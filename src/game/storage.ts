import { SAVE_VERSION } from "./constants";
import { createPlayer } from "./player";
import type { Career, GameSettings } from "./types";

const CAREER_KEY = "pfc:career:v1";
const SETTINGS_KEY = "pfc:settings:v1";

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  animationsEnabled: true,
  autoSave: true,
  language: "pt-BR",
};

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/**
 * Save layer. Isolated on purpose: swapping localStorage for a cloud backend
 * later only touches this file.
 */
export function loadCareer(): Career | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(CAREER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Career;
    return migrateCareer(parsed);
  } catch {
    return null;
  }
}

export function saveCareer(career: Career) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CAREER_KEY, JSON.stringify(career));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export function deleteCareer() {
  if (!isBrowser()) return;
  localStorage.removeItem(CAREER_KEY);
}

export function loadSettings(): GameSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<GameSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings) {
  if (!isBrowser()) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Forward-compatible save migration hook. */
function migrateCareer(career: Career): Career | null {
  if (!career || typeof career !== "object" || !career.player) return null;
  if (career.version === SAVE_VERSION) return career;

  let next = career;

  // v1 -> v2: identity-only players gain attributes, personality and history.
  if (!next.player.attributes) {
    const player = createPlayer(
      {
        firstName: next.player.firstName,
        lastName: next.player.lastName,
        birthDate: next.player.birthDate,
        nationality: next.player.nationality,
        position: next.player.position,
        foot: next.player.foot,
      },
      next.timeline?.current?.date,
    );
    next = { ...next, player: { ...player, id: next.player.id } };
  }

  // Future migrations chain here.
  return { ...next, version: SAVE_VERSION };
}

