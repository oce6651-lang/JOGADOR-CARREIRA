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
  | "injury"
  | "award"
  | "title"
  | "transfer"
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

export type PositionGroup = "goalkeeper" | "defender" | "midfielder" | "forward";

export interface PositionDefinition {
  code: PositionCode;
  /** Human readable label (pt-BR). */
  label: string;
  /** Broad group used for grouping in UI and future tactical logic. */
  group: PositionGroup;
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

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export type AttributeCategory = "technical" | "mental" | "physical";

export type TechnicalAttributeKey =
  | "finishing"
  | "passing"
  | "crossing"
  | "dribbling"
  | "firstTouch"
  | "heading"
  | "marking"
  | "tackling"
  | "technique"
  | "setPieces"
  | "penalties";

export type MentalAttributeKey =
  | "concentration"
  | "decisions"
  | "determination"
  | "leadership"
  | "composure"
  | "positioning"
  | "vision"
  | "teamwork"
  | "aggression";

export type PhysicalAttributeKey =
  | "pace"
  | "acceleration"
  | "agility"
  | "balance"
  | "jumping"
  | "strength"
  | "stamina"
  | "naturalFitness";

export type AttributeKey =
  | TechnicalAttributeKey
  | MentalAttributeKey
  | PhysicalAttributeKey;

export interface AttributeDefinition<K extends AttributeKey = AttributeKey> {
  key: K;
  label: string;
  category: AttributeCategory;
}

export interface PlayerAttributes {
  technical: Record<TechnicalAttributeKey, number>;
  mental: Record<MentalAttributeKey, number>;
  physical: Record<PhysicalAttributeKey, number>;
}

/** Weight map used to compute a position-aware overall. */
export type AttributeWeights = Partial<Record<AttributeKey, number>>;

/* ------------------------------------------------------------------ */
/* Personality & hidden data                                           */
/* ------------------------------------------------------------------ */

export type PersonalityTraitId =
  | "ambitious"
  | "hardWorking"
  | "undisciplined"
  | "leader"
  | "calm"
  | "competitive"
  | "shy"
  | "confident"
  | "loyal"
  | "temperamental";

export interface PersonalityTrait {
  id: PersonalityTraitId;
  label: string;
  description: string;
  /** Multipliers future systems read (growth, morale, discipline...). */
  effects: {
    growth?: number;
    morale?: number;
    discipline?: number;
    negotiation?: number;
  };
}

/**
 * Never shown to the player. Drives progression across the whole career.
 */
export interface PlayerHiddenProfile {
  /** Maximum overall the player could theoretically reach (1-100). */
  potential: number;
  /** How fast the player converts training/minutes into growth (0.6 - 1.4). */
  growthRate: number;
  /** Chance modifier for injuries (0.6 - 1.5). */
  injuryProneness: number;
  /** Match rating stability (0.6 - 1.4). */
  consistency: number;
  /** Performance boost under pressure (0.6 - 1.4). */
  bigMatches: number;
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

export type PlayerStatusId =
  | "unsigned"
  | "contracted"
  | "onLoan"
  | "injured"
  | "suspended"
  | "calledUp"
  | "retired";

export interface PlayerStatusFlag {
  id: PlayerStatusId;
  /** Optional in-game week the status expires on. */
  untilWeek?: number;
  note?: string;
}

/* ------------------------------------------------------------------ */
/* History (structures are created empty and filled by future systems) */
/* ------------------------------------------------------------------ */

export interface ClubSpell {
  id: EntityId;
  clubId: EntityId;
  clubName: string;
  category: string;
  from: GameDate;
  to?: GameDate;
  type: "youth" | "permanent" | "loan";
}

export interface MatchStatLine {
  appearances: number;
  minutes: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  ratingSum: number;
}

export interface SeasonRecord {
  id: EntityId;
  seasonYear: number;
  clubId?: EntityId;
  clubName?: string;
  category?: string;
  stats: MatchStatLine;
  overallStart: number;
  overallEnd: number;
  attributes: PlayerAttributes;
}

export interface MatchRecord {
  id: EntityId;
  date: GameDate;
  competition: string;
  opponent: string;
  scoreFor: number;
  scoreAgainst: number;
  minutes: number;
  goals: number;
  assists: number;
  rating: number;
}

export interface InjuryRecord {
  id: EntityId;
  name: string;
  from: GameDate;
  weeksOut: number;
  severity: "light" | "moderate" | "severe";
}

export interface TitleRecord {
  id: EntityId;
  competition: string;
  seasonYear: number;
  clubName?: string;
}

export interface AwardRecord {
  id: EntityId;
  name: string;
  seasonYear: number;
  scope: "club" | "league" | "continental" | "world";
}

export interface CallUpRecord {
  id: EntityId;
  nationalTeam: string;
  level: "U15" | "U17" | "U20" | "Olympic" | "Senior";
  seasonYear: number;
  caps: number;
  goals: number;
}

export interface TransferRecord {
  id: EntityId;
  date: GameDate;
  fromClub?: string;
  toClub: string;
  fee: number;
  type: "youth" | "free" | "permanent" | "loan";
}

export interface SalaryRecord {
  id: EntityId;
  date: GameDate;
  clubName?: string;
  /** Weekly wage in the game currency. */
  amount: number;
}

export interface MarketValueRecord {
  date: GameDate;
  value: number;
}

export interface OverallRecord {
  seasonYear: number;
  overall: number;
  age: number;
}

/** Permanent career archive — survives retirement. */
export interface PlayerHistory {
  clubs: ClubSpell[];
  seasons: SeasonRecord[];
  matches: MatchRecord[];
  injuries: InjuryRecord[];
  titles: TitleRecord[];
  awards: AwardRecord[];
  callUps: CallUpRecord[];
  transfers: TransferRecord[];
  salaries: SalaryRecord[];
  marketValues: MarketValueRecord[];
  overallBySeason: OverallRecord[];
  totals: MatchStatLine;
}

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export interface Player {
  /** Internal unique id (never shown as a label). */
  id: EntityId;
  /** Human readable sequential code, e.g. PLY000001. */
  code: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: IsoDate;
  /** Nationality code (e.g. BRA). */
  nationality: string;
  /** Country of birth code — may differ from nationality later. */
  country: string;
  foot: Foot;
  position: PositionCode;
  secondaryPositions: PositionCode[];
  heightCm: number;
  weightKg: number;
  attributes: PlayerAttributes;
  personality: PersonalityTrait[];
  statuses: PlayerStatusFlag[];
  /** Hidden data — never rendered in the UI. */
  hidden: PlayerHiddenProfile;
  history: PlayerHistory;
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
  player: Player;
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
