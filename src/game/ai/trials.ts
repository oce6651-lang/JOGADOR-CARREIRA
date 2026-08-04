import { createEvent } from "../events";
import type { Random } from "../rng";
import { chance } from "../rng";
import type { CareerAi, ClubOffer, GameDate, GameEvent, Player } from "../types";
import {
  categoryForSeason,
  categoryLabel,
  seasonAge,
  type CategoryCode,
  type Club,
} from "../world";
import { levelGap } from "./evaluation";
import { entryCategoryFor, homeCountryFor, plannedEntryCategory, reachableClubs } from "./market";
import { addOffer, buildOffer } from "./offers";

/**
 * Career AI — trials (peneiras).
 *
 * Trials are hard and local. A free agent knocks on the doors of clubs from
 * his own country; only genuinely special situations (level, agent contacts,
 * invitations, international tournaments) open a door abroad.
 */

export type TrialDifficulty = "regional" | "estadual" | "nacional" | "elite" | "mundial";

export const TRIAL_DIFFICULTY_LABELS: Record<TrialDifficulty, string> = {
  regional: "Regional",
  estadual: "Estadual",
  nacional: "Nacional",
  elite: "Elite",
  mundial: "Mundial",
};

/** How much harder each tier is (multiplies the approval chance). */
const DIFFICULTY_FACTOR: Record<TrialDifficulty, number> = {
  regional: 1,
  estadual: 0.78,
  nacional: 0.55,
  elite: 0.34,
  mundial: 0.2,
};

export function trialDifficulty(clubReputation: number): TrialDifficulty {
  if (clubReputation >= 82) return "mundial";
  if (clubReputation >= 68) return "elite";
  if (clubReputation >= 52) return "nacional";
  if (clubReputation >= 36) return "estadual";
  return "regional";
}

/** Why a foreign club is willing to look at the athlete at all. */
export type TrialOrigin = "domestic" | "level" | "agent" | "invitation" | "tournament";

export const TRIAL_ORIGIN_LABELS: Record<TrialOrigin, string> = {
  domestic: "Peneira aberta",
  level: "Observado pelo alto nível",
  agent: "Indicação do empresário",
  invitation: "Convite direto",
  tournament: "Torneio internacional",
};

export interface TrialOpportunity {
  club: Club;
  category: CategoryCode;
  /** Overall usually required by the category at that club. */
  required: number;
  /** Estimated approval chance (0-1). */
  successChance: number;
  difficulty: TrialDifficulty;
  origin: TrialOrigin;
  international: boolean;
  /** Cost of attending — distance/logistics, paid with morale. */
  moraleCost: number;
}

/** Projected level the scouts actually see. */
function projectedLevel(player: Player, ai: CareerAi, overall: number) {
  return overall + Math.max(0, player.hidden.potential - overall) * 0.3 + ai.reputation * 0.06;
}

export function trialOpportunities(
  player: Player,
  ai: CareerAi,
  age: number,
  overall: number,
  seasonYear: number,
  /** Weekly seed — makes the open trials rotate instead of being always the same. */
  random: Random,
): TrialOpportunity[] {
  const wanted = categoryForSeason(player.birthDate, seasonYear);
  const home = homeCountryFor(player, ai);
  const projected = projectedLevel(player, ai, overall);

  const agentReach = ai.agent ? ai.agent.quality : 0;
  const invited = new Set(
    ai.offers.filter((offer) => offer.kind === "trial").map((offer) => offer.clubId),
  );

  const clubs = reachableClubs(overall, player.hidden.potential, wanted, ai.reputation);

  const opportunities = clubs
    .map((club) => {
      const international = club.country !== home;
      const origin =
        originFor({
          international,
          invited: invited.has(club.id),
          projected,
          agentReach,
          reputation: ai.reputation,
          clubReputation: club.reputation,
        }) ?? (invited.has(club.id) ? "agent" : null);
      if (!origin) return null;

      const category = plannedEntryCategory(club, entryCategoryFor(club, wanted), projected, age);
      const gap = levelGap(overall, category, club.reputation);
      const difficulty = trialDifficulty(club.reputation);

      const raw =
        0.24 +
        gap * 0.028 +
        (player.hidden.potential - overall) * 0.004 +
        (player.attributes.mental.determination - 50) * 0.0025 +
        (ai.fitness - 80) * 0.002 +
        ai.reputation * 0.0022 +
        agentReach * 0.0012;

      // A trial the agent arranged is a warm introduction: the club already
      // wants to like the athlete, so approval is far likelier than in an
      // open trial where hundreds of kids show up.
      const referred = invited.has(club.id);
      const successChance = Math.max(
        0.02,
        Math.min(
          referred ? 0.88 : 0.72,
          raw * DIFFICULTY_FACTOR[difficulty] * (referred ? 1.75 : 1) +
            (referred ? 0.12 : 0) +
            (international ? -0.04 : 0),
        ),
      );

      return {
        club,
        category,
        required: Math.round(overall - gap),
        successChance,
        difficulty,
        origin,
        international,
        moraleCost: international ? 9 : club.reputation > 70 ? 6 : 4,
      } satisfies TrialOpportunity;
    })
    .filter((item): item is TrialOpportunity => item !== null);

  const domestic = opportunities.filter((item) => !item.international);
  const abroad = opportunities.filter((item) => item.international);

  const sortByReputation = (a: TrialOpportunity, b: TrialOpportunity) =>
    b.club.reputation - a.club.reputation;

  // Clubs do not open trials every week: draw a different regional shortlist
  // each week, biased towards the clubs closest to the athlete's level.
  return [
    ...drawTrials(domestic, 8, random).sort(sortByReputation),
    ...drawTrials(abroad, 2, random).sort(sortByReputation),
  ];
}

/** Weighted draw without repetition — better chances have more tickets. */
function drawTrials(pool: TrialOpportunity[], size: number, random: Random) {
  const remaining = [...pool];
  const drawn: TrialOpportunity[] = [];
  while (remaining.length && drawn.length < size) {
    const weights = remaining.map((item) => 0.25 + item.successChance);
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let ticket = random() * total;
    let index = remaining.length - 1;
    for (let i = 0; i < remaining.length; i += 1) {
      ticket -= weights[i];
      if (ticket <= 0) {
        index = i;
        break;
      }
    }
    drawn.push(remaining[index]);
    remaining.splice(index, 1);
  }
  return drawn;
}

function originFor(input: {
  international: boolean;
  invited: boolean;
  projected: number;
  agentReach: number;
  reputation: number;
  clubReputation: number;
}): TrialOrigin | null {
  if (!input.international) return "domestic";
  if (input.invited) return "invitation";
  if (input.projected >= 70 && input.reputation >= 35) return "level";
  if (
    input.agentReach >= 60 &&
    input.reputation >= 25 &&
    input.clubReputation <= input.agentReach + 15
  ) {
    return "agent";
  }
  if (input.reputation >= 55 && input.clubReputation <= 60) return "tournament";
  return null;
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
      description: `Avaliação para o ${categoryLabel(category)} · dificuldade ${TRIAL_DIFFICULTY_LABELS[opportunity.difficulty]}.`,
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
    age: seasonAge(player.birthDate, date.seasonYear),
    seasonYear: date.seasonYear,
    random,
    message: `Aprovado na peneira do ${club.name}. A diretoria ofereceu contrato para o ${categoryLabel(category)}.`,
  });

  next = addOffer(
    {
      ...next,
      morale: Math.min(100, next.morale + 10),
      reputation: Math.min(100, next.reputation + (opportunity.international ? 4 : 2)),
    },
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
