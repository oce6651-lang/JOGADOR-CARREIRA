/**
 * Project Football Career — core domain types.
 *
 * Every entity carries a unique `id` so future systems (clubs, competitions,
 * transfers, agents, injuries...) can reference each other without coupling.
 * Nothing here knows about React or the UI.
 */

import type { CategoryCode } from "./world/types";

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
  /** 0-indexed month the season starts in (country dependent). */
  seasonStartMonth: number;
  /** Country code driving the calendar (BRA = Jan-Dec, ENG = Aug-May). */
  calendarCountry: string;
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
  /** Main competition disputed in the season, when known. */
  competitionName?: string;
  /** Age the athlete reached at the end of the season. */
  age?: number;
  /** Market value and wage snapshot at the end of the season. */
  marketValue?: number;
  weeklyWage?: number;
  titles?: TitleRecord[];
  awards?: AwardRecord[];
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

/* ------------------------------------------------------------------ */
/* Events & simulation                                                 */
/* ------------------------------------------------------------------ */

/**
 * Every kind of thing that can happen in a career. Systems that do not exist
 * yet (clubs, competitions, agents) already have their event type reserved.
 */
export type GameEventType =
  | "training"
  | "match"
  | "goal"
  | "injury"
  | "recovery"
  | "growth"
  | "decline"
  | "birthday"
  | "trial"
  | "transfer"
  | "contract"
  | "callUp"
  | "title"
  | "award"
  | "categoryChange"
  | "seasonStart"
  | "seasonEnd"
  | "vacation"
  | "retirement"
  | "milestone";

export type GameEventTone = "neutral" | "info" | "positive" | "warning" | "danger";

export interface GameEvent {
  id: EntityId;
  type: GameEventType;
  date: GameDate;
  title: string;
  description?: string;
  tone: GameEventTone;
  /** Free-form payload for systems that need structured data. */
  data?: Record<string, unknown>;
}

export interface AttributeChange {
  key: AttributeKey;
  before: number;
  after: number;
}

/* ------------------------------------------------------------------ */
/* Career AI                                                           */
/* ------------------------------------------------------------------ */

/** How the coaching staff currently sees the player inside the squad. */
export type SquadRole =
  | "star"
  | "starter"
  | "rotation"
  | "bench"
  | "reserve"
  | "outOfSquad";

/** Where the athlete plays right now, decided entirely by the career AI. */
/**
 * Nature of the agreement with the club.
 * - `formation`: youth football school, only a stipend (auxílio) is allowed.
 * - `youthPro`: first professional deal signed inside the academy (16+).
 * - `professional`: full professional contract.
 */
export type ContractType = "formation" | "youthPro" | "professional";

export interface ClubSituation {
  spellId: EntityId;
  clubId: EntityId;
  clubSlug: string;
  clubName: string;
  clubReputation: number;
  /** Category code from the world module (U11...PRO). */
  category: CategoryCode;
  role: SquadRole;
  joinedSeason: number;
  contractUntilSeason: number;
  /** Weekly wage in BRL. */
  weeklyWage: number;
  onLoan: boolean;
  parentClubId?: EntityId;
  parentClubName?: string;
  /** Weeks spent in the current category — feeds promotion decisions. */
  weeksInCategory: number;
  /** Nature of the deal: formation stipend or professional contract. */
  contractType?: ContractType;
  /** Release clause in BRL (0 = none). */
  releaseClause?: number;
  /** Bonus per appearance, in BRL. */
  appearanceBonus?: number;
  /** Bonus per goal (or clean sheet for keepers), in BRL. */
  goalBonus?: number;
}

/** A club watching the athlete. Interest grows and decays over time. */
export interface ScoutingInterest {
  clubId: EntityId;
  clubName: string;
  clubReputation: number;
  /** 0-100. */
  level: number;
  sinceWeek: number;
}

/* ------------------------------------------------------------------ */
/* Negotiations                                                        */
/* ------------------------------------------------------------------ */

/** Every kind of proposal the athlete can receive. */
export type OfferKind = "trial" | "contract" | "renewal" | "loan" | "transfer";

/** What the athlete (or his agent) tries to improve in a negotiation. */
export type NegotiationTopic = "wage" | "seasons" | "role" | "clause" | "bonus";

export interface ContractTerms {
  /** Weekly wage in BRL (stipend when the deal is a formation agreement). */
  weeklyWage: number;
  /** Contract length in seasons. */
  seasons: number;
  /** Squad role promised by the club. */
  role: SquadRole;
  /** One-off signing bonus in BRL (luvas). */
  signingBonus: number;
  /** Nature of the deal. */
  contractType: ContractType;
  /** Release clause in BRL — 0 when the club refuses to set one. */
  releaseClause: number;
  /** Bonus paid per appearance, in BRL. */
  appearanceBonus: number;
  /** Bonus paid per goal (clean sheet for keepers), in BRL. */
  goalBonus: number;
  /** True when the deal only starts in the next season (pré-contrato). */
  preContract: boolean;
}

/** Unpredictable development phase the athlete is going through. */
export type DevelopmentPhaseId =
  | "breakthrough"
  | "steady"
  | "plateau"
  | "setback"
  | "lateBloom";

