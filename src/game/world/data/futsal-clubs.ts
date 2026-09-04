import type { ClubRow } from "./brazil-clubs";
import type { ClubColors } from "../types";

/**
 * Real futsal clubs. Same compact row shape used by the football datasets:
 * [slug, name, shortName, city, state, foundedYear, arena, capacity,
 *  reputation, tier, colors]
 *
 * Only clubs that really exist in futsal are listed here — no football clubs
 * with "Futsal" appended and no invented city teams.
 */

const c = (primary: string, secondary: string, detail: string): ClubColors => ({
  primary,
  secondary,
  detail,
});

/** Liga Nacional de Futsal (LNF) and the strongest state sides. */
export const BRAZIL_FUTSAL_CLUBS: ClubRow[] = [
  ["magnus-futsal", "Magnus Futsal", "Magnus", "Sorocaba", "SP", 2012, "Arena Sorocaba", 5000, 93, 1, c("#f5c518", "#111111", "#ffffff")],
  ["acbf-carlos-barbosa", "Associação Carlos Barbosa de Futsal", "ACBF", "Carlos Barbosa", "RS", 1976, "Ginásio Dores Marcon", 3500, 91, 1, c("#046b41", "#ffffff", "#111111")],
  ["corinthians-futsal", "Corinthians Futsal", "Corinthians", "São Paulo", "SP", 2009, "Ginásio Wlamir Marques", 3500, 89, 1, c("#111111", "#ffffff", "#8f8f8f")],
  ["atlantico-erechim", "Atlântico Futsal", "Atlântico", "Erechim", "RS", 1999, "Ginásio Antônio Barrichello", 4000, 87, 1, c("#c8102e", "#111111", "#ffffff")],
  ["pato-futsal", "Pato Futsal", "Pato", "Pato Branco", "PR", 1999, "Ginásio Dolivar Lavarda", 3000, 85, 1, c("#0d8ecf", "#ffffff", "#111111")],
  ["jaragua-futsal", "Jaraguá Futsal", "Jaraguá", "Jaraguá do Sul", "SC", 2009, "Arena Jaraguá", 4700, 84, 1, c("#c8102e", "#111111", "#ffffff")],
  ["joinville-futsal", "Joinville Futsal", "Joinville", "Joinville", "SC", 2002, "Centreventos Cau Hansen", 4200, 83, 1, c("#111111", "#f5c518", "#ffffff")],
  ["cascavel-futsal", "Cascavel Futsal", "Cascavel", "Cascavel", "PR", 2012, "Ginásio Sérgio Mauro Festugatto", 3500, 82, 1, c("#0a3d27", "#f5c518", "#ffffff")],
  ["minas-tenis-futsal", "Minas Tênis Clube", "Minas", "Belo Horizonte", "MG", 1935, "Arena Minas", 5000, 80, 1, c("#1c3f94", "#ffffff", "#111111")],
  ["praia-clube-futsal", "Praia Clube Futsal", "Praia Clube", "Uberlândia", "MG", 1932, "Arena Praia", 3000, 78, 1, c("#c8102e", "#111111", "#ffffff")],
  ["marreco-futsal", "Marreco Futsal", "Marreco", "Francisco Beltrão", "PR", 2013, "Ginásio Arrudão", 3200, 77, 1, c("#046b41", "#f5c518", "#ffffff")],
  ["campo-mourao-futsal", "Campo Mourão Futsal", "Campo Mourão", "Campo Mourão", "PR", 2010, "Ginásio Belin Carolo", 3000, 76, 1, c("#1c3f94", "#ffffff", "#f5c518")],
  ["sao-jose-futsal", "São José Futsal", "São José", "São José dos Campos", "SP", 2011, "Ginásio Lineu de Moura", 3200, 75, 1, c("#111111", "#0d8ecf", "#ffffff")],
  ["tubarao-futsal", "Tubarão Futsal", "Tubarão", "Tubarão", "SC", 2016, "Arena Multiuso de Tubarão", 3000, 74, 1, c("#111111", "#c8102e", "#ffffff")],
  ["blumenau-futsal", "Blumenau Futsal", "Blumenau", "Blumenau", "SC", 2018, "Ginásio Sebastião Cruz", 3400, 73, 1, c("#0d8ecf", "#ffffff", "#111111")],
  ["umuarama-futsal", "Umuarama Futsal", "Umuarama", "Umuarama", "PR", 2011, "Ginásio Amário Vieira da Costa", 2800, 72, 1, c("#c8102e", "#ffffff", "#111111")],
  ["brasilia-futsal", "Brasília Futsal", "Brasília", "Brasília", "DF", 2014, "Ginásio Nilson Nelson", 5000, 71, 1, c("#f5c518", "#046b41", "#ffffff")],
  ["foz-cataratas-futsal", "Foz Cataratas Futsal", "Foz Cataratas", "Foz do Iguaçu", "PR", 2013, "Ginásio Costa Cavalcanti", 3000, 70, 1, c("#046b41", "#0d8ecf", "#ffffff")],
  ["assoeva-futsal", "Assoeva Futsal", "Assoeva", "Venâncio Aires", "RS", 2005, "Ginásio da Assoeva", 2500, 68, 2, c("#c8102e", "#111111", "#ffffff")],
  ["passo-fundo-futsal", "Passo Fundo Futsal", "Passo Fundo", "Passo Fundo", "RS", 2011, "Ginásio Teixeirinha", 2600, 66, 2, c("#1c3f94", "#ffffff", "#c8102e")],
  ["guarapuava-futsal", "Guarapuava Futsal", "Guarapuava", "Guarapuava", "PR", 2015, "Ginásio do Trabalhador", 2500, 64, 2, c("#046b41", "#ffffff", "#111111")],
  ["concordia-futsal", "Concórdia Atlético Clube", "Concórdia", "Concórdia", "SC", 2011, "Ginásio Ary Alves de Souza", 2400, 63, 2, c("#c8102e", "#ffffff", "#111111")],
  ["copagril-futsal", "Copagril Futsal", "Copagril", "Marechal Cândido Rondon", "PR", 2008, "Ginásio Guido Bonatto", 2200, 62, 2, c("#046b41", "#f5c518", "#ffffff")],
  ["apodi-futsal", "Apodi Futsal", "Apodi", "Mossoró", "RN", 2015, "Ginásio Pedro Ciarlini", 2000, 60, 2, c("#0d8ecf", "#f5c518", "#ffffff")],
  ["sercesa-apucarana", "Sercesa Futsal", "Sercesa", "Apucarana", "PR", 2003, "Ginásio Lagoão", 2000, 58, 2, c("#111111", "#f5c518", "#ffffff")],
  ["juventude-futsal", "Juventude Futsal", "Juventude", "Caxias do Sul", "RS", 2016, "Ginásio Vasco da Gama", 2200, 57, 2, c("#046b41", "#ffffff", "#111111")],
  ["dracena-futsal", "Dracena Futsal", "Dracena", "Dracena", "SP", 2009, "Ginásio Municipal de Dracena", 1800, 55, 2, c("#1c3f94", "#ffffff", "#c8102e")],
  ["taubate-futsal", "Taubaté Futsal", "Taubaté", "Taubaté", "SP", 2008, "Ginásio Ary Barroso", 2000, 54, 2, c("#0d8ecf", "#ffffff", "#111111")],
  ["santo-andre-futsal", "Santo André Futsal", "Santo André", "Santo André", "SP", 2010, "Ginásio Noêmia Assumpção", 2000, 53, 2, c("#c8102e", "#ffffff", "#111111")],
  ["sao-paulo-futsal", "São Paulo Futsal", "São Paulo FS", "São Paulo", "SP", 2019, "Ginásio Antônio Leme Nunes Galvão", 2400, 52, 2, c("#c8102e", "#ffffff", "#111111")],
];

