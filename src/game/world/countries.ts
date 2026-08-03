import type { Country } from "./types";

const BRAZIL_STATES = [
  ["AC", "Acre"],
  ["AL", "Alagoas"],
  ["AM", "Amazonas"],
  ["AP", "Amapá"],
  ["BA", "Bahia"],
  ["CE", "Ceará"],
  ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"],
  ["GO", "Goiás"],
  ["MA", "Maranhão"],
  ["MG", "Minas Gerais"],
  ["MS", "Mato Grosso do Sul"],
  ["MT", "Mato Grosso"],
  ["PA", "Pará"],
  ["PB", "Paraíba"],
  ["PE", "Pernambuco"],
  ["PI", "Piauí"],
  ["PR", "Paraná"],
  ["RJ", "Rio de Janeiro"],
  ["RN", "Rio Grande do Norte"],
  ["RO", "Rondônia"],
  ["RR", "Roraima"],
  ["RS", "Rio Grande do Sul"],
  ["SC", "Santa Catarina"],
  ["SE", "Sergipe"],
  ["SP", "São Paulo"],
  ["TO", "Tocantins"],
] as const;

function states(list: readonly (readonly [string, string])[]) {
  return list.map(([code, label]) => ({ code, label }));
}

/**
 * Countries are ids-first so future nations only need a new entry here plus
 * their club dataset — nothing else in the world engine changes.
 *
 * `seasonStartMonth` is what makes the calendar realistic: South America runs
 * the season inside a single calendar year, Europe crosses the new year.
 */
