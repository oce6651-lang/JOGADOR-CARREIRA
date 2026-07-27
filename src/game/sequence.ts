const COUNTER_KEY = "pfc:sequences:v1";

type Counters = Record<string, number>;

function read(): Counters {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(COUNTER_KEY) ?? "{}") as Counters;
  } catch {
    return {};
  }
}

function write(counters: Counters) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(COUNTER_KEY, JSON.stringify(counters));
  } catch {
    /* storage unavailable — the code falls back to an in-memory counter */
  }
}

const memory: Counters = {};

/**
 * Human readable sequential codes (PLY000001, CLB000001, ...).
 * Persisted so codes never repeat across sessions of the same save.
 */
export function nextSequentialCode(prefix: string, padding = 6): string {
  const counters = read();
  const current = Math.max(counters[prefix] ?? 0, memory[prefix] ?? 0) + 1;
  counters[prefix] = current;
  memory[prefix] = current;
  write(counters);
  return `${prefix}${String(current).padStart(padding, "0")}`;
}