export const SPAIN_FUTSAL_CLUBS: ClubRow[] = [
  ["barca-futsal", "FC Barcelona Futsal", "Barça", "Barcelona", "CAT", 1978, "Palau Blaugrana", 7585, 95, 1, c("#0a2896", "#a50044", "#ffcb05")],
  ["movistar-inter", "Movistar Inter FS", "Inter FS", "Torrejón de Ardoz", "MAD", 1977, "Jorge Garbajosa", 3500, 93, 1, c("#0d8ecf", "#111111", "#ffffff")],
  ["elpozo-murcia", "ElPozo Murcia Costa Cálida", "ElPozo", "Múrcia", "MUR", 1989, "Palacio de los Deportes de Murcia", 7500, 92, 1, c("#c8102e", "#ffffff", "#111111")],
  ["jaen-paraiso", "Jaén Paraíso Interior FS", "Jaén FS", "Jaén", "AND", 2000, "Olivo Arena", 6000, 88, 1, c("#046b41", "#ffffff", "#f5c518")],
  ["palma-futsal", "Illes Balears Palma Futsal", "Palma Futsal", "Palma", "BAL", 1998, "Son Moix", 5000, 90, 1, c("#111111", "#f5c518", "#ffffff")],
  ["valdepenas-futsal", "Viña Albali Valdepeñas", "Valdepeñas", "Valdepeñas", "CLM", 1998, "Virgen de la Cabeza", 2500, 85, 1, c("#7a1b3d", "#ffffff", "#111111")],
  ["cartagena-futsal", "Jimbee Cartagena FS", "Cartagena", "Cartagena", "MUR", 2011, "Palacio de Deportes de Cartagena", 5000, 86, 1, c("#0a2896", "#f5c518", "#ffffff")],
  ["levante-futsal", "Levante UD FS", "Levante FS", "Valência", "VAL", 1997, "Pabellón de Paterna", 2500, 82, 1, c("#0a2896", "#c8102e", "#ffffff")],
  ["cordoba-futsal", "Córdoba Patrimonio de la Humanidad", "Córdoba FS", "Córdoba", "AND", 2006, "Vista Alegre", 3500, 80, 1, c("#046b41", "#ffffff", "#111111")],
  ["betis-futsal", "Real Betis Futsal", "Betis FS", "Sevilha", "AND", 2015, "Amate", 2000, 76, 1, c("#046b41", "#ffffff", "#f5c518")],
  ["noia-futsal", "Noia Portus Apostoli", "Noia", "Noia", "GAL", 2004, "Pavillón A Xunqueira", 1500, 72, 1, c("#0d8ecf", "#ffffff", "#111111")],
  ["manzanares-futsal", "Manzanares FS Quesos El Hidalgo", "Manzanares", "Manzanares", "CLM", 2001, "Pabellón Antonio Caba", 1200, 70, 1, c("#f5c518", "#0a2896", "#ffffff")],
];

