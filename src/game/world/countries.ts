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

/**
 * Countries are ids-first so future nations only need a new entry here plus
 * their club dataset — nothing else in the world engine changes.
 */
export const COUNTRIES: Country[] = [
  {
    id: "country_bra",
    code: "BRA",
    name: "Brasil",
    flag: "🇧🇷",
    confederation: "CONMEBOL",
    playable: true,
    states: BRAZIL_STATES.map(([code, label]) => ({ code, label })),
  },
  {
    id: "country_por",
    code: "POR",
    name: "Portugal",
    flag: "🇵🇹",
    confederation: "UEFA",
    playable: false,
    states: [],
  },
  {
    id: "country_esp",
    code: "ESP",
    name: "Espanha",
    flag: "🇪🇸",
    confederation: "UEFA",
    playable: false,
    states: [],
  },
  {
    id: "country_eng",
    code: "ENG",
    name: "Inglaterra",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    confederation: "UEFA",
    playable: false,
    states: [],
  },
  {
    id: "country_ita",
    code: "ITA",
    name: "Itália",
    flag: "🇮🇹",
    confederation: "UEFA",
    playable: false,
    states: [],
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

export function stateLabel(countryCode: string, stateCode: string) {
  return (
    BY_CODE.get(countryCode)?.states.find((state) => state.code === stateCode)?.label ??
    stateCode
  );
}

export function playableCountries() {
  return COUNTRIES.filter((country) => country.playable);
}
