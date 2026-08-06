import { createId } from "../ids";
import { createStatLine, mergeStatLines } from "../player/history";
import { calculateOverall } from "../player/overall";
import { flattenAttributes } from "../player/attributes";
import type {
  CompetitionStatLine,
  MatchStatLine,
  Player,
  SeasonProgress,
  SeasonRecord,
  SeasonSummary,
} from "../types";
import { diffAttributes } from "./progression";

export function createSeasonProgress(
  player: Player,
  seasonYear: number,
  age: number,
  clubName?: string,
  category?: string,
): SeasonProgress {
  return {
    seasonYear,
    ageStart: age,
    overallStart: calculateOverall(player.attributes, player.position),
    attributesStart: cloneAttributes(player),
    clubName,
    category,
    stats: createStatLine(),
    competitionStats: [],
    trainings: 0,
    injuries: [],
    titles: [],
    awards: [],
    callUps: [],
  };
}

export function addSeasonStats(
  progress: SeasonProgress,
  stats: MatchStatLine,
): SeasonProgress {
  return { ...progress, stats: mergeStatLines(progress.stats, stats) };
}

/**
 * Books a match into the competition it was played in. Every tournament keeps
 * its own games, goals, assists and ratings — a season is never a single
 * undifferentiated block of numbers.
 */
export function addCompetitionStats(
  progress: SeasonProgress,
  entry: {
    competitionId?: string;
    competitionName: string;
    clubName?: string;
    category?: string;
    stats: MatchStatLine;
  },
): SeasonProgress {
  const current = progress.competitionStats ?? [];
  const index = current.findIndex(
    (row) =>
      (entry.competitionId && row.competitionId === entry.competitionId) ||
      (!entry.competitionId && row.competitionName === entry.competitionName),
  );

  if (index < 0) {
    return {
      ...progress,
      competitionStats: [
        ...current,
        {
          competitionId: entry.competitionId,
          competitionName: entry.competitionName,
          clubName: entry.clubName,
          category: entry.category,
          stats: entry.stats,
        },
      ],
    };
  }

  const merged = current.map((row, position) =>
    position === index
      ? { ...row, stats: mergeStatLines(row.stats, entry.stats) }
      : row,
  );
  return { ...progress, competitionStats: merged };
}

export interface SeasonContext {
  clubId?: string;
  competitionName?: string;
  competitions?: string[];
  marketValue?: number;
  weeklyWage?: number;
  /** Final tables of every competition disputed in the season. */
  competitionStats?: CompetitionStatLine[];
}

/** Closes the season, producing both the permanent record and the UI summary. */
export function finalizeSeason(
  progress: SeasonProgress,
  player: Player,
  ageEnd: number,
  context: SeasonContext = {},
): { summary: SeasonSummary; record: SeasonRecord } {
  const overallEnd = calculateOverall(player.attributes, player.position);
  const attributeChanges = diffAttributes(
    flattenAttributes(progress.attributesStart),
    flattenAttributes(player.attributes),
  );

  const summary: SeasonSummary = {
    id: createId("event"),
    seasonYear: progress.seasonYear,
    ageStart: progress.ageStart,
    ageEnd,
    clubName: progress.clubName,
    category: progress.category,
    overallStart: progress.overallStart,
    overallEnd,
    attributeChanges,
    stats: progress.stats,
    injuries: progress.injuries,
    titles: progress.titles,
    awards: progress.awards,
    callUps: progress.callUps,
    highlights: buildHighlights(progress, overallEnd - progress.overallStart),
  };

  const record: SeasonRecord = {
    id: createId("event"),
    seasonYear: progress.seasonYear,
    clubId: context.clubId,
    clubName: progress.clubName,
    category: progress.category,
    competitionName: context.competitionName,
    competitions: context.competitions,
    age: ageEnd,
    marketValue: context.marketValue,
    weeklyWage: context.weeklyWage,
    titles: progress.titles,
    awards: progress.awards,
    stats: progress.stats,
    competitionStats: context.competitionStats ?? progress.competitionStats ?? [],
    overallStart: progress.overallStart,
    overallEnd,
    attributes: cloneAttributes(player),
  };

  return { summary, record };
}


function buildHighlights(progress: SeasonProgress, overallDelta: number): string[] {
  const highlights: string[] = [];
  const { stats } = progress;

  if (!stats.appearances) {
    highlights.push("Temporada sem partidas oficiais.");
  } else {
    highlights.push(
      `${stats.appearances} jogos, ${stats.goals} gols e ${stats.assists} assistências.`,
    );
    if (stats.goals >= 15) highlights.push("Temporada goleadora.");
  }

  highlights.push(`${progress.trainings} treinos realizados.`);

  if (overallDelta > 0) highlights.push(`Overall subiu ${overallDelta} ponto(s).`);
  else if (overallDelta < 0)
    highlights.push(`Overall caiu ${Math.abs(overallDelta)} ponto(s).`);
  else highlights.push("Overall permaneceu igual.");

  if (progress.injuries.length)
    highlights.push(`${progress.injuries.length} lesão(ões) sofridas.`);
  if (progress.titles.length) highlights.push(`${progress.titles.length} título(s).`);
  if (progress.awards.length) highlights.push(`${progress.awards.length} prêmio(s).`);
  if (progress.callUps.length)
    highlights.push(`${progress.callUps.length} convocação(ões).`);

  return highlights;
}

function cloneAttributes(player: Player) {
  return {
    technical: { ...player.attributes.technical },
    mental: { ...player.attributes.mental },
    physical: { ...player.attributes.physical },
  };
}
