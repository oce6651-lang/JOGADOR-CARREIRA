import { averageRating } from "../player/history";
import type { CareerAi, GameEvent, MatchStatLine } from "../types";
import { categoryLabel } from "../world";
import { roleLabel } from "./squad";

/** Human readable digest of a simulated period, written by the career AI. */
export function buildHeadlines(input: {
  ai: CareerAi;
  stats: MatchStatLine;
  trainings: number;
  overallDelta: number;
  injuries: number;
  events: GameEvent[];
}): string[] {
  const { ai, stats, trainings, overallDelta, injuries, events } = input;
  const lines: string[] = [];

  if (stats.appearances) {
    lines.push(`✔ Jogou ${stats.appearances} partida(s) · ${stats.minutes} min.`);
    if (stats.goals) lines.push(`⚽ ${stats.goals} gol(s).`);
    if (stats.assists) lines.push(`🎯 ${stats.assists} assistência(s).`);
    lines.push(`⭐ Nota média ${averageRating(stats).toFixed(2)}.`);
  } else {
    lines.push("✔ Nenhuma partida no período.");
  }

  lines.push(`🏋️ ${trainings} treino(s) realizados.`);

  if (overallDelta > 0) lines.push(`📈 Overall aumentou +${overallDelta}.`);
  else if (overallDelta < 0) lines.push(`📉 Overall caiu ${overallDelta}.`);
  else lines.push("📊 Overall permaneceu igual.");

  if (injuries) lines.push(`🚑 ${injuries} lesão(ões) sofridas.`);

  for (const event of events) {
    if (event.type === "categoryChange") lines.push(`🏃 ${event.title}.`);
    if (event.type === "transfer") lines.push(`🔁 ${event.title}.`);
    if (event.type === "contract") lines.push(`📝 ${event.title}.`);
  }

  if (ai.club) {
    lines.push(
      `👕 ${ai.club.clubName} · ${categoryLabel(ai.club.category)} · ${roleLabel(ai.club.role)}.`,
    );
  } else {
    lines.push("🔎 Sem clube — buscando oportunidades em peneiras.");
  }

  if (ai.scouting.length) {
    lines.push(
      `👀 ${ai.scouting.length} clube(s) observando: ${ai.scouting
        .map((interest) => interest.clubName)
        .join(", ")}.`,
    );
  }

  return lines;
}
