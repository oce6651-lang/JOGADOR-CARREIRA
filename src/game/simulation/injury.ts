import { createId } from "../ids";
import type { Random } from "../rng";
import { chance, pick, randomInt } from "../rng";
import type { GameDate, InjuryRecord, Player } from "../types";

interface InjuryTemplate {
  name: string;
  severity: InjuryRecord["severity"];
  minWeeks: number;
  maxWeeks: number;
}

const TEMPLATES: InjuryTemplate[] = [
  { name: "Desconforto muscular", severity: "light", minWeeks: 1, maxWeeks: 2 },
  { name: "Entorse no tornozelo", severity: "light", minWeeks: 1, maxWeeks: 3 },
  { name: "Estiramento na coxa", severity: "moderate", minWeeks: 3, maxWeeks: 6 },
  { name: "Lesão no joelho", severity: "moderate", minWeeks: 4, maxWeeks: 8 },
  { name: "Fratura por estresse", severity: "severe", minWeeks: 10, maxWeeks: 20 },
  { name: "Ruptura de ligamento", severity: "severe", minWeeks: 18, maxWeeks: 32 },
];

/** Weekly injury probability, before proneness / load modifiers. */
const BASE_WEEKLY_RISK = 0.018;

export function injuryRisk(player: Player, age: number, load: number) {
  const fitness = player.attributes.physical.naturalFitness / 100;
  const strength = player.attributes.physical.strength / 100;
  const ageFactor = age >= 30 ? 1 + (age - 29) * 0.09 : age <= 16 ? 1.1 : 1;
  return (
    BASE_WEEKLY_RISK *
    player.hidden.injuryProneness *
    ageFactor *
    (0.4 + load) *
    (1.35 - fitness * 0.3 - strength * 0.15)
  );
}

export function rollInjury(
  player: Player,
  date: GameDate,
  age: number,
  load: number,
  random: Random,
): InjuryRecord | null {
  if (!chance(injuryRisk(player, age, load), random)) return null;

  const weights = chance(0.6, random)
    ? TEMPLATES.filter((t) => t.severity === "light")
    : chance(0.75, random)
      ? TEMPLATES.filter((t) => t.severity === "moderate")
      : TEMPLATES.filter((t) => t.severity === "severe");

  const template = pick(weights, random);
  return {
    id: createId("injury"),
    name: template.name,
    from: date,
    weeksOut: randomInt(template.minWeeks, template.maxWeeks, random),
    severity: template.severity,
  };
}

export function injurySeverityLabel(severity: InjuryRecord["severity"]) {
  return severity === "light" ? "Leve" : severity === "moderate" ? "Moderada" : "Grave";
}
