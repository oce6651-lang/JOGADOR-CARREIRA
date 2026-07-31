import type { Player } from "../types";

/**
 * Physical growth.
 *
 * Between ~7 and 18/19 the athlete grows: height rises year after year with a
 * puberty spike around 12-15 and stops in the late teens. Weight never stops
 * moving — it follows the growth first and then training, diet, injuries and
 * conditioning for the rest of the career.
 */

/** Average height gained in a year, per age (cm). */
const HEIGHT_GAIN: Record<number, number> = {
  7: 6,
  8: 6,
  9: 6,
  10: 6.2,
  11: 6.6,
  12: 7.4,
  13: 8.2,
  14: 7.6,
  15: 5.4,
  16: 3.2,
  17: 1.8,
  18: 0.9,
  19: 0.4,
};

export const ADULT_HEIGHT_AGE = 20;

export interface GrowthInput {
  /** Age the athlete just turned. */
  age: number;
  /** 0-100 physical condition of the season. */
  fitness: number;
  /** Weeks lost to injury during the last year. */
  injuryWeeks: number;
  /** Strength attribute — muscle mass follows it. */
  strength: number;
}

export interface GrowthResult {
  heightCm: number;
  weightKg: number;
  heightDelta: number;
  weightDelta: number;
}

/** Weight a footballer of that height and strength tends to settle at. */
function targetWeight(heightCm: number, strength: number) {
  return (heightCm - 100) * 0.9 + (strength - 50) * 0.12;
}

/** One year of physical development. Called on every birthday. */
export function annualGrowth(
  player: Player,
  input: GrowthInput,
  random: () => number,
): GrowthResult {
  const { age, fitness, injuryWeeks, strength } = input;
  const jitter = 0.7 + random() * 0.6;
  const heightDelta =
    age < ADULT_HEIGHT_AGE ? Number(((HEIGHT_GAIN[age] ?? 0) * jitter).toFixed(1)) : 0;

  const heightCm = Math.round(player.heightCm + heightDelta);

  // Growing bodies chase the ideal weight fast; adults drift slowly and are
  // pushed around by conditioning and time on the treatment table.
  const target = targetWeight(heightCm, strength);
  const pull = age < ADULT_HEIGHT_AGE ? 0.55 : 0.18;
  const conditioning = (fitness - 80) * 0.03;
  const inactivity = Math.min(3, injuryWeeks * 0.12);
  const drift = (random() - 0.5) * 1.4;

  const weightCm =
    player.weightKg + (target - player.weightKg) * pull - conditioning + inactivity + drift;
  const weightKg = Math.max(28, Math.round(weightCm));

  return {
    heightCm,
    weightKg,
    heightDelta,
    weightDelta: weightKg - player.weightKg,
  };
}

/** Human readable summary used by the birthday event. */
export function growthNote(result: GrowthResult) {
  const parts: string[] = [];
  if (result.heightDelta > 0) parts.push(`+${result.heightDelta.toFixed(1)} cm`);
  if (result.weightDelta !== 0) {
    parts.push(`${result.weightDelta > 0 ? "+" : ""}${result.weightDelta} kg`);
  }
  if (!parts.length) return "Estrutura física estável.";
  return `Desenvolvimento físico: ${parts.join(" · ")} (${result.heightCm} cm / ${result.weightKg} kg).`;
}
