import type { PersonalityTrait, PersonalityTraitId } from "../types";

/**
 * Permanent traits. They never change during the career and are read by
 * future systems (growth, morale, negotiations, discipline).
 */
export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  {
    id: "ambitious",
    label: "Ambicioso",
    description: "Busca sempre clubes maiores e grandes desafios.",
    effects: { growth: 1.05, negotiation: 1.1 },
  },
  {
    id: "hardWorking",
    label: "Trabalhador",
    description: "Aproveita melhor cada treino e sessão de recuperação.",
    effects: { growth: 1.12, discipline: 1.05 },
  },
  {
    id: "undisciplined",
    label: "Indisciplinado",
    description: "Tende a se envolver em problemas dentro e fora de campo.",
    effects: { growth: 0.9, discipline: 0.8 },
  },
  {
    id: "leader",
    label: "Líder",
    description: "Influencia o elenco e ganha a confiança dos treinadores.",
    effects: { morale: 1.1, negotiation: 1.05 },
  },
  {
    id: "calm",
    label: "Calmo",
    description: "Mantém o equilíbrio em momentos decisivos.",
    effects: { morale: 1.08, discipline: 1.1 },
  },
  {
    id: "competitive",
    label: "Competitivo",
    description: "Rende mais quando disputa posição com outros atletas.",
    effects: { growth: 1.06, morale: 0.98 },
  },
  {
    id: "shy",
    label: "Tímido",
    description: "Demora a se adaptar a novos vestiários.",
    effects: { morale: 0.92, negotiation: 0.9 },
  },
  {
    id: "confident",
    label: "Confiante",
    description: "Não se abala com sequências ruins de desempenho.",
    effects: { morale: 1.12 },
  },
  {
    id: "loyal",
    label: "Leal",
    description: "Valoriza a permanência e a identificação com o clube.",
    effects: { morale: 1.05, negotiation: 0.95 },
  },
  {
    id: "temperamental",
    label: "Temperamental",
    description: "Oscila muito entre grandes atuações e jogos apagados.",
    effects: { morale: 0.95, discipline: 0.85 },
  },
];

/** Traits that should never coexist on the same player. */
const CONFLICTS: Partial<Record<PersonalityTraitId, PersonalityTraitId[]>> = {
  calm: ["temperamental", "undisciplined"],
  temperamental: ["calm"],
  undisciplined: ["hardWorking", "calm"],
  hardWorking: ["undisciplined"],
  shy: ["confident", "leader"],
  confident: ["shy"],
  leader: ["shy"],
};

export function personalityTrait(id: PersonalityTraitId) {
  return PERSONALITY_TRAITS.find((trait) => trait.id === id);
}

/** Picks 2–3 compatible traits. */
export function rollPersonality(random: () => number = Math.random) {
  const pool = [...PERSONALITY_TRAITS].sort(() => random() - 0.5);
  const picked: PersonalityTrait[] = [];
  const target = random() < 0.45 ? 3 : 2;

  for (const trait of pool) {
    if (picked.length >= target) break;
    const blocked = picked.some((chosen) =>
      (CONFLICTS[chosen.id] ?? []).includes(trait.id),
    );
    if (!blocked) picked.push(trait);
  }

  return picked;
}

/** Aggregated multiplier for a given effect, used by future systems. */
export function personalityModifier(
  traits: PersonalityTrait[],
  effect: keyof PersonalityTrait["effects"],
) {
  return traits.reduce((total, trait) => total * (trait.effects[effect] ?? 1), 1);
}
