import { createId } from "../ids";
import type { Agent, CareerAi, MatchStatLine, Player } from "../types";

/**
 * Career AI — agents.
 *
 * Representation is a privilege, never a given. Agents live off commission, so
 * they only sign athletes they believe they can place: someone with a club
 * history, minutes on the pitch, visible potential and the right head. An
 * unknown teenager with no youth spell will be turned down by almost everyone.
 */

export interface AgentRequirements {
  /** Minimum career reputation. */
  minReputation: number;
  /** Minimum senior/youth appearances registered in the career. */
  minAppearances: number;
  /** Minimum number of club spells (0 = accepts a total unknown). */
  minSpells: number;
  /** Minimum overall the agent bothers to look at. */
  minOverall: number;
  /** Minimum projected level (overall + untapped potential). */
  minProjection: number;
}

export interface AgentTemplate
  extends Omit<Agent, "id" | "hiredSeason" | "homeCountry" | "homeState"> {
  requirements: AgentRequirements;
}

export const AGENT_POOL: AgentTemplate[] = [
  {
    name: "Ricardo Mendes",
    quality: 32,
    commission: 3,
    minReputation: 0,
    description:
      "Empresário de bairro. Conhece peneiras e clubes pequenos da região, mas só assina quem já pisou em um clube.",
    requirements: {
      minReputation: 0,
      minAppearances: 0,
      minSpells: 1,
      minOverall: 28,
      minProjection: 44,
    },
  },
  {
    name: "Sônia Vasques",
    quality: 48,
    commission: 5,
    minReputation: 18,
    description: "Especialista em categorias de base. Ótima em conseguir contratos longos.",
    requirements: {
      minReputation: 18,
      minAppearances: 20,
      minSpells: 1,
      minOverall: 40,
      minProjection: 58,
    },
  },
  {
    name: "Djalma Prado",
    quality: 63,
    commission: 7,
    minReputation: 34,
    description: "Trânsito livre nos clubes da Série A e boa conversa por salário.",
    requirements: {
      minReputation: 34,
      minAppearances: 45,
      minSpells: 1,
      minOverall: 52,
      minProjection: 66,
    },
  },
  {
    name: "Helena Bertoldo",
    quality: 78,
    commission: 9,
    minReputation: 52,
    description: "Negocia com clubes do exterior e força papéis de titular no contrato.",
    requirements: {
      minReputation: 52,
      minAppearances: 90,
      minSpells: 2,
      minOverall: 64,
      minProjection: 74,
    },
  },
  {
    name: "Marco Salvatore",
    quality: 92,
    commission: 12,
    minReputation: 70,
    description: "Um dos maiores agentes do mundo. Só trabalha com quem já é nome feito.",
    requirements: {
      minReputation: 70,
      minAppearances: 150,
      minSpells: 2,
      minOverall: 74,
      minProjection: 80,
    },
  },
];

export interface AgentEvaluationContext {
  player: Player;
  ai: CareerAi;
  overall: number;
  age: number;
  totals: MatchStatLine;
  /** Number of club spells already lived (youth included). */
  spells: number;
}

export interface AgentAvailability {
  template: AgentTemplate;
  interested: boolean;
  /** Human readable reason in Brazilian Portuguese when he refuses. */
  reason?: string;
}

/** Projected ceiling the agent believes in — never the raw potential. */
function projection(context: AgentEvaluationContext) {
  const { player, ai, overall, age } = context;
  const room = Math.max(0, player.hidden.potential - overall);
  const youth = Math.max(0, Math.min(1, (26 - age) / 12));
  return (
    overall +
    room * (0.25 + youth * 0.35) +
    ai.reputation * 0.08 +
    (player.attributes.mental.determination - 50) * 0.05
  );
}

/** Does this agent agree to represent the athlete, and why not? */
export function evaluateAgent(
  template: AgentTemplate,
  context: AgentEvaluationContext,
): AgentAvailability {
  const need = template.requirements;
  const { ai, overall, totals, spells } = context;
  const projected = projection(context);

  if (spells < need.minSpells) {
    return {
      template,
      interested: false,
      reason:
        need.minSpells > 1
          ? "Só trabalha com atletas que já passaram por mais de um clube."
          : "Não representa atletas que nunca defenderam um clube.",
    };
  }
  if (ai.reputation < need.minReputation) {
    return { template, interested: false, reason: "Você ainda é desconhecido demais para ele." };
  }
  if (totals.appearances < need.minAppearances) {
    return {
      template,
      interested: false,
      reason: `Quer ver pelo menos ${need.minAppearances} jogos na carreira.`,
    };
  }
  if (overall < need.minOverall) {
    return { template, interested: false, reason: "Avaliou o nível técnico e passou." };
  }
  if (projected < need.minProjection) {
    return { template, interested: false, reason: "Não enxerga margem de evolução suficiente." };
  }
  return { template, interested: true };
}

/** Every agent in the market, with his verdict on this athlete. */
export function agentMarket(context: AgentEvaluationContext): AgentAvailability[] {
  return AGENT_POOL.map((template) => evaluateAgent(template, context));
}

/** Only the agents that would actually sign the athlete today. */
export function availableAgents(context: AgentEvaluationContext): AgentTemplate[] {
  return agentMarket(context)
    .filter((entry) => entry.interested)
    .map((entry) => entry.template);
}

export interface AgentHome {
  country: string;
  state?: string;
}

export function hireAgent(
  template: AgentTemplate,
  seasonYear: number,
  home: AgentHome,
): Agent {
  const { requirements: _requirements, ...rest } = template;
  return {
    ...rest,
    id: createId("agent"),
    hiredSeason: seasonYear,
    homeCountry: home.country,
    homeState: home.state,
  };
}

/** Net weekly wage after the agent's commission. */
export function netWage(weeklyWage: number, agent: Agent | null) {
  if (!agent) return weeklyWage;
  return Math.round(weeklyWage * (1 - agent.commission / 100));
}
