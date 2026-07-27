import type {
  AttributeKey,
  AttributeWeights,
  PlayerAttributes,
  PositionCode,
} from "../types";
import { clampAttribute, flattenAttributes } from "./attributes";

/**
 * Position-aware overall.
 *
 * Each position declares the attributes that truly matter for it. Anything not
 * listed still counts, but with a small baseline weight so a complete player is
 * always slightly better than a one-dimensional one.
 */
const BASELINE_WEIGHT = 0.25;

/** Shared mental core every outfield position values. */
const CORE: AttributeWeights = {
  decisions: 1,
  concentration: 0.8,
  composure: 0.8,
  teamwork: 0.7,
  determination: 0.7,
  stamina: 0.7,
  naturalFitness: 0.5,
};

export const POSITION_WEIGHTS: Record<PositionCode, AttributeWeights> = {
  // Goalkeepers use dedicated keeper attributes in a future step; for now the
  // calculation leans on positioning, composure and physical presence.
  GK: {
    positioning: 3,
    concentration: 2.5,
    composure: 2.5,
    decisions: 2,
    firstTouch: 1.2,
    passing: 1.2,
    jumping: 2,
    agility: 2,
    balance: 1.5,
    strength: 1.2,
    naturalFitness: 1,
  },
  CB: {
    ...CORE,
    marking: 3,
    tackling: 3,
    heading: 2.6,
    positioning: 2.6,
    strength: 2.2,
    jumping: 2,
    aggression: 1.6,
    passing: 1.2,
    firstTouch: 1,
    pace: 1.2,
  },
  LB: {
    ...CORE,
    marking: 2.2,
    tackling: 2.2,
    crossing: 2.4,
    pace: 2.4,
    acceleration: 2.2,
    stamina: 2.4,
    positioning: 1.8,
    passing: 1.6,
    dribbling: 1.4,
  },
  RB: {
    ...CORE,
    marking: 2.2,
    tackling: 2.2,
    crossing: 2.4,
    pace: 2.4,
    acceleration: 2.2,
    stamina: 2.4,
    positioning: 1.8,
    passing: 1.6,
    dribbling: 1.4,
  },
  DM: {
    ...CORE,
    tackling: 2.8,
    marking: 2.4,
    positioning: 2.6,
    passing: 2.4,
    firstTouch: 1.8,
    vision: 1.6,
    strength: 1.8,
    aggression: 1.6,
    stamina: 2,
  },
  CM: {
    ...CORE,
    passing: 3,
    firstTouch: 2.4,
    vision: 2.4,
    technique: 2.2,
    stamina: 2.2,
    dribbling: 1.6,
    tackling: 1.6,
    positioning: 1.6,
  },
  AM: {
    ...CORE,
    vision: 3,
    passing: 2.8,
    technique: 2.6,
    firstTouch: 2.4,
    dribbling: 2.4,
    finishing: 2,
    setPieces: 1.6,
    agility: 1.8,
    acceleration: 1.6,
  },
  LW: {
    ...CORE,
    dribbling: 3,
    pace: 2.8,
    acceleration: 2.8,
    crossing: 2.2,
    technique: 2.2,
    agility: 2.2,
    finishing: 2,
    firstTouch: 1.8,
    balance: 1.6,
  },
  RW: {
    ...CORE,
    dribbling: 3,
    pace: 2.8,
    acceleration: 2.8,
    crossing: 2.2,
    technique: 2.2,
    agility: 2.2,
    finishing: 2,
    firstTouch: 1.8,
    balance: 1.6,
  },
  ST: {
    ...CORE,
    finishing: 3.4,
    firstTouch: 2.4,
    heading: 2.2,
    positioning: 2.4,
    dribbling: 1.8,
    technique: 1.8,
    acceleration: 2.2,
    pace: 2.2,
    strength: 1.8,
    penalties: 1.2,
  },
};

/** Overall (1-100) for the given attributes evaluated at a given position. */
export function calculateOverall(
  attributes: PlayerAttributes,
  position: PositionCode,
): number {
  const flat = flattenAttributes(attributes);
  const weights = POSITION_WEIGHTS[position];

  let weighted = 0;
  let total = 0;

  for (const key of Object.keys(flat) as AttributeKey[]) {
    const weight = weights[key] ?? BASELINE_WEIGHT;
    weighted += flat[key] * weight;
    total += weight;
  }

  return clampAttribute(weighted / total);
}

/** Best alternative position for the player, useful for future scouting. */
export function bestPosition(attributes: PlayerAttributes): PositionCode {
  const positions = Object.keys(POSITION_WEIGHTS) as PositionCode[];
  return positions.reduce((best, position) =>
    calculateOverall(attributes, position) > calculateOverall(attributes, best)
      ? position
      : best,
  );
}

/** The attributes that weigh the most for a position (UI highlighting). */
export function keyAttributes(position: PositionCode, count = 6): AttributeKey[] {
  return (Object.entries(POSITION_WEIGHTS[position]) as [AttributeKey, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => key);
}
