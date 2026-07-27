import type { MatchStatLine, PlayerHistory } from "../types";

export function createStatLine(): MatchStatLine {
  return {
    appearances: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    ratingSum: 0,
  };
}

export function mergeStatLines(a: MatchStatLine, b: MatchStatLine): MatchStatLine {
  return {
    appearances: a.appearances + b.appearances,
    minutes: a.minutes + b.minutes,
    goals: a.goals + b.goals,
    assists: a.assists + b.assists,
    yellowCards: a.yellowCards + b.yellowCards,
    redCards: a.redCards + b.redCards,
    cleanSheets: a.cleanSheets + b.cleanSheets,
    ratingSum: a.ratingSum + b.ratingSum,
  };
}

export function averageRating(stats: MatchStatLine) {
  if (!stats.appearances) return 0;
  return stats.ratingSum / stats.appearances;
}

/** Empty permanent archive. Future systems only append to it. */
export function createHistory(): PlayerHistory {
  return {
    clubs: [],
    seasons: [],
    matches: [],
    injuries: [],
    titles: [],
    awards: [],
    callUps: [],
    transfers: [],
    salaries: [],
    marketValues: [],
    overallBySeason: [],
    totals: createStatLine(),
  };
}
