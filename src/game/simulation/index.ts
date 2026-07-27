import { advanceWeek, ageAt } from "../calendar";
import { WEEKS_PER_SEASON } from "../constants";
import { appendEvents, createEvent } from "../events";
import { createStatLine, mergeStatLines } from "../player/history";
import { calculateOverall } from "../player/overall";
import { addStatus, hasStatus, removeStatus } from "../player/status";
import { createRandom } from "../rng";
import { chance, randomInt } from "../rng";
import type {
  AttributeChange,
  Career,
  GameEvent,
  InjuryRecord,
  MatchStatLine,
  Player,
  SeasonSummary,
  SimulationReport,
} from "../types";
import { createId } from "../ids";
import { rollInjury } from "./injury";
import { matchToStatLine, randomOpponent, simulateMatch } from "./match";
import { mergeChanges, progressAttributes } from "./progression";
import { addSeasonStats, createSeasonProgress, finalizeSeason } from "./season";

export * from "./injury";
export * from "./match";
export * from "./progression";
export * from "./season";

export type SimulationScope = "match" | "week" | "month";

const SCOPE_WEEKS: Record<SimulationScope, number> = { match: 1, week: 1, month: 4 };
/** Safety cap when looking for the next match. */
const MAX_MATCH_SEARCH_WEEKS = 8;

/** Off-season weeks (vacation) at the very end of the season. */
const VACATION_WEEKS = 4;

interface WeekOutcome {
  career: Career;
  events: GameEvent[];
  stats: MatchStatLine;
  trainings: number;
  injuries: InjuryRecord[];
  attributeChanges: AttributeChange[];
  seasonSummaries: SeasonSummary[];
  playedMatch: boolean;
}

export function hasClub(player: Player) {
  return hasStatus(player.statuses, "contracted") || hasStatus(player.statuses, "onLoan");
}

export function isInjured(player: Player) {
  return hasStatus(player.statuses, "injured");
}

export function isRetired(player: Player) {
  return hasStatus(player.statuses, "retired");
}

export function isVacation(week: number) {
  return week > WEEKS_PER_SEASON - VACATION_WEEKS;
}

/** Simulates the requested period and returns the new save + a full report. */
export function simulate(career: Career, scope: SimulationScope): {
  career: Career;
  report: SimulationReport;
} {
  const from = career.timeline.current;
  const overallBefore = calculateOverall(career.player.attributes, career.player.position);
  const ageBefore = ageAt(career.player.birthDate, from.date);

  const maxWeeks =
    scope === "match" ? MAX_MATCH_SEARCH_WEEKS : SCOPE_WEEKS[scope];

  let state = career;
  const events: GameEvent[] = [];
  let stats = createStatLine();
  let trainings = 0;
  let injuries: InjuryRecord[] = [];
  let attributeChanges: AttributeChange[] = [];
  let seasonSummaries: SeasonSummary[] = [];
  let weeks = 0;

  for (let i = 0; i < maxWeeks; i += 1) {
    const outcome = simulateSingleWeek(state);
    state = outcome.career;
    weeks += 1;
    events.push(...outcome.events);
    stats = mergeStatLines(stats, outcome.stats);
    trainings += outcome.trainings;
    injuries = [...injuries, ...outcome.injuries];
    attributeChanges = mergeChanges(attributeChanges, outcome.attributeChanges);
    seasonSummaries = [...seasonSummaries, ...outcome.seasonSummaries];

    if (scope === "match" && (outcome.playedMatch || !hasClub(state.player))) break;
  }

  const overallAfter = calculateOverall(state.player.attributes, state.player.position);
  const report: SimulationReport = {
    id: createId("event"),
    from,
    to: state.timeline.current,
    weeks,
    scope,
    events,
    stats,
    trainings,
    overallBefore,
    overallAfter,
    ageBefore,
    ageAfter: ageAt(state.player.birthDate, state.timeline.current.date),
    attributeChanges,
    injuries,
    seasonSummaries,
  };

  return { career: { ...state, updatedAt: Date.now() }, report };
}

