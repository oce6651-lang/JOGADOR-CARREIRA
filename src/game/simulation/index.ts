import { advanceWeek, ageAt } from "../calendar";
import { WEEKS_PER_SEASON } from "../constants";
import { appendEvents, createEvent } from "../events";
import { createStatLine, mergeStatLines } from "../player/history";
import { calculateOverall } from "../player/overall";
import { addStatus, hasStatus, removeStatus } from "../player/status";
import { createRandom } from "../rng";
import { chance } from "../rng";
import {
  applyMatchFeedback,
  applyWeekCondition,
  buildHeadlines,
  decayMorale,
  randomOpponentStrength,
  roleLabel,
  runCareerReview,
  selectionProfile,
  shouldReview,
} from "../ai";
import { categoryLabel } from "../world";
import type {
  AttributeChange,
  CareerAi,
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

/** Chance the club has a fixture in a given (non-vacation) week. */
const FIXTURE_CHANCE = 0.85;

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

  const maxWeeks = scope === "match" ? MAX_MATCH_SEARCH_WEEKS : SCOPE_WEEKS[scope];

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

    if (scope === "match" && outcome.playedMatch) break;
  }

  const overallAfter = calculateOverall(state.player.attributes, state.player.position);
  const ai = state.ai;

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
    headlines: buildHeadlines({
      ai,
      stats,
      trainings,
      overallDelta: overallAfter - overallBefore,
      injuries: injuries.length,
      events,
    }),
    clubName: ai.club?.clubName,
    categoryLabel: ai.club ? categoryLabel(ai.club.category) : undefined,
    roleLabel: ai.club ? roleLabel(ai.club.role) : undefined,
    morale: ai.morale,
    fitness: ai.fitness,
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
  let minutesPlayed = 0;
  let player = career.player;
  let ai: CareerAi = career.ai;
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

  const vacation = isVacation(date.week);

  /* --- recovery ---------------------------------------------------- */
  if (isInjured(player)) {
    const flag = player.statuses.find((status) => status.id === "injured");
    if (flag?.untilWeek !== undefined && career.timeline.elapsedWeeks >= flag.untilWeek) {
      player = { ...player, statuses: removeStatus(player.statuses, "injured") };
      events.push(
        createEvent("recovery", date, "Recuperado da lesão", {
          description: "Liberado para treinar, mas ainda sem ritmo de jogo.",
        }),
      );
    }
  }

  const stillInjured = isInjured(player);

  /* --- training ---------------------------------------------------- */
  if (!stillInjured && !vacation) {
    trainings = 2 + (chance(0.5, random) ? 1 : 0) + (ai.club ? 1 : 0);
    events.push(
      createEvent("training", date, `${trainings} treinos realizados`, {
        description: ai.club
          ? `Rotina semanal no ${ai.club.clubName} (${categoryLabel(ai.club.category)}).`
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

  /* --- match ------------------------------------------------------- */
  const situation = ai.club;
  const fixtureWeek =
    !stillInjured && !vacation && situation !== null && chance(FIXTURE_CHANCE, random);

  if (fixtureWeek && situation) {
    const profile = selectionProfile(situation.role);
    const called = chance(profile.playChance, random);

    if (called) {
      const starter = chance(profile.starterChance, random);
      const opponentStrength = randomOpponentStrength(situation.clubReputation, random);
      const match = simulateMatch(
        player,
        {
          date,
          competition: `${categoryLabel(situation.category)} · ${situation.clubName}`,
          opponent: randomOpponent(random),
          starter,
          benchMinutes: profile.benchMinutes,
          sharpness: ai.sharpness,
          morale: ai.morale,
          teamStrength: situation.clubReputation,
          opponentStrength,
        },
        random,
      );
      playedMatch = true;
      minutesPlayed = match.minutes;
      stats = mergeStatLines(stats, matchToStatLine(player, match));
      ai = applyMatchFeedback(ai, match, situation.clubReputation);
      player = {
        ...player,
        history: {
          ...player.history,
          matches: [match, ...player.history.matches].slice(0, 400),
        },
      };
      events.push(
        createEvent(
          "match",
          date,
          `${match.scoreFor} x ${match.scoreAgainst} · ${match.opponent}`,
          {
            description: `${starter ? "Titular" : "Entrou no decorrer"} · ${match.minutes} min · ${match.goals} gol(s) · ${match.assists} assistência(s) · nota ${match.rating.toFixed(2)}`,
            data: { matchId: match.id },
          },
        ),
      );
      if (match.goals > 0) {
        events.push(
          createEvent("goal", date, `${match.goals} gol(s) marcado(s)`, {
            description: `Contra ${match.opponent}.`,
          }),
        );
      }
    } else {
      ai = decayMorale({ ...ai, morale: Math.max(0, ai.morale - 3) });
      events.push(
        createEvent("milestone", date, "Fora dos relacionados", {
          description: `${situation.clubName} não relacionou o atleta para a rodada.`,
          tone: "warning",
        }),
      );
    }
  }

  /* --- injury ------------------------------------------------------ */
  if (!stillInjured && !vacation) {
    const load = playedMatch ? 0.6 + minutesPlayed / 150 : 0.5;
    const fatigue = load * (1 + (85 - ai.fitness) / 120);
    const injury = rollInjury(player, date, age, fatigue, random);
    if (injury) {
      injuries.push(injury);
      ai = {
        ...ai,
        sharpness: Math.max(0, ai.sharpness - injury.weeksOut * 4),
        fitness: Math.max(20, ai.fitness - injury.weeksOut * 2),
        morale: Math.max(5, ai.morale - 10 - injury.weeksOut),
      };
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

  /* --- condition --------------------------------------------------- */
  ai = applyWeekCondition(ai, {
    injured: stillInjured,
    vacation,
    trained: trainings > 0,
    playedMinutes: minutesPlayed,
    naturalFitness: player.attributes.physical.naturalFitness,
  });
  ai = decayMorale(ai);

  /* --- progression -------------------------------------------------- */
  const personalityGrowth = player.personality.reduce(
    (acc, trait) => acc * (trait.effects.growth ?? 1),
    1,
  );
  const load = vacation
    ? 0.1
    : stillInjured
      ? 0.15
      : playedMatch
        ? 0.55 + minutesPlayed / 200
        : ai.club
          ? 0.45
          : 0.3;
  const progression = progressAttributes(
    player.attributes,
    {
      age,
      position: player.position,
      potential: player.hidden.potential,
      growthRate: player.hidden.growthRate,
      personalityGrowth: personalityGrowth * (0.9 + ai.morale / 500),
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

  /* --- season accumulator ------------------------------------------- */
  season = addSeasonStats(season, stats);
  season = {
    ...season,
    trainings: season.trainings + trainings,
    injuries: [...season.injuries, ...injuries],
    clubName: ai.club?.clubName ?? season.clubName,
    category: ai.club ? categoryLabel(ai.club.category) : season.category,
  };

  player = {
    ...player,
    history: {
      ...player.history,
      totals: mergeStatLines(player.history.totals, stats),
    },
  };

  if (ai.club) {
    ai = { ...ai, club: { ...ai.club, weeksInCategory: ai.club.weeksInCategory + 1 } };
  }

  /* --- clock --------------------------------------------------------- */
  const timeline = advanceWeek(career.timeline);
  const nextDate = timeline.current;
  const newAge = ageAt(player.birthDate, nextDate.date);
  const seasonEnd = timeline.completedSeasons > career.timeline.completedSeasons;
  const seasonSummaries: SeasonSummary[] = [];

  if (newAge > age) {
    events.push(
      createEvent("birthday", nextDate, `${newAge} anos`, {
        description: "A idade é calculada automaticamente pela data de nascimento.",
      }),
    );
  }

  /* --- career AI ------------------------------------------------------ */
  let categoryChange: string | undefined;
  if (
    !isRetired(player) &&
    shouldReview(ai, { elapsedWeeks: timeline.elapsedWeeks, seasonEnd })
  ) {
    const review = runCareerReview({
      player,
      ai,
      date: nextDate,
      elapsedWeeks: timeline.elapsedWeeks,
      age: newAge,
      overall: calculateOverall(player.attributes, player.position),
      seasonStats: season.stats,
      seasonEnd,
      random,
    });
    player = review.player;
    ai = review.ai;
    categoryChange = review.categoryChange;
    events.push(...review.events);
    season = {
      ...season,
      clubName: ai.club?.clubName ?? season.clubName,
      category: ai.club ? categoryLabel(ai.club.category) : season.category,
    };
  }

  let nextSeason = season;
  if (seasonEnd) {
    const { summary, record } = finalizeSeason(season, player, newAge);
    const withChange: SeasonSummary = { ...summary, categoryChange };
    seasonSummaries.push(withChange);
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
      ai.club?.clubName,
      ai.club ? categoryLabel(ai.club.category) : undefined,
    );
  }

  const nextCareer: Career = {
    ...career,
    player,
    ai,
    status: hasClub(player) ? "active" : career.status === "retired" ? "retired" : "unsigned",
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
