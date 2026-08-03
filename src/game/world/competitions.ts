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
  foundedYear: number;
  status: "active" | "planned";
  colors: ClubColors;
  clubIds: string[];
}

function nationalLeague(
  country: string,
  slug: string,
  name: string,
  shortName: string,
  tier: number,
  foundedYear: number,
  colors: ClubColors,
): CompetitionSeed {
  const clubs = sortByReputation(clubsByTier(country, tier));
  return {
    slug,
    name,
    shortName,
    country,
    format: "league",
    scope: "national",
    category: "PRO",
    tier,
    reputationFloor: clubs.length ? Math.min(...clubs.map((club) => club.reputation)) : 0,
    foundedYear,
    status: "active",
    colors,
    clubIds: clubs.map((club) => club.id),
  };
}

function nationalCup(
  country: string,
  slug: string,
  name: string,
  shortName: string,
  foundedYear: number,
  colors: ClubColors,
): CompetitionSeed {
  return {
    slug,
    name,
    shortName,
    country,
    format: "cup",
    scope: "national",
    category: "PRO",
    reputationFloor: 20,
    foundedYear,
    status: "active",
    colors,
    clubIds: sortByReputation(CLUBS.filter((club) => club.country === country))
      .slice(0, 64)
      .map((club) => club.id),
  };
}

/** One state championship per state that has clubs in the dataset. */
function stateChampionships(country: string): CompetitionSeed[] {
  return statesWithClubs(country)
    .map((state) => {
      const clubs = sortByReputation(clubsByState(country, state));
      return {
        slug: `estadual-${country.toLowerCase()}-${state.toLowerCase()}`,
        name: `Campeonato ${stateLabel(country, state)}`,
        shortName: `Estadual ${state}`,
        country,
        state,
        format: "league" as const,
        scope: "state" as const,
        category: "PRO" as CategoryCode,
        tier: 1,
        reputationFloor: 15,
        foundedYear: 1902,
        status: "active" as const,
        colors: c("#0d8ecf", "#111111", "#ffffff"),
        clubIds: clubs.map((club) => club.id),
      };
    })
    .filter((competition) => competition.clubIds.length >= 2);
}

/** Youth competitions: only clubs that actually field the category take part. */
function youthCompetition(
  country: string,
  slug: string,
  name: string,
  shortName: string,
  category: CategoryCode,
  reputationFloor: number,
  format: CompetitionFormat,
  foundedYear: number,
  colors: ClubColors,
): CompetitionSeed {
  const clubs = sortByReputation(
    CLUBS.filter(
      (club) =>
        club.country === country &&
        club.categories.includes(category) &&
        club.reputation >= reputationFloor,
    ),
  );
  return {
    slug,
    name,
    shortName,
    country,
    format,
    scope: "national",
    category,
    reputationFloor,
    foundedYear,
    status: "active",
    colors,
    clubIds: clubs.map((club) => club.id),
  };
}

/** Continental and world competitions — visible across every country. */
const CONTINENTAL: CompetitionSeed[] = (
  [
    ["libertadores", "CONMEBOL Libertadores", "Libertadores", "continental", 1960, ["BRA", "ARG"]],
    ["sul-americana", "CONMEBOL Sul-Americana", "Sul-Americana", "continental", 2002, ["BRA", "ARG"]],
    ["champions-league", "UEFA Champions League", "Champions", "continental", 1955, ["ENG", "ESP", "ITA", "GER", "FRA", "POR"]],
    ["europa-league", "UEFA Europa League", "Europa League", "continental", 1971, ["ENG", "ESP", "ITA", "GER", "FRA", "POR"]],
    ["concacaf-champions", "CONCACAF Champions Cup", "Concachampions", "continental", 1962, ["MEX"]],
    ["mundial-de-clubes", "Mundial de Clubes FIFA", "Mundial", "world", 2000, []],
  ] as const
).map(([slug, name, shortName, scope, foundedYear, countries]) => ({
  slug,
  name,
  shortName,
  country: countries[0] ?? "BRA",
  format: "groupsAndKnockout" as const,
  scope: scope as CompetitionScope,
  category: "PRO" as CategoryCode,
  reputationFloor: 75,
  foundedYear,
  status: "active" as const,
  colors: c("#c8a24a", "#111111", "#ffffff"),
  clubIds: sortByReputation(
    CLUBS.filter(
      (club) =>
        (countries.length === 0 || (countries as readonly string[]).includes(club.country)) &&
        club.reputation >= 75,
    ),
  )
    .slice(0, 32)
    .map((club) => club.id),
}));

