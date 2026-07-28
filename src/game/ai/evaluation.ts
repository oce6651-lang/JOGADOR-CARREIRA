import { averageRating } from "../player/history";
import type { CareerAi, MatchStatLine, Player } from "../types";
import { categoryOrder, type CategoryCode } from "../world";

/**
 * Career AI — evaluation layer.
 *
 * Pure scoring functions. Every decision in the career (minutes, promotion,
 * loan, release, renewal, scouting) reads from here, so the whole AI shares a
 * single, tunable notion of "how good is this player, right now, right here".
 */

/** Overall a fully average player of that category is expected to have. */
const CATEGORY_BASE: Record<CategoryCode, number> = {
  U11: 18,
  U13: 24,
  U15: 31,
  U17: 40,
  U20: 50,
  U23: 56,
  PRO: 60,
};

/** How much the club reputation raises the bar inside a category. */
const REPUTATION_WEIGHT: Record<CategoryCode, number> = {
  U11: 0.16,
  U13: 0.18,
  U15: 0.22,
  U17: 0.26,
  U20: 0.3,
  U23: 0.32,
  PRO: 0.36,
};

/** Minimum overall expected to hold a place in a category at a given club. */
export function requiredOverall(category: CategoryCode, clubReputation: number) {
  const base = CATEGORY_BASE[category] ?? 40;
  return Math.round(base + (clubReputation - 45) * (REPUTATION_WEIGHT[category] ?? 0.25));
}

/** Positive = above the level of the squad he is in. */
export function levelGap(
  overall: number,
  category: CategoryCode,
  clubReputation: number,
) {
  return overall - requiredOverall(category, clubReputation);
}

/** Rolling average of the last matches (0 when he has not played). */
export function recentForm(ai: CareerAi) {
  if (!ai.recentRatings.length) return 0;
  const sum = ai.recentRatings.reduce((acc, value) => acc + value, 0);
  return sum / ai.recentRatings.length;
}

/** -1 .. +1 — how far recent ratings are from an average performance. */
export function formScore(ai: CareerAi) {
  const form = recentForm(ai);
  if (!form) return -0.15;
  return Math.max(-1, Math.min(1, (form - 6.6) / 1.6));
}

/** -1 .. +1 — production (goals/assists) relative to what the position asks. */
export function productionScore(player: Player, stats: MatchStatLine) {
  if (!stats.appearances) return 0;
  const per90 = ((stats.goals + stats.assists * 0.7) * 90) / Math.max(1, stats.minutes);
  const expected = EXPECTED_PER_90[player.position] ?? 0.2;
  return Math.max(-1, Math.min(1, (per90 - expected) / Math.max(0.12, expected)));
}

const EXPECTED_PER_90: Record<string, number> = {
  GK: 0.02,
  CB: 0.08,
  LB: 0.12,
  RB: 0.12,
  DM: 0.12,
  CM: 0.22,
  AM: 0.4,
  LW: 0.45,
  RW: 0.45,
  ST: 0.6,
};

/** -1 .. +1 — is he young, on time or late for this category? */
export function ageScore(age: number, category: CategoryCode) {
  const expected = EXPECTED_AGE[category] ?? age;
  return Math.max(-1, Math.min(1, (expected - age) / 3));
}

const EXPECTED_AGE: Record<CategoryCode, number> = {
  U11: 11,
  U13: 13,
  U15: 15,
  U17: 17,
  U20: 19,
  U23: 22,
  PRO: 26,
};

/** 0 .. 1 — how much untapped potential the AI still believes in. */
export function potentialScore(player: Player, overall: number, age: number) {
  const room = Math.max(0, player.hidden.potential - overall);
  const youth = Math.max(0, Math.min(1, (28 - age) / 14));
  return Math.max(0, Math.min(1, (room / 25) * 0.7 + youth * 0.3));
}

export interface EvaluationInput {
  player: Player;
  ai: CareerAi;
  overall: number;
  age: number;
  category: CategoryCode;
  clubReputation: number;
  seasonStats: MatchStatLine;
}

export interface Evaluation {
  /** Overall standing versus the squad level (in overall points). */
  gap: number;
  form: number;
  formScore: number;
  production: number;
  age: number;
  ageScore: number;
  potential: number;
  /** -100 .. +100 composite used by every decision. */
  score: number;
  averageRating: number;
}

/**
 * Composite career index. Never a single attribute: level, form, production,
 * minutes, morale, fitness, trust, reputation and potential all take part.
 */
export function evaluate(input: EvaluationInput): Evaluation {
  const { player, ai, overall, age, category, clubReputation, seasonStats } = input;
  const gap = levelGap(overall, category, clubReputation);
  const form = formScore(ai);
  const production = productionScore(player, seasonStats);
  const ageFit = ageScore(age, category);
  const potential = potentialScore(player, overall, age);

  const minutesFactor = Math.max(
    -1,
    Math.min(1, (seasonStats.minutes - 700) / 1400),
  );

  const score =
    gap * 2.2 +
    form * 22 +
    production * 12 +
    ageFit * 8 +
    potential * 14 +
    minutesFactor * 6 +
    (ai.coachTrust - 50) * 0.22 +
    (ai.morale - 50) * 0.08 +
    (ai.fitness - 85) * 0.12 +
    (ai.reputation - 30) * 0.08;

  return {
    gap,
    form: recentForm(ai),
    formScore: form,
    production,
    age,
    ageScore: ageFit,
    potential,
    score: Math.max(-100, Math.min(100, score)),
    averageRating: averageRating(seasonStats),
  };
}
