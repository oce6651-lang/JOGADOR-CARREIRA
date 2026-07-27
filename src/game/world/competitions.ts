import { CLUBS, clubsByState, clubsByTier, sortByReputation, statesWithClubs } from "./clubs";
import { stateLabel } from "./countries";
import type { CategoryCode, ClubColors, Competition, CompetitionFormat, CompetitionScope } from "./types";

const c = (primary: string, secondary: string, detail: string): ClubColors => ({
  primary,
  secondary,
  detail,
});

interface CompetitionSeed {
  slug: string;
  name: string;
  shortName: string;
  country: string;
  state?: string;
  format: CompetitionFormat;
  scope: CompetitionScope;
  category: CategoryCode;
  tier?: number;
  reputationFloor: number;
  status: "active" | "planned";
  colors: ClubColors;
  clubIds: string[];
}

function nationalLeague(
  slug: string,
  name: string,
  shortName: string,
  tier: number,
  colors: ClubColors,
): CompetitionSeed {
  const clubs = sortByReputation(clubsByTier("BRA", tier));
  return {
    slug,
    name,
    shortName,
    country: "BRA",
    format: "league",
    scope: "national",
    category: "PRO",
    tier,
    reputationFloor: Math.min(...clubs.map((club) => club.reputation)),
    status: "active",
    colors,
    clubIds: clubs.map((club) => club.id),
  };
}

const CUP: CompetitionSeed = {
  slug: "copa-do-brasil",
  name: "Copa do Brasil",
  shortName: "Copa do Brasil",
  country: "BRA",
  format: "cup",
  scope: "national",
  category: "PRO",
  reputationFloor: 20,
  status: "active",
  colors: c("#f5c518", "#046b41", "#111111"),
  clubIds: sortByReputation(CLUBS.filter((club) => club.country === "BRA"))
    .slice(0, 64)
    .map((club) => club.id),
};

/** One state championship per state that has clubs in the dataset. */
function stateChampionships(): CompetitionSeed[] {
  return statesWithClubs("BRA")
    .map((state) => {
      const clubs = sortByReputation(clubsByState("BRA", state));
      return {
        slug: `estadual-${state.toLowerCase()}`,
        name: `Campeonato ${stateLabel("BRA", state)}`,
        shortName: `Estadual ${state}`,
        country: "BRA",
        state,
        format: "league" as const,
        scope: "state" as const,
        category: "PRO" as CategoryCode,
        tier: 1,
        reputationFloor: 15,
        status: "active" as const,
        colors: c("#0d8ecf", "#111111", "#ffffff"),
        clubIds: clubs.map((club) => club.id),
      };
    })
    .filter((competition) => competition.clubIds.length >= 2);
}

/** Youth competitions: only clubs that actually field the category take part. */
function youthCompetition(
  slug: string,
  name: string,
  shortName: string,
  category: CategoryCode,
  reputationFloor: number,
  format: CompetitionFormat,
  colors: ClubColors,
): CompetitionSeed {
  const clubs = sortByReputation(
    CLUBS.filter(
      (club) =>
        club.country === "BRA" &&
        club.categories.includes(category) &&
        club.reputation >= reputationFloor,
    ),
  );
  return {
    slug,
    name,
    shortName,
    country: "BRA",
    format,
    scope: "national",
    category,
    reputationFloor,
    status: "active",
    colors,
    clubIds: clubs.map((club) => club.id),
  };
}

/** Reserved for future continental/world systems — visible but not disputed yet. */
const PLANNED: CompetitionSeed[] = [
  ["libertadores", "CONMEBOL Libertadores", "Libertadores", "continental"],
  ["sul-americana", "CONMEBOL Sul-Americana", "Sul-Americana", "continental"],
  ["champions-league", "UEFA Champions League", "Champions", "continental"],
  ["europa-league", "UEFA Europa League", "Europa League", "continental"],
  ["mundial-de-clubes", "Mundial de Clubes FIFA", "Mundial", "world"],
].map(([slug, name, shortName, scope]) => ({
  slug,
  name,
  shortName,
  country: "BRA",
  format: "groupsAndKnockout" as const,
  scope: scope as CompetitionScope,
  category: "PRO" as CategoryCode,
  reputationFloor: 75,
  status: "planned" as const,
  colors: c("#c8a24a", "#111111", "#ffffff"),
  clubIds: [],
}));

