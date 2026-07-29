import { createEvent } from "../events";
import type { Random } from "../rng";
import { chance, pick } from "../rng";
import type {
  CareerAi,
  GameDate,
  GameEvent,
  MatchStatLine,
  Player,
  ScoutingInterest,
} from "../types";
import {
  categoryForAge,
  categoryLabel,
  getCategory,
  getClub,
  nextCategory,
  CLUBS,
  type CategoryCode,
  type Club,
} from "../world";
import { changeCategory, releaseFromClub } from "./clubMoves";
import { evaluate, levelGap, type Evaluation } from "./evaluation";
import { entryCategoryFor, reachableClubs } from "./market";
import { evaluateCallUp } from "./nationalTeam";
import { addOffer, buildOffer } from "./offers";
import { decideRole, isMarginal, roleLabel } from "./squad";

/**
 * Career AI — decision engine.
 *
 * Runs periodically (and always at the end of a season) and answers the
 * questions that shape a career: does he stay, get promoted, get loaned out,
 * get released, get a new contract, and who is watching him.
 */

/** Weeks between two squad reviews. */
export const REVIEW_INTERVAL = 6;

export interface AiContext {
  player: Player;
  ai: CareerAi;
  date: GameDate;
  elapsedWeeks: number;
  age: number;
  overall: number;
  seasonStats: MatchStatLine;
  seasonEnd: boolean;
  random: Random;
}

export interface AiOutcome {
  player: Player;
  ai: CareerAi;
  events: GameEvent[];
  categoryChange?: string;
}

export function shouldReview(ai: CareerAi, ctx: { elapsedWeeks: number; seasonEnd: boolean }) {
  return ctx.seasonEnd || ctx.elapsedWeeks - ai.lastReviewWeek >= REVIEW_INTERVAL;
}

/** Full review pass. Never decides on a single number. */
export function runCareerReview(ctx: AiContext): AiOutcome {
  const base: AiOutcome = { player: ctx.player, ai: ctx.ai, events: [] };
  const outcome = ctx.ai.club ? reviewContractedPlayer(ctx) : reviewFreeAgent(ctx);
  const merged: AiOutcome = {
    ...base,
    ...outcome,
    ai: { ...outcome.ai, lastReviewWeek: ctx.elapsedWeeks },
  };
  return merged;
}

/* ------------------------------------------------------------------ */
/* Free agents — trials                                                */
/* ------------------------------------------------------------------ */

function reviewFreeAgent(ctx: AiContext): AiOutcome {
  const { player, date, age, overall, random } = ctx;
  let ai = ctx.ai;

  const category = categoryForAge(age);
  const candidates = reachableClubs(overall, player.hidden.potential, category, ai.reputation);

  if (!candidates.length) {
    return {
      player,
      ai,
      events: [
        createEvent("trial", date, "Sem oportunidades no momento", {
          description:
            "Nenhum clube com vaga compatível. Continue treinando e tente peneiras mais modestas.",
          tone: "warning",
        }),
      ],
    };
  }

  // Clubs only come knocking when the athlete is known; otherwise he has to
  // knock on doors himself through the trials screen.
  const inviteChance = Math.min(
    0.75,
    0.08 +
      ai.reputation / 190 +
      player.attributes.mental.determination / 900 +
      (ai.agent ? ai.agent.quality / 320 : 0),
  );

  if (ai.offers.length >= 3 || !chance(inviteChance, random)) {
    return {
      player,
      ai: { ...ai, morale: Math.max(10, ai.morale - 2) },
      events: [
        createEvent("trial", date, "Semana sem convites", {
          description: "O atleta segue treinando por conta própria à espera de uma chance.",
          tone: "warning",
        }),
      ],
    };
  }

  const club = pickTrialClub(candidates, overall, random);
  const target = entryCategoryFor(club, category);
  const offer = buildOffer({
    kind: "trial",
    club,
    category: target,
    overall,
    elapsedWeeks: ctx.elapsedWeeks,
    ai,
    random,
    message: `O ${club.name} convidou o atleta para uma avaliação no ${categoryLabel(target)}. Aceitar garante vaga direta na peneira.`,
  });
  ai = addOffer(ai, offer);

  return {
    player,
    ai,
    events: [
      createEvent("contract", date, `Convite do ${club.name}`, {
        description: `Convite para avaliação no ${categoryLabel(target)}. Responda em Negociações.`,
        tone: "info",
      }),
    ],
  };
}