export const PORTUGAL_FUTSAL_CLUBS: ClubRow[] = [
  ["sporting-futsal", "Sporting CP Futsal", "Sporting", "Lisboa", "LIS", 1998, "Pavilhão João Rocha", 3000, 94, 1, c("#008057", "#ffffff", "#111111")],
  ["benfica-futsal", "SL Benfica Futsal", "Benfica", "Lisboa", "LIS", 2001, "Pavilhão Fidelidade", 2000, 92, 1, c("#e30613", "#ffffff", "#111111")],
  ["braga-futsal", "SC Braga Futsal", "Braga", "Braga", "BRG", 2015, "Pavilhão Flávio Sá Leite", 2500, 84, 1, c("#c8102e", "#ffffff", "#111111")],
  ["leoes-porto-salvo", "Leões de Porto Salvo", "Porto Salvo", "Oeiras", "LIS", 1978, "Pavilhão Municipal de Porto Salvo", 1200, 76, 1, c("#f5c518", "#111111", "#ffffff")],
  ["modicus-sandim", "Modicus Sandim", "Modicus", "Vila Nova de Gaia", "POR", 1984, "Pavilhão de Sandim", 1000, 72, 1, c("#0a2896", "#ffffff", "#c8102e")],
  ["quinta-dos-lombos", "Quinta dos Lombos", "Lombos", "Carcavelos", "LIS", 1978, "Pavilhão da Quinta dos Lombos", 1200, 70, 1, c("#046b41", "#f5c518", "#ffffff")],
  ["fundao-futsal", "CB Fundão", "Fundão", "Fundão", "CBR", 1976, "Pavilhão Municipal do Fundão", 1000, 68, 1, c("#c8102e", "#111111", "#ffffff")],
];

export const ITALY_FUTSAL_CLUBS: ClubRow[] = [
  ["napoli-futsal", "Napoli Futsal", "Napoli", "Nápoles", "CAM", 2020, "PalaCercola", 1500, 86, 1, c("#0d8ecf", "#ffffff", "#111111")],
  ["feldi-eboli", "Feldi Eboli", "Eboli", "Eboli", "CAM", 1999, "PalaSele", 2500, 85, 1, c("#f5c518", "#0a2896", "#ffffff")],
  ["italservice-pesaro", "Italservice Pesaro", "Pesaro", "Pesaro", "MAR", 1998, "PalaFiera Pesaro", 2000, 84, 1, c("#c8102e", "#111111", "#ffffff")],
  ["came-treviso", "Came Treviso", "Treviso", "Treviso", "VEN", 2003, "PalaCame", 1200, 80, 1, c("#0a2896", "#ffffff", "#f5c518")],
  ["meta-catania", "Meta Catania", "Catania", "Catânia", "SIC", 2003, "PalaCatania", 2000, 82, 1, c("#c8102e", "#0d8ecf", "#ffffff")],
  ["sandro-abate", "Sandro Abate Avellino", "Avellino", "Avellino", "CAM", 2013, "PalaDelMauro", 1800, 76, 1, c("#046b41", "#ffffff", "#111111")],
];

