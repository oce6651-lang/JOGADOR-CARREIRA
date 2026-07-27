import {
  SEASON_START_DAY,
  SEASON_START_MONTH,
  WEEKS_PER_SEASON,
} from "./constants";
import type { CareerTimeline, GameDate, IsoDate } from "./types";

function toIso(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function seasonStartDate(seasonYear: number): Date {
  return new Date(Date.UTC(seasonYear, SEASON_START_MONTH, SEASON_START_DAY));
}

export function createTimeline(seasonYear: number): CareerTimeline {
  return {
    current: {
      seasonYear,
      week: 1,
      date: toIso(seasonStartDate(seasonYear)),
    },
    elapsedWeeks: 0,
    completedSeasons: 0,
  };
}

/** Advances the in-game clock by one week, rolling over into a new season. */
export function advanceWeek(timeline: CareerTimeline): CareerTimeline {
  const isSeasonEnd = timeline.current.week >= WEEKS_PER_SEASON;
  const seasonYear = isSeasonEnd
    ? timeline.current.seasonYear + 1
    : timeline.current.seasonYear;
  const week = isSeasonEnd ? 1 : timeline.current.week + 1;

  const date = seasonStartDate(seasonYear);
  date.setUTCDate(date.getUTCDate() + (week - 1) * 7);

  return {
    current: { seasonYear, week, date: toIso(date) },
    elapsedWeeks: timeline.elapsedWeeks + 1,
    completedSeasons: timeline.completedSeasons + (isSeasonEnd ? 1 : 0),
  };
}

export function seasonLabel(date: GameDate) {
  const next = String((date.seasonYear + 1) % 100).padStart(2, "0");
  return `${date.seasonYear}/${next}`;
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
