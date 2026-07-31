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
  { code: "U11", label: "Sub-11", maxAge: 11, minAge: 8, order: 3 },
  { code: "U13", label: "Sub-13", maxAge: 13, minAge: 10, order: 4 },
  { code: "U15", label: "Sub-15", maxAge: 15, minAge: 12, order: 5 },
  { code: "U17", label: "Sub-17", maxAge: 17, minAge: 14, order: 6 },
  { code: "U20", label: "Sub-20", maxAge: 20, minAge: 15, order: 7 },
  { code: "U23", label: "Sub-23", maxAge: 23, minAge: 16, order: 8 },
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

/** Sorts any list of categories from youngest to veteran. */
export function sortCategories(codes: CategoryCode[]) {
  return [...codes].sort((a, b) => categoryOrder(a) - categoryOrder(b));
}

/** Natural category for a given age (used by trials and promotions). */
export function categoryForAge(age: number): CategoryCode {
  if (age >= 38) return "VET";
  const match = CATEGORIES.find(
    (category) => category.maxAge !== undefined && age <= category.maxAge,
  );
  return match?.code ?? "PRO";
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
