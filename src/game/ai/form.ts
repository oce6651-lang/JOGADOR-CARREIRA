import type { CareerAi } from "../types";

/**
 * Career AI — current form.
 *
 * Form is what scouts actually watch: the last handful of performances, with
 * the most recent games weighing far more than a good night three months ago.
 * Everything that reacts to "how the athlete is playing right now" — transfer
 * windows, call-ups, squad role — reads from here.
 */

/** How many matches the form window looks at. */
export const FORM_WINDOW = 6;

/** Weighted average of the last ratings (0-10). Returns 0 without matches. */
export function currentForm(ai: CareerAi): number {
  const ratings = ai.recentRatings.slice(0, FORM_WINDOW);
  if (!ratings.length) return 0;
  let weightSum = 0;
  let total = 0;
  ratings.forEach((rating, index) => {
    const weight = Math.pow(0.82, index);
    total += rating * weight;
    weightSum += weight;
  });
  return total / weightSum;
}

/** Form normalised to 0-100 — handy for gauges and probability maths. */
export function formIndex(ai: CareerAi): number {
  const form = currentForm(ai);
  if (!form) return 40;
  return Math.max(0, Math.min(100, ((form - 4.5) / 4) * 100));
}

export type FormBand = "cold" | "irregular" | "steady" | "hot" | "onFire";

export function formBand(ai: CareerAi): FormBand {
  const form = currentForm(ai);
  if (!form) return "irregular";
  if (form < 5.8) return "cold";
  if (form < 6.4) return "irregular";
  if (form < 7.1) return "steady";
  if (form < 7.8) return "hot";
  return "onFire";
}

export const FORM_LABELS: Record<FormBand, string> = {
  cold: "Fase ruim",
  irregular: "Oscilando",
  steady: "Regular",
  hot: "Boa fase",
  onFire: "Fase artilheira",
};

export function formLabel(ai: CareerAi) {
  return FORM_LABELS[formBand(ai)];
}

/** Short line for the UI: "Boa fase · nota 7,25 nos últimos 5 jogos". */
export function formDescription(ai: CareerAi) {
  const matches = Math.min(FORM_WINDOW, ai.recentRatings.length);
  if (!matches) return "Sem partidas recentes para avaliar a forma.";
  return `${formLabel(ai)} · nota ${currentForm(ai).toFixed(2).replace(".", ",")} nos últimos ${matches} jogos.`;
}
