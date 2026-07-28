import { SAVE_VERSION } from "./constants";
import { ageAt, createTimeline } from "./calendar";
import { createEvent, appendEvents } from "./events";
import { createId } from "./ids";
import { calculateOverall, createPlayer, primaryStatus } from "./player";
import { createSeasonProgress, simulate, type SimulationScope } from "./simulation";
import type {
  Career,
  CareerSummary,
  Foot,
  GameEvent,
  IsoDate,
  PositionCode,
  SimulationReport,
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
  const player = createPlayer(input, timeline.current.date);
  const age = ageAt(player.birthDate, timeline.current.date);

  const events: GameEvent[] = [
    createEvent(
      "seasonStart",
      timeline.current,
      `Início da temporada ${timeline.current.seasonYear}`,
      { description: "A jornada começa agora." },
    ),
    createEvent("milestone", timeline.current, "Carreira iniciada", {
      description: `${player.fullName} (${player.code}) começa sua jornada sem clube.`,
    }),
  ];

  return {
    id: createId("career"),
    version: SAVE_VERSION,
    createdAt: now,
    updatedAt: now,
    status: "unsigned",
    player,
    timeline,
    events,
    pendingSeasonSummaries: [],
    currentSeason: createSeasonProgress(player, timeline.current.seasonYear, age),
    ai: createCareerAi(player),
  };
}


export function playerFullName(career: Career) {
  return career.player.fullName;
}

export function playerAge(career: Career) {
  return ageAt(career.player.birthDate, career.timeline.current.date);
}

export function playerOverall(career: Career) {
  return calculateOverall(career.player.attributes, career.player.position);
}

export function playerStatus(career: Career) {
  return primaryStatus(career.player.statuses);
}

/** Advances the career, running every automatic system for the period. */
export function simulateCareer(
  career: Career,
  scope: SimulationScope,
): { career: Career; report: SimulationReport } {
  return simulate(career, scope);
}

export function acknowledgeSeasonSummary(career: Career, summaryId: string): Career {
  return {
    ...career,
    pendingSeasonSummaries: career.pendingSeasonSummaries.filter(
      (summary) => summary.id !== summaryId,
    ),
    updatedAt: Date.now(),
  };
}

export function appendEvent(
  career: Career,
  event: Omit<GameEvent, "id" | "date" | "tone"> & { tone?: GameEvent["tone"] },
): Career {
  return {
    ...career,
    events: appendEvents(career.events, [
      createEvent(event.type, career.timeline.current, event.title, {
        description: event.description,
        tone: event.tone,
        data: event.data,
      }),
    ]),
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
