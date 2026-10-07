import { describe, expect, it } from "vitest";
import { createCareer, retireCareer } from "../career";
import { simulateCareer } from "../career";
import { getClub } from "../world";
import { acceptSponsorship, declineSponsorship, eligibleSponsorBrands, ensureSponsorships, reviewSponsorships, settleSponsorships } from "./index";
import type { Career, Sport } from "../types";

function fixture(sport: Sport = "football"): Career {
  const career = createCareer({ firstName: "João", lastName: "Teste", birthDate: "2005-01-01", nationality: "BRA", position: sport === "futsal" ? "PIV" : "ST", foot: "right", sport, startYear: 2026 });
  const club = getClub(sport === "football" ? "gremio" : "magnus-futsal");
  return { ...career, status: "active", ai: { ...career.ai, reputation: 80, club: {
    spellId: "spell-test", clubId: club?.id ?? "club-test", clubSlug: "club-test", clubName: "Clube de teste", clubReputation: 70,
    category: "PRO", role: "starter", joinedSeason: 2026, contractUntilSeason: 2030, weeklyWage: 1000, onLoan: false, weeksInCategory: 0,
  } } };
}

function signed(sport: Sport = "football") {
  const offered = reviewSponsorships(fixture(sport));
  const offer = offered.sponsorships?.offers[0];
  if (!offer) throw new Error("Expected sponsorship proposal");
  return acceptSponsorship(offered, offer.id);
}

