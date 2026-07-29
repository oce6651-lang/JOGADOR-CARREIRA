import { createEvent } from "../events";
import type { Random } from "../rng";
import { chance } from "../rng";
import type { CareerAi, ClubOffer, GameDate, GameEvent, Player } from "../types";
import { categoryForAge, categoryLabel, type CategoryCode, type Club } from "../world";
import { levelGap } from "./evaluation";
import { entryCategoryFor, reachableClubs } from "./market";
import { addOffer, buildOffer } from "./offers";

/**
 * Career AI — trials (peneiras).
 *
 * A free agent doesn't wait for luck: he picks a club, shows up and is
 * evaluated. Approval produces a contract proposal he still has to negotiate.
 */

export interface TrialOpportunity {
  club: Club;
  category: CategoryCode;
  /** Overall usually required by the category at that club. */
  required: number;
  /** Estimated approval chance (0-1). */
  successChance: number;
  /** Cost of attending — distance/logistics, paid with morale. */
  moraleCost: number;
}

export function trialOpportunities(
  player: Player,
  ai: CareerAi,
  age: number,
  overall: number,
): TrialOpportunity[] {
  const wanted = categoryForAge(age);
  const clubs = reachableClubs(overall, player.hidden.potential, wanted, ai.reputation);

  return clubs
    .map((club) => {
      const category = entryCategoryFor(club, wanted);
      const gap = levelGap(overall, category, club.reputation);
      const successChance = Math.max(
        0.05,
        Math.min(
          0.95,
          0.42 +
            gap * 0.05 +
            (player.hidden.potential - overall) * 0.008 +
            (player.attributes.mental.determination - 50) * 0.004 +
            (ai.fitness - 80) * 0.004 +
            ai.reputation * 0.003 +
            (ai.agent ? ai.agent.quality * 0.0015 : 0),
        ),
      );
      return {
        club,
        category,
        required: Math.round(overall - gap),
        successChance,
        moraleCost: club.reputation > 70 ? 6 : 4,
      };
    })
    .sort((a, b) => b.club.reputation - a.club.reputation)
    .slice(0, 12);
}

export interface TrialResult {
  ai: CareerAi;
  events: GameEvent[];
  approved: boolean;
  offer?: ClubOffer;
}

/** Attends one trial. Costs a week of the athlete's life either way. */
export function attendTrial(
  player: Player,
  ai: CareerAi,
  opportunity: TrialOpportunity,
  date: GameDate,
  elapsedWeeks: number,
  overall: number,
  random: Random,
): TrialResult {
  const { club, category, successChance } = opportunity;
  const events: GameEvent[] = [
    createEvent("trial", date, `Peneira no ${club.name}`, {
      description: `Avaliação para o ${categoryLabel(category)}.`,
    }),
  ];

  let next: CareerAi = {
    ...ai,
    trials: ai.trials + 1,
    lastTrialWeek: elapsedWeeks,
    fitness: Math.max(40, ai.fitness - 3),
  };

  if (!chance(successChance, random)) {
    next = { ...next, morale: Math.max(10, next.morale - opportunity.moraleCost) };
    events.push(
      createEvent("trial", date, `Reprovado no ${club.name}`, {
        description: "A comissão técnica optou por não seguir com o atleta.",
        tone: "danger",
      }),
    );
    return { ai: next, events, approved: false };
  }

  const offer = buildOffer({
    kind: "contract",
    club,
    category,
    overall,
    elapsedWeeks,
    ai: next,
    random,
    message: `Aprovado na peneira do ${club.name}. A diretoria ofereceu contrato para o ${categoryLabel(category)}.`,
  });

  next = addOffer(
    { ...next, morale: Math.min(100, next.morale + 10), reputation: Math.min(100, next.reputation + 2) },
    offer,
  );

  events.push(
    createEvent("trial", date, `Aprovado no ${club.name}`, {
      description: "O clube enviou uma proposta de contrato. Analise em Negociações.",
      tone: "positive",
    }),
  );

  return { ai: next, events, approved: true, offer };
}
