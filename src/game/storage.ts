import { SAVE_VERSION } from "./constants";
import { ageAt } from "./calendar";
import { createCareerAi } from "./ai";

import { createPlayer } from "./player";
import { createSeasonProgress } from "./simulation";
import type { Career, GameEvent, GameSettings } from "./types";

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

interface LegacyLogEntry {
  id: string;
  date: Career["timeline"]["current"];
  title: string;
  description?: string;
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

  // v2 -> v3: the career log becomes a typed event archive and the season
  // accumulator is introduced.
  if (!next.events) {
    const legacy = ((next as unknown as { log?: LegacyLogEntry[] }).log ?? []).map(
      (entry): GameEvent => ({
        id: entry.id,
        type: "milestone",
        date: entry.date,
        title: entry.title,
        description: entry.description,
        tone: "info",
      }),
    );
    next = { ...next, events: legacy };
  }

  if (!next.pendingSeasonSummaries) {
    next = { ...next, pendingSeasonSummaries: [] };
  }

  if (!next.currentSeason) {
    next = {
      ...next,
      currentSeason: createSeasonProgress(
        next.player,
        next.timeline.current.seasonYear,
        ageAt(next.player.birthDate, next.timeline.current.date),
      ),
    };
  }

  // v3 -> v4: the career AI (morale, fitness, squad role, scouting) is added.
  if (!next.ai) {
    next = { ...next, ai: createCareerAi(next.player) };
  }

  // v4 -> v5: negotiations, agents and national teams.
  if (!Array.isArray(next.ai.offers)) {
    next = {
      ...next,
      ai: {
        ...next.ai,
        offers: [],
        agent: next.ai.agent ?? null,
        lastTrialWeek: next.ai.lastTrialWeek ?? -99,
        nationalTeamLevel: next.ai.nationalTeamLevel ?? null,
      },
    };
  }

  // v5 -> v6: full contracts (type, clause, bonuses) and pending offers get
  // the new terms; legacy "VET" spells become professional ones.
  if (next.ai.club && next.ai.club.contractType === undefined) {
    next = {
      ...next,
      ai: {
        ...next.ai,
        club: {
          ...next.ai.club,
          category: next.ai.club.category === "VET" ? "PRO" : next.ai.club.category,
          contractType:
            next.ai.club.weeklyWage > 0 && next.ai.club.category !== "U15"
              ? "professional"
              : "formation",
          releaseClause: 0,
          appearanceBonus: 0,
          goalBonus: 0,
        },
      },
    };
  }

  if (next.ai.offers.some((offer) => offer.terms.contractType === undefined)) {
    next = {
      ...next,
      ai: {
        ...next.ai,
        offers: next.ai.offers.map((offer) => ({
          ...offer,
          terms: {
            ...offer.terms,
            contractType: offer.terms.weeklyWage > 800 ? "professional" : "formation",
            releaseClause: 0,
            appearanceBonus: 0,
            goalBonus: 0,
            preContract: false,
          },
        })),
      },
    };
  }

  // Future migrations chain here.
  return { ...next, version: SAVE_VERSION };

}
