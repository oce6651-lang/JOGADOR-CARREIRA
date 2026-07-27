import type { CategoryCode, CategoryDefinition } from "./types";

/** Youth ladder + professional squad, ordered from youngest to senior. */
export const CATEGORIES: CategoryDefinition[] = [
  { code: "U11", label: "Sub-11", maxAge: 11, order: 0 },
  { code: "U13", label: "Sub-13", maxAge: 13, order: 1 },
  { code: "U15", label: "Sub-15", maxAge: 15, order: 2 },
  { code: "U17", label: "Sub-17", maxAge: 17, order: 3 },
  { code: "U20", label: "Sub-20", maxAge: 20, order: 4 },
  { code: "U23", label: "Sub-23", maxAge: 23, order: 5 },
  { code: "PRO", label: "Profissional", order: 6 },
];

const BY_CODE = new Map<CategoryCode, CategoryDefinition>(
  CATEGORIES.map((category) => [category.code, category]),
);

export function getCategory(code: CategoryCode) {
  return BY_CODE.get(code);
}

export function categoryLabel(code: CategoryCode) {
  return BY_CODE.get(code)?.label ?? code;
}

export function categoryOrder(code: CategoryCode) {
  return BY_CODE.get(code)?.order ?? 0;
}

/** Sorts any list of categories from youngest to professional. */
export function sortCategories(codes: CategoryCode[]) {
  return [...codes].sort((a, b) => categoryOrder(a) - categoryOrder(b));
}

/** Natural category for a given age (used by trials and promotions). */
export function categoryForAge(age: number): CategoryCode {
  const match = CATEGORIES.find((category) => category.maxAge && age <= category.maxAge);
  return match?.code ?? "PRO";
}

/** Next category above the given one, or undefined at the top. */
export function nextCategory(code: CategoryCode): CategoryCode | undefined {
  return CATEGORIES[categoryOrder(code) + 1]?.code;
}
