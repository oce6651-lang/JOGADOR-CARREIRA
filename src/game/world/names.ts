import { createRandom } from "../rng";

/**
 * Deterministic name generator for the football world.
 *
 * Award winners, top scorers and squad players are never stored: they are
 * derived from a seed, so the same season always produces the same names in
 * every save and across hundreds of simulated years.
 */

const FIRST_NAMES = [
  "Bruno", "Rafael", "Carlos", "Diego", "Gabriel", "Lucas", "Matheus", "Thiago",
  "Vinícius", "Everton", "Rodrigo", "Felipe", "Éder", "Danilo", "Wesley",
  "Alisson", "Kaio", "Yuri", "Igor", "Murilo", "Caio", "Léo", "Pedro",
  "André", "Marcelo", "Renan", "Otávio", "Juninho", "Nicolas", "Emerson",
  "Santiago", "Mateo", "Facundo", "Julián", "Alejandro", "Marco", "Lorenzo",
  "Nicolò", "Iker", "Sergio", "Pablo", "Hugo", "Jules", "Théo", "Noah",
  "Liam", "Callum", "Jayden", "Kevin", "Nils",
];

const LAST_NAMES = [
  "Silva", "Souza", "Oliveira", "Ferreira", "Almeida", "Barbosa", "Ribeiro",
  "Cardoso", "Nascimento", "Machado", "Teixeira", "Moreira", "Batista",
  "Andrade", "Duarte", "Fonseca", "Pacheco", "Vasconcelos", "Queiroz",
  "Rezende", "Camargo", "Bittencourt", "Sampaio", "Corrêa", "Peixoto",
  "Martínez", "Fernández", "Domínguez", "Sosa", "Rojas", "Bianchi", "Rossi",
  "Conti", "Moretti", "García", "Navarro", "Iglesias", "Dupont", "Lefevre",
  "Van Dijk", "De Boer", "Müller", "Schneider", "Novak", "Petrov",
];

const NICKNAMES = [
  "Tuca", "Nenê", "Cacá", "Dedé", "Zeca", "Tico", "Juca", "Neco", "Vavá",
  "Bebeto", "Lelê", "Bill", "Careca", "Índio", "Pitbull",
];

/** Stable full name for a seed. Occasionally a Brazilian style nickname. */
export function generateName(seed: string): string {
  const random = createRandom(`name:${seed}`);
  if (random() < 0.12) {
    return NICKNAMES[Math.floor(random() * NICKNAMES.length)];
  }
  const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}
