import { SAVE_VERSION } from "./constants";
import { ageAt, createTimeline, seasonStartMonthFor } from "./calendar";
import {
  acceptOffer,
  attendTrial,
  declineOffer,
  hireAgent,
  negotiateOffer,
  trialOpportunities,
  createCareerAi,
  type AgentTemplate,
  type NegotiationResult,
  type TrialOpportunity,
} from "./ai";
import { createRandom } from "./rng";
import { CLUBS, categoryLabel, clampWorldYear } from "./world";
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
  NegotiationTopic,
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
  /** Season the career starts in (1930 .. current year). */
  startYear?: number;
}

/** The season the career starts in, respecting the calendar of the country. */
export function currentSeasonYear(now = new Date(), startMonth = 0): number {
  if (startMonth === 0) return now.getUTCFullYear();
  return now.getUTCMonth() >= startMonth ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

/** Athletes follow the calendar of their own country until they move abroad. */
function calendarCountryFor(nationality: string) {
  return CLUBS.some((club) => club.country === nationality) ? nationality : "BRA";
}

export function createCareer(input: NewCareerInput, now = Date.now()): Career {
  const country = calendarCountryFor(input.nationality);
  const startMonth = seasonStartMonthFor(country);
  const seasonYear = clampWorldYear(
    input.startYear ?? currentSeasonYear(new Date(now), startMonth),
    new Date(now),
  );
  const timeline = createTimeline(seasonYear, country);
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

/* ------------------------------------------------------------------ */
/* Negotiations, trials and agents                                     */
/* ------------------------------------------------------------------ */

function careerRandom(career: Career, tag: string) {
  return createRandom(`${career.id}:${tag}:${career.timeline.elapsedWeeks}:${career.updatedAt}`);
}

function withEvents(career: Career, events: GameEvent[]): Career {
  return {
    ...career,
    events: events.length ? appendEvents(career.events, events) : career.events,
    updatedAt: Date.now(),
  };
}

/** Signs a pending proposal exactly as negotiated by the player. */
export function acceptCareerOffer(career: Career, offerId: string): Career {
  const result = acceptOffer(
    career.player,
    career.ai,
    offerId,
    career.timeline.current,
    playerOverall(career),
    careerRandom(career, `accept:${offerId}`),
  );
  const next = withEvents(
    { ...career, player: result.player, ai: result.ai },
    result.events,
  );
  return {
    ...next,
    status: result.ai.club ? "active" : next.status,
    currentSeason: {
      ...next.currentSeason,
      clubName: result.ai.club?.clubName ?? next.currentSeason.clubName,
      category: result.ai.club ? categoryLabel(result.ai.club.category) : next.currentSeason.category,
    },
  };
}

export interface NegotiationFeedback {
  career: Career;
  result: NegotiationResult;
  message: string;
}

/** Counters a proposal. Each round risks losing the deal. */
export function negotiateCareerOffer(
  career: Career,
  offerId: string,
  topic: NegotiationTopic,
): NegotiationFeedback {
  const outcome = negotiateOffer(
    career.ai,
    offerId,
    topic,
    careerRandom(career, `negotiate:${offerId}:${topic}`),
  );
  const event = createEvent("contract", career.timeline.current, "Negociação", {
    description: outcome.message,
    tone: outcome.result === "improved" ? "positive" : outcome.result === "withdrawn" ? "danger" : "warning",
  });
  return {
    career: withEvents({ ...career, ai: outcome.ai }, [event]),
    result: outcome.result,
    message: outcome.message,
  };
}

export function declineCareerOffer(career: Career, offerId: string): Career {
  const result = declineOffer(career.ai, offerId, career.timeline.current);
  return withEvents({ ...career, ai: result.ai }, result.events);
}

/** Trials the athlete can attend right now (free agents only). */
export function careerTrials(career: Career): TrialOpportunity[] {
  if (career.ai.club) return [];
  return trialOpportunities(career.player, career.ai, playerAge(career), playerOverall(career));
}

/** One trial per week — the athlete needs time to travel and recover. */
export function canAttendTrial(career: Career) {
  return !career.ai.club && career.timeline.elapsedWeeks > career.ai.lastTrialWeek;
}

export function attendCareerTrial(
  career: Career,
  opportunity: TrialOpportunity,
): { career: Career; approved: boolean } {
  if (!canAttendTrial(career)) return { career, approved: false };
  const result = attendTrial(
    career.player,
    career.ai,
    opportunity,
    career.timeline.current,
    career.timeline.elapsedWeeks,
    playerOverall(career),
    careerRandom(career, `trial:${opportunity.club.id}`),
  );
  return {
    career: withEvents({ ...career, ai: result.ai }, result.events),
    approved: result.approved,
  };
}

export function hireCareerAgent(career: Career, template: AgentTemplate): Career {
  const agent = hireAgent(template, career.timeline.current.seasonYear);
  return withEvents(
    { ...career, ai: { ...career.ai, agent } },
    [
      createEvent("contract", career.timeline.current, `Novo empresário: ${agent.name}`, {
        description: `Comissão de ${agent.commission}% sobre o salário.`,
        tone: "positive",
      }),
    ],
  );
}

export function dismissCareerAgent(career: Career): Career {
  const agent = career.ai.agent;
  if (!agent) return career;
  return withEvents(
    { ...career, ai: { ...career.ai, agent: null } },
    [
      createEvent("contract", career.timeline.current, `${agent.name} deixou de representar o atleta`, {
        description: "O atleta voltou a negociar por conta própria.",
        tone: "warning",
      }),
    ],
  );
}
