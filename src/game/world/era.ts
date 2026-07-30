import { CLUBS } from "./clubs";
import { COMPETITIONS } from "./competitions";
import type { Club, Competition } from "./types";

/**
 * Historical era filter.
 *
 * A career can start anywhere between 1930 and the current year, so the world
 * has to answer "did this exist yet?" for every club and competition.
 */

export const MIN_WORLD_YEAR = 1930;

export function maxWorldYear(now = new Date()) {
  return now.getUTCFullYear();
}

export function clampWorldYear(year: number, now = new Date()) {
  return Math.max(MIN_WORLD_YEAR, Math.min(maxWorldYear(now), Math.round(year)));
}

export function clubExistsIn(club: Club, year: number) {
  return club.foundedYear <= year;
}

export function competitionExistsIn(competition: Competition, year: number) {
  return competition.foundedYear <= year;
}

/** Clubs available in a given season year. */
export function clubsInEra(year: number): Club[] {
  return CLUBS.filter((club) => clubExistsIn(club, year));
}

/** Competitions actually disputed in a given season year. */
export function competitionsInEra(year: number): Competition[] {
  return COMPETITIONS.filter((competition) => competitionExistsIn(competition, year));
}

export function clubsInEraByCountry(year: number, countryCode: string): Club[] {
  return clubsInEra(year).filter((club) => club.country === countryCode);
}

export function competitionsInEraByCountry(year: number, countryCode: string): Competition[] {
  return competitionsInEra(year).filter(
    (competition) => competition.country === countryCode,
  );
}

/**
 * Football was far less globalised before the 90s. Wages, transfer volume and
 * scouting reach all scale with this factor.
 */
export function eraWageFactor(year: number) {
  if (year <= 1950) return 0.05;
  if (year <= 1970) return 0.12;
  if (year <= 1985) return 0.25;
  if (year <= 1995) return 0.45;
  if (year <= 2005) return 0.68;
  if (year <= 2015) return 0.85;
  return 1;
}

/** 0..1 — how easily foreign clubs notice a player in that era. */
export function eraScoutingReach(year: number) {
  if (year <= 1960) return 0.15;
  if (year <= 1980) return 0.3;
  if (year <= 1995) return 0.55;
  if (year <= 2010) return 0.8;
  return 1;
}

export function eraLabel(year: number) {
  if (year < 1950) return "Era romântica";
  if (year < 1970) return "Era clássica";
  if (year < 1990) return "Era de ouro";
  if (year < 2005) return "Era moderna";
  return "Era contemporânea";
}
