/**
 * Football World — public API.
 *
 * Everything the rest of the game needs to know about countries, clubs and
 * competitions goes through this barrel, keeping the data layer swappable.
 */

export * from "./types";
export * from "./categories";
export * from "./countries";
export * from "./clubs";
export * from "./competitions";
export * from "./standings";

import { CLUBS } from "./clubs";
import { COMPETITIONS } from "./competitions";
import { COUNTRIES } from "./countries";
import type { WorldSnapshot } from "./types";

export function getWorld(): WorldSnapshot {
  return { countries: COUNTRIES, clubs: CLUBS, competitions: COMPETITIONS };
}

export const WORLD_STATS = {
  countries: COUNTRIES.filter((country) => country.playable).length,
  clubs: CLUBS.length,
  competitions: COMPETITIONS.filter((competition) => competition.status === "active")
    .length,
};
