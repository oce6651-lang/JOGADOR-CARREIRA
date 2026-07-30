import { WEEKS_PER_SEASON } from "./constants";
import { getCountry } from "./world/countries";
import type { CareerTimeline, GameDate, IsoDate } from "./types";

function toIso(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export const DEFAULT_SEASON_START_MONTH = 0;
export const SEASON_START_DAY = 8;

/** Season calendar of a country: Jan-Dec in South America, Jul-May in Europe. */
export function seasonStartMonthFor(countryCode: string) {
  return getCountry(countryCode)?.seasonStartMonth ?? DEFAULT_SEASON_START_MONTH;
}

/** True when the season spans two civil years (European calendar). */
export function isSplitYearCalendar(startMonth: number) {
  return startMonth > 0;
}

export function seasonStartDate(seasonYear: number, startMonth: number): Date {
  const month = Number.isFinite(startMonth) ? startMonth : DEFAULT_SEASON_START_MONTH;
  return new Date(Date.UTC(seasonYear, month, SEASON_START_DAY));
}


export function createTimeline(
  seasonYear: number,
  calendarCountry = "BRA",
): CareerTimeline {
  const seasonStartMonth = seasonStartMonthFor(calendarCountry);
  return {
    current: {
      seasonYear,
      week: 1,
      date: toIso(seasonStartDate(seasonYear, seasonStartMonth)),
    },
    elapsedWeeks: 0,
    completedSeasons: 0,
    seasonStartMonth,
    calendarCountry,
  };
}

/** Advances the in-game clock by one week, rolling over into a new season. */
export function advanceWeek(timeline: CareerTimeline): CareerTimeline {
  const isSeasonEnd = timeline.current.week >= WEEKS_PER_SEASON;
  const seasonYear = isSeasonEnd
    ? timeline.current.seasonYear + 1
    : timeline.current.seasonYear;
  const week = isSeasonEnd ? 1 : timeline.current.week + 1;

  const date = seasonStartDate(seasonYear, timeline.seasonStartMonth);
  date.setUTCDate(date.getUTCDate() + (week - 1) * 7);

  return {
    ...timeline,
    current: { seasonYear, week, date: toIso(date) },
    elapsedWeeks: timeline.elapsedWeeks + 1,
    completedSeasons: timeline.completedSeasons + (isSeasonEnd ? 1 : 0),
  };
}

/**
 * Moves the career to another country's calendar without losing the date,
 * used when the athlete transfers between continents.
 */
export function switchCalendar(
  timeline: CareerTimeline,
  calendarCountry: string,
): CareerTimeline {
  const seasonStartMonth = seasonStartMonthFor(calendarCountry);
  if (seasonStartMonth === timeline.seasonStartMonth) {
    return { ...timeline, calendarCountry };
  }
  return { ...timeline, calendarCountry, seasonStartMonth };
}

export function seasonLabel(date: GameDate, startMonth = DEFAULT_SEASON_START_MONTH) {
  if (!isSplitYearCalendar(startMonth)) return String(date.seasonYear);
  const next = String((date.seasonYear + 1) % 100).padStart(2, "0");
  return `${date.seasonYear}/${next}`;
}

/** Phase of the season, used by the UI and by the transfer windows. */
export function seasonPhase(week: number): "preSeason" | "inSeason" | "runIn" | "offSeason" {
  if (week <= 5) return "preSeason";
  if (week <= 40) return "inSeason";
  if (week <= 48) return "runIn";
  return "offSeason";
}

export const SEASON_PHASE_LABELS: Record<ReturnType<typeof seasonPhase>, string> = {
  preSeason: "Pré-temporada",
  inSeason: "Temporada",
  runIn: "Reta final",
  offSeason: "Férias",
};

/** Transfer windows: opening weeks of the season and mid-season. */
export function isTransferWindowOpen(week: number) {
  return week <= 8 || (week >= 26 && week <= 32) || week >= 49;
}

export function formatGameDate(date: GameDate) {
  const parsed = new Date(`${date.date}T00:00:00Z`);
  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ageAt(birthDate: IsoDate, reference: IsoDate): number {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const ref = new Date(`${reference}T00:00:00Z`);
  let age = ref.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = ref.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && ref.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return age;
}
