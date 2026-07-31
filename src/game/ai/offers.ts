import { createEvent } from "../events";
import { createId } from "../ids";
import type { Random } from "../rng";
import { chance, randomInt } from "../rng";
import type {
  CareerAi,
  ClubOffer,
  ContractTerms,
  GameDate,
  GameEvent,
  NegotiationTopic,
  OfferKind,
  Player,
  SquadRole,
} from "../types";
import { categoryLabel, getClub, type CategoryCode, type Club } from "../world";
import { contractLength, estimateWage, joinClub } from "./clubMoves";
import { negotiationLeverage } from "./reputation";
import { ROLE_ORDER, roleLabel } from "./squad";

/**
 * Career AI — negotiations.
 *
 * Clubs never sign the athlete by themselves: they send proposals and the
 * player accepts, counters or refuses them. Every proposal has a deadline,
 * a limited number of negotiation rounds and a breaking point.
 */

/** Weeks a proposal stays on the table. */
export const OFFER_VALIDITY_WEEKS = 4;

export const OFFER_LABELS: Record<OfferKind, string> = {
  trial: "Convite para peneira",
  contract: "Proposta de contrato",
  renewal: "Proposta de renovação",
  loan: "Proposta de empréstimo",
  transfer: "Proposta de transferência",
};

export const TOPIC_LABELS: Record<NegotiationTopic, string> = {
  wage: "Pedir salário maior",
  seasons: "Ajustar duração do contrato",
  role: "Exigir mais espaço no elenco",
};

export interface OfferInput {
  kind: OfferKind;
  club: Club;
  category: CategoryCode;
  overall: number;
  elapsedWeeks: number;
  ai: CareerAi;
  role?: SquadRole;
  fromClubName?: string;
  message?: string;
  random: Random;
}

export function buildOffer(input: OfferInput): ClubOffer {
  const { kind, club, category, overall, elapsedWeeks, ai, random } = input;
  const wage = estimateWage(club, category, overall, random);
  const seasons = contractLength(category, random);
  const role: SquadRole =
    input.role ?? (category === "PRO" ? "reserve" : "bench");

  const terms: ContractTerms = {
    weeklyWage: kind === "renewal" && ai.club ? Math.round(ai.club.weeklyWage * 1.12) : wage,
    seasons: kind === "loan" ? 1 : seasons,
    role,
    signingBonus: kind === "loan" ? 0 : Math.round(wage * randomInt(2, 10, random)),
  };

  return {
    id: createId("contract"),
    kind,
    clubId: club.id,
    clubSlug: club.slug,
    clubName: club.name,
    clubReputation: club.reputation,
    category,
    fromClubName: input.fromClubName,
    terms,
    message: input.message ?? defaultMessage(kind, club, category),
    createdWeek: elapsedWeeks,
    expiresWeek: elapsedWeeks + OFFER_VALIDITY_WEEKS,
    rounds: 0,
    maxRounds: ai.agent ? 3 : 2,
    finalOffer: false,
  };
}

function defaultMessage(kind: OfferKind, club: Club, category: CategoryCode) {
  const where = `${club.name} (${categoryLabel(category)})`;
  switch (kind) {
    case "trial":
      return `O ${where} abriu uma vaga de avaliação para a posição.`;
    case "renewal":
      return `A diretoria do ${where} quer estender o vínculo do atleta.`;
    case "loan":
      return `O ${where} quer o atleta por empréstimo para ganhar minutos.`;
    case "transfer":
      return `O ${where} apresentou proposta formal para contratar o atleta.`;
    default:
      return `O ${where} ofereceu um contrato ao atleta.`;
  }
}

/**
 * How the destination squad is presented to the player. European clubs call
 * their bridge squad "Equipe B" instead of Sub-23.
 */
export function offerCategoryLabel(category: CategoryCode, clubCountry?: string) {
  if (category === "U23" && clubCountry && !["BRA", "ARG"].includes(clubCountry)) {
    return "Equipe B";
  }
  return categoryLabel(category);
}

