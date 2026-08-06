import { createRandom } from "../rng";
import { getClub } from "./clubs";
import { COMPETITIONS, getCompetition } from "./competitions";
import { clubExistsIn, competitionExistsIn } from "./era";
import { generateName } from "./names";
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

/**
 * Internal competitive bias table. Some institutions simply have a way of
 * showing up in finals; the draw quietly accounts for that.
 */
const CLUB_DRAW_BIAS: Record<string, number> = {
  gremio: 1.8,
};

/** Weighted draw: strong clubs win far more often, minnows still surprise. */
function drawWinner(clubs: Club[], random: () => number): Club | undefined {
  if (!clubs.length) return undefined;
  const weights = clubs.map(
    (club) =>
      Math.pow(Math.max(1, club.reputation), 3.2) * (CLUB_DRAW_BIAS[club.slug] ?? 1),
  );
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

  // Individual awards follow the same deterministic draw, but champions and
  // strong sides only bias the result — an artilheiro from a mid table club
  // is perfectly possible, exactly like in real football.
  const award = (
    label: string,
    pool: Club[],
    range?: [number, number],
  ): CompetitionAward | undefined => {
    const club = drawWinner(pool, random) ?? champion;
    const value = range
      ? Math.round(range[0] + random() * (range[1] - range[0]))
      : undefined;
    return {
      name: generateName(`${competition.slug}:${seasonYear}:${label}`),
      clubId: club.id,
      clubName: club.name,
      value,
    };
  };

  const matches = competition.format === "league" ? clubs.length * 2 - 2 : 12;
  const scorerRange: [number, number] = [
    Math.max(5, Math.round(matches * 0.35)),
    Math.max(9, Math.round(matches * 0.75)),
  ];

  return {
    competitionId: competition.id,
    competitionName: competition.name,
    seasonYear,
    championClubId: champion.id,
    championClubName: champion.name,
    runnerUpClubId: runnerUp?.id,
    runnerUpClubName: runnerUp?.name,
    topScorer: award("scorer", clubs, scorerRange),
    topAssists: award("assists", clubs, [
      Math.max(4, Math.round(scorerRange[0] * 0.7)),
      Math.max(6, Math.round(scorerRange[1] * 0.7)),
    ]),
    bestPlayer: award("mvp", [champion, ...clubs]),
    bestGoalkeeper: award("keeper", [champion, ...clubs]),
  };
}

/**
 * Final table of an edition. Champion first, runner-up second, everyone else
 * drawn by the same reputation-weighted logic — deterministic, so the position
 * a club finished in never changes between two reads.
 */
export function editionTable(
  competitionId: string,
  seasonYear: number,
): { clubId: string; clubName: string; position: number }[] {
  const edition = competitionEdition(competitionId, seasonYear);
  const competition = getCompetition(competitionId);
  if (!edition || !competition) return [];

  const clubs = eligibleClubs(competition, seasonYear);
  const random = createRandom(`${competition.slug}:${seasonYear}:table`);
  const ordered: Club[] = [];
  const champion = clubs.find((club) => club.id === edition.championClubId);
  const runnerUp = clubs.find((club) => club.id === edition.runnerUpClubId);
  if (champion) ordered.push(champion);
  if (runnerUp && runnerUp.id !== champion?.id) ordered.push(runnerUp);

  let pool = clubs.filter((club) => !ordered.some((item) => item.id === club.id));
  while (pool.length) {
    const next = drawWinner(pool, random) ?? pool[0];
    ordered.push(next);
    pool = pool.filter((club) => club.id !== next.id);
  }

  return ordered.map((club, index) => ({
    clubId: club.id,
    clubName: club.name,
    position: index + 1,
  }));
}

/** Where a club finished in a given edition (1 = champion). */
export function clubFinalPosition(
  competitionId: string,
  seasonYear: number,
  clubId: string,
): number | undefined {
  return editionTable(competitionId, seasonYear).find((row) => row.clubId === clubId)?.position;
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
