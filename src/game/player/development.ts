import type { Random } from "../rng";
import { randomInt } from "../rng";
import type { DevelopmentPhaseId, DevelopmentState } from "../types";

/**
 * Development phases.
 *
 * Two identical talents must never evolve the same way. The athlete moves
 * through hidden phases — an explosion of growth, a long plateau, a setback —
 * that multiply (or kill) the weekly progression. The player only feels the
 * consequences: he is never told which phase he is in.
 */

interface PhaseDefinition {
  id: DevelopmentPhaseId;
  label: string;
  /** Growth multiplier while the phase lasts. */
  range: [number, number];
  /** Duration in weeks. */
  weeks: [number, number];
  /** Relative weight when drawing a new phase. */
  weight: (age: number) => number;
  headline: string;
  description: string;
}

const PHASES: PhaseDefinition[] = [
  {
    id: "breakthrough",
    label: "Estirão",
    range: [1.6, 2.4],
    weeks: [10, 30],
    weight: (age) => (age <= 21 ? 22 : age <= 26 ? 8 : 2),
    headline: "Salto de rendimento",
    description: "O atleta entrou em uma fase de evolução acelerada nos treinos.",
  },
  {
    id: "steady",
    label: "Evolução constante",
    range: [0.95, 1.25],
    weeks: [16, 44],
    weight: () => 40,
    headline: "Trabalho constante",
    description: "A evolução segue dentro do esperado pela comissão técnica.",
  },
  {
    id: "plateau",
    label: "Estagnação",
    range: [0.35, 0.6],
    weeks: [14, 40],
    weight: (age) => (age <= 18 ? 16 : 26),
    headline: "Fase de estagnação",
    description: "A evolução travou: o atleta repete os mesmos números há semanas.",
  },
  {
    id: "setback",
    label: "Queda de rendimento",
    range: [0.05, 0.25],
    weeks: [8, 22],
    weight: (age) => (age <= 20 ? 8 : 16),
    headline: "Queda de rendimento",
    description: "Nada sai como deveria: o rendimento nos treinos despencou.",
  },
  {
    id: "lateBloom",
    label: "Amadurecimento tardio",
    range: [1.3, 1.9],
    weeks: [20, 50],
    weight: (age) => (age >= 24 ? 14 : 2),
    headline: "Amadurecimento",
    description: "A leitura de jogo e a maturidade dão um novo patamar ao atleta.",
  },
];

const BY_ID = new Map(PHASES.map((phase) => [phase.id, phase]));

export function developmentPhaseLabel(id: DevelopmentPhaseId) {
  return BY_ID.get(id)?.label ?? id;
}

export function developmentPhaseHeadline(id: DevelopmentPhaseId) {
  return BY_ID.get(id)?.headline ?? "Nova fase";
}

export function developmentPhaseDescription(id: DevelopmentPhaseId) {
  return BY_ID.get(id)?.description ?? "";
}

/** Draws a brand new phase, weighted by age. */
export function rollDevelopmentPhase(
  age: number,
  elapsedWeeks: number,
  random: Random,
  avoid?: DevelopmentPhaseId,
): DevelopmentState {
  const pool = PHASES.filter((phase) => phase.id !== avoid);
  const total = pool.reduce((sum, phase) => sum + phase.weight(age), 0);
  let ticket = random() * total;
  let chosen = pool[pool.length - 1];
  for (const phase of pool) {
    ticket -= phase.weight(age);
    if (ticket <= 0) {
      chosen = phase;
      break;
    }
  }

  const [minMultiplier, maxMultiplier] = chosen.range;
  return {
    phase: chosen.id,
    weeksLeft: randomInt(chosen.weeks[0], chosen.weeks[1], random),
    multiplier:
      Math.round((minMultiplier + random() * (maxMultiplier - minMultiplier)) * 100) / 100,
    startedWeek: elapsedWeeks,
  };
}

export interface DevelopmentTick {
  state: DevelopmentState;
  /** True when a new phase started this week. */
  changed: boolean;
}

/** Advances one week of the current phase, drawing a new one when it ends. */
export function advanceDevelopment(
  state: DevelopmentState | undefined,
  age: number,
  elapsedWeeks: number,
  random: Random,
): DevelopmentTick {
  if (!state) {
    return { state: rollDevelopmentPhase(age, elapsedWeeks, random), changed: false };
  }
  if (state.weeksLeft > 1) {
    return { state: { ...state, weeksLeft: state.weeksLeft - 1 }, changed: false };
  }
  return {
    state: rollDevelopmentPhase(age, elapsedWeeks, random, state.phase),
    changed: true,
  };
}

/** A serious injury can break a promising phase. */
export function breakDevelopment(elapsedWeeks: number, random: Random): DevelopmentState {
  return {
    phase: "setback",
    weeksLeft: randomInt(10, 26, random),
    multiplier: 0.1 + random() * 0.2,
    startedWeek: elapsedWeeks,
  };
}
