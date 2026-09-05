import { BRAZIL_CLUBS, type ClubRow } from "./data/brazil-clubs";
import { INTERNATIONAL_CLUBS } from "./data/international-clubs";
import { FUTSAL_CLUBS_BY_COUNTRY } from "./data/futsal-clubs";
import type { Sport } from "../types";
import type { CategoryCode, Club, FinanceLevel } from "./types";

/**
 * Club registry. The dataset is static, so ids are derived from the slug
 * (`club_flamengo`) instead of random — saves stay valid forever.
 */

function financeFor(reputation: number): FinanceLevel {
  if (reputation >= 85) return "elite";
  if (reputation >= 70) return "rich";
  if (reputation >= 50) return "stable";
  if (reputation >= 33) return "struggling";
  return "insolvent";
}

/** Bigger clubs run the full youth ladder; smaller ones only the top rungs. */
function categoriesFor(reputation: number): CategoryCode[] {
  if (reputation >= 75)
    return ["U5", "U6", "U7", "U8", "U9", "U11", "U13", "U15", "U17", "U20", "U23", "PRO"];
  if (reputation >= 62)
    return ["U9", "U11", "U13", "U15", "U17", "U20", "U23", "PRO"];
  if (reputation >= 50) return ["U11", "U13", "U15", "U17", "U20", "U23", "PRO"];
  if (reputation >= 38) return ["U13", "U15", "U17", "U20", "PRO"];
  if (reputation >= 28) return ["U15", "U17", "U20", "PRO"];
  return ["U17", "U20", "PRO"];
}

function academyFor(reputation: number, foundedYear: number) {
  const tradition = Math.min(12, Math.max(0, (2000 - foundedYear) / 8));
  return Math.round(Math.max(10, Math.min(99, reputation * 0.85 + tradition)));
}

function buildClub(row: ClubRow, country: string, sport: Sport = "football"): Club {
  const [
    slug,
    name,
    shortName,
    city,
    state,
    foundedYear,
    stadiumName,
    capacity,
    reputation,
    tier,
    colors,
  ] = row;

  const categories = categoriesFor(reputation);

  return {
    id: sport === "futsal" ? `club_futsal_${slug}` : `club_${slug}`,
    sport,
    slug,
    name,
    shortName,
    city,
    state,
    country,
    foundedYear,
    stadium: { name: stadiumName, capacity },
    colors,
    reputation,
    financeLevel: financeFor(reputation),
    academyRating: academyFor(reputation, foundedYear),
    categories,
    entryCategory: categories[0],
    tier,
  };
}

export const CLUBS: Club[] = [
  ...BRAZIL_CLUBS.map((row) => buildClub(row, "BRA")),
  ...INTERNATIONAL_CLUBS.flatMap(({ country, rows }) =>
    rows.map((row) => buildClub(row, country)),
  ),
  ...FUTSAL_CLUBS_BY_COUNTRY.flatMap(({ country, rows }) =>
    rows.map((row) => buildClub(row, country, "futsal")),
  ),
];

/** Every club of one modality. Careers never see the other one. */
export function clubsBySport(sport: Sport = "football") {
  return CLUBS.filter((club) => club.sport === sport);
}

const BY_ID = new Map(CLUBS.map((club) => [club.id, club]));
const BY_SLUG = new Map(CLUBS.map((club) => [club.slug, club]));

export function getClub(id: string) {
  return BY_ID.get(id);
}

export function getClubBySlug(slug: string) {
  return BY_SLUG.get(slug);
}

export function clubsByCountry(countryCode: string, sport: Sport = "football") {
  return clubsBySport(sport).filter((club) => club.country === countryCode);
}

export function clubsByState(
  countryCode: string,
  stateCode: string,
  sport: Sport = "football",
) {
  return clubsByCountry(countryCode, sport).filter((club) => club.state === stateCode);
}

export function clubsByTier(countryCode: string, tier: number, sport: Sport = "football") {
  return clubsByCountry(countryCode, sport).filter((club) => club.tier === tier);
}

/** States that actually have clubs — used by the state championships. */
export function statesWithClubs(countryCode: string, sport: Sport = "football") {
  const set = new Set(clubsByCountry(countryCode, sport).map((club) => club.state));
  return [...set].sort();
}

export function sortByReputation(clubs: Club[]) {
  return [...clubs].sort((a, b) => b.reputation - a.reputation);
}

export const FINANCE_LABELS: Record<FinanceLevel, string> = {
  insolvent: "Endividado",
  struggling: "Apertado",
  stable: "Estável",
  rich: "Forte",
  elite: "Milionário",
};

/** Multiplier applied to wages by how healthy the club's finances are. */
export const FINANCE_WAGE_FACTOR: Record<FinanceLevel, number> = {
  insolvent: 0.55,
  struggling: 0.78,
  stable: 1,
  rich: 1.35,
  elite: 1.9,
};

/** Human label for a 1-100 reputation score. */
export function reputationLabel(reputation: number) {
  if (reputation >= 90) return "Mundial";
  if (reputation >= 78) return "Continental";
  if (reputation >= 64) return "Nacional";
  if (reputation >= 48) return "Regional";
  if (reputation >= 32) return "Estadual";
  return "Local";
}
