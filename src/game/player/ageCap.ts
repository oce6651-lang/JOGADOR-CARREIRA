import type { PlayerAttributes, PositionCode } from "../types";
import { clampAttribute } from "./attributes";
import { calculateOverall } from "./overall";

/**
 * Youth development ceilings.
 *
 * Real academies never produce a 60-rated eleven year old: raw talent still
 * needs a grown body. Each age bracket therefore has a hard overall ceiling
 * that no amount of training, form or potential can break. From 16 on the
 * player is treated as an adult footballer and the ceiling disappears.
 */
const AGE_CEILINGS: { maxAge: number; cap: number }[] = [
  { maxAge: 7, cap: 10 },
  { maxAge: 13, cap: 30 },
  { maxAge: 14, cap: 45 },
  { maxAge: 15, cap: 55 },
];

/** Highest overall a player of this age is allowed to reach (100 = free). */
export function ageOverallCap(age: number): number {
  for (const rule of AGE_CEILINGS) {
    if (age <= rule.maxAge) return rule.cap;
  }
  return 100;
}

/** True when the age bracket still limits the player's overall. */
export function hasAgeCeiling(age: number) {
  return ageOverallCap(age) < 100;
}

function scaleAttributes(attributes: PlayerAttributes, factor: number): PlayerAttributes {
  const scaleGroup = <T extends Record<string, number>>(group: T): T =>
    Object.fromEntries(
      Object.entries(group).map(([key, value]) => [key, clampAttribute(value * factor)]),
    ) as T;

  return {
    technical: scaleGroup(attributes.technical),
    mental: scaleGroup(attributes.mental),
    physical: scaleGroup(attributes.physical),
  };
}

/**
 * Compresses the attribute set until the resulting overall respects the age
 * ceiling. The profile shape is preserved — a young winger keeps being fast
 * relative to himself, he simply is not a finished footballer yet.
 */
export function enforceAgeCap(
  attributes: PlayerAttributes,
  position: PositionCode,
  age: number,
): PlayerAttributes {
  const cap = ageOverallCap(age);
  if (cap >= 100) return attributes;

  let current = attributes;
  for (let pass = 0; pass < 4; pass += 1) {
    const overall = calculateOverall(current, position);
    if (overall <= cap) return current;
    current = scaleAttributes(current, Math.max(0.5, (cap / overall) * 0.995));
  }
  return current;
}
