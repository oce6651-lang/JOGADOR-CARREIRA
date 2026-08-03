import { createEvent } from "../events";
import type { Random } from "../rng";
import { chance } from "../rng";
import type { Agent, CareerAi, GameDate, GameEvent, MatchStatLine, Player } from "../types";
import {
  categoryForSeason,
  categoryLabel,
  categoryOrder,
  getClub,
  nextCategory,
  sortCategories,
  type CategoryCode,
  type Club,
} from "../world";
import { levelGap, recentForm, requiredOverall } from "./evaluation";
import { changeCategory } from "./clubMoves";
import { estimateMarketValue, plannedEntryCategory } from "./market";
import { addOffer, buildOffer } from "./offers";

/**
 * Career AI — representation.
 *
 * What the agent can actually do for the athlete: knock on any club's door in
 * the world (with wildly different odds) and push the club to promote him to
 * a higher category inside the squad he already belongs to.
 */

/** Ceiling of the agency market: elite clubs never answer an agent's call. */
export const AGENT_REACH_CAP = 70;

/** Highest club reputation the agent has real contacts in. */
export function agentReach(agent: Agent | null) {
  if (!agent) return 34;
  return Math.min(AGENT_REACH_CAP, Math.round(30 + agent.quality * 0.72));
}

export type ApproachBlock = "none" | "noAgent" | "outOfReach";

export interface ApproachAssessment {
  club: Club;
  category: CategoryCode;
  /** 0-1 chance the club agrees to open talks. */
  chance: number;
  reach: number;
  block: ApproachBlock;
  marketValue: number;
}

/**
 * Can the agent get this club on the phone, and would they listen?
 * Reputation of both sides, level, category, market value and recent form.
 */
export function assessApproach(input: {
  player: Player;
  ai: CareerAi;
  club: Club;
  overall: number;
  age: number;
  seasonYear: number;
  seasonStats: MatchStatLine;
}): ApproachAssessment {
  const { player, ai, club, overall, age, seasonYear } = input;
  const agent = ai.agent;
  const reach = agentReach(agent);
  const projected =
    overall + Math.max(0, player.hidden.potential - overall) * 0.3 + ai.reputation * 0.06;

  const natural = categoryForSeason(player.birthDate, seasonYear);
  const category = plannedEntryCategory(
    club,
    entryCategory(club, natural),
    projected,
    age,
  );

  const marketValue = estimateMarketValue(
    overall,
    player.hidden.potential,
    age,
    ai.reputation,
    category,
  );

  if (!agent) {
    return {
      club,
      category,
      chance: club.reputation <= 30 ? 0.12 : 0,
      reach,
      block: club.reputation <= 30 ? "none" : "noAgent",
      marketValue,
    };
  }

  if (club.reputation > AGENT_REACH_CAP) {
    return { club, category, chance: 0, reach, block: "outOfReach", marketValue };
  }

  const overReach = club.reputation - reach;
  if (overReach > 18) {
    return { club, category, chance: 0, reach, block: "outOfReach", marketValue };
  }

  const gap = levelGap(projected, category, club.reputation);
  const form = recentForm(ai);
  const formBonus = form ? (form - 6.5) * 0.06 : -0.04;

  const raw =
    0.3 +
    gap * 0.02 +
    (ai.reputation - club.reputation * 0.4) * 0.006 +
    (agent.quality - club.reputation) * 0.004 +
    formBonus -
    Math.max(0, overReach) * 0.012;

  return {
    club,
    category,
    chance: Math.max(0.02, Math.min(0.82, raw)),
    reach,
    block: "none",
    marketValue,
  };
}

function entryCategory(club: Club, wanted: CategoryCode): CategoryCode {
  if (club.categories.includes(wanted)) return wanted;
  const sorted = sortCategories(club.categories);
  return (
    sorted.find((code) => categoryOrder(code) >= categoryOrder(wanted)) ??
    sorted[sorted.length - 1]
  );
}

export interface ApproachResult {
  ai: CareerAi;
  events: GameEvent[];
  opened: boolean;
  message: string;
}

