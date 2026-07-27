/**
 * Deterministic random source.
 *
 * Simulations are seeded with the career id + elapsed weeks so the same save
 * always produces the same results — essential for a career that must remain
 * consistent across hundreds of seasons and reloads.
 */
export type Random = () => number;

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRandom(seed: number | string): Random {
  let state = (typeof seed === "string" ? hashString(seed) : seed) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomBetween(min: number, max: number, random: Random) {
  return min + random() * (max - min);
}

export function randomInt(min: number, max: number, random: Random) {
  return Math.floor(randomBetween(min, max + 1, random));
}

export function chance(probability: number, random: Random) {
  return random() < probability;
}

export function pick<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length)];
}
