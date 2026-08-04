import { createRandom } from "../rng";
import { getClub } from "./clubs";
import { COMPETITIONS, getCompetition } from "./competitions";
import { clubExistsIn, competitionExistsIn } from "./era";
import type { Club, Competition } from "./types";

/**
 * Permanent competition history.
 *
 * Champions are derived deterministically from the competition slug + season
 * year, so every edition — past, present or a hundred seasons ahead — always
 * resolves to the same winner without storing a single row. Reputation biases
 * the draw, but upsets happen.
 */

export interface CompetitionAward {
  /** Awarded player name (generated deterministically). */
  name: string;
  clubId: string;
  clubName: string;
  /** Goals / assists for the statistical awards. */
  value?: number;
}

export interface CompetitionEdition {
  competitionId: string;
  competitionName: string;
  seasonYear: number;
  championClubId: string;
  championClubName: string;
  runnerUpClubId?: string;
  runnerUpClubName?: string;
  topScorer?: CompetitionAward;
  topAssists?: CompetitionAward;
  bestPlayer?: CompetitionAward;
  bestGoalkeeper?: CompetitionAward;
}

function eligibleClubs(competition: Competition, seasonYear: number): Club[] {
  return competition.clubIds
    .map((id) => getClub(id))
    .filter((club): club is Club => !!club && clubExistsIn(club, seasonYear));
}

/** Weighted draw: strong clubs win far more often, minnows still surprise. */
function drawWinner(clubs: Club[], random: () => number): Club | undefined {
  if (!clubs.length) return undefined;
  const weights = clubs.map((club) => Math.pow(Math.max(1, club.reputation), 3.2));
  const total = weights.reduce((acc, weight) => acc + weight, 0);
  let ticket = random() * total;
  for (let i = 0; i < clubs.length; i += 1) {
    ticket -= weights[i];
    if (ticket <= 0) return clubs[i];
  }
  return clubs[clubs.length - 1];
}

export function competitionEdition(
  competitionId: string,
  seasonYear: number,
): CompetitionEdition | null {
  const competition = getCompetition(competitionId);
  if (!competition || !competitionExistsIn(competition, seasonYear)) return null;

  const clubs = eligibleClubs(competition, seasonYear);
  if (clubs.length < 2) return null;

  const random = createRandom(`${competition.slug}:${seasonYear}`);
  const champion = drawWinner(clubs, random);
  if (!champion) return null;
  const runnerUp = drawWinner(
    clubs.filter((club) => club.id !== champion.id),
    random,
  );

  return {
    competitionId: competition.id,
    competitionName: competition.name,
    seasonYear,
    championClubId: champion.id,
    championClubName: champion.name,
    runnerUpClubId: runnerUp?.id,
    runnerUpClubName: runnerUp?.name,
  };
}

/** Roll of honour, most recent first. */
export function rollOfHonour(
  competitionId: string,
  fromYear: number,
  toYear: number,
): CompetitionEdition[] {
  const editions: CompetitionEdition[] = [];
  for (let year = toYear; year >= fromYear; year -= 1) {
    const edition = competitionEdition(competitionId, year);
    if (edition) editions.push(edition);
  }
  return editions;
}

/** How many times each club won a competition inside a range. */
export function titleCount(
  competitionId: string,
  fromYear: number,
  toYear: number,
): { clubId: string; clubName: string; titles: number }[] {
  const counts = new Map<string, { clubId: string; clubName: string; titles: number }>();
  for (const edition of rollOfHonour(competitionId, fromYear, toYear)) {
    const entry = counts.get(edition.championClubId) ?? {
      clubId: edition.championClubId,
      clubName: edition.championClubName,
      titles: 0,
    };
    entry.titles += 1;
    counts.set(edition.championClubId, entry);
  }
  return [...counts.values()].sort((a, b) => b.titles - a.titles);
}

/** Every trophy a club lifted in a given season. */
export function clubTitlesInSeason(clubId: string, seasonYear: number): CompetitionEdition[] {
  return COMPETITIONS.filter((competition) => competition.clubIds.includes(clubId))
    .map((competition) => competitionEdition(competition.id, seasonYear))
    .filter((edition): edition is CompetitionEdition => !!edition && edition.championClubId === clubId);
}

/** Full trophy cabinet of a club up to a season. */
export function clubHonours(clubId: string, fromYear: number, toYear: number) {
  const rows = new Map<string, { competitionName: string; seasons: number[] }>();
  for (let year = toYear; year >= fromYear; year -= 1) {
    for (const edition of clubTitlesInSeason(clubId, year)) {
      const row = rows.get(edition.competitionId) ?? {
        competitionName: edition.competitionName,
        seasons: [],
      };
      row.seasons.push(year);
      rows.set(edition.competitionId, row);
    }
  }
  return [...rows.values()].sort((a, b) => b.seasons.length - a.seasons.length);
}