export function addOffer(ai: CareerAi, offer: ClubOffer): CareerAi {
  const withoutSameClub = ai.offers.filter(
    (item) => !(item.clubId === offer.clubId && item.kind === offer.kind),
  );
  return { ...ai, offers: [...withoutSameClub, offer].slice(-8) };
}

export function isOfferOpen(offer: ClubOffer, elapsedWeeks: number) {
  return elapsedWeeks <= offer.expiresWeek;
}

export function weeksLeft(offer: ClubOffer, elapsedWeeks: number) {
  return Math.max(0, offer.expiresWeek - elapsedWeeks);
}

/** Removes proposals whose deadline has passed. */
export function expireOffers(
  ai: CareerAi,
  date: GameDate,
  elapsedWeeks: number,
): { ai: CareerAi; events: GameEvent[] } {
  const expired = ai.offers.filter((offer) => !isOfferOpen(offer, elapsedWeeks));
  if (!expired.length) return { ai, events: [] };
  return {
    ai: { ...ai, offers: ai.offers.filter((offer) => isOfferOpen(offer, elapsedWeeks)) },
    events: expired.map((offer) =>
      createEvent("contract", date, `${offer.clubName} retirou a proposta`, {
        description: `${OFFER_LABELS[offer.kind]} expirou sem resposta do atleta.`,
        tone: "warning",
      }),
    ),
  };
}

/* ------------------------------------------------------------------ */
/* Negotiation                                                         */
/* ------------------------------------------------------------------ */

export type NegotiationResult = "improved" | "refused" | "withdrawn";

export interface NegotiationOutcome {
  ai: CareerAi;
  result: NegotiationResult;
  message: string;
}

/** The player counters a proposal. Pushing too hard can kill the deal. */
export function negotiateOffer(
  ai: CareerAi,
  offerId: string,
  topic: NegotiationTopic,
  random: Random,
): NegotiationOutcome {
  const offer = ai.offers.find((item) => item.id === offerId);
  if (!offer) return { ai, result: "withdrawn", message: "Proposta não está mais disponível." };

  if (offer.finalOffer || offer.rounds >= offer.maxRounds) {
    const withdrawn = chance(0.35, random);
    return {
      ai: withdrawn ? { ...ai, offers: ai.offers.filter((item) => item.id !== offerId) } : ai,
      result: withdrawn ? "withdrawn" : "refused",
      message: withdrawn
        ? `O ${offer.clubName} encerrou as conversas e retirou a proposta.`
        : `O ${offer.clubName} avisou que a proposta é final.`,
    };
  }

  const leverage = negotiationLeverage(ai);
  const fatigue = offer.rounds * 0.18;
  const success = Math.max(0.08, Math.min(0.9, leverage - fatigue + (ai.agent ? 0.1 : 0)));

  if (!chance(success, random)) {
    const withdrawn = chance(0.18 + fatigue, random);
    const updated: ClubOffer = { ...offer, rounds: offer.rounds + 1, finalOffer: true };
    return {
      ai: {
        ...ai,
        offers: withdrawn
          ? ai.offers.filter((item) => item.id !== offerId)
          : ai.offers.map((item) => (item.id === offerId ? updated : item)),
      },
      result: withdrawn ? "withdrawn" : "refused",
      message: withdrawn
        ? `O ${offer.clubName} não gostou da exigência e desistiu da contratação.`
        : `O ${offer.clubName} recusou e manteve os termos atuais.`,
    };
  }

  const improved = improveTerms(offer, topic, leverage, random);
  return {
    ai: {
      ...ai,
      offers: ai.offers.map((item) => (item.id === offerId ? improved.offer : item)),
    },
    result: "improved",
    message: improved.message,
  };
}