/* ------------------------------------------------------------------ */
/* One week                                                            */
/* ------------------------------------------------------------------ */

function simulateSingleWeek(career: Career): WeekOutcome {
  const date = career.timeline.current;
  const random = createRandom(`${career.id}:${career.timeline.elapsedWeeks}`);
  const events: GameEvent[] = [];
  const injuries: InjuryRecord[] = [];
  let stats = createStatLine();
  let trainings = 0;
  let playedMatch = false;
  let player = career.player;
  let season = career.currentSeason;
  const age = ageAt(player.birthDate, date.date);

  if (isRetired(player)) {
    return {
      career,
      events: [],
      stats,
      trainings: 0,
      injuries: [],
      attributeChanges: [],
      seasonSummaries: [],
      playedMatch: false,
    };
  }

  const injured = isInjured(player);
  const vacation = isVacation(date.week);

  /* --- recovery ------------------------------------------------- */
  if (injured) {
    const flag = player.statuses.find((status) => status.id === "injured");
    if (flag?.untilWeek !== undefined && career.timeline.elapsedWeeks >= flag.untilWeek) {
      player = { ...player, statuses: removeStatus(player.statuses, "injured") };
      events.push(
        createEvent("recovery", date, "Recuperado da lesão", {
          description: "O atleta está liberado para treinar e jogar novamente.",
        }),
      );
    }
  }

  const stillInjured = isInjured(player);

  /* --- training --------------------------------------------------- */
  if (!stillInjured && !vacation) {
    trainings = randomInt(2, 4, random);
    events.push(
      createEvent("training", date, `${trainings} treinos realizados`, {
        description: hasClub(player)
          ? "Rotina semanal com o elenco."
          : "Treinos individuais enquanto procura um clube.",
      }),
    );
  } else if (vacation) {
    events.push(
      createEvent("vacation", date, "Semana de férias", {
        description: "Período de descanso entre temporadas.",
      }),
    );
  } else {
    events.push(
      createEvent("injury", date, "Em tratamento", {
        description: "Semana dedicada à fisioterapia.",
        tone: "warning",
      }),
    );
  }

  /* --- match ------------------------------------------------------ */
  if (!stillInjured && !vacation && hasClub(player) && chance(0.85, random)) {
    const match = simulateMatch(
      player,
      {
        date,
        competition: season.category ? `Campeonato ${season.category}` : "Campeonato",
        opponent: randomOpponent(random),
        starterChance: 0.7,
      },
      random,
    );
    playedMatch = true;
    stats = mergeStatLines(stats, matchToStatLine(player, match));
    player = {
      ...player,
      history: {
        ...player.history,
        matches: [match, ...player.history.matches].slice(0, 400),
      },
    };
    events.push(
      createEvent("match", date, `${match.scoreFor} x ${match.scoreAgainst} · ${match.opponent}`, {
        description: `${match.minutes} min · ${match.goals} gol(s) · ${match.assists} assistência(s) · nota ${match.rating.toFixed(2)}`,
        data: { matchId: match.id },
      }),
    );
    if (match.goals > 0) {
      events.push(
        createEvent("goal", date, `${match.goals} gol(s) marcado(s)`, {
          description: `Contra ${match.opponent}.`,
        }),
      );
    }
  } else if (!stillInjured && !vacation && !hasClub(player) && chance(0.12, random)) {
    events.push(
      createEvent("trial", date, "Convite para peneira", {
        description: "Um clube demonstrou interesse em avaliar o atleta.",
      }),
    );
  }

  /* --- injury ----------------------------------------------------- */
  if (!stillInjured && !vacation) {
    const load = playedMatch ? 1 : 0.5;
    const injury = rollInjury(player, date, age, load, random);
    if (injury) {
      injuries.push(injury);
      player = {
        ...player,
        statuses: addStatus(player.statuses, {
          id: "injured",
          untilWeek: career.timeline.elapsedWeeks + injury.weeksOut,
          note: injury.name,
        }),
        history: {
          ...player.history,
          injuries: [injury, ...player.history.injuries],
        },
      };
      events.push(
        createEvent("injury", date, injury.name, {
          description: `Afastado por aproximadamente ${injury.weeksOut} semana(s).`,
        }),
      );
    }
  }

  /* --- progression ------------------------------------------------ */
  const personalityGrowth = player.personality.reduce(
    (acc, trait) => acc * (trait.effects.growth ?? 1),
    1,
  );
  const load = vacation ? 0.1 : stillInjured ? 0.15 : playedMatch ? 1 : 0.6;
  const progression = progressAttributes(
    player.attributes,
    {
      age,
      position: player.position,
      potential: player.hidden.potential,
      growthRate: player.hidden.growthRate,
      personalityGrowth,
      load,
      form: stats.appearances ? stats.ratingSum / stats.appearances : 0,
    },
    random,
  );
  player = { ...player, attributes: progression.attributes };

  const gains = progression.changes.filter((c) => c.after > c.before);
  const losses = progression.changes.filter((c) => c.after < c.before);
  if (gains.length) {
    events.push(
      createEvent("growth", date, `${gains.length} atributo(s) evoluíram`, {
        description: gains.map((c) => `${c.key}: ${c.before} → ${c.after}`).join(", "),
        data: { changes: gains },
      }),
    );
  }
  if (losses.length) {
    events.push(
      createEvent("decline", date, `${losses.length} atributo(s) caíram`, {
        description: "Efeito natural do envelhecimento.",
        data: { changes: losses },
      }),
    );
  }

  /* --- season accumulator ----------------------------------------- */
  season = addSeasonStats(season, stats);
  season = {
    ...season,
    trainings: season.trainings + trainings,
    injuries: [...season.injuries, ...injuries],
  };

  player = {
    ...player,
    history: {
      ...player.history,
      totals: mergeStatLines(player.history.totals, stats),
    },
  };

  /* --- clock ------------------------------------------------------- */
  const timeline = advanceWeek(career.timeline);
  const nextDate = timeline.current;
  const newAge = ageAt(player.birthDate, nextDate.date);
  const seasonSummaries: SeasonSummary[] = [];

  if (newAge > age) {
    events.push(
      createEvent("birthday", nextDate, `${newAge} anos`, {
        description: "A idade é calculada automaticamente pela data de nascimento.",
      }),
    );
  }

  let nextSeason = season;
  if (timeline.completedSeasons > career.timeline.completedSeasons) {
    const { summary, record } = finalizeSeason(season, player, newAge);
    seasonSummaries.push(summary);
    player = {
      ...player,
      history: {
        ...player.history,
        seasons: [record, ...player.history.seasons],
        overallBySeason: [
          { seasonYear: record.seasonYear, overall: record.overallEnd, age: newAge },
          ...player.history.overallBySeason,
        ],
      },
    };
    events.push(
      createEvent("seasonEnd", nextDate, `Fim da temporada ${summary.seasonYear}`, {
        description: summary.highlights.join(" "),
        data: { seasonYear: summary.seasonYear },
      }),
    );
    events.push(
      createEvent("seasonStart", nextDate, `Início da temporada ${nextDate.seasonYear}`, {
        description: "Nova temporada, novos objetivos.",
      }),
    );
    nextSeason = createSeasonProgress(
      player,
      nextDate.seasonYear,
      newAge,
      season.clubName,
      season.category,
    );
  }

  const nextCareer: Career = {
    ...career,
    player,
    timeline,
    currentSeason: nextSeason,
    events: appendEvents(career.events, events),
    pendingSeasonSummaries: [...career.pendingSeasonSummaries, ...seasonSummaries],
  };

  return {
    career: nextCareer,
    events,
    stats,
    trainings,
    injuries,
    attributeChanges: progression.changes,
    seasonSummaries,
    playedMatch,
  };
}