export interface DevelopmentState {
  phase: DevelopmentPhaseId;
  /** Weeks remaining in the current phase. */
  weeksLeft: number;
  /** Multiplier applied to weekly growth while the phase lasts. */
  multiplier: number;
  /** elapsedWeeks when the phase started. */
  startedWeek: number;
}

/** A proposal waiting for the player's answer. Never resolved automatically. */
export interface ClubOffer {
  id: EntityId;
  kind: OfferKind;
  clubId: EntityId;
  clubSlug: string;
  clubName: string;
  clubReputation: number;
  category: CategoryCode;
  /** Club leaving behind (loans and transfers). */
  fromClubName?: string;
  terms: ContractTerms;
  message: string;
  createdWeek: number;
  /** elapsedWeeks after which the club withdraws the proposal. */
  expiresWeek: number;
  /** Negotiation rounds already used by the player. */
  rounds: number;
  maxRounds: number;
  /** The club refuses to improve the terms any further. */
  finalOffer: boolean;
}

/** Agents open doors, find trials and improve every negotiation. */
export interface Agent {
  id: EntityId;
  name: string;
  /** 1-100 — how good he is at finding and improving deals. */
  quality: number;
  /** Percentage of the wage kept by the agent. */
  commission: number;
  /** Minimum reputation required to be hired. */
  minReputation: number;
  hiredSeason?: number;
  description: string;
}

/** Persistent brain of the career: context every AI decision reads from. */
export interface CareerAi {
  club: ClubSituation | null;
  /** 0-100 — how happy the athlete is. */
  morale: number;
  /** 0-100 — physical condition. */
  fitness: number;
  /** 0-100 — match rhythm, lost during injuries and on the bench. */
  sharpness: number;
  /** 0-100 — how known the athlete is in the football world. */
  reputation: number;
  /** 0-100 — how much the coaching staff trusts him. */
  coachTrust: number;
  /** Ratings of the last matches (most recent first, capped). */
  recentRatings: number[];
  scouting: ScoutingInterest[];
  /** elapsedWeeks of the last squad review. */
  lastReviewWeek: number;
  /** How many trials the athlete already attended. */
  trials: number;
  /** How many times he was released by a club. */
  releases: number;
  /** Proposals waiting for the player's decision. */
  offers: ClubOffer[];
  /** Hired agent, if any. */
  agent: Agent | null;
  /** elapsedWeeks of the last trial attended (one per week). */
  lastTrialWeek: number;
  /** Week of the last approach made by the agent (sondagem/promoção). */
  lastApproachWeek?: number;
  /** National team level the athlete currently belongs to. */
  nationalTeamLevel: CallUpRecord["level"] | null;
  /** Current (hidden) development phase — makes evolution unpredictable. */
  development?: DevelopmentState;
}


/** Result of simulating one or more weeks. Shown to the player, not persisted. */
export interface SimulationReport {
  id: EntityId;
  from: GameDate;
  to: GameDate;
  weeks: number;
  scope: "match" | "week" | "month";
  events: GameEvent[];
  stats: MatchStatLine;
  trainings: number;
  overallBefore: number;
  overallAfter: number;
  ageBefore: number;
  ageAfter: number;
  attributeChanges: AttributeChange[];
  injuries: InjuryRecord[];
  seasonSummaries: SeasonSummary[];
  /** Short AI-written lines summarising what the period meant. */
  headlines: string[];
  clubName?: string;
  categoryLabel?: string;
  roleLabel?: string;
  morale: number;
  fitness: number;
}

/** End-of-season report — one of the most important screens in the game. */
export interface SeasonSummary {
  id: EntityId;
  seasonYear: number;
  ageStart: number;
  ageEnd: number;
  clubName?: string;
  category?: string;
  categoryChange?: string;
  overallStart: number;
  overallEnd: number;
  attributeChanges: AttributeChange[];
  stats: MatchStatLine;
  injuries: InjuryRecord[];
  titles: TitleRecord[];
  awards: AwardRecord[];
  callUps: CallUpRecord[];
  highlights: string[];
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
  /** Permanent event archive (most recent first). */
  events: GameEvent[];
  /** Season summaries the player has not acknowledged yet. */
  pendingSeasonSummaries: SeasonSummary[];
  /** Accumulator for the season currently being played. */
  currentSeason: SeasonProgress;
  /** Career AI state — drives every automatic decision. */
  ai: CareerAi;
  /** Permanent competition history lived through this career. */
  competitionHistory: CompetitionSeasonRecord[];
}

/** A competition edition finished while this career was being played. */
export interface CompetitionSeasonRecord {
  id: EntityId;
  competitionId: EntityId;
  competitionName: string;
  seasonYear: number;
  championClubId: EntityId;
  championClubName: string;
  runnerUpClubName?: string;
  /** True when the athlete's club disputed the edition. */
  playerInvolved: boolean;
  /** True when the athlete himself lifted the trophy. */
  playerChampion: boolean;
}



/** Live accumulator for the ongoing season. Finalised into a SeasonSummary. */
export interface SeasonProgress {
  seasonYear: number;
  ageStart: number;
  overallStart: number;
  attributesStart: PlayerAttributes;
  clubName?: string;
  category?: string;
  stats: MatchStatLine;
  trainings: number;
  injuries: InjuryRecord[];
  titles: TitleRecord[];
  awards: AwardRecord[];
  callUps: CallUpRecord[];
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
