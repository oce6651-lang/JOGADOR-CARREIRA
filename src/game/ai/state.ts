import type { CareerAi, MatchRecord, Player, SquadRole } from "../types";

/**
 * Career AI — persistent state helpers.
 *
 * Morale, fitness, sharpness, trust and reputation are the "soft" variables
 * that make two identical players live completely different careers.
 */

const MAX_TRACKED_RATINGS = 10;

export function clamp01to100(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function createCareerAi(player: Player): CareerAi {
  const determination = player.attributes.mental.determination;
  return {
    club: null,
    morale: 70,
    fitness: 92,
    sharpness: 55,
    reputation: Math.max(1, Math.round(player.hidden.potential * 0.12)),
    coachTrust: 45 + Math.round((determination - 50) * 0.1),
    recentRatings: [],
    scouting: [],
    lastReviewWeek: 0,
    trials: 0,
    releases: 0,
    offers: [],
    agent: null,
    lastTrialWeek: -99,
    lastApproachWeek: -99,
    nationalTeamLevel: null,
  };
}


export function recordRating(ai: CareerAi, rating: number): CareerAi {
  return {
    ...ai,
    recentRatings: [rating, ...ai.recentRatings].slice(0, MAX_TRACKED_RATINGS),
  };
}

export function adjustMorale(ai: CareerAi, delta: number): CareerAi {
  return { ...ai, morale: clamp01to100(ai.morale + delta) };
}

/** Applies the physical/mental consequences of a single simulated week. */
export function applyWeekCondition(
  ai: CareerAi,
  options: {
    injured: boolean;
    vacation: boolean;
    trained: boolean;
    playedMinutes: number;
    naturalFitness: number;
  },
): CareerAi {
  const { injured, vacation, trained, playedMinutes, naturalFitness } = options;
  const recovery = 1 + (naturalFitness - 50) / 100;

  let fitness = ai.fitness;
  let sharpness = ai.sharpness;

  if (injured) {
    fitness -= 4;
    sharpness -= 6;
  } else if (vacation) {
    fitness += 4 * recovery;
    sharpness -= 3;
  } else {
    fitness += (trained ? 2.5 : 0) * recovery - playedMinutes / 90;
    sharpness += playedMinutes > 0 ? 6 + playedMinutes / 25 : -3.5;
  }

  return {
    ...ai,
    fitness: clamp01to100(fitness),
    sharpness: clamp01to100(sharpness),
  };
}

/** Match results move morale, trust and public reputation together. */
export function applyMatchFeedback(
  ai: CareerAi,
  match: MatchRecord,
  clubReputation: number,
): CareerAi {
  const delta = match.rating - 6.6;
  const contribution = match.goals * 1.2 + match.assists * 0.7;

  return {
    ...recordRating(ai, match.rating),
    morale: clamp01to100(ai.morale + delta * 2.2 + contribution * 2),
    coachTrust: clamp01to100(ai.coachTrust + delta * 1.8 + contribution * 1.4),
    reputation: clamp01to100(
      ai.reputation +
        Math.max(0, delta) * (0.25 + clubReputation / 240) +
        contribution * 0.35 -
        0.02,
    ),
  };
}

/** Morale drifts back to a neutral baseline when nothing happens. */
export function decayMorale(ai: CareerAi): CareerAi {
  const target = 60;
  return { ...ai, morale: clamp01to100(ai.morale + (target - ai.morale) * 0.06) };
}

export function setRole(ai: CareerAi, role: SquadRole): CareerAi {
  if (!ai.club || ai.club.role === role) return ai;
  return { ...ai, club: { ...ai.club, role } };
}
