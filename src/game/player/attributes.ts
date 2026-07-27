import type {
  AttributeCategory,
  AttributeDefinition,
  AttributeKey,
  MentalAttributeKey,
  PhysicalAttributeKey,
  PlayerAttributes,
  TechnicalAttributeKey,
} from "../types";

/** Attribute scale used across the whole game. */
export const ATTRIBUTE_MIN = 1;
export const ATTRIBUTE_MAX = 100;

export const TECHNICAL_ATTRIBUTES: AttributeDefinition<TechnicalAttributeKey>[] = [
  { key: "finishing", label: "Finalização", category: "technical" },
  { key: "passing", label: "Passe", category: "technical" },
  { key: "crossing", label: "Cruzamento", category: "technical" },
  { key: "dribbling", label: "Drible", category: "technical" },
  { key: "firstTouch", label: "Primeiro toque", category: "technical" },
  { key: "heading", label: "Cabeceio", category: "technical" },
  { key: "marking", label: "Marcação", category: "technical" },
  { key: "tackling", label: "Desarme", category: "technical" },
  { key: "technique", label: "Técnica", category: "technical" },
  { key: "setPieces", label: "Bola parada", category: "technical" },
  { key: "penalties", label: "Pênaltis", category: "technical" },
];

export const MENTAL_ATTRIBUTES: AttributeDefinition<MentalAttributeKey>[] = [
  { key: "concentration", label: "Concentração", category: "mental" },
  { key: "decisions", label: "Decisões", category: "mental" },
  { key: "determination", label: "Determinação", category: "mental" },
  { key: "leadership", label: "Liderança", category: "mental" },
  { key: "composure", label: "Compostura", category: "mental" },
  { key: "positioning", label: "Posicionamento", category: "mental" },
  { key: "vision", label: "Visão de jogo", category: "mental" },
  { key: "teamwork", label: "Trabalho em equipe", category: "mental" },
  { key: "aggression", label: "Agressividade", category: "mental" },
];

export const PHYSICAL_ATTRIBUTES: AttributeDefinition<PhysicalAttributeKey>[] = [
  { key: "pace", label: "Velocidade", category: "physical" },
  { key: "acceleration", label: "Aceleração", category: "physical" },
  { key: "agility", label: "Agilidade", category: "physical" },
  { key: "balance", label: "Equilíbrio", category: "physical" },
  { key: "jumping", label: "Impulsão", category: "physical" },
  { key: "strength", label: "Força", category: "physical" },
  { key: "stamina", label: "Resistência", category: "physical" },
  { key: "naturalFitness", label: "Fôlego", category: "physical" },
];

export const ATTRIBUTE_CATEGORIES: {
  id: AttributeCategory;
  label: string;
  attributes: AttributeDefinition<AttributeKey>[];
}[] = [
  {
    id: "technical",
    label: "Técnicos",
    attributes: TECHNICAL_ATTRIBUTES as AttributeDefinition<AttributeKey>[],
  },
  {
    id: "mental",
    label: "Mentais",
    attributes: MENTAL_ATTRIBUTES as AttributeDefinition<AttributeKey>[],
  },
  {
    id: "physical",
    label: "Físicos",
    attributes: PHYSICAL_ATTRIBUTES as AttributeDefinition<AttributeKey>[],
  },
];

export const ALL_ATTRIBUTES: AttributeDefinition<AttributeKey>[] =
  ATTRIBUTE_CATEGORIES.flatMap((category) => category.attributes);

export const ATTRIBUTE_KEYS: AttributeKey[] = ALL_ATTRIBUTES.map((a) => a.key);

export function attributeLabel(key: AttributeKey) {
  return ALL_ATTRIBUTES.find((a) => a.key === key)?.label ?? key;
}

export function clampAttribute(value: number) {
  return Math.max(ATTRIBUTE_MIN, Math.min(ATTRIBUTE_MAX, Math.round(value)));
}

/** Flattens the categorised attribute block into a single lookup map. */
export function flattenAttributes(
  attributes: PlayerAttributes,
): Record<AttributeKey, number> {
  return {
    ...attributes.technical,
    ...attributes.mental,
    ...attributes.physical,
  } as Record<AttributeKey, number>;
}

export function attributeValue(attributes: PlayerAttributes, key: AttributeKey) {
  return flattenAttributes(attributes)[key] ?? ATTRIBUTE_MIN;
}

/** Average of a single category — handy for compact UI summaries. */
export function categoryAverage(
  attributes: PlayerAttributes,
  category: AttributeCategory,
) {
  const block = attributes[category] as Record<string, number>;
  const values = Object.values(block);
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}
