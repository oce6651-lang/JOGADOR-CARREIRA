import { createId } from "../ids";
import type { GameDate, GameEvent, GameEventTone, GameEventType } from "../types";

export interface GameEventDefinition {
  type: GameEventType;
  label: string;
  /** Lucide icon name, resolved by the UI layer. */
  icon: string;
  tone: GameEventTone;
}

/**
 * Every event the career can produce. Systems that do not exist yet are
 * already declared here so future modules only have to emit them.
 */
export const EVENT_DEFINITIONS: Record<GameEventType, GameEventDefinition> = {
  training: { type: "training", label: "Treino", icon: "Dumbbell", tone: "neutral" },
  match: { type: "match", label: "Partida", icon: "Shirt", tone: "info" },
  goal: { type: "goal", label: "Gol", icon: "Target", tone: "positive" },
  injury: { type: "injury", label: "Lesão", icon: "Stethoscope", tone: "danger" },
  recovery: { type: "recovery", label: "Recuperação", icon: "HeartPulse", tone: "positive" },
  growth: { type: "growth", label: "Evolução", icon: "TrendingUp", tone: "positive" },
  decline: { type: "decline", label: "Regressão", icon: "TrendingDown", tone: "warning" },
  birthday: { type: "birthday", label: "Aniversário", icon: "Cake", tone: "info" },
  trial: { type: "trial", label: "Peneira", icon: "Search", tone: "info" },
  transfer: { type: "transfer", label: "Transferência", icon: "Repeat", tone: "info" },
  contract: { type: "contract", label: "Contrato", icon: "FileSignature", tone: "info" },
  callUp: { type: "callUp", label: "Convocação", icon: "Flag", tone: "positive" },
  title: { type: "title", label: "Título", icon: "Trophy", tone: "positive" },
  award: { type: "award", label: "Prêmio", icon: "Award", tone: "positive" },
  categoryChange: {
    type: "categoryChange",
    label: "Mudança de categoria",
    icon: "ArrowUpRight",
    tone: "positive",
  },
  seasonStart: {
    type: "seasonStart",
    label: "Início de temporada",
    icon: "CalendarPlus",
    tone: "info",
  },
  seasonEnd: {
    type: "seasonEnd",
    label: "Fim de temporada",
    icon: "CalendarCheck",
    tone: "info",
  },
  vacation: { type: "vacation", label: "Férias", icon: "Palmtree", tone: "neutral" },
  retirement: { type: "retirement", label: "Aposentadoria", icon: "Medal", tone: "warning" },
  milestone: { type: "milestone", label: "Marco", icon: "Sparkles", tone: "info" },
};

export const EVENT_TYPES = Object.keys(EVENT_DEFINITIONS) as GameEventType[];

export function eventDefinition(type: GameEventType): GameEventDefinition {
  return EVENT_DEFINITIONS[type] ?? EVENT_DEFINITIONS.milestone;
}

export function createEvent(
  type: GameEventType,
  date: GameDate,
  title: string,
  options: { description?: string; tone?: GameEventTone; data?: Record<string, unknown> } = {},
): GameEvent {
  return {
    id: createId("event"),
    type,
    date,
    title,
    description: options.description,
    tone: options.tone ?? eventDefinition(type).tone,
    data: options.data,
  };
}

/** Permanent archive cap — keeps saves light without losing recent history. */
export const MAX_STORED_EVENTS = 600;

export function appendEvents(archive: GameEvent[], incoming: GameEvent[]): GameEvent[] {
  if (!incoming.length) return archive;
  return [...incoming.slice().reverse(), ...archive].slice(0, MAX_STORED_EVENTS);
}
