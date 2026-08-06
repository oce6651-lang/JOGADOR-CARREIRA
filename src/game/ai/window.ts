import { isTransferWindowOpen } from "../calendar";
import { createEvent } from "../events";
import type { Random } from "../rng";
import { chance, pick } from "../rng";
import type { CareerAi, GameDate, GameEvent, Player } from "../types";
import {
  categoryForAge,
  categoryLabel,
  categoryOrder,
  legalCategoryForAge,
  type CategoryCode,
  type Club,
} from "../world";
import { levelGap } from "./evaluation";
import { currentForm, formLabel } from "./form";
import { entryCategoryFor, plannedEntryCategory, reachableClubs } from "./market";
import { addOffer, buildOffer } from "./offers";

/**
 * Career AI — transfer windows.
 *
 * Clubs do not sign players whenever they feel like it: proposals only arrive
 * while a window is open. Who calls, and how good the proposal is, depends on
 * how well known the athlete is (reputation), how good he is (overall), how he
 * has been playing lately (form) and where he currently plays.
 */

export interface WindowContext {
  player: Player;
  ai: CareerAi;
  date: GameDate;
  elapsedWeeks: number;
  age: number;
  overall: number;
  random: Random;
}

/** 0-100 — how attractive the athlete looks to the market right now. */
export function marketAppeal(ctx: WindowContext): number {
  const { ai, overall } = ctx;
  const form = currentForm(ai);
  const formBonus = form ? (form - 6.3) * 9 : -4;
  const clubBonus = ai.club ? ai.club.clubReputation * 0.18 : -6;
  const youth = ctx.age <= 21 ? 6 : ctx.age >= 32 ? -12 : 0;
  const potential = Math.max(0, ctx.player.hidden.potential - overall) * 0.35;
  const raw =
    overall * 0.42 + ai.reputation * 0.4 + formBonus + clubBonus + youth + potential;
  return Math.max(0, Math.min(100, raw));
}

/** Weekly chance a club formalises a proposal during the window. */
function approachChance(appeal: number, freeAgent: boolean) {
  const base = (appeal - 32) / 240;
  return Math.max(0.015, Math.min(0.4, base + (freeAgent ? 0.06 : 0.02)));
}

function suitorsFor(ctx: WindowContext, category: CategoryCode): Club[] {
  const { ai, overall, player } = ctx;
  const pool = reachableClubs(overall, player.hidden.potential, category, ai.reputation);
  if (!ai.club) return pool;
  return pool.filter((club) => {
    if (club.id === ai.club!.clubId) return false;
    // Someone only pays for him when the destination makes sporting sense.
    const target = entryCategoryFor(club, category);
    const gap = levelGap(overall, target, club.reputation);
    return gap >= -6 && club.reputation >= ai.club!.clubReputation - 8;
  });
}

/**
 * Runs one week of the open window. Produces at most one proposal so the
 * player always has time to decide before the next one lands.
 */
export function runTransferWindow(ctx: WindowContext): { ai: CareerAi; events: GameEvent[] } {
  const { ai, date, random } = ctx;
  if (!isTransferWindowOpen(date.week)) return { ai, events: [] };
  if (ai.offers.length >= 4) return { ai, events: [] };

  const appeal = marketAppeal(ctx);
  const freeAgent = !ai.club;
  if (!chance(approachChance(appeal, freeAgent), random)) return { ai, events: [] };

  const natural = legalCategoryForAge(
    ai.club?.category ?? categoryForAge(ctx.age),
    ctx.age,
  );
  const suitors = suitorsFor(ctx, natural).filter(
    (club) => !ai.offers.some((offer) => offer.clubId === club.id),
  );
  if (!suitors.length) return { ai, events: [] };

  const club = pick(suitors, random);
  const projected =
    ctx.overall + Math.max(0, ctx.player.hidden.potential - ctx.overall) * 0.35;
  const planned = plannedEntryCategory(
    club,
    entryCategoryFor(club, natural),
    projected,
    ctx.age,
  );
  const category = legalCategoryForAge(planned, ctx.age);

  // A first team player with little football gets loan calls instead of bids.
  const wantsLoan =
    !freeAgent &&
    ctx.age <= 23 &&
    categoryOrder(natural) >= categoryOrder("U23") &&
    club.reputation < (ai.club?.clubReputation ?? 0) &&
    chance(0.4, random);

  const kind = freeAgent ? "contract" : wantsLoan ? "loan" : "transfer";
  const form = currentForm(ai);

  const offer = buildOffer({
    kind,
    club,
    category,
    overall: ctx.overall,
    elapsedWeeks: ctx.elapsedWeeks,
    ai,
    age: ctx.age,
    seasonYear: date.seasonYear,
    role: category === "PRO" ? (appeal >= 62 ? "rotation" : "reserve") : "starter",
    fromClubName: ai.club?.clubName,
    random,
    message: buildMessage(club, category, ai, form, freeAgent, kind),
  });

  return {
    ai: addOffer(ai, offer),
    events: [
      createEvent("contract", date, `Janela: proposta do ${club.name}`, {
        description: `${categoryLabel(category)} · ${formLabel(ai)} · decida em Negociações.`,
        tone: "positive",
        data: { clubSlug: club.slug },
      }),
    ],
  };
}

function buildMessage(
  club: Club,
  category: CategoryCode,
  ai: CareerAi,
  form: number,
  freeAgent: boolean,
  kind: "contract" | "loan" | "transfer",
) {
  const where = `${club.name} (${categoryLabel(category)})`;
  const observation = form >= 7.2 ? "As últimas atuações chamaram atenção." : "";
  if (freeAgent) {
    return `O ${where} acompanhou o atleta sem clube e quer contratá-lo agora. ${observation}`.trim();
  }
  if (kind === "loan") {
    return `O ${where} pediu o atleta por empréstimo até o fim da temporada para garantir minutos. ${observation}`.trim();
  }
  return `O ${where} abriu negociação com o ${ai.club?.clubName ?? "clube"} durante a janela. ${observation}`.trim();
}
