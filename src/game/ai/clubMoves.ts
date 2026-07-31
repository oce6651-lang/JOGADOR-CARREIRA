import { createEvent } from "../events";
import { createId } from "../ids";
import { addStatus, removeStatus } from "../player/status";
import type { Random } from "../rng";
import { randomInt } from "../rng";
import type {
  CareerAi,
  ClubSituation,
  GameDate,
  GameEvent,
  Player,
  SquadRole,
} from "../types";

import { categoryLabel, type CategoryCode, type Club } from "../world";
import { requiredOverall } from "./evaluation";

/**
 * Career AI — club moves.
 *
 * Every entry, promotion, loan and release goes through here so the permanent
 * history (spells, transfers, salaries) is always written the same way.
 */

export type MoveType = "youth" | "permanent" | "loan";

/** Weekly wage estimate, driven by category, club money and player level. */
export function estimateWage(
  club: Club,
  category: CategoryCode,
  overall: number,
  random: Random,
) {
  if (category !== "PRO" && category !== "U23") {
    const base = 200 + club.reputation * 12 + overall * 4;
    return Math.round(base * (0.85 + random() * 0.4));
  }
  const base = 1500 + club.reputation * 140 + Math.max(0, overall - 55) * 320;
  return Math.round(base * (0.85 + random() * 0.5));
}

export function contractLength(category: CategoryCode, random: Random) {
  if (category === "PRO" || category === "U23") return randomInt(2, 4, random);
  return randomInt(2, 3, random);
}

/** Opens a new club spell (or a new category spell inside the same club). */
export function joinClub(
  player: Player,
  ai: CareerAi,
  options: {
    club: Club;
    category: CategoryCode;
    date: GameDate;
    overall: number;
    type: MoveType;
    parent?: ClubSituation;
    random: Random;
    /** Terms agreed by the player during the negotiation. */
    terms?: { weeklyWage: number; seasons: number; role: SquadRole };
  },
): { player: Player; ai: CareerAi; events: GameEvent[] } {
  const { club, category, date, overall, type, parent, random, terms } = options;
  const spellId = createId("contract");
  const wage = terms?.weeklyWage ?? estimateWage(club, category, overall, random);
  const events: GameEvent[] = [];

  const situation: ClubSituation = {
    spellId,
    clubId: club.id,
    clubSlug: club.slug,
    clubName: club.name,
    clubReputation: club.reputation,
    category,
    role: terms?.role ?? (category === "PRO" ? "reserve" : "bench"),
    joinedSeason: date.seasonYear,
    contractUntilSeason:
      date.seasonYear + (terms?.seasons ?? contractLength(category, random)),
    weeklyWage: wage,
    onLoan: type === "loan",
    parentClubId: parent?.clubId,
    parentClubName: parent?.clubName,
    weeksInCategory: 0,
  };


  const nextPlayer: Player = {
    ...player,
    statuses: addStatus(
      removeStatus(player.statuses, "unsigned"),
      type === "loan"
        ? { id: "onLoan", note: club.name }
        : { id: "contracted", note: club.name },
    ),
    history: {
      ...player.history,
      clubs: [
        {
          id: spellId,
          clubId: club.id,
          clubName: club.name,
          category,
          from: date,
          type: type === "permanent" ? "permanent" : type,
        },
        ...player.history.clubs,
      ],
      transfers: [
        {
          id: createId("transfer"),
          date,
          fromClub: parent?.clubName,
          toClub: club.name,
          fee: 0,
          type: type === "youth" ? "youth" : type === "loan" ? "loan" : "free",
        },
        ...player.history.transfers,
      ],
      salaries: [
        { id: createId("contract"), date, clubName: club.name, amount: wage },
        ...player.history.salaries,
      ],
    },
  };

  events.push(
    createEvent(
      "transfer",
      date,
      type === "loan"
        ? `Emprestado ao ${club.name}`
        : `Contratado pelo ${club.name}`,
      {
        description: `${categoryLabel(category)} · ${club.city}/${club.state} · nível exigido ${requiredOverall(category, club.reputation)}.`,
        tone: "positive",
        data: { clubSlug: club.slug, category },
      },
    ),
  );

  return {
    player: nextPlayer,
    ai: { ...ai, club: situation, coachTrust: 45, morale: Math.max(ai.morale, 68) },
    events,
  };
}

