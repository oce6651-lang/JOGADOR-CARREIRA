import { createId } from "../ids";
import type { Agent } from "../types";

/**
 * Career AI — agents.
 *
 * The agent is the player's ally at the negotiation table: he finds trials,
 * raises wages and unlocks bigger clubs — for a slice of every salary.
 */

export interface AgentTemplate extends Omit<Agent, "id" | "hiredSeason"> {}

export const AGENT_POOL: AgentTemplate[] = [
  {
    name: "Ricardo Mendes",
    quality: 32,
    commission: 3,
    minReputation: 0,
    description: "Empresário de bairro. Conhece peneiras e clubes pequenos da região.",
  },
  {
    name: "Sônia Vasques",
    quality: 48,
    commission: 5,
    minReputation: 18,
    description: "Especialista em categorias de base. Ótima em conseguir contratos longos.",
  },
  {
    name: "Djalma Prado",
    quality: 63,
    commission: 7,
    minReputation: 34,
    description: "Trânsito livre nos clubes da Série A e boa conversa por salário.",
  },
  {
    name: "Helena Bertoldo",
    quality: 78,
    commission: 9,
    minReputation: 52,
    description: "Negocia com clubes do exterior e força papéis de titular no contrato.",
  },
  {
    name: "Marco Salvatore",
    quality: 92,
    commission: 12,
    minReputation: 70,
    description: "Um dos maiores agentes do mundo. Só trabalha com quem já é nome feito.",
  },
];

export function availableAgents(reputation: number): AgentTemplate[] {
  return AGENT_POOL.filter((agent) => reputation >= agent.minReputation);
}

export function hireAgent(template: AgentTemplate, seasonYear: number): Agent {
  return { ...template, id: createId("agent"), hiredSeason: seasonYear };
}

/** Net weekly wage after the agent's commission. */
export function netWage(weeklyWage: number, agent: Agent | null) {
  if (!agent) return weeklyWage;
  return Math.round(weeklyWage * (1 - agent.commission / 100));
}
