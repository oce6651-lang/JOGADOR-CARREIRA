/**
 * Football World — domain types.
 *
 * The world exists independently from the player's career: every country,
 * club and competition is defined here and referenced by stable ids so that
 * saves stay valid across hundreds of seasons.
 */

import type { EntityId } from "../types";

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export type CategoryCode =
  | "U7"
  | "U8"
  | "U9"
  | "U11"
  | "U13"
  | "U15"
  | "U17"
  | "U20"
  | "U23"
  | "PRO";

export interface CategoryDefinition {
  code: CategoryCode;
  label: string;
  /** Maximum age allowed (PRO has none). */
  maxAge?: number;
  /** Minimum age allowed to be registered in the category. */
  minAge?: number;
  /** Ordering from youngest to professional. */
  order: number;
}

/* ------------------------------------------------------------------ */
/* Country                                                             */
/* ------------------------------------------------------------------ */

export interface State {
  code: string;
  label: string;
}

export interface Country {
  id: EntityId;
  /** ISO-ish code, e.g. BRA. */
  code: string;
  name: string;
  flag: string;
  confederation: "CONMEBOL" | "UEFA" | "CONCACAF" | "AFC" | "CAF" | "OFC";
  states: State[];
  /** False for countries that are only scaffolded for the future. */
  playable: boolean;
  /**
   * Month (0-indexed) the domestic season kicks off in. Brazil and Argentina
   * run a calendar year (January), most of Europe starts in July.
   */
  seasonStartMonth: number;
  /** Currency symbol used when showing wages of clubs from this country. */
  currency: string;
  /** Rough wage power of the league versus Brazil (1 = Brazilian level). */
  wageIndex: number;
}

/* ------------------------------------------------------------------ */
/* Club                                                                */
/* ------------------------------------------------------------------ */

export type FinanceLevel = "insolvent" | "struggling" | "stable" | "rich" | "elite";

export interface ClubColors {
  primary: string;
  secondary: string;
  detail: string;
}

export interface Stadium {
  name: string;
  capacity: number;
}

export interface Club {
  id: EntityId;
  /** Stable slug used in URLs and save files. */
  slug: string;
  name: string;
  shortName: string;
  nickname?: string;
  city: string;
  /** State code (e.g. SP). */
  state: string;
  /** Country code (e.g. BRA). */
  country: string;
  foundedYear: number;
  stadium: Stadium;
  colors: ClubColors;
  /** 1-100 — drives scouting, transfers and call-ups. */
  reputation: number;
  financeLevel: FinanceLevel;
  /** Quality of the youth academy (1-100). */
  academyRating: number;
  /** Categories the club actually fields. */
  categories: CategoryCode[];
  /** Youngest category the club runs — entry point for trials. */
  entryCategory: CategoryCode;
  /** Default national league tier the club belongs to (1-4). */
  tier: number;
}

/* ------------------------------------------------------------------ */
/* Competitions                                                        */
/* ------------------------------------------------------------------ */

export type CompetitionFormat = "league" | "cup" | "groupsAndKnockout";

export type CompetitionScope = "national" | "state" | "continental" | "world";

export type CompetitionStatus = "active" | "planned";

export interface Competition {
  id: EntityId;
  slug: string;
  name: string;
  shortName: string;
  country: string;
  /** Present only for state competitions. */
  state?: string;
  format: CompetitionFormat;
  scope: CompetitionScope;
  /** Which club category disputes it. */
  category: CategoryCode;
  /** 1 = top division. Undefined for cups. */
  tier?: number;
  /** Minimum club reputation usually required to take part. */
  reputationFloor: number;
  /** Year the competition was first played — the world adapts to the era. */
  foundedYear: number;
  status: CompetitionStatus;
  colors: ClubColors;
  clubIds: EntityId[];
}

/* ------------------------------------------------------------------ */
/* Season structures                                                   */
/* ------------------------------------------------------------------ */

export interface StandingRow {
  clubId: EntityId;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

/** One edition of a competition. Ready for the future match simulation. */
export interface CompetitionSeason {
  id: EntityId;
  competitionId: EntityId;
  seasonYear: number;
  clubIds: EntityId[];
  standings: StandingRow[];
  /** Filled when the edition finishes. */
  championClubId?: EntityId;
  finished: boolean;
}

export interface WorldSnapshot {
  countries: Country[];
  clubs: Club[];
  competitions: Competition[];
}