/** Closes the current spell in the permanent history. */
export function closeSpell(player: Player, spellId: string, date: GameDate): Player {
  return {
    ...player,
    history: {
      ...player.history,
      clubs: player.history.clubs.map((spell) =>
        spell.id === spellId && !spell.to ? { ...spell, to: date } : spell,
      ),
    },
  };
}

/** Moves the athlete to another category inside the same club. */
export function changeCategory(
  player: Player,
  ai: CareerAi,
  category: CategoryCode,
  date: GameDate,
  promotion: boolean,
): { player: Player; ai: CareerAi; events: GameEvent[] } {
  const situation = ai.club;
  if (!situation) return { player, ai, events: [] };

  const closed = closeSpell(player, situation.spellId, date);
  const spellId = createId("contract");

  const nextPlayer: Player = {
    ...closed,
    history: {
      ...closed.history,
      clubs: [
        {
          id: spellId,
          clubId: situation.clubId,
          clubName: situation.clubName,
          category,
          from: date,
          type: category === "PRO" ? "permanent" : "youth",
        },
        ...closed.history.clubs,
      ],
    },
  };

  const nextAi: CareerAi = {
    ...ai,
    club: {
      ...situation,
      spellId,
      category,
      role: promotion ? "reserve" : "bench",
      weeksInCategory: 0,
    },
    coachTrust: promotion ? 42 : 52,
    morale: Math.max(0, Math.min(100, ai.morale + (promotion ? 12 : -8))),
  };

  return {
    player: nextPlayer,
    ai: nextAi,
    events: [
      createEvent(
        "categoryChange",
        date,
        promotion
          ? `Promovido ao ${categoryLabel(category)}`
          : `Rebaixado ao ${categoryLabel(category)}`,
        {
          description: `${situation.clubName} · ${promotion ? "desempenho acima da categoria anterior" : "precisa de mais ritmo de jogo"}.`,
          tone: promotion ? "positive" : "warning",
        },
      ),
    ],
  };
}

/** Releases the athlete: he goes back to the market without a club. */
export function releaseFromClub(
  player: Player,
  ai: CareerAi,
  date: GameDate,
  reason: string,
  /** A contract simply running out is not the same as being let go. */
  kind: "release" | "contractEnd" = "release",
): { player: Player; ai: CareerAi; events: GameEvent[] } {
  const situation = ai.club;
  if (!situation) return { player, ai, events: [] };

  const closed = closeSpell(player, situation.spellId, date);
  const nextPlayer: Player = {
    ...closed,
    statuses: addStatus(
      removeStatus(removeStatus(closed.statuses, "contracted"), "onLoan"),
      { id: "unsigned" },
    ),
  };

  return {
    player: nextPlayer,
    ai: {
      ...ai,
      club: null,
      releases: ai.releases + (kind === "release" ? 1 : 0),
      morale: Math.max(10, ai.morale - (kind === "release" ? 28 : 12)),
      coachTrust: 40,
    },
    events: [
      createEvent(
        "transfer",
        date,
        kind === "release"
          ? `Dispensado pelo ${situation.clubName}`
          : `Fim de contrato com o ${situation.clubName}`,
        {
          description:
            kind === "release"
              ? reason
              : `${reason} O atleta está livre no mercado: pode receber propostas, treinar por conta e disputar peneiras.`,
          tone: kind === "release" ? "danger" : "warning",
        },
      ),
    ],
  };
}
