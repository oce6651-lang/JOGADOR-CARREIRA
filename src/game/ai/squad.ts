import type { SquadRole } from "../types";
import type { Evaluation } from "./evaluation";

/**
 * Career AI — squad role & selection.
 *
 * Decides whether the athlete is untouchable, a starter, a rotation option,
 * a bench player, a deep reserve or simply not listed for the match.
 */

export const ROLE_LABELS: Record<SquadRole, string> = {
  star: "Estrela do time",
  starter: "Titular absoluto",
  rotation: "Titular alternado",
  bench: "Reserva utilizado",
  reserve: "Reserva pouco utilizado",
  outOfSquad: "Fora dos relacionados",
};

export const ROLE_ORDER: SquadRole[] = [
  "outOfSquad",
  "reserve",
  "bench",
  "rotation",
  "starter",
  "star",
];

export interface SelectionProfile {
  /** Chance of being listed and getting on the pitch in a given match week. */
  playChance: number;
  /** Chance of starting when listed. */
  starterChance: number;
  /** Minutes range when coming off the bench. */
  benchMinutes: [number, number];
}

const SELECTION: Record<SquadRole, SelectionProfile> = {
  star: { playChance: 0.96, starterChance: 0.96, benchMinutes: [25, 45] },
  starter: { playChance: 0.92, starterChance: 0.86, benchMinutes: [20, 40] },
  rotation: { playChance: 0.85, starterChance: 0.5, benchMinutes: [15, 35] },
  bench: { playChance: 0.72, starterChance: 0.16, benchMinutes: [8, 30] },
  reserve: { playChance: 0.35, starterChance: 0.05, benchMinutes: [4, 18] },
  outOfSquad: { playChance: 0.06, starterChance: 0.02, benchMinutes: [3, 12] },
};

export function selectionProfile(role: SquadRole) {
  return SELECTION[role];
}

/**
 * Turns the composite evaluation into a squad role. Sticky by design: roles
 * move one step at a time so the career feels like a story, not a dice roll.
 */
export function decideRole(current: SquadRole, evaluation: Evaluation): SquadRole {
  const target = targetRole(evaluation);
  const currentIndex = ROLE_ORDER.indexOf(current);
  const targetIndex = ROLE_ORDER.indexOf(target);
  if (targetIndex === currentIndex) return current;
  const step = targetIndex > currentIndex ? 1 : -1;
  return ROLE_ORDER[currentIndex + step];
}

function targetRole(evaluation: Evaluation): SquadRole {
  const { score, gap } = evaluation;
  if (score >= 40 && gap >= 6) return "star";
  if (score >= 20) return "starter";
  if (score >= 2) return "rotation";
  if (score >= -16) return "bench";
  if (score >= -34) return "reserve";
  return "outOfSquad";
}

export function roleLabel(role: SquadRole) {
  return ROLE_LABELS[role];
}

/** Roles that make the athlete effectively lose his career development. */
export function isMarginal(role: SquadRole) {
  return role === "reserve" || role === "outOfSquad";
}
