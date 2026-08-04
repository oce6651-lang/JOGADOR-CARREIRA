/**
 * Developer mode gate.
 *
 * The tools stay invisible for regular players: the flag only exists on the
 * authorised device, unlocked with the studio access code.
 */
const KEY = "pfc:dev:v1";
const ACCESS_CODE = "PFC-DEV-2026";

export function isDeveloper(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === ACCESS_CODE;
}

/** Returns true when the code is valid and developer mode was unlocked. */
export function unlockDeveloper(code: string): boolean {
  if (code.trim().toUpperCase() !== ACCESS_CODE) return false;
  window.localStorage.setItem(KEY, ACCESS_CODE);
  return true;
}

export function lockDeveloper() {
  window.localStorage.removeItem(KEY);
}
