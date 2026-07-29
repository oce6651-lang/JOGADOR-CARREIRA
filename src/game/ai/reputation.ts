import type { CareerAi } from "../types";
import { clamp01to100 } from "./state";

/**
 * Career AI — player reputation.
 *
 * Reputation is how known the athlete is in the football world. It opens
 * trials, attracts scouts, improves every negotiation and decides national
 * team call-ups.
 */

export interface ReputationTier {
  /** Minimum reputation to reach the tier. */
  min: number;
  label: string;
  description: string;
}

export const REPUTATION_TIERS: ReputationTier[] = [
  { min: 0, label: "Desconhecido", description: "Ninguém fora do bairro conhece o atleta." },
  { min: 12, label: "Promessa local", description: "Comentado nas categorias de base da região." },
  { min: 25, label: "Destaque regional", description: "Olheiros da região começam a acompanhar." },
  { min: 40, label: "Nome nacional", description: "Citado pela imprensa esportiva do país." },
  { min: 56, label: "Estrela do país", description: "Um dos jogadores mais falados da liga." },
  { min: 72, label: "Reconhecido no exterior", description: "Clubes de fora monitoram cada partida." },
  { min: 86, label: "Craque mundial", description: "Referência global da posição." },
];

export function reputationTier(value: number): ReputationTier {
  return [...REPUTATION_TIERS].reverse().find((tier) => value >= tier.min) ?? REPUTATION_TIERS[0];
}

export function reputationLabel(value: number) {
  return reputationTier(value).label;
}

/** Progress (0-1) towards the next reputation tier. */
export function reputationProgress(value: number) {
  const current = reputationTier(value);
  const next = REPUTATION_TIERS.find((tier) => tier.min > current.min);
  if (!next) return 1;
  return Math.max(0, Math.min(1, (value - current.min) / (next.min - current.min)));
}

export function gainReputation(ai: CareerAi, amount: number): CareerAi {
  return { ...ai, reputation: clamp01to100(ai.reputation + amount) };
}

/**
 * Negotiation leverage (0-1): how much weight the athlete has at the table.
 * Reputation is the main driver, the agent and current form do the rest.
 */
export function negotiationLeverage(ai: CareerAi) {
  const agent = ai.agent ? ai.agent.quality / 240 : 0;
  const scouts = Math.min(0.15, ai.scouting.length * 0.05);
  const trust = (ai.coachTrust - 50) / 500;
  return Math.max(0.05, Math.min(0.95, ai.reputation / 130 + agent + scouts + trust));
}
