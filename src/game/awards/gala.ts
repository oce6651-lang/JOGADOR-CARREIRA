import { createId } from "../ids";
import type { CompetitionEdition } from "../world/history";
import type { AwardRecord, GalaAward, MatchStatLine } from "../types";

/**
 * End-of-season gala. Pure: given how the athlete performed and how the
 * main competition edition resolved, decides every individual award and who
 * won it — the athlete himself or a rival from the deterministic edition.
 */
export interface GalaContext {
  seasonYear: number;
  stats: MatchStatLine;
  age: number;
  overall: number;
  reputation: number;
  isProfessional: boolean;
  clubName?: string;
  categoryLabel?: string;
  playerName: string;
  /** Main competition edition of the season (league first). */
  mainEdition?: CompetitionEdition | null;
}

export interface GalaResult {
  ceremony: GalaAward[];
  /** Awards the athlete actually took home. */
  won: AwardRecord[];
  /** Prize money in BRL (before era scaling). */
  prize: number;
}

const avg = (stats: MatchStatLine) => (stats.appearances ? stats.ratingSum / stats.appearances : 0);

export function runGala(ctx: GalaContext): GalaResult {
  const { stats, mainEdition } = ctx;
  const rating = avg(stats);
  const apps = stats.appearances;
  const league = mainEdition?.competitionName ?? ctx.categoryLabel ?? "Temporada";
  const suffix = ctx.categoryLabel && !ctx.isProfessional ? ` (${ctx.categoryLabel})` : "";
  const ceremony: GalaAward[] = [];

  const add = (
    key: GalaAward["key"],
    label: string,
    scope: AwardRecord["scope"],
    playerWins: boolean,
    rival: { name: string; clubName: string; value?: number } | undefined,
    value: number | undefined,
    prize: number,
  ) => {
    if (playerWins) {
      ceremony.push({
        key, label, scope, isPlayer: true, prize,
        winnerName: ctx.playerName, clubName: ctx.clubName ?? "—", value,
      });
    } else if (rival) {
      ceremony.push({
        key, label, scope, isPlayer: false, prize: 0,
        winnerName: rival.name, clubName: rival.clubName, value: rival.value,
      });
    }
  };

  const scorerBar = mainEdition?.topScorer?.value ?? 15;
  const assistBar = mainEdition?.topAssists?.value ?? 10;
  const rep = ctx.isProfessional ? 1 : 0.15;

  add("bestPlayer", `Melhor Jogador — ${league}${suffix}`, "league",
    apps >= 10 && rating >= 7.45, mainEdition?.bestPlayer, undefined, Math.round(60000 * rep));
  add("revelation", `Revelação — ${league}${suffix}`, "league",
    ctx.age <= 21 && apps >= 8 && rating >= 7.0, mainEdition?.bestGoalkeeper
      ? { ...mainEdition.bestGoalkeeper, value: undefined } : undefined, undefined, Math.round(30000 * rep));
  add("topScorer", `Artilheiro — ${league}${suffix}`, "league",
    stats.goals > 0 && stats.goals >= scorerBar, mainEdition?.topScorer, stats.goals, Math.round(40000 * rep));
  add("topAssists", `Líder de Assistências — ${league}${suffix}`, "league",
    stats.assists > 0 && stats.assists >= assistBar, mainEdition?.topAssists, stats.assists, Math.round(25000 * rep));
  if (apps >= 12 && rating >= 7.15) {
    add("teamOfSeason", `Seleção do Campeonato — ${league}${suffix}`, "league",
      true, undefined, undefined, Math.round(15000 * rep));
  }
  if (apps >= 8 && rating >= 7.1) {
    add("clubPlayer", `Craque do ${ctx.clubName ?? "clube"}${suffix}`, "club",
      true, undefined, undefined, Math.round(10000 * rep));
  }
  if (ctx.isProfessional && apps >= 20 && rating >= 7.6 && ctx.overall >= 86 && ctx.reputation >= 85) {
    add("worldBest", "Bola de Ouro", "world", true, undefined, undefined, 500000);
  }

  const won: AwardRecord[] = ceremony
    .filter((item) => item.isPlayer)
    .map((item) => ({ id: createId("award"), name: item.label, seasonYear: ctx.seasonYear, scope: item.scope }));
  const prize = ceremony.reduce((acc, item) => acc + item.prize, 0);
  return { ceremony, won, prize };
}
