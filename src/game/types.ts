/**
 * Project Football Career — core domain types.
 *
 * Every entity carries a unique `id` so future systems (clubs, competitions,
 * transfers, agents, injuries...) can reference each other without coupling.
 * Nothing here knows about React or the UI.
 */

export type EntityId = string;

/** Discriminates the kind of an entity id, useful for future registries. */
export type EntityKind =
  | "career"
  | "player"
  | "club"
  | "competition"
  | "match"
  | "contract"
  | "agent"
  | "event";

export type Foot = "left" | "right" | "both";

export type PositionCode =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "DM"
  | "CM"
  | "AM"
  | "LW"
  | "RW"
  | "ST";

export interface PositionDefinition {
  code: PositionCode;
  /** Human readable label (pt-BR). */
  label: string;
  /** Broad group used for grouping in UI and future tactical logic. */
  group: "goalkeeper" | "defender" | "midfielder" | "forward";
}

export interface Nationality {
  code: string;
  label: string;
  flag: string;
}

/** ISO date string (YYYY-MM-DD). */
export type IsoDate = string;

/**
 * In-game clock. A career is a long sequence of seasons; each season is split
 * into weeks so future systems (matches, training, transfer windows) can hook
 * into a single, stable timeline.
 */
export interface GameDate {
  /** Starting year of the season, e.g. 2026 for the 2026/27 season. */
  seasonYear: number;
  /** 1-based week inside the season. */
  week: number;
  /** Real world date this week maps to, kept for age calculations. */
  date: IsoDate;
}

export interface CareerTimeline {
  current: GameDate;
  /** Number of weeks elapsed since the career started. */
  elapsedWeeks: number;
  /** Seasons already completed. */
  completedSeasons: number;
}

/** Snapshot of who the athlete is. Attributes/evolution come later. */
export interface PlayerIdentity {
  id: EntityId;
  firstName: string;
  lastName: string;
  birthDate: IsoDate;
  nationality: string;
  position: PositionCode;
  foot: Foot;
}

export type CareerStatus = "unsigned" | "active" | "retired";

export interface CareerLogEntry {
  id: EntityId;
  date: GameDate;
  title: string;
  description?: string;
  kind: "milestone" | "info";
}

/** A full save file. Future systems add their own top-level slices here. */
export interface Career {
  id: EntityId;
  version: number;
  createdAt: number;
  updatedAt: number;
  status: CareerStatus;
  player: PlayerIdentity;
  timeline: CareerTimeline;
  log: CareerLogEntry[];
}

export interface CareerSummary {
  id: EntityId;
  playerName: string;
  position: PositionCode;
  age: number;
  seasonYear: number;
  updatedAt: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoSave: boolean;
  language: "pt-BR";
}
