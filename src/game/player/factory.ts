import { ageAt } from "../calendar";
import { createId } from "../ids";
import { nextSequentialCode } from "../sequence";
import type {
  AttributeKey,
  Foot,
  IsoDate,
  MentalAttributeKey,
  PhysicalAttributeKey,
  Player,
  PlayerAttributes,
  PlayerHiddenProfile,
  PositionCode,
  TechnicalAttributeKey,
} from "../types";
import {
  MENTAL_ATTRIBUTES,
  PHYSICAL_ATTRIBUTES,
  TECHNICAL_ATTRIBUTES,
  clampAttribute,
} from "./attributes";
import { createHistory } from "./history";
import { keyAttributes } from "./overall";
import { rollPersonality } from "./personality";

export interface CreatePlayerInput {
  firstName: string;
  lastName: string;
  birthDate: IsoDate;
  nationality: string;
  country?: string;
  position: PositionCode;
  foot: Foot;
}

/** Positions a player can naturally cover besides the main one. */
const RELATED_POSITIONS: Record<PositionCode, PositionCode[]> = {
  GK: [],
  CB: ["LB", "RB", "DM"],
  LB: ["CB", "LW", "DM"],
  RB: ["CB", "RW", "DM"],
  DM: ["CM", "CB"],
  CM: ["DM", "AM"],
  AM: ["CM", "LW", "RW", "ST"],
  LW: ["RW", "AM", "ST"],
  RW: ["LW", "AM", "ST"],
  ST: ["AM", "LW", "RW"],
};

/** Typical adult build per position (cm / kg). */
const BUILD: Record<PositionCode, { height: number; weight: number }> = {
  GK: { height: 190, weight: 84 },
  CB: { height: 187, weight: 82 },
  LB: { height: 177, weight: 72 },
  RB: { height: 177, weight: 72 },
  DM: { height: 181, weight: 76 },
  CM: { height: 179, weight: 74 },
  AM: { height: 176, weight: 71 },
  LW: { height: 174, weight: 69 },
  RW: { height: 174, weight: 69 },
  ST: { height: 183, weight: 78 },
};

function randomBetween(min: number, max: number, random: () => number) {
  return min + random() * (max - min);
}

/** Bell-ish distribution so extreme rolls are rare. */
function bell(random: () => number) {
  return (random() + random() + random()) / 3;
}

function rollHidden(random: () => number): PlayerHiddenProfile {
  return {
    potential: clampAttribute(45 + bell(random) * 55),
    growthRate: Number(randomBetween(0.7, 1.35, random).toFixed(2)),
    injuryProneness: Number(randomBetween(0.6, 1.45, random).toFixed(2)),
    consistency: Number(randomBetween(0.7, 1.3, random).toFixed(2)),
    bigMatches: Number(randomBetween(0.7, 1.3, random).toFixed(2)),
  };
}

/**
 * Starting attributes. Young players start low; the hidden potential defines
 * how much room they still have to grow across the next decades.
 */
function rollAttributes(
  position: PositionCode,
  age: number,
  hidden: PlayerHiddenProfile,
  random: () => number,
): PlayerAttributes {
  const maturity = Math.min(1, Math.max(0, (age - 10) / 14));
  const ceiling = hidden.potential;
  const base = 12 + maturity * (ceiling * 0.55);
  const boosted = new Set<AttributeKey>(keyAttributes(position, 7));

  const roll = (key: AttributeKey) => {
    const bonus = boosted.has(key) ? 10 + maturity * 8 : 0;
    const spread = randomBetween(-8, 8, random);
    return clampAttribute(Math.min(ceiling, base + bonus + spread));
  };

  const technical = {} as Record<TechnicalAttributeKey, number>;
  for (const attribute of TECHNICAL_ATTRIBUTES) {
    technical[attribute.key] = roll(attribute.key);
  }

  const mental = {} as Record<MentalAttributeKey, number>;
  for (const attribute of MENTAL_ATTRIBUTES) {
    // Mental attributes mature slower than the rest.
    mental[attribute.key] = clampAttribute(roll(attribute.key) * (0.8 + maturity * 0.2));
  }

  const physical = {} as Record<PhysicalAttributeKey, number>;
  for (const attribute of PHYSICAL_ATTRIBUTES) {
    physical[attribute.key] = roll(attribute.key);
  }

  return { technical, mental, physical };
}

function rollSecondaryPositions(position: PositionCode, random: () => number) {
  const pool = RELATED_POSITIONS[position];
  if (!pool.length) return [];
  const count = random() < 0.35 ? 2 : 1;
  return [...pool].sort(() => random() - 0.5).slice(0, count);
}

function rollBuild(position: PositionCode, age: number, random: () => number) {
  const target = BUILD[position];
  // Growth curve: an 11 year old is ~72% of his adult height.
  const growth = Math.min(1, 0.72 + Math.max(0, age - 11) * 0.028);
  return {
    heightCm: Math.round((target.height + randomBetween(-6, 6, random)) * growth),
    weightKg: Math.round(
      (target.weight + randomBetween(-5, 5, random)) * Math.pow(growth, 2.1),
    ),
  };
}

/** Builds a complete, career-ready player. */
export function createPlayer(
  input: CreatePlayerInput,
  today: IsoDate = new Date().toISOString().slice(0, 10),
  random: () => number = Math.random,
): Player {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const age = ageAt(input.birthDate, today);
  const hidden = rollHidden(random);
  const build = rollBuild(input.position, age, random);

  return {
    id: createId("player"),
    code: nextSequentialCode("PLY"),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    birthDate: input.birthDate,
    nationality: input.nationality,
    country: input.country ?? input.nationality,
    foot: input.foot,
    position: input.position,
    secondaryPositions: rollSecondaryPositions(input.position, random),
    heightCm: build.heightCm,
    weightKg: build.weightKg,
    attributes: rollAttributes(input.position, age, hidden, random),
    personality: rollPersonality(random),
    statuses: [{ id: "unsigned" }],
    hidden,
    history: createHistory(),
  };
}
