import { createId } from "../ids";
import { createStatLine, mergeStatLines } from "../player/history";
import { calculateOverall } from "../player/overall";
import { flattenAttributes } from "../player/attributes";
import type {
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

/** Closes the season, producing both the permanent record and the UI summary. */
export function finalizeSeason(
  progress: SeasonProgress,
  player: Player,
  ageEnd: number,
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
    clubName: progress.clubName,
    category: progress.category,
    stats: progress.stats,
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