export const COUNTRIES: Country[] = [
  {
    id: "country_bra",
    code: "BRA",
    name: "Brasil",
    flag: "🇧🇷",
    confederation: "CONMEBOL",
    playable: true,
    seasonStartMonth: 0,
    currency: "R$",
    wageIndex: 1,
    states: states(BRAZIL_STATES),
  },
  {
    id: "country_arg",
    code: "ARG",
    name: "Argentina",
    flag: "🇦🇷",
    confederation: "CONMEBOL",
    playable: true,
    seasonStartMonth: 0,
    currency: "R$",
    wageIndex: 0.75,
    states: states([
      ["BA", "Buenos Aires"],
      ["CABA", "Capital Federal"],
      ["SF", "Santa Fe"],
      ["CB", "Córdoba"],
      ["MZ", "Mendoza"],
      ["TU", "Tucumán"],
    ]),
  },
  {
    id: "country_por",
    code: "POR",
    name: "Portugal",
    flag: "🇵🇹",
    confederation: "UEFA",
    playable: true,
    seasonStartMonth: 7,
    currency: "R$",
    wageIndex: 2.1,
    states: states([
      ["LIS", "Lisboa"],
      ["POR", "Porto"],
      ["BRA", "Braga"],
      ["MAD", "Madeira"],
      ["AVE", "Aveiro"],
      ["FAR", "Faro"],
      ["GUI", "Guimarães"],
    ]),
  },
  {
    id: "country_esp",
    code: "ESP",
    name: "Espanha",
    flag: "🇪🇸",
    confederation: "UEFA",
    playable: true,
    seasonStartMonth: 7,
    currency: "R$",
    wageIndex: 5.4,
    states: states([
      ["MAD", "Madrid"],
      ["CAT", "Catalunha"],
      ["AND", "Andaluzia"],
      ["PVA", "País Basco"],
      ["VAL", "Valência"],
      ["GAL", "Galícia"],
      ["ARA", "Aragão"],
    ]),
  },
  {
    id: "country_eng",
    code: "ENG",
    name: "Inglaterra",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    confederation: "UEFA",
    playable: true,
    seasonStartMonth: 7,
    currency: "R$",
    wageIndex: 7.5,
    states: states([
      ["LON", "Londres"],
      ["MAN", "Grande Manchester"],
      ["MER", "Merseyside"],
      ["MID", "Midlands"],
      ["YOR", "Yorkshire"],
      ["NEA", "Nordeste"],
      ["SOU", "Sul"],
    ]),
  },
  {
    id: "country_ita",
    code: "ITA",
    name: "Itália",
    flag: "🇮🇹",
    confederation: "UEFA",
    playable: true,
    seasonStartMonth: 7,
    currency: "R$",
    wageIndex: 4.6,
    states: states([
      ["LOM", "Lombardia"],
      ["PIE", "Piemonte"],
      ["LAZ", "Lácio"],
      ["CAM", "Campânia"],
      ["TOS", "Toscana"],
      ["EMI", "Emília-Romanha"],
      ["VEN", "Vêneto"],
    ]),
  },
  {
    id: "country_ger",
    code: "GER",
    name: "Alemanha",
    flag: "🇩🇪",
    confederation: "UEFA",
    playable: true,
    seasonStartMonth: 7,
    currency: "R$",
    wageIndex: 4.9,
    states: states([
      ["BAY", "Baviera"],
      ["NRW", "Renânia do Norte-Vestfália"],
      ["BER", "Berlim"],
      ["BAW", "Baden-Württemberg"],
      ["HES", "Hesse"],
      ["SAX", "Saxônia"],
      ["NDS", "Baixa Saxônia"],
    ]),
  },
  {
    id: "country_fra",
    code: "FRA",
    name: "França",
    flag: "🇫🇷",
    confederation: "UEFA",
    playable: true,
    seasonStartMonth: 7,
    currency: "R$",
    wageIndex: 3.8,
    states: states([
      ["IDF", "Île-de-France"],
      ["PAC", "Provença"],
      ["AUR", "Auvérnia-Ródano-Alpes"],
      ["HDF", "Altos da França"],
      ["OCC", "Occitânia"],
      ["BRE", "Bretanha"],
      ["NAQ", "Nova Aquitânia"],
    ]),
  },
  {
    id: "country_ned",
    code: "NED",
    name: "Países Baixos",
    flag: "🇳🇱",
    confederation: "UEFA",
    playable: true,
    seasonStartMonth: 7,
    currency: "R$",
    wageIndex: 2.6,
    states: states([
      ["NH", "Holanda do Norte"],
      ["ZH", "Holanda do Sul"],
      ["NB", "Brabante do Norte"],
      ["GE", "Guéldria"],
      ["OV", "Overissel"],
      ["UT", "Utrecht"],
      ["LI", "Limburgo"],
    ]),
  },
  {
    id: "country_mex",
    code: "MEX",
    name: "México",
    flag: "🇲🇽",
    confederation: "CONCACAF",
    playable: true,
    seasonStartMonth: 6,
    currency: "R$",
    wageIndex: 1.9,
    states: states([
      ["CMX", "Cidade do México"],
      ["JAL", "Jalisco"],
      ["NLE", "Nuevo León"],
      ["PUE", "Puebla"],
      ["MIC", "Michoacán"],
      ["SIN", "Sinaloa"],
      ["YUC", "Yucatán"],
    ]),
  },
];


const BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));

export function getCountry(code: string) {
  return BY_CODE.get(code);
}

export function countryLabel(code: string) {
  const country = BY_CODE.get(code);
  return country ? `${country.flag} ${country.name}` : code;
}

export function countryName(code: string) {
  return BY_CODE.get(code)?.name ?? code;
}

export function stateLabel(countryCode: string, stateCode: string) {
  return (
    BY_CODE.get(countryCode)?.states.find((state) => state.code === stateCode)?.label ??
    stateCode
  );
}

/** Month (0-indexed) the domestic season starts in. Defaults to Brazil. */
export function seasonStartMonthFor(countryCode: string) {
  return BY_CODE.get(countryCode)?.seasonStartMonth ?? 0;
}

/** Seasons that cross the new year are labelled 2026/27. */
export function seasonCrossesYear(countryCode: string) {
  return seasonStartMonthFor(countryCode) > 0;
}

export function wageIndexFor(countryCode: string) {
  return BY_CODE.get(countryCode)?.wageIndex ?? 1;
}

export function playableCountries() {
  return COUNTRIES.filter((country) => country.playable);
}
