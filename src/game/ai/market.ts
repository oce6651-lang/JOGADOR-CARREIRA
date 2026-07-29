import type { CategoryCode, Club } from "../world";
import { CLUBS, categoryOrder, sortCategories } from "../world";
import { requiredOverall } from "./evaluation";

/**
 * Career AI — market helpers.
 *
 * Shared rules about which clubs and categories are realistically reachable.
 * Used by trials, offers and the review engine so every system agrees on what
 * "within reach" means.
 */

/** Category a club can actually offer for a wanted level. */
export function entryCategoryFor(club: Club, wanted: CategoryCode): CategoryCode {
  if (club.categories.includes(wanted)) return wanted;
  const sorted = sortCategories(club.categories);
  return (
    sorted.find((code) => categoryOrder(code) >= categoryOrder(wanted)) ??
    sorted[sorted.length - 1]
  );
}

/** Clubs whose level matches the athlete's current and projected ability. */
export function reachableClubs(
  overall: number,
  potential: number,
  category: CategoryCode,
  reputation = 0,
): Club[] {
  const projected = overall + Math.max(0, potential - overall) * 0.35 + reputation * 0.08;
  return CLUBS.filter((club) => {
    const target = entryCategoryFor(club, category);
    const required = requiredOverall(target, club.reputation);
    return projected >= required - 4 && projected <= required + 26;
  });
}

/** Estimated market value in BRL — drives transfer talk and history records. */
export function estimateMarketValue(
  overall: number,
  potential: number,
  age: number,
  reputation: number,
  category: CategoryCode,
) {
  if (categoryOrder(category) < categoryOrder("U17")) return 0;
  const base = Math.pow(Math.max(1, overall) / 10, 4.1) * 900;
  const potentialBonus = 1 + Math.max(0, potential - overall) * 0.03;
  const ageFactor = age <= 23 ? 1.25 : age <= 28 ? 1 : Math.max(0.15, 1 - (age - 28) * 0.16);
  const fame = 1 + reputation / 140;
  return Math.round((base * potentialBonus * ageFactor * fame) / 1000) * 1000;
}
