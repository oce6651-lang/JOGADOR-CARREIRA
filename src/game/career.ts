import { SAVE_VERSION } from "./constants";
import { advanceWeek, ageAt, createTimeline } from "./calendar";
import { createId } from "./ids";
import type {
  Career,
  CareerLogEntry,
  CareerSummary,
  Foot,
  IsoDate,
  PositionCode,
} from "./types";

export interface NewCareerInput {
  firstName: string;
  lastName: string;
  birthDate: IsoDate;
  nationality: string;
  position: PositionCode;
  foot: Foot;
}

/** The season the career starts in (July-based football season). */
export function currentSeasonYear(now = new Date()): number {
  return now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

export function createCareer(input: NewCareerInput, now = Date.now()): Career {
  const timeline = createTimeline(currentSeasonYear(new Date(now)));

  const firstEntry: CareerLogEntry = {
    id: createId("event"),
    date: timeline.current,
    title: "Carreira iniciada",
    description: `${input.firstName} ${input.lastName} começa sua jornada sem clube.`,
    kind: "milestone",
  };

  return {
    id: createId("career"),
    version: SAVE_VERSION,
    createdAt: now,
    updatedAt: now,
    status: "unsigned",
    player: {
      id: createId("player"),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      birthDate: input.birthDate,
      nationality: input.nationality,
      position: input.position,
      foot: input.foot,
    },
    timeline,
    log: [firstEntry],
  };
}

export function playerFullName(career: Career) {
  return `${career.player.firstName} ${career.player.lastName}`.trim();
}

export function playerAge(career: Career) {
  return ageAt(career.player.birthDate, career.timeline.current.date);
}

/** Pure clock advance. Future systems will compose their own steps around it. */
export function advanceCareerWeek(career: Career): Career {
  return {
    ...career,
    timeline: advanceWeek(career.timeline),
    updatedAt: Date.now(),
  };
}

export function appendLog(
  career: Career,
  entry: Omit<CareerLogEntry, "id" | "date">,
): Career {
  return {
    ...career,
    log: [
      { id: createId("event"), date: career.timeline.current, ...entry },
      ...career.log,
    ].slice(0, 200),
    updatedAt: Date.now(),
  };
}

export function toSummary(career: Career): CareerSummary {
  return {
    id: career.id,
    playerName: playerFullName(career),
    position: career.player.position,
    age: playerAge(career),
    seasonYear: career.timeline.current.seasonYear,
    updatedAt: career.updatedAt,
  };
}