const SEEDS: CompetitionSeed[] = [
  nationalLeague("brasileirao-serie-a", "Brasileirão Série A", "Série A", 1, c("#046b41", "#f5c518", "#ffffff")),
  nationalLeague("brasileirao-serie-b", "Brasileirão Série B", "Série B", 2, c("#1c3f94", "#ffffff", "#f5c518")),
  nationalLeague("brasileirao-serie-c", "Brasileirão Série C", "Série C", 3, c("#c8102e", "#ffffff", "#111111")),
  nationalLeague("brasileirao-serie-d", "Brasileirão Série D", "Série D", 4, c("#7a1b3d", "#ffffff", "#f5c518")),
  CUP,
  ...stateChampionships(),
  youthCompetition("brasileirao-sub-20", "Brasileirão Sub-20", "Brasileirão Sub-20", "U20", 45, "league", c("#046b41", "#ffffff", "#f5c518")),
  youthCompetition("copa-do-brasil-sub-20", "Copa do Brasil Sub-20", "Copa Sub-20", "U20", 40, "cup", c("#f5c518", "#046b41", "#111111")),
  youthCompetition("copa-sp-juniores", "Copa São Paulo de Futebol Júnior", "Copinha", "U20", 25, "cup", c("#1c3f94", "#ffffff", "#c8102e")),
  youthCompetition("brasileirao-sub-17", "Brasileirão Sub-17", "Brasileirão Sub-17", "U17", 45, "league", c("#046b41", "#ffffff", "#111111")),
  youthCompetition("copa-do-brasil-sub-17", "Copa do Brasil Sub-17", "Copa Sub-17", "U17", 40, "cup", c("#c8102e", "#f5c518", "#ffffff")),
  youthCompetition("campeonato-sub-15", "Campeonato Brasileiro Sub-15", "Sub-15", "U15", 50, "league", c("#0d8ecf", "#ffffff", "#111111")),
  ...PLANNED,
];

export const COMPETITIONS: Competition[] = SEEDS.map((seed) => ({
  ...seed,
  id: `competition_${seed.slug}`,
}));

const BY_ID = new Map(COMPETITIONS.map((competition) => [competition.id, competition]));
const BY_SLUG = new Map(COMPETITIONS.map((competition) => [competition.slug, competition]));

export function getCompetition(id: string) {
  return BY_ID.get(id);
}

export function getCompetitionBySlug(slug: string) {
  return BY_SLUG.get(slug);
}

export function competitionsByCountry(countryCode: string) {
  return COMPETITIONS.filter((competition) => competition.country === countryCode);
}

export function competitionsForClub(clubId: string) {
  return COMPETITIONS.filter((competition) => competition.clubIds.includes(clubId));
}

export function competitionsByScope(countryCode: string, scope: CompetitionScope) {
  return competitionsByCountry(countryCode).filter(
    (competition) => competition.scope === scope,
  );
}

export function competitionsByCategory(countryCode: string, category: CategoryCode) {
  return competitionsByCountry(countryCode).filter(
    (competition) => competition.category === category,
  );
}

export const FORMAT_LABELS: Record<CompetitionFormat, string> = {
  league: "Pontos corridos",
  cup: "Mata-mata",
  groupsAndKnockout: "Grupos + mata-mata",
};

export const SCOPE_LABELS: Record<CompetitionScope, string> = {
  national: "Nacional",
  state: "Estadual",
  continental: "Continental",
  world: "Mundial",
};
