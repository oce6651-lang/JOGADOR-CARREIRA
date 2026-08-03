import type { CategoryCode, CategoryDefinition } from "./types";

/**
 * Youth ladder + professional squad + veteran squad, ordered from youngest to
 * oldest. Categories are the backbone of the career: trials, promotions,
 * wages and competitions all read from this table.
 */
export const CATEGORIES: CategoryDefinition[] = [
  { code: "U7", label: "Sub-7", maxAge: 7, minAge: 5, order: 0 },
  { code: "U8", label: "Sub-8", maxAge: 8, minAge: 6, order: 1 },
  { code: "U9", label: "Sub-9", maxAge: 9, minAge: 7, order: 2 },
  { code: "U11", label: "Sub-11", maxAge: 11, minAge: 9, order: 3 },
  { code: "U13", label: "Sub-13", maxAge: 13, minAge: 11, order: 4 },
  { code: "U15", label: "Sub-15", maxAge: 15, minAge: 13, order: 5 },
  { code: "U17", label: "Sub-17", maxAge: 17, minAge: 15, order: 6 },
  { code: "U20", label: "Sub-20", maxAge: 20, minAge: 17, order: 7 },
  { code: "U23", label: "Sub-23", maxAge: 23, minAge: 19, order: 8 },
  { code: "PRO", label: "Profissional", minAge: 16, order: 9 },

];


const BY_CODE = new Map<CategoryCode, CategoryDefinition>(
  CATEGORIES.map((category) => [category.code, category]),
);

/** Categories that are still football school: no professional contract. */
export const FORMATION_CATEGORIES: CategoryCode[] = [
  "U7",
  "U8",
  "U9",
  "U11",
  "U13",
  "U15",
];

/** Minimum age the law (and the game) allows a professional contract. */
export const PROFESSIONAL_AGE = 16;

export function getCategory(code: CategoryCode) {
  return BY_CODE.get(code);
}

export function categoryLabel(code: CategoryCode) {
  return BY_CODE.get(code)?.label ?? code;
}

export function categoryOrder(code: CategoryCode) {
  return BY_CODE.get(code)?.order ?? 0;
}

/** True while the athlete can only sign a formation (youth) agreement. */
export function isFormationCategory(code: CategoryCode) {
  return FORMATION_CATEGORIES.includes(code);
}

/** Sorts any list of categories from youngest to professional. */
export function sortCategories(codes: CategoryCode[]) {
  return [...codes].sort((a, b) => categoryOrder(a) - categoryOrder(b));
}

/**
 * U23 is never a natural age category: it is a club decision (see
 * `isDevelopmentCategory`), used for athletes who already left the youth
 * ladder but are not ready for the first team yet.
 */
export function categoryForAge(age: number): CategoryCode {
  const match = CATEGORIES.find(
    (category) =>
      category.code !== "U23" && category.maxAge !== undefined && age <= category.maxAge,
  );
  return match?.code ?? "PRO";
}

/**
 * Youth football registers athletes by the age they COMPLETE during the
 * season's civil year, not by the age they have today. Someone who turns 18
 * in October is already out of the Sub-17 from the first round of the season.
 */
export function seasonAge(birthDate: string, seasonYear: number) {
  return seasonYear - Number(birthDate.slice(0, 4));
}

/** Category the athlete belongs to during a whole season. */
export function categoryForSeason(birthDate: string, seasonYear: number): CategoryCode {
  return categoryForAge(seasonAge(birthDate, seasonYear));
}

/** True while the athlete still plays inside the youth ladder. */
export function isYouthCategory(code: CategoryCode) {
  return code !== "PRO" && code !== "U23";
}

/** U23 — the bridge squad between the academy and the first team. */
export function isDevelopmentCategory(code: CategoryCode) {
  return code === "U23";
}


/** Can an athlete of this age legally play in that category? */
export function isAgeEligible(code: CategoryCode, age: number) {
  const category = BY_CODE.get(code);
  if (!category) return false;
  if (category.maxAge !== undefined && age > category.maxAge) return false;
  if (category.minAge !== undefined && age < category.minAge) return false;
  return true;
}

/** Every category the athlete could legally be registered in, at this age. */
export function eligibleCategories(age: number): CategoryCode[] {
  return CATEGORIES.filter((category) => isAgeEligible(category.code, age)).map(
    (category) => category.code,
  );
}

/** Next category above the given one, or undefined at the top. */
export function nextCategory(code: CategoryCode): CategoryCode | undefined {
  return CATEGORIES[categoryOrder(code) + 1]?.code;
}
