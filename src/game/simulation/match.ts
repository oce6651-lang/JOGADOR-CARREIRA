import { createId } from "../ids";
import { calculateOverall } from "../player/overall";
import { createStatLine } from "../player/history";
import type { Random } from "../rng";
import { chance, pick, randomBetween, randomInt } from "../rng";
import type { GameDate, MatchRecord, MatchStatLine, Player, PositionCode } from "../types";

/**
 * Match engine. The career AI decides *if* and *how much* the athlete plays;
 * this module only resolves what happens on the pitch once he is on it.
 */
export interface MatchContext {
  date: GameDate;
  competition: string;
  opponent: string;
  /** Decided by the AI selection layer. */
  starter: boolean;
  /** Minutes range used when he comes off the bench. */
  benchMinutes: [number, number];
  /** 0-100 match rhythm. */
  sharpness: number;
  /** 0-100 happiness. */
  morale: number;
  /** 1-100 strength of his own team. */
  teamStrength: number;
  /** 1-100 strength of the opponent. */
  opponentStrength: number;
}

const GOAL_RATE: Record<PositionCode, number> = {
  GK: 0,
  CB: 0.06,
  LB: 0.04,
  RB: 0.04,
  DM: 0.06,
  CM: 0.1,
  AM: 0.2,
  LW: 0.24,
  RW: 0.24,
  ST: 0.42,
  FIX: 0.12,
  AD: 0.28,
  AE: 0.28,
  PIV: 0.55,
};

const ASSIST_RATE: Record<PositionCode, number> = {
  GK: 0,
  CB: 0.03,
  LB: 0.12,
  RB: 0.12,
  DM: 0.08,
  CM: 0.16,
  AM: 0.26,
  LW: 0.24,
  RW: 0.24,
  ST: 0.16,
  FIX: 0.14,
  AD: 0.3,
  AE: 0.3,
  PIV: 0.24,
};

export function simulateMatch(
  player: Player,
  context: MatchContext,
  random: Random,
): MatchRecord {
  const overall = calculateOverall(player.attributes, player.position);
  const quality = overall / 100;
  const minutes = context.starter
    ? randomInt(65, 90, random)
    : randomInt(context.benchMinutes[0], context.benchMinutes[1], random);
  const share = minutes / 90;

  const condition =
    0.75 + (context.sharpness / 100) * 0.2 + (context.morale / 100) * 0.15;
  const teamHelp = 0.75 + (context.teamStrength / 100) * 0.5;

  const goals = countEvents(
    GOAL_RATE[player.position] * share * (0.5 + quality) * condition * teamHelp,
    random,
  );
  const assists = countEvents(
    ASSIST_RATE[player.position] * share * (0.5 + quality) * condition * teamHelp,
    random,
  );

  const stability = player.hidden.consistency;
  const base = 5.4 + quality * 1.6;
  const swing = randomBetween(-1.5, 1.5, random) / stability;
  const conditionBonus = (context.sharpness - 60) / 160 + (context.morale - 60) / 220;
  const rating = clampRating(
    base + swing + conditionBonus + goals * 0.8 + assists * 0.45,
  );

  const strengthEdge = (context.teamStrength - context.opponentStrength) / 40;
  const scoreFor = Math.max(
    0,
    randomInt(0, 3, random) + (chance(Math.min(0.8, 0.35 + strengthEdge * 0.2), random) ? 1 : 0),
  );
  const scoreAgainst = Math.max(
    0,
    randomInt(0, 3, random) - (strengthEdge > 0.5 ? 1 : 0),
  );

  return {
    id: createId("match"),
    date: context.date,
    competition: context.competition,
    opponent: context.opponent,
    scoreFor: Math.max(scoreFor, goals),
    scoreAgainst,
    minutes,
    goals,
    assists,
    rating: Number(rating.toFixed(2)),
  };
}

export function matchToStatLine(player: Player, match: MatchRecord): MatchStatLine {
  const line = createStatLine();
  line.appearances = 1;
  line.minutes = match.minutes;
  line.goals = match.goals;
  line.assists = match.assists;
  line.cleanSheets = player.position === "GK" && match.scoreAgainst === 0 ? 1 : 0;
  line.ratingSum = match.rating;
  return line;
}

export const PLACEHOLDER_OPPONENTS = [
  "Rival da cidade",
  "Adversário regional",
  "Equipe visitante",
  "Time da capital",
  "Clube tradicional",
];

export function randomOpponent(random: Random) {
  return pick(PLACEHOLDER_OPPONENTS, random);
}

function countEvents(rate: number, random: Random) {
  let count = 0;
  let remaining = Math.max(0, rate);
  while (remaining > 0) {
    if (chance(Math.min(1, remaining), random)) count += 1;
    remaining -= 1;
  }
  return count;
}

function clampRating(value: number) {
  return Math.max(3, Math.min(10, value));
}
