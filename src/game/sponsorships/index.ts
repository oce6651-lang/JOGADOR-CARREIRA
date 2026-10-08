import { createId } from "../ids";
import { appendEvents, createEvent } from "../events";
import { ensureFinances, registerTransaction } from "../finance";
import { createRandom } from "../rng";
import { eraWageFactor } from "../world/era";
import type { Career, SponsorshipContract, SponsorshipState, Sport } from "../types";

interface Brand {
  id: string;
  name: string;
  sport: Sport;
  founded: number;
  minReputation: number;
  professionalOnly: boolean;
  baseFee: number;
}

export const SPONSOR_BRANDS: readonly Brand[] = [
  { id: "nike", name: "Nike", sport: "football", founded: 1971, minReputation: 65, professionalOnly: true, baseFee: 100000 },
  { id: "adidas", name: "Adidas", sport: "football", founded: 1949, minReputation: 55, professionalOnly: true, baseFee: 80000 },
  { id: "puma", name: "Puma", sport: "football", founded: 1948, minReputation: 25, professionalOnly: false, baseFee: 25000 },
  { id: "penalty", name: "Penalty", sport: "futsal", founded: 1970, minReputation: 15, professionalOnly: false, baseFee: 12000 },
  { id: "joma", name: "Joma", sport: "futsal", founded: 1965, minReputation: 45, professionalOnly: true, baseFee: 35000 },
  { id: "topper", name: "Topper", sport: "futsal", founded: 1975, minReputation: 25, professionalOnly: false, baseFee: 18000 },
  { id: "umbro", name: "Umbro", sport: "futsal", founded: 1924, minReputation: 60, professionalOnly: true, baseFee: 50000 },
];

export function ensureSponsorships(state?: SponsorshipState): SponsorshipState {
  return { offers: state?.offers ?? [], contracts: state?.contracts ?? [], lastReviewWeek: state?.lastReviewWeek ?? -4 };
}

export function eligibleSponsorBrands(career: Career) {
  if (career.status === "retired" || !career.ai.club) return [];
  return SPONSOR_BRANDS.filter((brand) => brand.sport === (career.sport ?? "football") &&
    brand.founded <= career.timeline.current.seasonYear && career.ai.reputation >= brand.minReputation &&
    (!brand.professionalOnly || career.ai.club?.category === "PRO"));
}

/** Reviews share one saved cooldown; reloading or clicking cannot reroll terms. */
export function reviewSponsorships(career: Career): Career {
  const state = ensureSponsorships(career.sponsorships);
  const week = career.timeline.elapsedWeeks;
  const offers = state.offers.filter((offer) => offer.expiresWeek > week && offer.sport === career.sport);
  if (career.status === "retired") return { ...career, sponsorships: { ...state, offers: [] } };
  if (state.contracts.some((contract) => contract.status === "active") || week - state.lastReviewWeek < 4) {
    return { ...career, sponsorships: { ...state, offers } };
  }
  const random = createRandom(`${career.id}:sponsors:${week}`);
  const candidates = eligibleSponsorBrands(career).filter((brand) => !offers.some((offer) => offer.brandId === brand.id));
  const brand = candidates[Math.floor(random() * candidates.length)];
  if (!brand || offers.length >= 2) return { ...career, sponsorships: { ...state, offers, lastReviewWeek: week } };
  const scale = (0.7 + career.ai.reputation / 100) * (career.ai.club?.category === "PRO" ? 1 : 0.15) * eraWageFactor(career.timeline.current.seasonYear);
  const seasonalFee = Math.round(brand.baseFee * scale);
  const offer = {
    id: createId("sponsorship"), brandId: brand.id, brandName: brand.name, sport: brand.sport,
    terms: { seasonalFee, goalBonus: Math.round(seasonalFee * 0.005), titleBonus: Math.round(seasonalFee * 0.2), callUpBonus: Math.round(seasonalFee * 0.1), seasons: 2 },
    createdWeek: week, expiresWeek: week + 8,
  };
  return {
    ...career, sponsorships: { ...state, offers: [...offers, offer], lastReviewWeek: week },
    events: appendEvents(career.events, [createEvent("contract", career.timeline.current, `Proposta de patrocínio: ${brand.name}`, { tone: "positive" })]),
  };
}

