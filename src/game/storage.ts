import { SAVE_VERSION } from "./constants";
import { ageAt, switchCalendar } from "./calendar";
import { createCareerAi } from "./ai";

import { createPlayer } from "./player";
import { calculateOverall } from "./player/overall";
import { createSeasonProgress } from "./simulation";
import { addStatus, hasStatus, removeStatus } from "./player/status";
import { categoryLabel, getClub } from "./world";
import type { Career, CareerSummary, GameEvent, GameSettings } from "./types";

/** Legacy single-slot key — migrated into the slot index on first load. */
const CAREER_KEY = "pfc:career:v1";
const SETTINGS_KEY = "pfc:settings:v1";
const INDEX_KEY = "pfc:saves:index:v1";
const ACTIVE_KEY = "pfc:saves:active:v1";
const slotKey = (id: string) => `pfc:save:${id}`;

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
 * later only touches this file. Careers live in independent slots so the
 * player can keep dozens of parallel stories forever.
 */

function readIndex(): CareerSummary[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const list = raw ? (JSON.parse(raw) as CareerSummary[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeIndex(list: CareerSummary[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function summarize(career: Career): CareerSummary {
  return {
    id: career.id,
    playerName: career.player.fullName,
    position: career.player.position,
    age: ageAt(career.player.birthDate, career.timeline.current.date),
    seasonYear: career.timeline.current.seasonYear,
    updatedAt: career.updatedAt,
    createdAt: career.createdAt,
    status: career.status,
    overall: calculateOverall(career.player.attributes, career.player.position),
    clubName: career.ai?.club?.clubName,
    category: career.ai?.club ? categoryLabel(career.ai.club.category) : undefined,
  };
}

/** All saves, most recently played first. */
export function listSaves(): CareerSummary[] {
  migrateLegacySlot();
  return [...readIndex()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function loadCareerById(id: string): Career | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(slotKey(id));
    if (!raw) return null;
    return migrateCareer(JSON.parse(raw) as Career);
  } catch {
    return null;
  }
}

/** Moves a pre-slot save into the new index (runs at most once). */
function migrateLegacySlot() {
  if (!isBrowser()) return;
  const raw = localStorage.getItem(CAREER_KEY);
  if (!raw) return;
  try {
    const career = migrateCareer(JSON.parse(raw) as Career);
    if (career) {
      localStorage.setItem(slotKey(career.id), JSON.stringify(career));
      const index = readIndex().filter((entry) => entry.id !== career.id);
      writeIndex([summarize(career), ...index]);
      localStorage.setItem(ACTIVE_KEY, career.id);
    }
  } catch {
    /* ignore */
  }
  localStorage.removeItem(CAREER_KEY);
}

/** The career currently being played. */
export function loadCareer(): Career | null {
  if (!isBrowser()) return null;
  migrateLegacySlot();
  const activeId = localStorage.getItem(ACTIVE_KEY);
  if (activeId) {
    const career = loadCareerById(activeId);
    if (career) return career;
  }
  const [latest] = listSaves();
  return latest ? loadCareerById(latest.id) : null;
}

export function setActiveCareer(id: string | null) {
  if (!isBrowser()) return;
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function saveCareer(career: Career) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(slotKey(career.id), JSON.stringify(career));
    localStorage.setItem(ACTIVE_KEY, career.id);
    const index = readIndex().filter((entry) => entry.id !== career.id);
    writeIndex([summarize(career), ...index]);
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export function deleteCareerById(id: string) {
  if (!isBrowser()) return;
  localStorage.removeItem(slotKey(id));
  writeIndex(readIndex().filter((entry) => entry.id !== id));
  if (localStorage.getItem(ACTIVE_KEY) === id) localStorage.removeItem(ACTIVE_KEY);
}

/** Deletes the active save (used by "abandonar carreira"). */
export function deleteCareer(id?: string) {
  if (!isBrowser()) return;
  const target = id ?? localStorage.getItem(ACTIVE_KEY);
  if (target) deleteCareerById(target);
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
          category: (next.ai.club.category as string) === "VET" ? "PRO" : next.ai.club.category,
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

  // v6 -> v7: permanent competition history + multi-slot saves.
  if (!Array.isArray(next.competitionHistory)) {
    next = { ...next, competitionHistory: [] };
  }

  // v7 -> v8: mandatory sanity pass on every load.

  // Future migrations chain here.
  return repairCareer({ ...next, version: SAVE_VERSION });
}

/**
 * Sanity pass that runs on every load, even for up-to-date saves. It fixes
 * inconsistencies created by older builds instead of letting them rot:
 * duplicated club statuses, missing arrays and a calendar out of sync with
 * the club's country.
 */
function repairCareer(career: Career): Career {
  let next: Career = {
    ...career,
    events: Array.isArray(career.events) ? career.events : [],
    pendingSeasonSummaries: Array.isArray(career.pendingSeasonSummaries)
      ? career.pendingSeasonSummaries
      : [],
    competitionHistory: Array.isArray(career.competitionHistory)
      ? career.competitionHistory
      : [],
  };

  const club = next.ai?.club;
  const retired = hasStatus(next.player.statuses, "retired") || next.status === "retired";

  // Only one club status may be active at a time.
  let statuses = next.player.statuses ?? [];
  if (!retired) {
    if (club) {
      statuses = removeStatus(statuses, "unsigned");
      statuses = club.onLoan
        ? addStatus(removeStatus(statuses, "contracted"), {
            id: "onLoan",
            note: club.clubName,
          })
        : addStatus(removeStatus(statuses, "onLoan"), {
            id: "contracted",
            note: club.clubName,
          });
    } else {
      statuses = removeStatus(removeStatus(statuses, "contracted"), "onLoan");
      statuses = addStatus(statuses, { id: "unsigned" });
    }
  }
  if (statuses !== next.player.statuses) {
    next = { ...next, player: { ...next.player, statuses } };
  }

  // The calendar must follow the club's country.
  const country = club ? getClub(club.clubId)?.country : undefined;
  if (country && country !== next.timeline.calendarCountry) {
    next = { ...next, timeline: switchCalendar(next.timeline, country) };
  }

  // A retired career never reports itself as active.
  if (retired && next.status !== "retired") {
    next = { ...next, status: "retired" };
  }

  return next;
}
