import { clampAttribute, flattenAttributes } from "../player/attributes";
import { calculateOverall, keyAttributes } from "../player/overall";
import type { Random } from "../rng";
import { chance } from "../rng";
import type { AttributeChange, AttributeKey, PlayerAttributes, PositionCode } from "../types";

export interface ProgressionContext {
  age: number;
  position: PositionCode;
  potential: number;
  growthRate: number;
  /** Personality multiplier applied on top of growthRate. */
  personalityGrowth: number;
  /** 0-1: how much football the player actually played this week. */
  load: number;
  /** Average match rating in the period (0 when he did not play). */
  form: number;
  /** Hidden development phase multiplier (breakthrough, plateau, setback...). */
  phaseMultiplier?: number;
}

/** Age curve: teens grow fast, prime is stable, veterans decline. */
export function growthFactor(age: number) {
  if (age <= 16) return 1.35;
  if (age <= 20) return 1.15;
  if (age <= 24) return 0.85;
  if (age <= 28) return 0.45;
  if (age <= 30) return 0.2;
  return 0;
}

export function declineFactor(age: number) {
  if (age < 30) return 0;
  return Math.min(1.4, (age - 29) * 0.22);
}

const PHYSICAL_DECLINE: AttributeKey[] = [
  "pace",
  "acceleration",
  "agility",
  "stamina",
  "jumping",
  "balance",
];

const MENTAL_LATE_GROWTH: AttributeKey[] = [
  "decisions",
  "positioning",
  "composure",
  "concentration",
  "leadership",
  "vision",
];

/**
 * Applies one week of natural + training progression.
 * Growth is intentionally slow: a career spans decades of in-game weeks.
 */
export function progressAttributes(
  attributes: PlayerAttributes,
  context: ProgressionContext,
  random: Random,
): { attributes: PlayerAttributes; changes: AttributeChange[] } {
  const before = flattenAttributes(attributes);
  const overall = calculateOverall(attributes, context.position);
  const room = Math.max(0, context.potential - overall) / 100;

  const growthPower =
    growthFactor(context.age) *
    context.growthRate *
    context.personalityGrowth *
    // Minutes are the engine of development: a player who barely features
    // stagnates, one who plays every week evolves far faster.
    (0.08 + context.load * 1.7) *
    (0.7 + room * 1.6) *
    (context.form ? 0.75 + (context.form - 6) * 0.12 : 0.85) *
    (context.phaseMultiplier ?? 1);

  const decline = declineFactor(context.age);
  const key = new Set<AttributeKey>(keyAttributes(context.position, 8));
  const next: PlayerAttributes = {
    technical: { ...attributes.technical },
    mental: { ...attributes.mental },
    physical: { ...attributes.physical },
  };

  const bump = (group: keyof PlayerAttributes, attributeKey: string, delta: number) => {
    const record = next[group] as Record<string, number>;
    record[attributeKey] = clampAttribute(record[attributeKey] + delta);
  };

  const groups: [keyof PlayerAttributes, Record<string, number>][] = [
    ["technical", attributes.technical],
    ["mental", attributes.mental],
    ["physical", attributes.physical],
  ];

  for (const [group, values] of groups) {
    for (const attributeKey of Object.keys(values)) {
      const typed = attributeKey as AttributeKey;
      const weight = key.has(typed) ? 1.4 : 0.8;
      const probability = Math.min(0.5, growthPower * 0.09 * weight);
      if (probability > 0 && chance(probability, random)) {
        bump(group, attributeKey, 1);
      }

      if (decline > 0) {
        const declines = PHYSICAL_DECLINE.includes(typed);
        const resists = MENTAL_LATE_GROWTH.includes(typed);
        const lossChance = declines ? decline * 0.05 : resists ? 0 : decline * 0.02;
        if (lossChance > 0 && chance(lossChance, random)) {
          bump(group, attributeKey, -1);
        }
      }
    }
  }

  return { attributes: next, changes: diffAttributes(before, flattenAttributes(next)) };
}

export function diffAttributes(
  before: Record<AttributeKey, number>,
  after: Record<AttributeKey, number>,
): AttributeChange[] {
  const changes: AttributeChange[] = [];
  for (const key of Object.keys(after) as AttributeKey[]) {
    if (before[key] !== after[key]) {
      changes.push({ key, before: before[key], after: after[key] });
    }
  }
  return changes.sort((a, b) => b.after - b.before - (a.after - a.before));
}

export function mergeChanges(
  base: AttributeChange[],
  incoming: AttributeChange[],
): AttributeChange[] {
  const map = new Map(base.map((change) => [change.key, { ...change }]));
  for (const change of incoming) {
    const existing = map.get(change.key);
    if (existing) existing.after = change.after;
    else map.set(change.key, { ...change });
  }
  return [...map.values()]
    .filter((change) => change.after !== change.before)
    .sort((a, b) => b.after - b.before - (a.after - a.before));
}