export function acceptSponsorship(career: Career, offerId: string): Career {
  const state = ensureSponsorships(career.sponsorships);
  const offer = state.offers.find((item) => item.id === offerId);
  if (!offer || offer.expiresWeek <= career.timeline.elapsedWeeks || career.status === "retired" ||
    state.contracts.some((contract) => contract.status === "active") ||
    !eligibleSponsorBrands(career).some((brand) => brand.id === offer.brandId)) return career;
  const signedDate = career.timeline.current.date;
  const end = new Date(`${signedDate}T00:00:00Z`);
  end.setUTCFullYear(end.getUTCFullYear() + offer.terms.seasons);
  // Current season is paid proportionally; subsequent seasons pay the full fee.
  const amount = Math.round(offer.terms.seasonalFee * (53 - career.timeline.current.week) / 52);
  const contract: SponsorshipContract = { ...offer, signedDate, endDate: end.toISOString().slice(0, 10), status: "active", totalReceived: amount, paidSeasons: [career.timeline.current.seasonYear] };
  return {
    ...career, sponsorships: { ...state, offers: [], contracts: [...state.contracts, contract] },
    finances: registerTransaction(ensureFinances(career.finances), { date: career.timeline.current, amount, category: "sponsorship", label: `${offer.brandName} · cota da temporada ${career.timeline.current.seasonYear}` }),
    events: appendEvents(career.events, [createEvent("contract", career.timeline.current, `Patrocínio assinado: ${offer.brandName}`, { description: `Contrato de ${offer.terms.seasons} anos.`, tone: "positive" })]),
  };
}

export function declineSponsorship(career: Career, offerId: string): Career {
  const state = ensureSponsorships(career.sponsorships);
  return { ...career, sponsorships: { ...state, offers: state.offers.filter((offer) => offer.id !== offerId) } };
}

/** Pays only new achievements in this simulation step, before expiry at the boundary. */
export function settleSponsorships(before: Career, after: Career): Career {
  const state = ensureSponsorships(before.sponsorships);
  let finances = ensureFinances(after.finances);
  const events = [...after.events];
  const contracts = state.contracts.map((contract) => {
    if (contract.status !== "active") return contract;
    let totalReceived = contract.totalReceived;
    const paidSeasons = [...contract.paidSeasons];
    const activeDuringStep = before.timeline.current.date < contract.endDate;
    const goals = Math.max(0, after.player.history.totals.goals - before.player.history.totals.goals);
    const titles = after.player.history.titles.filter((item) => !before.player.history.titles.some((old) => old.id === item.id)).length;
    const callUps = after.player.history.callUps.filter((item) => !before.player.history.callUps.some((old) => old.id === item.id)).length;
    const entries: [string, number][] = activeDuringStep ? [
      ["bônus por gols", goals * contract.terms.goalBonus],
      ["bônus por títulos", titles * contract.terms.titleBonus],
      ["bônus por convocação", callUps * contract.terms.callUpBonus],
    ] : [];
    const year = after.timeline.current.seasonYear;
    if (after.status !== "retired" && after.timeline.current.date < contract.endDate && !paidSeasons.includes(year)) {
      entries.push([`cota da temporada ${year}`, contract.terms.seasonalFee]);
      paidSeasons.push(year);
    }
    for (const [label, amount] of entries) {
      if (amount <= 0) continue;
      finances = registerTransaction(finances, { date: after.timeline.current, amount, category: "sponsorship", label: `${contract.brandName} · ${label}` });
      totalReceived += amount;
    }
    const status: SponsorshipContract["status"] = after.status === "retired" ? "retired" : after.timeline.current.date >= contract.endDate ? "expired" : "active";
    if (status !== "active") events.unshift(createEvent("contract", after.timeline.current, `Patrocínio encerrado: ${contract.brandName}`));
    return { ...contract, totalReceived, paidSeasons, status };
  });
  return { ...after, finances, events, sponsorships: { ...state, contracts, offers: after.status === "retired" ? [] : state.offers } };
}