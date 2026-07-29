import { createEvent } from "../events";
import { createId } from "../ids";
import { nationalityLabel } from "../constants";
import type { Random } from "../rng";
import { chance, randomInt } from "../rng";
import type {
  CallUpRecord,
  CareerAi,
  GameDate,
  GameEvent,
  MatchStatLine,
  Player,
} from "../types";
import { averageRating } from "../player/history";

/**
 * Career AI — national teams.
 *
 * Call-ups depend only on performance and fame: reputation, minutes, ratings
 * and goals. Every call-up is written to the permanent history.
 */

export type NationalLevel = CallUpRecord["level"];

interface LevelRule {
  level: NationalLevel;
  maxAge?: number;
  minAge: number;
  minReputation: number;
  order: number;
}

const LEVELS: LevelRule[] = [
  { level: "U15", minAge: 13, maxAge: 15, minReputation: 14, order: 1 },
  { level: "U17", minAge: 15, maxAge: 17, minReputation: 22, order: 2 },
  { level: "U20", minAge: 17, maxAge: 20, minReputation: 32, order: 3 },
  { level: "Olympic", minAge: 19, maxAge: 23, minReputation: 45, order: 4 },
  { level: "Senior", minAge: 17, minReputation: 58, order: 5 },
];

export const LEVEL_LABELS: Record<NationalLevel, string> = {
  U15: "Seleção Sub-15",
  U17: "Seleção Sub-17",
  U20: "Seleção Sub-20",
  Olympic: "Seleção Olímpica",
  Senior: "Seleção Principal",
};

export function nationalTeamName(nationality: string) {
  return nationalityLabel(nationality);
}

/** Best level the athlete currently qualifies for, if any. */
export function eligibleLevel(age: number, reputation: number): NationalLevel | null {
  const options = LEVELS.filter(
    (rule) =>
      age >= rule.minAge &&
      (rule.maxAge === undefined || age <= rule.maxAge) &&
      reputation >= rule.minReputation,
  );
  if (!options.length) return null;
  return options.sort((a, b) => b.order - a.order)[0].level;
}

export interface CallUpContext {
  player: Player;
  ai: CareerAi;
  date: GameDate;
  age: number;
  seasonStats: MatchStatLine;
  random: Random;
}

export interface CallUpOutcome {
  player: Player;
  ai: CareerAi;
  events: GameEvent[];
}

/** Evaluated at every career review — never scripted, always performance based. */
export function evaluateCallUp(ctx: CallUpContext): CallUpOutcome {
  const { player, ai, date, age, seasonStats, random } = ctx;
  if (!ai.club) return { player, ai, events: [] };

  const level = eligibleLevel(age, ai.reputation);
  if (!level) return { player, ai, events: [] };

  const form = averageRating(seasonStats);
  const playing = seasonStats.appearances >= 5;
  if (!playing || form < 6.6) return { player, ai, events: [] };

  const odds = Math.min(
    0.85,
    (ai.reputation - 10) / 120 + (form - 6.6) * 0.35 + seasonStats.goals * 0.01,
  );
  if (!chance(odds, random)) return { player, ai, events: [] };

  const team = nationalTeamName(player.nationality);
  const existing = player.history.callUps.find(
    (record) => record.level === level && record.seasonYear === date.seasonYear,
  );
  const caps = randomInt(1, 3, random);
  const goals = randomInt(0, Math.max(0, Math.round(seasonStats.goals / 6)), random);

  const callUps = existing
    ? player.history.callUps.map((record) =>
        record.id === existing.id
          ? { ...record, caps: record.caps + caps, goals: record.goals + goals }
          : record,
      )
    : [
        {
          id: createId("award"),
          nationalTeam: team,
          level,
          seasonYear: date.seasonYear,
          caps,
          goals,
        } satisfies CallUpRecord,
        ...player.history.callUps,
      ];

  return {
    player: { ...player, history: { ...player.history, callUps } },
    ai: {
      ...ai,
      nationalTeamLevel: level,
      morale: Math.min(100, ai.morale + 8),
      reputation: Math.min(100, ai.reputation + (level === "Senior" ? 6 : 3)),
    },
    events: [
      createEvent("callUp", date, `Convocado — ${LEVEL_LABELS[level]}`, {
        description: `${team}: ${caps} jogo(s)${goals ? ` e ${goals} gol(s)` : ""} na data FIFA.`,
        tone: "positive",
      }),
    ],
  };
}