function improveTerms(
  offer: ClubOffer,
  topic: NegotiationTopic,
  leverage: number,
  random: Random,
): { offer: ClubOffer; message: string } {
  const terms = { ...offer.terms };
  let message = "";

  if (topic === "wage") {
    const raise = 1 + 0.08 + leverage * 0.35 * (0.6 + random() * 0.8);
    terms.weeklyWage = Math.round(terms.weeklyWage * raise);
    terms.signingBonus = Math.round(terms.signingBonus * raise);
    message = `O ${offer.clubName} subiu o salário para R$ ${terms.weeklyWage.toLocaleString("pt-BR")}/semana.`;
  } else if (topic === "seasons") {
    const longer = leverage > 0.45;
    terms.seasons = Math.max(1, Math.min(5, terms.seasons + (longer ? 1 : -1)));
    message = `Novo vínculo proposto: ${terms.seasons} temporada${terms.seasons > 1 ? "s" : ""}.`;
  } else {
    const index = ROLE_ORDER.indexOf(terms.role);
    terms.role = ROLE_ORDER[Math.min(ROLE_ORDER.length - 1, index + 1)];
    terms.weeklyWage = Math.round(terms.weeklyWage * 1.05);
    message = `O ${offer.clubName} aceitou tratá-lo como ${roleLabel(terms.role).toLowerCase()}.`;
  }

  return {
    offer: { ...offer, terms, rounds: offer.rounds + 1 },
    message,
  };
}

export function declineOffer(
  ai: CareerAi,
  offerId: string,
  date: GameDate,
): { ai: CareerAi; events: GameEvent[] } {
  const offer = ai.offers.find((item) => item.id === offerId);
  if (!offer) return { ai, events: [] };
  return {
    ai: {
      ...ai,
      offers: ai.offers.filter((item) => item.id !== offerId),
      morale: Math.max(10, ai.morale - 2),
    },
    events: [
      createEvent("contract", date, `Proposta do ${offer.clubName} recusada`, {
        description: `${OFFER_LABELS[offer.kind]} rejeitada pelo atleta.`,
        tone: "warning",
      }),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Accepting                                                           */
/* ------------------------------------------------------------------ */

export interface AcceptResult {
  player: Player;
  ai: CareerAi;
  events: GameEvent[];
}

/** Signs the deal the player agreed to. */
export function acceptOffer(
  player: Player,
  ai: CareerAi,
  offerId: string,
  date: GameDate,
  overall: number,
  random: Random,
): AcceptResult {
  const offer = ai.offers.find((item) => item.id === offerId);
  if (!offer) return { player, ai, events: [] };

  const remaining = ai.offers.filter((item) => item.id !== offerId);
  const club = getClub(offer.clubId);
  if (!club) return { player, ai: { ...ai, offers: remaining }, events: [] };

  if (offer.kind === "renewal" && ai.club) {
    const renewed = {
      ...ai.club,
      contractUntilSeason: date.seasonYear + offer.terms.seasons,
      weeklyWage: offer.terms.weeklyWage,
      role: offer.terms.role,
    };
    return {
      player,
      ai: {
        ...ai,
        offers: remaining,
        club: renewed,
        morale: Math.min(100, ai.morale + 10),
      },
      events: [
        createEvent("contract", date, `Renovação com o ${offer.clubName}`, {
          description: `Novo vínculo até ${renewed.contractUntilSeason} com R$ ${renewed.weeklyWage.toLocaleString("pt-BR")}/semana.`,
          tone: "positive",
        }),
      ],
    };
  }

  const joined = joinClub(player, { ...ai, offers: remaining }, {
    club,
    category: offer.category,
    date,
    overall,
    type: offer.kind === "loan" ? "loan" : offer.category === "PRO" ? "permanent" : "youth",
    parent: offer.kind === "loan" ? (ai.club ?? undefined) : undefined,
    random,
    terms: {
      weeklyWage: offer.terms.weeklyWage,
      seasons: offer.terms.seasons,
      role: offer.terms.role,
    },
  });

  return {
    player: joined.player,
    ai: { ...joined.ai, morale: Math.min(100, joined.ai.morale + 8) },
    events: joined.events,
  };
}