/** The agent offers the athlete to a club anywhere in the world. */
export function offerPlayerToClub(input: {
  player: Player;
  ai: CareerAi;
  club: Club;
  date: GameDate;
  elapsedWeeks: number;
  overall: number;
  age: number;
  seasonStats: MatchStatLine;
  random: Random;
}): ApproachResult {
  const { ai, club, date, elapsedWeeks, overall, random } = input;
  const assessment = assessApproach({
    player: input.player,
    ai,
    club,
    overall,
    age: input.age,
    seasonYear: date.seasonYear,
    seasonStats: input.seasonStats,
  });

  const attempted: CareerAi = { ...ai, lastApproachWeek: elapsedWeeks };

  if (assessment.block === "noAgent") {
    return {
      ai: attempted,
      events: [],
      opened: false,
      message: `Sem empresário, o ${club.name} sequer atendeu o telefone.`,
    };
  }
  if (assessment.block === "outOfReach") {
    return {
      ai: attempted,
      events: [],
      opened: false,
      message: `${ai.agent?.name ?? "O empresário"} não tem contato na diretoria do ${club.name}.`,
    };
  }

  if (!chance(assessment.chance, random)) {
    return {
      ai: { ...attempted, morale: Math.max(10, attempted.morale - 2) },
      events: [
        createEvent("contract", date, `${club.name} recusou a sondagem`, {
          description: `O clube analisou o atleta e decidiu não abrir negociação por enquanto.`,
          tone: "warning",
        }),
      ],
      opened: false,
      message: `O ${club.name} agradeceu, mas não abriu negociação.`,
    };
  }

  const offer = buildOffer({
    kind: ai.club ? "transfer" : "contract",
    club,
    category: assessment.category,
    overall,
    elapsedWeeks,
    ai: attempted,
    age: input.age,
    seasonYear: date.seasonYear,
    fromClubName: ai.club?.clubName,
    random,
    message: `${ai.agent?.name ?? "O atleta"} levou o nome ao ${club.name}, que abriu negociação para o ${categoryLabel(assessment.category)}.`,
  });

  return {
    ai: addOffer({ ...attempted, morale: Math.min(100, attempted.morale + 4) }, offer),
    events: [
      createEvent("contract", date, `${club.name} abriu negociação`, {
        description: `Proposta para o ${categoryLabel(assessment.category)}. Analise em Negociações.`,
        tone: "positive",
      }),
    ],
    opened: true,
    message: `O ${club.name} abriu negociação! A proposta está em Negociações.`,
  };
}

/* ------------------------------------------------------------------ */
/* Internal promotion requests                                         */
/* ------------------------------------------------------------------ */

export interface PromotionRequest {
  target: CategoryCode;
  chance: number;
}

/** Next category the agent could push for inside the current club. */
export function promotionTarget(ai: CareerAi): CategoryCode | undefined {
  const situation = ai.club;
  if (!situation) return undefined;
  const club = getClub(situation.clubId);
  if (!club) return undefined;
  let candidate = nextCategory(situation.category);
  while (candidate && !club.categories.includes(candidate)) {
    candidate = nextCategory(candidate);
  }
  return candidate;
}

export function assessPromotion(input: {
  player: Player;
  ai: CareerAi;
  overall: number;
  age: number;
  seasonStats: MatchStatLine;
}): PromotionRequest | undefined {
  const { player, ai, overall, age, seasonStats } = input;
  const situation = ai.club;
  const target = promotionTarget(ai);
  if (!situation || !target) return undefined;

  const club = getClub(situation.clubId);
  if (!club) return undefined;

  const required = requiredOverall(target, club.reputation);
  const form = recentForm(ai);
  const need = target === "PRO" ? 0.42 : 0.5;

  const raw =
    need +
    (overall - required) * 0.035 +
    (form ? (form - 6.6) * 0.09 : -0.12) +
    (seasonStats.appearances >= 8 ? 0.08 : -0.08) +
    (ai.coachTrust - 50) * 0.006 +
    (player.hidden.potential - overall) * 0.005 +
    (age >= (target === "PRO" ? 17 : 15) ? 0.05 : -0.15) +
    (ai.agent ? ai.agent.quality * 0.0022 : -0.08);

  return { target, chance: Math.max(0.02, Math.min(0.9, raw)) };
}

export interface PromotionResult {
  player: Player;
  ai: CareerAi;
  events: GameEvent[];
  granted: boolean;
  message: string;
}

/** The agent asks the club to move the athlete up a category. */
export function requestPromotion(input: {
  player: Player;
  ai: CareerAi;
  date: GameDate;
  elapsedWeeks: number;
  overall: number;
  age: number;
  seasonStats: MatchStatLine;
  random: Random;
}): PromotionResult {
  const { player, ai, date, elapsedWeeks, random } = input;
  const request = assessPromotion(input);
  if (!request) {
    return {
      player,
      ai,
      events: [],
      granted: false,
      message: "Não há categoria superior disponível neste clube.",
    };
  }

  const attempted: CareerAi = { ...ai, lastApproachWeek: elapsedWeeks };

  if (!chance(request.chance, random)) {
    return {
      player,
      ai: { ...attempted, coachTrust: Math.max(0, attempted.coachTrust - 4) },
      events: [
        createEvent("contract", date, "Pedido de promoção negado", {
          description: `A comissão técnica entendeu que o atleta ainda precisa de tempo no ${categoryLabel(ai.club!.category)}.`,
          tone: "warning",
        }),
      ],
      granted: false,
      message: `O clube negou a subida para o ${categoryLabel(request.target)}.`,
    };
  }

  const moved = changeCategory(player, attempted, request.target, date, true);
  return {
    player: moved.player,
    ai: moved.ai,
    events: moved.events,
    granted: true,
    message: `Promovido ao ${categoryLabel(request.target)}!`,
  };
}