function pickTrialClub(candidates: Club[], overall: number, random: Random) {
  // Prefer the strongest club he can realistically reach, with some noise.
  const sorted = [...candidates].sort((a, b) => b.reputation - a.reputation);
  const window = sorted.slice(0, Math.max(3, Math.ceil(sorted.length * 0.25)));
  const bias = Math.min(window.length - 1, Math.floor((overall / 100) * window.length));
  return chance(0.6, random) ? window[bias] ?? pick(window, random) : pick(sorted, random);
}

/* ------------------------------------------------------------------ */
/* Contracted players                                                  */
/* ------------------------------------------------------------------ */

function reviewContractedPlayer(ctx: AiContext): AiOutcome {
  const { date, age, overall, seasonStats, seasonEnd, random } = ctx;
  let player = ctx.player;
  let ai = ctx.ai;
  const situation = ai.club!;
  const events: GameEvent[] = [];

  const evaluation = evaluate({
    player,
    ai,
    overall,
    age,
    category: situation.category,
    clubReputation: situation.clubReputation,
    seasonStats,
  });

  /* --- squad role ------------------------------------------------- */
  const nextRole = decideRole(situation.role, evaluation);
  if (nextRole !== situation.role) {
    ai = { ...ai, club: { ...ai.club!, role: nextRole } };
    events.push(
      createEvent("milestone", date, roleLabel(nextRole), {
        description: `A comissão técnica do ${situation.clubName} redefiniu o papel do atleta no elenco.`,
        tone: isMarginal(nextRole) ? "warning" : "positive",
      }),
    );
  }

  /* --- scouting --------------------------------------------------- */
  const scouted = updateScouting(ai, evaluation, ctx);
  ai = scouted.ai;
  events.push(...scouted.events);

  /* --- promotion -------------------------------------------------- */
  const promotion = evaluatePromotion(ai, evaluation, ctx);
  if (promotion) {
    const moved = changeCategory(player, ai, promotion, date, true);
    return finish(moved.player, moved.ai, [...events, ...moved.events], categoryLabel(promotion));
  }

  /* --- release / stay --------------------------------------------- */
  const maxAge = getCategory(situation.category)?.maxAge;
  const overAge = maxAge !== undefined && age > maxAge;
  const failing = evaluation.score <= -34 && evaluation.gap <= -6;

  if ((seasonEnd && overAge) || failing) {
    const canStay = evaluation.score > -18 && !overAge;
    if (!canStay) {
      const released = releaseFromClub(
        player,
        ai,
        date,
        overAge
          ? `Idade acima do ${categoryLabel(situation.category)} sem espaço na categoria seguinte.`
          : "Desempenho abaixo do exigido pela comissão técnica.",
      );
      return finish(released.player, released.ai, [...events, ...released.events]);
    }
  }

  /* --- loan ------------------------------------------------------- */
  const loan = evaluateLoan(ai, evaluation, ctx);
  if (loan) {
    const category = entryCategoryFor(loan, situation.category);
    ai = addOffer(
      ai,
      buildOffer({
        kind: "loan",
        club: loan,
        category,
        overall,
        elapsedWeeks: ctx.elapsedWeeks,
        ai,
        role: "rotation",
        fromClubName: situation.clubName,
        random,
        message: `O ${situation.clubName} liberou uma saída por empréstimo. O ${loan.name} garante minutos no ${categoryLabel(category)}.`,
      }),
    );
    events.push(
      createEvent("contract", date, `Empréstimo oferecido pelo ${loan.name}`, {
        description: "Proposta aguardando decisão do atleta em Negociações.",
        tone: "info",
      }),
    );
  }

  /* --- renewal ---------------------------------------------------- */
  if (
    ai.club &&
    ai.club.contractUntilSeason <= date.seasonYear + 1 &&
    evaluation.score > -12 &&
    !ai.offers.some((offer) => offer.kind === "renewal")
  ) {
    const club = getClub(ai.club.clubId);
    if (club) {
      const seasons = evaluation.score > 25 ? 4 : evaluation.score > 5 ? 3 : 2;
      const raise = 1 + Math.max(0.05, Math.min(1.2, evaluation.score / 60));
      const offer = buildOffer({
        kind: "renewal",
        club,
        category: ai.club.category,
        overall,
        elapsedWeeks: ctx.elapsedWeeks,
        ai,
        role: ai.club.role,
        random,
        message: `O ${situation.clubName} quer renovar o contrato do atleta.`,
      });
      ai = addOffer(ai, {
        ...offer,
        terms: {
          ...offer.terms,
          seasons,
          weeklyWage: Math.round(ai.club.weeklyWage * raise),
        },
      });
      events.push(
        createEvent("contract", date, `Renovação oferecida pelo ${situation.clubName}`, {
          description: "A diretoria apresentou uma proposta de renovação. Analise em Negociações.",
          tone: "info",
        }),
      );
    }
  }

  /* --- national team ---------------------------------------------- */
  const callUp = evaluateCallUp({ player, ai, date, age, seasonStats, random });
  player = callUp.player;
  ai = callUp.ai;
  events.push(...callUp.events);

  return finish(player, ai, events);
}