const SEEDS: CompetitionSeed[] = [
  /* Brasil */
  nationalLeague("BRA", "brasileirao-serie-a", "Brasileirão Série A", "Série A", 1, 1971, c("#046b41", "#f5c518", "#ffffff")),
  nationalLeague("BRA", "brasileirao-serie-b", "Brasileirão Série B", "Série B", 2, 1971, c("#1c3f94", "#ffffff", "#f5c518")),
  nationalLeague("BRA", "brasileirao-serie-c", "Brasileirão Série C", "Série C", 3, 1981, c("#c8102e", "#ffffff", "#111111")),
  nationalLeague("BRA", "brasileirao-serie-d", "Brasileirão Série D", "Série D", 4, 2009, c("#7a1b3d", "#ffffff", "#f5c518")),
  nationalCup("BRA", "copa-do-brasil", "Copa do Brasil", "Copa do Brasil", 1989, c("#f5c518", "#046b41", "#111111")),
  ...stateChampionships("BRA"),
  youthCompetition("BRA", "brasileirao-sub-20", "Brasileirão Sub-20", "Brasileirão Sub-20", "U20", 45, "league", 2006, c("#046b41", "#ffffff", "#f5c518")),
  youthCompetition("BRA", "copa-do-brasil-sub-20", "Copa do Brasil Sub-20", "Copa Sub-20", "U20", 40, "cup", 2012, c("#f5c518", "#046b41", "#111111")),
  youthCompetition("BRA", "copa-sp-juniores", "Copa São Paulo de Futebol Júnior", "Copinha", "U20", 25, "cup", 1969, c("#1c3f94", "#ffffff", "#c8102e")),
  youthCompetition("BRA", "brasileirao-sub-17", "Brasileirão Sub-17", "Brasileirão Sub-17", "U17", 45, "league", 2013, c("#046b41", "#ffffff", "#111111")),
  youthCompetition("BRA", "copa-do-brasil-sub-17", "Copa do Brasil Sub-17", "Copa Sub-17", "U17", 40, "cup", 2013, c("#c8102e", "#f5c518", "#ffffff")),
  youthCompetition("BRA", "campeonato-sub-15", "Campeonato Brasileiro Sub-15", "Sub-15", "U15", 50, "league", 2015, c("#0d8ecf", "#ffffff", "#111111")),

  /* Argentina */
  nationalLeague("ARG", "liga-profesional", "Liga Profesional Argentina", "Liga Argentina", 1, 1891, c("#7cb9e8", "#ffffff", "#111111")),
  nationalLeague("ARG", "primera-nacional", "Primera Nacional", "Primera Nacional", 2, 1986, c("#0a3c7d", "#ffffff", "#7cb9e8")),
  nationalCup("ARG", "copa-argentina", "Copa Argentina", "Copa Argentina", 1969, c("#ffffff", "#7cb9e8", "#111111")),
  youthCompetition("ARG", "reserva-argentina", "Torneo de Reserva", "Reserva", "U23", 55, "league", 1993, c("#7cb9e8", "#111111", "#ffffff")),

  /* Portugal */
  nationalLeague("POR", "primeira-liga", "Primeira Liga", "Primeira Liga", 1, 1934, c("#008057", "#e30613", "#ffffff")),
  nationalLeague("POR", "liga-portugal-2", "Liga Portugal 2", "Liga 2", 2, 1990, c("#e30613", "#ffffff", "#008057")),
  nationalCup("POR", "taca-de-portugal", "Taça de Portugal", "Taça", 1938, c("#008057", "#ffffff", "#e30613")),
  youthCompetition("POR", "campeonato-juniores-por", "Campeonato Nacional de Juniores", "Juniores", "U20", 55, "league", 1953, c("#008057", "#ffffff", "#111111")),

  /* Espanha */
  nationalLeague("ESP", "laliga", "LaLiga", "LaLiga", 1, 1929, c("#e30613", "#ffffff", "#febe10")),
  nationalLeague("ESP", "laliga-hypermotion", "LaLiga Hypermotion", "LaLiga 2", 2, 1929, c("#0057b8", "#ffffff", "#e30613")),
  nationalCup("ESP", "copa-del-rey", "Copa del Rey", "Copa del Rey", 1903, c("#febe10", "#e30613", "#ffffff")),
  youthCompetition("ESP", "division-de-honor-juvenil", "División de Honor Juvenil", "Juvenil", "U20", 60, "league", 1996, c("#e30613", "#febe10", "#ffffff")),

  /* Inglaterra */
  nationalLeague("ENG", "premier-league", "Premier League", "Premier League", 1, 1888, c("#38003c", "#00ff85", "#ffffff")),
  nationalLeague("ENG", "championship", "EFL Championship", "Championship", 2, 1892, c("#092c5c", "#ffffff", "#00ff85")),
  nationalCup("ENG", "fa-cup", "FA Cup", "FA Cup", 1871, c("#ffffff", "#092c5c", "#c8102e")),
  youthCompetition("ENG", "premier-league-2", "Premier League 2", "PL2", "U23", 60, "league", 2016, c("#38003c", "#ffffff", "#00ff85")),
  youthCompetition("ENG", "fa-youth-cup", "FA Youth Cup", "Youth Cup", "U20", 50, "cup", 1952, c("#c8102e", "#ffffff", "#092c5c")),

  /* Itália */
  nationalLeague("ITA", "serie-a-italia", "Serie A", "Serie A", 1, 1898, c("#0a2c5b", "#ffffff", "#009246")),
  nationalLeague("ITA", "serie-b-italia", "Serie B", "Serie B", 2, 1929, c("#009246", "#ffffff", "#ce2b37")),
  nationalCup("ITA", "coppa-italia", "Coppa Italia", "Coppa Italia", 1922, c("#009246", "#ffffff", "#ce2b37")),
  youthCompetition("ITA", "campionato-primavera", "Campionato Primavera", "Primavera", "U20", 60, "league", 1962, c("#0a2c5b", "#ffffff", "#009246")),

  /* Alemanha */
  nationalLeague("GER", "bundesliga", "Bundesliga", "Bundesliga", 1, 1963, c("#d20515", "#ffffff", "#111111")),
  nationalLeague("GER", "bundesliga-2", "2. Bundesliga", "2. Bundesliga", 2, 1974, c("#111111", "#ffffff", "#d20515")),
  nationalCup("GER", "dfb-pokal", "DFB-Pokal", "DFB-Pokal", 1935, c("#111111", "#d20515", "#ffe600")),
  youthCompetition("GER", "a-junioren-bundesliga", "A-Junioren Bundesliga", "A-Junioren", "U20", 60, "league", 2003, c("#d20515", "#ffe600", "#111111")),

  /* França */
  nationalLeague("FRA", "ligue-1", "Ligue 1", "Ligue 1", 1, 1932, c("#091c3e", "#ffffff", "#dcb46a")),
  nationalLeague("FRA", "ligue-2", "Ligue 2", "Ligue 2", 2, 1933, c("#0a2896", "#ffffff", "#e2001a")),
  nationalCup("FRA", "coupe-de-france", "Coupe de France", "Coupe de France", 1917, c("#0a2896", "#ffffff", "#e2001a")),
  youthCompetition("FRA", "championnat-national-u19", "Championnat National U19", "National U19", "U20", 60, "league", 1998, c("#091c3e", "#dcb46a", "#ffffff")),

  /* Países Baixos */
  nationalLeague("NED", "eredivisie", "Eredivisie", "Eredivisie", 1, 1956, c("#e30613", "#ffffff", "#0a51a1")),
  nationalLeague("NED", "eerste-divisie", "Eerste Divisie", "Eerste Divisie", 2, 1956, c("#0a51a1", "#ffffff", "#e30613")),
  nationalCup("NED", "knvb-beker", "KNVB Beker", "KNVB Beker", 1898, c("#ff6b00", "#ffffff", "#000000")),
  youthCompetition("NED", "eredivisie-u21", "Eredivisie Sub-21", "Sub-21 NED", "U23", 55, "league", 2013, c("#e30613", "#ffffff", "#000000")),

  /* México */
  nationalLeague("MEX", "liga-mx", "Liga MX", "Liga MX", 1, 1943, c("#00843d", "#ffffff", "#e30613")),
  nationalLeague("MEX", "liga-de-expansion", "Liga de Expansión MX", "Expansión MX", 2, 1994, c("#0a2896", "#ffffff", "#ffe600")),
  nationalCup("MEX", "copa-mx", "Copa MX", "Copa MX", 1932, c("#ffe600", "#00843d", "#ffffff")),
  youthCompetition("MEX", "liga-mx-sub-20", "Liga MX Sub-20", "Sub-20 MEX", "U20", 55, "league", 2010, c("#00843d", "#ffe600", "#ffffff")),

  ...CONTINENTAL,
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
