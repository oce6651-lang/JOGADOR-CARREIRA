import type { Random } from "../rng";
import { randomInt } from "../rng";
import type { ContractTerms, ContractType, SquadRole } from "../types";
import {
  PROFESSIONAL_AGE,
  categoryOrder,
  eraWageFactor,
  isFormationCategory,
  type CategoryCode,
  type Club,
} from "../world";

/**
 * Career AI — contracts and wages.
 *
 * One single source of truth for money: how much a club pays, what kind of
 * agreement it can legally sign and which clauses come with it. Formation
 * categories (up to Sub-15) never generate a salary — only a monthly stipend
 * (auxílio) — while every deal from 16 years old is a professional contract.
 */

const FINANCE_FACTOR: Record<Club["financeLevel"], number> = {
  insolvent: 0.45,
  struggling: 0.7,
  stable: 1,
  rich: 1.45,
  elite: 2.1,
};

function financeFactor(club: Club) {
  return FINANCE_FACTOR[club.financeLevel] ?? 1;
}

/** Which kind of agreement the club can offer for that category and age. */
export function contractTypeFor(category: CategoryCode, age: number): ContractType {
  if (age < PROFESSIONAL_AGE || isFormationCategory(category)) return "formation";
  if (category === "PRO") return "professional";
  return "youthPro";
}

/** A formation deal pays a stipend, not a wage. */
export function isStipend(type: ContractType) {
  return type === "formation";
}

export function contractTypeLabel(type: ContractType) {
  switch (type) {
    case "formation":
      return "Contrato de formação";
    case "youthPro":
      return "Primeiro contrato profissional";
    default:
      return "Contrato profissional";
  }
}

export function wageLabel(type: ContractType) {
  return isStipend(type) ? "Auxílio" : "Salário";
}

export interface WageInput {
  club: Club;
  category: CategoryCode;
  overall: number;
  age: number;
  reputation: number;
  seasonYear: number;
  random: Random;
}

/** Weekly amount in BRL. Formation deals return a small weekly stipend. */
export function weeklyWageFor(input: WageInput) {
  const { club, category, overall, age, reputation, seasonYear, random } = input;
  const type = contractTypeFor(category, age);
  const era = eraWageFactor(seasonYear);
  const noise = 0.85 + random() * 0.4;

  if (isStipend(type)) {
    // Auxílio de formação: transport, food and school support only.
    const base = 120 + club.reputation * 6 + Math.max(0, overall - 40) * 5;
    return Math.max(60, Math.round(base * financeFactor(club) * era * noise));
  }

  const ladder = categoryOrder(category) / categoryOrder("PRO");
  const base =
    (600 + club.reputation * 95 + Math.max(0, overall - 50) * 260) * (0.45 + ladder * 0.75);
  const fame = 1 + reputation / 160;
  return Math.max(200, Math.round(base * financeFactor(club) * era * fame * noise));
}

export function contractSeasons(type: ContractType, age: number, random: Random) {
  if (isStipend(type)) return randomInt(1, 2, random);
  if (age <= 20) return randomInt(3, 5, random);
  if (age <= 30) return randomInt(2, 4, random);
  return randomInt(1, 2, random);
}

export interface ContractTermsInput {
  club: Club;
  category: CategoryCode;
  overall: number;
  age: number;
  reputation: number;
  seasonYear: number;
  role: SquadRole;
  random: Random;
  /** Loans never carry clause, luvas or a long deal. */
  loan?: boolean;
  /** Deal that only starts next season. */
  preContract?: boolean;
  /** Overrides the computed wage (renewals reuse the current salary). */
  weeklyWage?: number;
}

/** Full package a club puts on the table. */
export function buildContractTerms(input: ContractTermsInput): ContractTerms {
  const { club, category, overall, age, random, loan } = input;
  const contractType = contractTypeFor(category, age);
  const stipend = isStipend(contractType);
  const weeklyWage = input.weeklyWage ?? weeklyWageFor(input);
  const seasons = loan ? 1 : contractSeasons(contractType, age, random);

  const signingBonus = loan || stipend ? 0 : Math.round(weeklyWage * randomInt(3, 14, random));

  // Clause scales with wage, club ambition and how much of a bet he is.
  const clauseFactor = stipend ? 90 : 140 + club.reputation * 4;
  const releaseClause =
    loan || stipend
      ? 0
      : Math.round((weeklyWage * clauseFactor * (0.7 + random() * 0.9)) / 1000) * 1000;

  const appearanceBonus = stipend ? 0 : Math.round(weeklyWage * (0.1 + random() * 0.25));
  const goalBonus = stipend ? 0 : Math.round(weeklyWage * (0.2 + random() * 0.5));

  return {
    weeklyWage,
    seasons,
    role: input.role,
    signingBonus,
    contractType,
    releaseClause,
    appearanceBonus,
    goalBonus,
    preContract: Boolean(input.preContract),
  };
}

/** Monthly figure shown in the UI — weekly wages are hard to read. */
export function monthlyWage(weeklyWage: number) {
  return Math.round(weeklyWage * 4.33);
}
