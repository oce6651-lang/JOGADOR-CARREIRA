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
  // --- Rio Grande do Sul: Gauchão Série A (Liga Gaúcha de Futsal) ---
  ["ulbra-canoas-futsal", "Ulbra Canoas Futsal", "Ulbra", "Canoas", "RS", 2004, "Complexo Esportivo Ulbra", 2500, 65, 2, c("#0a2896", "#ffffff", "#f5c518")],
  ["afcs-porto-alegre", "AFCS Futsal", "AFCS", "Porto Alegre", "RS", 1998, "Ginásio Tesourinha", 3000, 62, 2, c("#046b41", "#ffffff", "#111111")],
  ["estrela-futsal", "Estrela Futsal", "Estrela", "Estrela", "RS", 2009, "Ginásio Municipal de Estrela", 1500, 58, 2, c("#c8102e", "#ffffff", "#111111")],
  ["horizontina-futsal", "Horizontina Futsal", "Horizontina", "Horizontina", "RS", 2012, "Ginásio Édio Stoll", 1200, 60, 2, c("#f5c518", "#111111", "#ffffff")],
  ["lagoa-futsal", "Lagoa Futsal", "Lagoa", "Lagoa Vermelha", "RS", 2010, "Ginásio Adolfo Stela", 1200, 61, 2, c("#0d8ecf", "#ffffff", "#111111")],
  ["serc-santa-rosa", "Santa Rosa Futsal", "Santa Rosa", "Santa Rosa", "RS", 2005, "Ginásio Municipal de Santa Rosa", 1400, 59, 2, c("#046b41", "#f5c518", "#ffffff")],
  ["aagf-agudo", "Associação Agudense de Futsal", "AAGF", "Agudo", "RS", 2002, "Ginásio Lauro Reinoldo Reetz", 1000, 55, 2, c("#046b41", "#ffffff", "#f5c518")],
  ["acef-filtradores", "ACE Filtradores", "Filtradores", "Bom Princípio", "RS", 2014, "Ginásio Júlio Redecker", 1200, 57, 2, c("#0a2896", "#ffffff", "#c8102e")],
  ["aef-entre-ijuis", "Associação Entre-Ijuís Futsal", "AEF", "Entre-Ijuís", "RS", 2008, "Ginásio Municipal de Entre-Ijuís", 1200, 56, 2, c("#c8102e", "#ffffff", "#111111")],
  ["aeu-uruguaianense", "A.E. Uruguaianense", "Uruguaianense", "Uruguaiana", "RS", 1995, "Ginásio Municipal de Uruguaiana", 1800, 55, 2, c("#f5c518", "#046b41", "#111111")],
  ["afucs-seberi", "AFUCS Seberi", "Afucs", "Seberi", "RS", 2006, "Ginásio Municipal de Seberi", 1000, 52, 2, c("#0d8ecf", "#ffffff", "#111111")],
  ["age-guapore", "Agremiação Guaporense de Esportes", "AGE", "Guaporé", "RS", 2001, "Ginásio Multiuso de Guaporé", 1400, 57, 2, c("#046b41", "#f5c518", "#ffffff")],
  ["amf-marau", "Associação Marauense de Futsal", "AMF", "Marau", "RS", 2007, "Ginásio Municipal de Marau", 1500, 54, 2, c("#c8102e", "#111111", "#ffffff")],
  ["asf-serafina", "Associação Serafinense de Futsal", "ASF", "Serafina Corrêa", "RS", 2018, "Ginásio Irceu Antônio Gasparin", 1200, 51, 2, c("#0a2896", "#f5c518", "#ffffff")],
  ["cerro-largo-futsal", "Cerro Largo Futsal", "Cerro Largo", "Cerro Largo", "RS", 2011, "Ginásio Roque Reinaldo Nedel", 1600, 56, 2, c("#046b41", "#ffffff", "#111111")],
  ["guarani-fw-futsal", "Guarani F.C. Futsal", "Guarani FW", "Frederico Westphalen", "RS", 2004, "Ginásio Municipal de Frederico Westphalen", 1300, 50, 2, c("#c8102e", "#ffffff", "#111111")],
  ["guarany-espumoso", "Clube Atlético Guarany", "Guarany", "Espumoso", "RS", 1948, "Ginásio Municipal de Espumoso", 1500, 58, 2, c("#0d8ecf", "#ffffff", "#111111")],
  ["lokomotiv-palmeira", "Lokomotiv Futsal", "Lokomotiv", "Palmeira das Missões", "RS", 2010, "Ginásio Crispim Miranda Filho", 1200, 50, 2, c("#f5c518", "#111111", "#ffffff")],
  ["sercca-casca", "SERCCA de Casca", "Sercca", "Casca", "RS", 1999, "Ginásio Municipal de Casca", 1400, 55, 2, c("#046b41", "#ffffff", "#c8102e")],
  // --- Rio Grande do Sul: Gauchão Série B ---
  ["velez-camaqua", "Vélez Camaquã Futsal", "Vélez", "Camaquã", "RS", 2008, "Ginásio Wadislau Niemxeski", 1500, 52, 3, c("#0a2896", "#ffffff", "#c8102e")],
  ["atlec-tres-passos", "ATLEC Futsal", "ATLEC", "Três Passos", "RS", 2005, "Ginásio Municipal de Três Passos", 1200, 51, 3, c("#c8102e", "#ffffff", "#111111")],
  ["tapejara-futsal", "Tapejara Futsal", "Tapejara", "Tapejara", "RS", 2009, "Ginásio Municipal de Tapejara", 1100, 49, 3, c("#046b41", "#f5c518", "#ffffff")],
  ["ibira-futsal", "Ibira Futsal", "Ibira", "Ibiraiaras", "RS", 2012, "Ginásio Municipal de Ibiraiaras", 900, 47, 3, c("#0d8ecf", "#ffffff", "#111111")],
  ["girua-futsal", "Giruá Futsal", "Giruá", "Giruá", "RS", 2010, "Ginásio Municipal de Giruá", 1000, 48, 3, c("#c8102e", "#f5c518", "#111111")],
  ["nadas-branco-futsal", "Nadas Branco Futsal", "Nadas", "Rio Pardo", "RS", 2007, "Ginásio Municipal de Rio Pardo", 1300, 47, 3, c("#111111", "#ffffff", "#c8102e")],
  ["asaf-campos-borges", "ASAF Campos Borges", "ASAF CB", "Campos Borges", "RS", 2008, "Ginásio Municipal de Campos Borges", 900, 46, 3, c("#046b41", "#ffffff", "#111111")],
  ["soberano-sarandi", "Soberano Futsal", "Soberano", "Sarandi", "RS", 2011, "Ginásio Municipal de Sarandi", 1000, 46, 3, c("#f5c518", "#0a2896", "#ffffff")],
  ["david-futsal", "David Futsal", "David", "David Canabarro", "RS", 2013, "Ginásio Municipal de David Canabarro", 800, 44, 3, c("#0d8ecf", "#111111", "#ffffff")],
  ["uniao-parobe", "União Parobé Futsal", "União Parobé", "Parobé", "RS", 2006, "Ginásio Municipal de Parobé", 1100, 45, 3, c("#c8102e", "#ffffff", "#046b41")],
  ["agsl-sao-luiz", "AGSL Futsal", "AGSL", "São Luiz Gonzaga", "RS", 2009, "Ginásio Municipal de São Luiz Gonzaga", 1200, 45, 3, c("#0a2896", "#f5c518", "#ffffff")],
  ["asserc-bage", "ASSERC Bagé", "Asserc", "Bagé", "RS", 2004, "Ginásio Municipal de Bagé", 1500, 44, 3, c("#f5c518", "#111111", "#ffffff")],
  ["santa-cruz-futsal", "Santa Cruz Futsal", "Santa Cruz", "Santa Cruz do Sul", "RS", 2005, "Ginásio Municipal de Santa Cruz do Sul", 1600, 47, 3, c("#046b41", "#ffffff", "#111111")],
  ["uniao-castilhense", "União Castilhense", "U. Castilhense", "Veranópolis", "RS", 2008, "Ginásio Municipal de Veranópolis", 1300, 45, 3, c("#c8102e", "#ffffff", "#111111")],
  ["sao-jose-inhacora", "São José Futsal Inhacorá", "São José IN", "São José do Inhacorá", "RS", 2012, "Ginásio Municipal de São José do Inhacorá", 800, 43, 3, c("#0d8ecf", "#ffffff", "#111111")],
  ["fx-futsal", "FX Futsal", "FX", "Fontoura Xavier", "RS", 2011, "Ginásio Municipal de Fontoura Xavier", 900, 44, 3, c("#111111", "#f5c518", "#ffffff")],
  // --- Rio Grande do Sul: Gauchão Série C ---
  ["audax-espumoso", "Audax Futsal Espumoso", "Audax", "Espumoso", "RS", 2014, "Ginásio Municipal de Espumoso", 1500, 42, 4, c("#c8102e", "#111111", "#ffffff")],
  ["trianon-cangucu", "A.A.C. Trianon", "Trianon", "Canguçu", "RS", 2003, "Ginásio Municipal de Canguçu", 1200, 42, 4, c("#0a2896", "#ffffff", "#111111")],
  ["progresso-bento", "Progresso Futsal", "Progresso", "Bento Gonçalves", "RS", 2008, "Ginásio Municipal de Bento Gonçalves", 2000, 43, 4, c("#046b41", "#f5c518", "#ffffff")],
  ["cacapavana-futsal", "Associação Caçapavana de Futsal", "Caçapavana", "Caçapava do Sul", "RS", 2010, "Ginásio Municipal de Caçapava do Sul", 900, 40, 4, c("#c8102e", "#ffffff", "#111111")],
  ["catuipe-futsal", "Associação Catuípe de Esportes", "Catuípe", "Catuípe", "RS", 2011, "Ginásio Municipal de Catuípe", 800, 40, 4, c("#f5c518", "#046b41", "#111111")],
  ["erechinense-futsal", "A.E. Erechinense de Futsal", "Erechinense", "Erechim", "RS", 2007, "Ginásio Municipal de Erechim", 1800, 41, 4, c("#0d8ecf", "#ffffff", "#111111")],
  ["real-itaqui", "A.E. Real Itaqui", "Real Itaqui", "Itaqui", "RS", 2009, "Ginásio Municipal de Itaqui", 1100, 40, 4, c("#c8102e", "#ffffff", "#0a2896")],
  ["sobradinho-futsal", "A.E. Sobradinho", "Sobradinho", "Sobradinho", "RS", 2010, "Ginásio Municipal de Sobradinho", 800, 40, 4, c("#046b41", "#ffffff", "#111111")],
  ["rodeio-futsal", "Rodeio Futsal", "Rodeio", "Rodeio Bonito", "RS", 2012, "Ginásio Municipal de Rodeio Bonito", 800, 41, 4, c("#111111", "#c8102e", "#ffffff")],
  ["nanico-sarandi", "Associação Nanico de Futsal", "Nanico", "Sarandi", "RS", 2013, "Ginásio Municipal de Sarandi", 900, 39, 4, c("#f5c518", "#111111", "#ffffff")],
  ["anbf-novo-barreiro", "Associação Novo Barreiro de Futsal", "ANBF", "Novo Barreiro", "RS", 2011, "Ginásio Municipal de Novo Barreiro", 800, 40, 4, c("#0a2896", "#ffffff", "#c8102e")],
  ["asaf-santo-angelo", "ASAF Santo Ângelo", "ASAF SA", "Santo Ângelo", "RS", 2006, "Ginásio Municipal de Santo Ângelo", 1400, 41, 4, c("#c8102e", "#f5c518", "#111111")],
  ["uniao-nonoai", "Associação União Futebol Clube", "União Nonoai", "Nonoai", "RS", 2008, "Ginásio Municipal de Nonoai", 900, 39, 4, c("#046b41", "#ffffff", "#111111")],
  ["bom-jesus-soledade", "E.C. Bom Jesus", "Bom Jesus", "Soledade", "RS", 1955, "Ginásio Municipal de Soledade", 1000, 39, 4, c("#0d8ecf", "#ffffff", "#111111")],
  ["penharol-arvorezinha", "E.C. Penharol", "Penharol", "Arvorezinha", "RS", 1962, "Ginásio Municipal de Arvorezinha", 800, 38, 4, c("#046b41", "#f5c518", "#ffffff")],
  ["penarol-guaiba", "Peñarol Futebol Clube", "Peñarol", "Guaíba", "RS", 1958, "Ginásio Municipal de Guaíba", 1300, 40, 4, c("#111111", "#f5c518", "#ffffff")],
  ["sap-futsal", "Santo Antônio da Patrulha Futsal", "SAP Futsal", "Santo Antônio da Patrulha", "RS", 2010, "Ginásio Municipal de Santo Antônio da Patrulha", 1100, 39, 4, c("#c8102e", "#ffffff", "#111111")],
  ["sase-selbach", "S.A. de Selbach", "SASE", "Selbach", "RS", 2009, "Ginásio Municipal de Selbach", 800, 38, 4, c("#0a2896", "#ffffff", "#f5c518")],
  ["uniao-tresmaiense", "União Tresmaiense de Futsal", "U. Tresmaiense", "Três de Maio", "RS", 2007, "Ginásio Municipal de Três de Maio", 900, 39, 4, c("#046b41", "#ffffff", "#c8102e")],
  // --- Santa Catarina ---
  ["chapeco-futsal", "Chapecó Futsal", "Chapecó", "Chapecó", "SC", 2013, "Arena Condá", 5000, 69, 2, c("#046b41", "#ffffff", "#f5c518")],
  ["lages-futsal", "Lages Futsal", "Lages", "Lages", "SC", 2014, "Ginásio Jones Minosso", 2000, 57, 3, c("#0a2896", "#ffffff", "#c8102e")],
  // --- Paraná ---
  ["acel-chopinzinho", "ACEL Chopinzinho", "Chopinzinho", "Chopinzinho", "PR", 2007, "Ginásio Municipal de Chopinzinho", 1500, 67, 2, c("#c8102e", "#f5c518", "#111111")],
  ["toledo-futsal", "Toledo Futsal", "Toledo", "Toledo", "PR", 2009, "Ginásio Alcides Pan", 2500, 61, 2, c("#0a2896", "#f5c518", "#ffffff")],
  ["dois-vizinhos-futsal", "Dois Vizinhos Futsal", "Dois Vizinhos", "Dois Vizinhos", "PR", 2012, "Ginásio Municipal de Dois Vizinhos", 1400, 56, 3, c("#046b41", "#ffffff", "#111111")],
  // --- São Paulo ---
  ["sorocaba-futsal", "Sorocaba Futsal", "Sorocaba", "Sorocaba", "SP", 2014, "Arena Sorocaba", 5000, 66, 2, c("#111111", "#c8102e", "#ffffff")],
  ["santos-futsal", "Santos Futsal", "Santos", "Santos", "SP", 2011, "Arena Santos", 5000, 64, 2, c("#ffffff", "#111111", "#8f8f8f")],
  ["franca-futsal", "Franca Futsal", "Franca", "Franca", "SP", 2013, "Ginásio Pedrocão", 6000, 60, 2, c("#c8102e", "#ffffff", "#111111")],
  ["ribeirao-preto-futsal", "Ribeirão Preto Futsal", "Ribeirão", "Ribeirão Preto", "SP", 2015, "Ginásio Cava do Bosque", 2500, 57, 3, c("#046b41", "#ffffff", "#f5c518")],
  // --- Rio de Janeiro ---
  ["flamengo-futsal", "Flamengo Futsal", "Flamengo", "Rio de Janeiro", "RJ", 2016, "Ginásio Hélio Maurício", 2000, 70, 2, c("#c8102e", "#111111", "#ffffff")],
  ["vasco-futsal", "Vasco da Gama Futsal", "Vasco", "Rio de Janeiro", "RJ", 2014, "Ginásio São Januário", 2500, 68, 2, c("#111111", "#ffffff", "#c8102e")],
  ["fluminense-futsal", "Fluminense Futsal", "Fluminense", "Rio de Janeiro", "RJ", 2015, "Ginásio das Laranjeiras", 1800, 66, 2, c("#7a1b3d", "#046b41", "#ffffff")],
  ["sesc-rj-futsal", "Sesc Futsal", "Sesc RJ", "Rio de Janeiro", "RJ", 2009, "Ginásio do Sesc", 1200, 59, 3, c("#0d8ecf", "#f5c518", "#111111")],
  // --- Minas Gerais ---
  ["sao-lourenco-futsal", "São Lourenço Futsal", "São Lourenço", "São Lourenço", "MG", 2010, "Ginásio Poliesportivo de São Lourenço", 1500, 56, 3, c("#c8102e", "#ffffff", "#111111")],
  // --- Nordeste e Centro-Oeste ---
  ["abc-natal-futsal", "ABC Futsal", "ABC", "Natal", "RN", 2015, "Ginásio Nélio Dias", 3000, 58, 3, c("#111111", "#ffffff", "#c8102e")],
  ["frango-futsal", "Frango Futsal", "Frango", "Dourados", "MS", 2011, "Ginásio Douradão", 2000, 55, 3, c("#f5c518", "#046b41", "#111111")],
  ["cuiaba-futsal", "Cuiabá Futsal", "Cuiabá", "Cuiabá", "MT", 2016, "Ginásio Aecim Tocantins", 3000, 54, 3, c("#046b41", "#f5c518", "#ffffff")],
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
