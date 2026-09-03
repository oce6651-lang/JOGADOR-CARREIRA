import type { Foot, Nationality, PositionDefinition, Sport } from "./types";

export const GAME_NAME = "Project Football Career";
export const SAVE_VERSION = 8;

/** Weeks in one in-game season. */
export const WEEKS_PER_SEASON = 52;

/** Age range allowed when creating an athlete (any positive age). */
export const MIN_START_AGE = 1;
export const MAX_START_AGE = 60;

/** Earliest season a career can start in. */
export const MIN_START_YEAR = 1930;

export function maxStartYear(now = new Date()) {
  return now.getUTCFullYear();
}


/** Modalities the game supports. Each one is a fully separated career. */
export const SPORTS: { value: Sport; label: string; description: string }[] = [
  {
    value: "football",
    label: "Futebol",
    description: "Carreira tradicional de campo: clubes, base e competições de futebol.",
  },
  {
    value: "futsal",
    label: "Futsal",
    description: "Carreira de quadra: clubes, posições e competições exclusivas do futsal.",
  },
];

export function sportLabel(sport: Sport) {
  return SPORTS.find((item) => item.value === sport)?.label ?? "Futebol";
}

export const POSITIONS: PositionDefinition[] = [
  { code: "GK", label: "Goleiro", group: "goalkeeper", sport: "football" },
  { code: "CB", label: "Zagueiro", group: "defender" },
  { code: "LB", label: "Lateral esquerdo", group: "defender" },
  { code: "RB", label: "Lateral direito", group: "defender" },
  { code: "DM", label: "Volante", group: "midfielder" },
  { code: "CM", label: "Meio-campista", group: "midfielder" },
  { code: "AM", label: "Meia atacante", group: "midfielder" },
  { code: "LW", label: "Ponta esquerda", group: "forward" },
  { code: "RW", label: "Ponta direita", group: "forward" },
  { code: "ST", label: "Centroavante", group: "forward" },
];

/** Futsal uses a completely different set of positions. */
export const FUTSAL_POSITIONS: PositionDefinition[] = [
  { code: "GK", label: "Goleiro", group: "goalkeeper", sport: "futsal" },
  { code: "FIX", label: "Fixo", group: "defender", sport: "futsal" },
  { code: "AD", label: "Ala direito", group: "midfielder", sport: "futsal" },
  { code: "AE", label: "Ala esquerdo", group: "midfielder", sport: "futsal" },
  { code: "PIV", label: "Pivô", group: "forward", sport: "futsal" },
];

/** Positions available when creating (or showing) a career of this modality. */
export function positionsForSport(sport: Sport = "football"): PositionDefinition[] {
  return sport === "futsal" ? FUTSAL_POSITIONS : POSITIONS;
}

export const FEET: { value: Foot; label: string }[] = [
  { value: "right", label: "Destro" },
  { value: "left", label: "Canhoto" },
  { value: "both", label: "Ambidestro" },
];

export const NATIONALITIES: Nationality[] = [
  { code: "BRA", label: "Brasil", flag: "🇧🇷" },
  { code: "ARG", label: "Argentina", flag: "🇦🇷" },
  { code: "POR", label: "Portugal", flag: "🇵🇹" },
  { code: "ESP", label: "Espanha", flag: "🇪🇸" },
  { code: "FRA", label: "França", flag: "🇫🇷" },
  { code: "ENG", label: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "ITA", label: "Itália", flag: "🇮🇹" },
  { code: "GER", label: "Alemanha", flag: "🇩🇪" },
  { code: "NED", label: "Holanda", flag: "🇳🇱" },
  { code: "URU", label: "Uruguai", flag: "🇺🇾" },
  { code: "COL", label: "Colômbia", flag: "🇨🇴" },
  { code: "JPN", label: "Japão", flag: "🇯🇵" },
];

export function positionLabel(code: string) {
  return (
    POSITIONS.find((p) => p.code === code)?.label ??
    FUTSAL_POSITIONS.find((p) => p.code === code)?.label ??
    code
  );
}

export function nationalityLabel(code: string) {
  const n = NATIONALITIES.find((item) => item.code === code);
  return n ? `${n.flag} ${n.label}` : code;
}

export function footLabel(foot: Foot) {
  return FEET.find((f) => f.value === foot)?.label ?? foot;
}
