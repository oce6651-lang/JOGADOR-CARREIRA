import { describe, expect, it } from "vitest";
import { createRandom } from "../rng";
import { buildMatchHighlights } from "./narration";
import type { MatchRecord } from "../types";

const match: MatchRecord = { id: "m1", date: {} as MatchRecord["date"], competition: "Série A", opponent: "Inter", scoreFor: 3, scoreAgainst: 1, minutes: 30, goals: 2, assists: 1, rating: 8.4 };
const ctx = { playerName: "Silva", clubName: "Grêmio", starter: false, sport: "football" as const, isGoalkeeper: false };

describe("match narration", () => {
  it("narrates exactly the athlete's goals and assists and the final score", () => {
    const list = buildMatchHighlights(match, ctx, createRandom("x"));
    expect(list.filter((h) => h.kind === "goal")).toHaveLength(2);
    expect(list.filter((h) => h.kind === "assist")).toHaveLength(1);
    expect(list.filter((h) => h.kind === "concede")).toHaveLength(1);
  });
  it("places a substitute's actions only after he comes on", () => {
    const list = buildMatchHighlights(match, ctx, createRandom("y"));
    const sub = list.find((h) => h.kind === "sub")!;
    expect(list.filter((h) => h.involvesPlayer).every((h) => h.minute >= sub.minute)).toBe(true);
  });
});