function finish(
  player: Player,
  ai: CareerAi,
  events: GameEvent[],
  categoryChange?: string,
): AiOutcome {
  return { player, ai, events, categoryChange };
}

/** Promotion is possible before the expected age, but never for free. */
function evaluatePromotion(
  ai: CareerAi,
  evaluation: Evaluation,
  ctx: AiContext,
): CategoryCode | undefined {
  const situation = ai.club;
  if (!situation) return undefined;

  const club = getClub(situation.clubId);
  if (!club) return undefined;

  const target = nextAvailableCategory(club, situation.category);
  if (!target) return undefined;

  const maxAge = getCategory(situation.category)?.maxAge;
  const overAge = maxAge !== undefined && ctx.age > maxAge;
  const settled = situation.weeksInCategory >= 8;
  const readyForTarget =
    levelGap(ctx.overall, target, club.reputation) >= (target === "PRO" ? -6 : -3);

  if (overAge && ctx.seasonEnd && evaluation.score > -18 && readyForTarget) return target;
  if (!settled) return undefined;

  const dominating =
    evaluation.gap >= 5 &&
    evaluation.score >= 26 &&
    evaluation.form >= 6.9 &&
    ctx.seasonStats.appearances >= 6;

  if (dominating && readyForTarget) return target;
  return undefined;
}

function nextAvailableCategory(club: Club, current: CategoryCode) {
  let candidate = nextCategory(current);
  while (candidate && !club.categories.includes(candidate)) {
    candidate = nextCategory(candidate);
  }
  return candidate;
}

/** Young professionals stuck on the bench get loaned to smaller clubs. */
function evaluateLoan(ai: CareerAi, evaluation: Evaluation, ctx: AiContext) {
  const situation = ai.club;
  if (!situation || situation.onLoan) return undefined;
  if (situation.category !== "PRO" && situation.category !== "U23") return undefined;
  if (ctx.age < 17 || ctx.age > 24) return undefined;
  if (!isMarginal(situation.role) && evaluation.score > -6) return undefined;
  if (!ctx.seasonEnd && !chance(0.35, ctx.random)) return undefined;

  const targets = CLUBS.filter((club) => {
    if (club.id === situation.clubId) return false;
    if (!club.categories.includes("PRO")) return false;
    const gap = levelGap(ctx.overall, "PRO", club.reputation);
    return gap >= 0 && gap <= 12 && club.reputation < situation.clubReputation;
  });
  if (!targets.length) return undefined;
  return pick(targets, ctx.random);
}

/* ------------------------------------------------------------------ */
/* Scouting                                                            */
/* ------------------------------------------------------------------ */

function updateScouting(
  ai: CareerAi,
  evaluation: Evaluation,
  ctx: AiContext,
): { ai: CareerAi; events: GameEvent[] } {
  const situation = ai.club;
  if (!situation) return { ai, events: [] };

  const events: GameEvent[] = [];
  const growth = evaluation.score / 6 + (evaluation.potential - 0.4) * 8;

  let scouting: ScoutingInterest[] = ai.scouting
    .map((interest) => ({
      ...interest,
      level: Math.max(0, Math.min(100, interest.level + growth - 3)),
    }))
    .filter((interest) => interest.level > 5);

  const attractsAttention = evaluation.score >= 18 && ctx.seasonStats.appearances >= 4;
  if (attractsAttention && scouting.length < 4) {
    const observers = CLUBS.filter(
      (club) =>
        club.id !== situation.clubId &&
        club.reputation > situation.clubReputation + 4 &&
        club.reputation <=
          situation.clubReputation + 20 + Math.max(0, evaluation.score - 18) &&
        !scouting.some((interest) => interest.clubId === club.id),
    );
    if (observers.length && chance(0.5, ctx.random)) {
      const club = pick(observers, ctx.random);
      scouting = [
        ...scouting,
        {
          clubId: club.id,
          clubName: club.name,
          clubReputation: club.reputation,
          level: 20 + Math.max(0, evaluation.score - 18),
          sinceWeek: ctx.elapsedWeeks,
        },
      ];
      events.push(
        createEvent("milestone", ctx.date, `${club.name} está observando`, {
          description: `Olheiros do ${club.name} acompanharam as últimas atuações no ${categoryLabel(situation.category)}.`,
          tone: "info",
        }),
      );
    }
  }

  return { ai: { ...ai, scouting }, events };
}
