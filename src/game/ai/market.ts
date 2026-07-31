import type { CareerAi, Player } from "../types";
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

/** Country the athlete currently belongs to: his club's, or his own. */
export function homeCountryFor(player: Player, ai: CareerAi) {
  if (ai.club) {
    const club = CLUBS.find((item) => item.id === ai.club!.clubId);
    if (club) return club.country;
  }
  return player.country ?? player.nationality;
}

export function clubsFromCountry(country: string) {
  return CLUBS.filter((club) => club.country === country);
}

/**
 * Where a club would actually register the athlete. Small clubs push talent
 * straight into the first team; big clubs park newcomers in the academy or in
 * the U23 for adaptation, no matter how well he did somewhere else.
 */
export function plannedEntryCategory(
  club: Club,
  natural: CategoryCode,
  projectedLevel: number,
  age: number,
): CategoryCode {
  const required = requiredOverall("PRO", club.reputation);
  const sorted = sortCategories(club.categories);
  const has = (code: CategoryCode) => club.categories.includes(code);

  // Modest club, athlete above the youth level: he goes up right away.
  if (
    club.reputation <= 55 &&
    age >= 16 &&
    projectedLevel >= required - 4 &&
    has("PRO") &&
    categoryOrder(natural) < categoryOrder("PRO")
  ) {
    return "PRO";
  }

  // Big club: adaptation period one step below what he is used to.
  if (club.reputation >= 70 && projectedLevel < required + 2) {
    if (natural === "PRO") {
      if (age <= 20 && has("U20")) return "U20";
      if (has("U23")) return "U23";
    }
    const below = [...sorted]
      .reverse()
      .find((code) => code !== "U23" && categoryOrder(code) < categoryOrder(natural));
    if (below && age <= 19) return below;
  }

  if (natural === "PRO" && projectedLevel < required - 5 && has("U23")) return "U23";
  return natural;
}
