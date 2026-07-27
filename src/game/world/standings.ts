import { createId } from "../ids";
import { getClub } from "./clubs";
import { getCompetition } from "./competitions";
import type { CompetitionSeason, StandingRow } from "./types";

/**
 * League table structures. The match simulation for other clubs does not exist
 * yet, but every edition already carries a complete, sortable standings table
 * so the future engine only has to feed results into `applyResult`.
 */

export function createStandingRow(clubId: string, position: number): StandingRow {
  return {
    clubId,
    position,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

export function createCompetitionSeason(
  competitionId: string,
  seasonYear: number,
): CompetitionSeason {
  const competition = getCompetition(competitionId);
  const clubIds = competition?.clubIds ?? [];

  return {
    id: createId("competition"),
    competitionId,
    seasonYear,
    clubIds,
    standings: clubIds.map((clubId, index) => createStandingRow(clubId, index + 1)),
    finished: false,
  };
}

export interface MatchResultInput {
  homeClubId: string;
  awayClubId: string;
  homeGoals: number;
  awayGoals: number;
}

/** Pure: returns a new season with the result applied and the table re-sorted. */
export function applyResult(
  season: CompetitionSeason,
  result: MatchResultInput,
): CompetitionSeason {
  const standings = season.standings.map((row) => {
    const isHome = row.clubId === result.homeClubId;
    const isAway = row.clubId === result.awayClubId;
    if (!isHome && !isAway) return row;

    const scored = isHome ? result.homeGoals : result.awayGoals;
    const conceded = isHome ? result.awayGoals : result.homeGoals;
    const win = scored > conceded;
    const draw = scored === conceded;

    return {
      ...row,
      played: row.played + 1,
      wins: row.wins + (win ? 1 : 0),
      draws: row.draws + (draw ? 1 : 0),
      losses: row.losses + (!win && !draw ? 1 : 0),
      goalsFor: row.goalsFor + scored,
      goalsAgainst: row.goalsAgainst + conceded,
      goalDifference: row.goalsFor + scored - (row.goalsAgainst + conceded),
      points: row.points + (win ? 3 : draw ? 1 : 0),
    };
  });

  return { ...season, standings: sortStandings(standings) };
}

/** Points → goal difference → goals for → wins → club name. */
export function sortStandings(rows: StandingRow[]): StandingRow[] {
  return [...rows]
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      if (b.wins !== a.wins) return b.wins - a.wins;
      const nameA = getClub(a.clubId)?.shortName ?? "";
      const nameB = getClub(b.clubId)?.shortName ?? "";
      return nameA.localeCompare(nameB);
    })
    .map((row, index) => ({ ...row, position: index + 1 }));
}

export function findStandingRow(season: CompetitionSeason, clubId: string) {
  return season.standings.find((row) => row.clubId === clubId);
}