export const ARGENTINA_FUTSAL_CLUBS: ClubRow[] = [
  ["boca-futsal", "Boca Juniors Futsal", "Boca", "Buenos Aires", "CABA", 1985, "Estadio Luis Conde", 2500, 88, 1, c("#0a2896", "#f5c518", "#ffffff")],
  ["river-futsal", "River Plate Futsal", "River", "Buenos Aires", "CABA", 1990, "Microestadio Monumental", 2000, 84, 1, c("#ffffff", "#c8102e", "#111111")],
  ["san-lorenzo-futsal", "San Lorenzo Futsal", "San Lorenzo", "Buenos Aires", "CABA", 1988, "Polideportivo Roberto Pando", 1800, 82, 1, c("#0a2896", "#c8102e", "#ffffff")],
  ["barracas-central-futsal", "Barracas Central Futsal", "Barracas", "Buenos Aires", "CABA", 1996, "Microestadio Barracas", 1200, 76, 1, c("#c8102e", "#ffffff", "#111111")],
  ["kimberley-futsal", "Kimberley de Mar del Plata", "Kimberley", "Mar del Plata", "BA", 1921, "Polideportivo Kimberley", 1500, 72, 1, c("#046b41", "#ffffff", "#111111")],
  ["ferro-futsal", "Ferro Carril Oeste Futsal", "Ferro", "Buenos Aires", "CABA", 1987, "Estadio Héctor Etchart", 1800, 74, 1, c("#046b41", "#ffffff", "#111111")],
];

export const FRANCE_FUTSAL_CLUBS: ClubRow[] = [
  ["accs-paris", "ACCS Asnières Villeneuve", "ACCS", "Asnières-sur-Seine", "IDF", 2016, "Halle Georges Carpentier", 4000, 84, 1, c("#0a2896", "#ffffff", "#c8102e")],
  ["toulon-elite-futsal", "Toulon Élite Futsal", "Toulon", "Toulon", "PAC", 2013, "Palais des Sports de Toulon", 2500, 78, 1, c("#c8102e", "#111111", "#ffffff")],
  ["kremlin-bicetre", "Kremlin-Bicêtre United", "KB United", "Le Kremlin-Bicêtre", "IDF", 2007, "Gymnase Élisabeth Boselli", 1500, 76, 1, c("#046b41", "#ffffff", "#111111")],
  ["nantes-futsal", "Nantes Métropole Futsal", "Nantes", "Nantes", "PDL", 2011, "Complexe Sportif Mangin Beaulieu", 2000, 74, 1, c("#f5c518", "#046b41", "#ffffff")],
];

export const NETHERLANDS_FUTSAL_CLUBS: ClubRow[] = [
  ["hovocubo", "ZVV Hovocubo", "Hovocubo", "Hoorn", "NH", 1978, "De Opgang", 1500, 78, 1, c("#c8102e", "#111111", "#ffffff")],
  ["groene-ster", "Groene Ster Vlissingen", "Groene Ster", "Vlissingen", "ZEE", 1946, "Sporthal Baskensburg", 1200, 74, 1, c("#046b41", "#ffffff", "#111111")],
  ["knooppunt", "ZVV 't Knooppunt", "Knooppunt", "Sittard", "LIM", 1998, "Sporthal Baandert", 1000, 70, 1, c("#0d8ecf", "#f5c518", "#ffffff")],
];

export const FUTSAL_CLUBS_BY_COUNTRY: { country: string; rows: ClubRow[] }[] = [
  { country: "BRA", rows: BRAZIL_FUTSAL_CLUBS },
  { country: "ESP", rows: SPAIN_FUTSAL_CLUBS },
  { country: "POR", rows: PORTUGAL_FUTSAL_CLUBS },
  { country: "ITA", rows: ITALY_FUTSAL_CLUBS },
  { country: "ARG", rows: ARGENTINA_FUTSAL_CLUBS },
  { country: "FRA", rows: FRANCE_FUTSAL_CLUBS },
  { country: "NED", rows: NETHERLANDS_FUTSAL_CLUBS },
];