describe("sports sponsorships", () => {
  it("uses Nike, Adidas and Puma only for football", () => {
    expect(eligibleSponsorBrands(fixture()).map((brand) => brand.name)).toEqual(["Nike", "Adidas", "Puma"]);
  });
  it("uses Penalty, Joma, Topper and Umbro only for futsal", () => {
    expect(eligibleSponsorBrands(fixture("futsal")).map((brand) => brand.name)).toEqual(["Penalty", "Joma", "Topper", "Umbro"]);
  });
  it("selects offers by reputation", () => {
    const career = fixture();
    expect(eligibleSponsorBrands({ ...career, ai: { ...career.ai, reputation: 25 } }).map((brand) => brand.name)).toEqual(["Puma"]);
  });
  it("excludes professional-only brands from academy categories", () => {
    const career = fixture();
    if (!career.ai.club) throw new Error("Missing club");
    expect(eligibleSponsorBrands({ ...career, ai: { ...career.ai, club: { ...career.ai.club, category: "U20" } } }).map((brand) => brand.name)).toEqual(["Puma"]);
  });
  it("does not pay or sign automatically on review", () => {
    const career = reviewSponsorships(fixture());
    expect(career.sponsorships?.contracts).toHaveLength(0);
    expect(career.finances.balance).toBe(0);
    expect(career.sponsorships?.offers).toHaveLength(1);
  });
  it("accepts exclusively, registers fixed revenue and prevents double signing", () => {
    const offered = reviewSponsorships(fixture());
    const offer = offered.sponsorships?.offers[0];
    if (!offer) throw new Error("Missing offer");
    const career = acceptSponsorship(offered, offer.id);
    expect(career.sponsorships?.offers).toEqual([]);
    expect(career.finances.balance).toBe(offer.terms.seasonalFee);
    expect(career.finances.balance).toBe(career.finances.totalEarned - career.finances.totalSpent);
    expect(acceptSponsorship(career, offer.id).finances.balance).toBe(career.finances.balance);
  });
  it("declines without receiving any money", () => {
    const offered = reviewSponsorships(fixture());
    const offer = offered.sponsorships?.offers[0];
    if (!offer) throw new Error("Missing offer");
    const career = declineSponsorship(offered, offer.id);
    expect(career.sponsorships?.offers).toEqual([]);
    expect(career.finances.balance).toBe(0);
  });
  it("refuses expired offers", () => {
    const offered = reviewSponsorships(fixture());
    const offer = offered.sponsorships?.offers[0];
    if (!offer) throw new Error("Missing offer");
    const expired = { ...offered, timeline: { ...offered.timeline, elapsedWeeks: offer.expiresWeek } };
    expect(acceptSponsorship(expired, offer.id).sponsorships?.contracts).toHaveLength(0);
  });
  it("pays exactly the contracted goal bonus and never repays unchanged achievements", () => {
    const before = signed();
    const contract = before.sponsorships?.contracts[0];
    if (!contract) throw new Error("Missing contract");
    const after = { ...before, player: { ...before.player, history: { ...before.player.history, totals: { ...before.player.history.totals, goals: 3 } } } };
    const settled = settleSponsorships(before, after);
    expect(settled.finances.balance - before.finances.balance).toBe(3 * contract.terms.goalBonus);
    expect(settleSponsorships(settled, settled).finances.balance).toBe(settled.finances.balance);
  });
  it("pays title clauses separately", () => {
    const before = signed();
    const contract = before.sponsorships?.contracts[0];
    if (!contract) throw new Error("Missing contract");
    const after = { ...before, player: { ...before.player, history: { ...before.player.history, titles: [{ id: "title-test", competition: "Copa", seasonYear: 2026 }] } } };
    expect(settleSponsorships(before, after).finances.balance - before.finances.balance).toBe(contract.terms.titleBonus);
  });
  it("pays national-team callup clauses separately", () => {
    const before = signed();
    const contract = before.sponsorships?.contracts[0];
    if (!contract) throw new Error("Missing contract");
    const after: Career = { ...before, player: { ...before.player, history: { ...before.player.history, callUps: [{ id: "callup-test", nationalTeam: "Brasil", level: "Senior", seasonYear: 2026, caps: 0, goals: 0 }] } } };
    expect(settleSponsorships(before, after).finances.balance - before.finances.balance).toBe(contract.terms.callUpBonus);
  });
  it("pays each new seasonal fee once and expires the agreement", () => {
    const before = signed();
    const contract = before.sponsorships?.contracts[0];
    if (!contract) throw new Error("Missing contract");
    const after = { ...before, timeline: { ...before.timeline, current: { seasonYear: 2027, week: 1, date: "2027-01-01" } } };
    const settled = settleSponsorships(before, after);
    expect(settled.finances.balance - before.finances.balance).toBe(contract.terms.seasonalFee);
    expect(settleSponsorships(settled, settled).finances.balance).toBe(settled.finances.balance);
    const expired = settleSponsorships(settled, { ...settled, timeline: { ...settled.timeline, current: { seasonYear: 2028, week: 1, date: contract.endDate } } });
    expect(expired.sponsorships?.contracts[0].status).toBe("expired");
    expect(expired.finances.balance).toBe(settled.finances.balance);
  });
  it("preserves agreements and earnings in the retirement archive", () => {
    const career = signed();
    const retired = retireCareer(career);
    expect(retired.sponsorships?.contracts[0].status).toBe("retired");
    expect(retired.finances.balance).toBe(career.finances.balance);
    expect(simulateCareer(retired, "year").career.timeline).toEqual(retired.timeline);
  });
  it("initializes absent sponsorship slices in legacy saves", () => {
    expect(ensureSponsorships(undefined)).toEqual({ offers: [], contracts: [], lastReviewWeek: -4 });
  });
  it("integrates with a full futsal season and survives a save roundtrip", () => {
    const before = signed("futsal");
    const saved = JSON.parse(JSON.stringify(before)) as Career;
    const after = simulateCareer(saved, "year").career;
    expect(after.timeline.current.seasonYear).toBe(2027);
    expect(after.sponsorships?.contracts[0].paidSeasons).toEqual([2026, 2027]);
    expect(after.finances.transactions.some((transaction) => transaction.category === "sponsorship")).toBe(true);
    expect(after.sponsorships?.contracts).toHaveLength(1);
  });
});