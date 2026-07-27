import { createId } from "../ids";
import { calculateOverall } from "../player/overall";
import { createStatLine } from "../player/history";
import type { Random } from "../rng";
import { chance, pick, randomBetween, randomInt } from "../rng";
import type { GameDate, MatchRecord, MatchStatLine, Player, PositionCode } from "../types";

/**
 * Lightweight match engine. Clubs and competitions do not exist yet, so the
 * opponent/competition come from placeholders — the shape of the record is
 * already final so the real systems only have to feed better data in.
 */
export interface MatchContext {
  date: GameDate;
  competition: string;
  opponent: string;
  /** 0-1 chance the player starts the match. */
  starterChance: number;
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
};

export function simulateMatch(
  player: Player,
  context: MatchContext,
  random: Random,
): MatchRecord {
  const overall = calculateOverall(player.attributes, player.position);
  const quality = overall / 100;
  const starter = chance(context.starterChance, random);
  const minutes = starter ? randomInt(60, 90, random) : randomInt(5, 35, random);
  const share = minutes / 90;

  const goals = countEvents(GOAL_RATE[player.position] * share * (0.5 + quality), random);
  const assists = countEvents(
    ASSIST_RATE[player.position] * share * (0.5 + quality),
    random,
  );

  const stability = player.hidden.consistency;
  const base = 5.4 + quality * 1.6;
  const swing = randomBetween(-1.5, 1.5, random) / stability;
  const rating = clampRating(base + swing + goals * 0.8 + assists * 0.45);

  const scoreFor = randomInt(0, 4, random);
  const scoreAgainst = randomInt(0, 3, random);

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
