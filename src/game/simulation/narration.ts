import type { Random } from "../rng";
import { pick, randomInt } from "../rng";
import type { MatchHighlight, MatchRecord, Sport } from "../types";

/**
 * Text commentary for a resolved match. Pure and post-hoc: it never changes
 * the result, it only narrates goals, assists and key moments consistently
 * with the final score and the athlete's minutes on the pitch.
 */
export interface NarrationContext {
  playerName: string;
  clubName: string;
  starter: boolean;
  sport: Sport;
  isGoalkeeper: boolean;
}

const PLAYER_GOAL = [
  "{p} recebe na entrada da área e bate firme no canto!",
  "Que golaço! {p} acerta um chute de fora da área.",
  "{p} aparece livre na segunda trave e só empurra para as redes.",
  "{p} dribla o marcador e finaliza com categoria.",
  "Cabeçada certeira de {p} após cruzamento!",
];
const PLAYER_ASSIST = [
  "{p} enfia a bola na medida e {c} marca.",
  "Cruzamento perfeito de {p} — gol do {c}!",
  "{p} rouba a bola e serve o companheiro: gol do {c}.",
];
const TEAM_GOAL = ["Gol do {c}! Jogada coletiva bem trabalhada.", "O {c} amplia em cobrança de escanteio.", "Gol do {c} em contra-ataque rápido."];
const CONCEDE = ["Gol do {o}. A defesa falha na marcação.", "O {o} marca em chute desviado.", "{o} empata em bola parada."];
const CHANCE = ["{p} carimba a trave!", "{p} obriga o goleiro a fazer grande defesa.", "{p} finaliza por cima, quase!"];
const SAVE = ["Milagre! {p} salva à queima-roupa.", "{p} voa no ângulo e evita o gol.", "{p} fecha o gol no mano a mano."];

export function buildMatchHighlights(match: MatchRecord, ctx: NarrationContext, random: Random): MatchHighlight[] {
  const length = ctx.sport === "futsal" ? 40 : 90;
  const scale = length / 90;
  const onFrom = ctx.starter ? 1 : Math.max(1, Math.round((90 - match.minutes) * scale));
  const onTo = ctx.starter ? Math.max(onFrom + 1, Math.round(match.minutes * scale)) : length;
  const playerMinute = () => randomInt(onFrom, onTo, random);
  const anyMinute = () => randomInt(1, length, random);
  const fill = (text: string) =>
    text.replaceAll("{p}", ctx.playerName).replaceAll("{c}", ctx.clubName).replaceAll("{o}", match.opponent);

  const list: MatchHighlight[] = [];
  if (!ctx.starter) list.push({ minute: onFrom, kind: "sub", text: fill("{p} entra em campo."), involvesPlayer: true });

  // Team goals: the athlete's goals first, then assists on remaining goals.
  const assistsLeft = Math.min(match.assists, Math.max(0, match.scoreFor - match.goals));
  for (let i = 0; i < match.scoreFor; i += 1) {
    if (i < match.goals) list.push({ minute: playerMinute(), kind: "goal", text: fill(pick(PLAYER_GOAL, random)), involvesPlayer: true });
    else if (i < match.goals + assistsLeft) list.push({ minute: playerMinute(), kind: "assist", text: fill(pick(PLAYER_ASSIST, random)), involvesPlayer: true });
    else list.push({ minute: anyMinute(), kind: "teamGoal", text: fill(pick(TEAM_GOAL, random)), involvesPlayer: false });
  }
  for (let i = 0; i < match.scoreAgainst; i += 1) {
    list.push({ minute: anyMinute(), kind: "concede", text: fill(pick(CONCEDE, random)), involvesPlayer: false });
  }
  const extra = match.rating >= 7 ? 2 : 1;
  for (let i = 0; i < extra; i += 1) {
    const pool = ctx.isGoalkeeper ? SAVE : CHANCE;
    list.push({ minute: playerMinute(), kind: ctx.isGoalkeeper ? "save" : "chance", text: fill(pick(pool, random)), involvesPlayer: true });
  }
  list.sort((a, b) => a.minute - b.minute);
  list.push({ minute: length, kind: "final", text: finalLine(match, ctx), involvesPlayer: false });
  return list;
}

export function isStandoutMatch(match: MatchRecord) {
  return match.rating >= 8 || match.goals >= 2 || match.goals + match.assists >= 3;
}

function finalLine(match: MatchRecord, ctx: NarrationContext) {
  const result = match.scoreFor > match.scoreAgainst ? "Vitória" : match.scoreFor < match.scoreAgainst ? "Derrota" : "Empate";
  return `Fim de jogo: ${result} do ${ctx.clubName} por ${match.scoreFor} x ${match.scoreAgainst}. Nota de ${ctx.playerName}: ${match.rating.toFixed(1)}.`;
}
