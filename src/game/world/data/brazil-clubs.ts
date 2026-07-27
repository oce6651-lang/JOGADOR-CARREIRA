import type { ClubColors } from "../types";

/**
 * Compact club dataset. Rows keep the file readable while the club factory
 * derives categories, finances and academy quality from reputation/tier.
 *
 * [slug, name, shortName, city, state, foundedYear, stadium, capacity,
 *  reputation, tier, colors]
 */
export type ClubRow = [
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  number,
  number,
  ClubColors,
];

const c = (primary: string, secondary: string, detail: string): ClubColors => ({
  primary,
  secondary,
  detail,
});

export const BRAZIL_CLUBS: ClubRow[] = [
  // ---------------------------------------------------------------- Tier 1
  ["flamengo", "Clube de Regatas do Flamengo", "Flamengo", "Rio de Janeiro", "RJ", 1895, "Maracanã", 78838, 95, 1, c("#e11d2e", "#111111", "#ffffff")],
  ["palmeiras", "Sociedade Esportiva Palmeiras", "Palmeiras", "São Paulo", "SP", 1914, "Allianz Parque", 43713, 94, 1, c("#046b41", "#ffffff", "#0a3d27")],
  ["corinthians", "Sport Club Corinthians Paulista", "Corinthians", "São Paulo", "SP", 1910, "Neo Química Arena", 49205, 90, 1, c("#111111", "#ffffff", "#8f8f8f")],
  ["sao-paulo", "São Paulo Futebol Clube", "São Paulo", "São Paulo", "SP", 1930, "Morumbis", 66795, 89, 1, c("#e11d2e", "#ffffff", "#111111")],
  ["atletico-mg", "Clube Atlético Mineiro", "Atlético-MG", "Belo Horizonte", "MG", 1908, "Arena MRV", 46000, 87, 1, c("#111111", "#ffffff", "#c8a24a")],
  ["gremio", "Grêmio Foot-Ball Porto Alegrense", "Grêmio", "Porto Alegre", "RS", 1903, "Arena do Grêmio", 55225, 86, 1, c("#0d8ecf", "#111111", "#ffffff")],
  ["internacional", "Sport Club Internacional", "Internacional", "Porto Alegre", "RS", 1909, "Beira-Rio", 50128, 85, 1, c("#c8102e", "#ffffff", "#111111")],
  ["cruzeiro", "Cruzeiro Esporte Clube", "Cruzeiro", "Belo Horizonte", "MG", 1921, "Mineirão", 61846, 85, 1, c("#1c3f94", "#ffffff", "#c8a24a")],
  ["botafogo", "Botafogo de Futebol e Regatas", "Botafogo", "Rio de Janeiro", "RJ", 1904, "Nilton Santos", 44661, 84, 1, c("#111111", "#ffffff", "#9aa0a6")],
  ["fluminense", "Fluminense Football Club", "Fluminense", "Rio de Janeiro", "RJ", 1902, "Maracanã", 78838, 83, 1, c("#7a1b3d", "#046b41", "#ffffff")],
  ["vasco", "Club de Regatas Vasco da Gama", "Vasco", "Rio de Janeiro", "RJ", 1898, "São Januário", 21880, 82, 1, c("#111111", "#ffffff", "#c8102e")],
  ["santos", "Santos Futebol Clube", "Santos", "Santos", "SP", 1912, "Vila Belmiro", 16068, 82, 1, c("#ffffff", "#111111", "#d8d8d8")],
  ["bahia", "Esporte Clube Bahia", "Bahia", "Salvador", "BA", 1931, "Arena Fonte Nova", 47907, 79, 1, c("#1c5fbf", "#e11d2e", "#ffffff")],
  ["fortaleza", "Fortaleza Esporte Clube", "Fortaleza", "Fortaleza", "CE", 1918, "Castelão", 63903, 77, 1, c("#1c3f94", "#e11d2e", "#ffffff")],
  ["bragantino", "Red Bull Bragantino", "Bragantino", "Bragança Paulista", "SP", 1928, "Cícero de Souza Marques", 17724, 74, 1, c("#e11d2e", "#ffffff", "#1c3f94")],
  ["sport", "Sport Club do Recife", "Sport", "Recife", "PE", 1905, "Ilha do Retiro", 26418, 72, 1, c("#c8102e", "#111111", "#c8a24a")],
  ["ceara", "Ceará Sporting Club", "Ceará", "Fortaleza", "CE", 1914, "Castelão", 63903, 70, 1, c("#111111", "#ffffff", "#c8102e")],
  ["vitoria", "Esporte Clube Vitória", "Vitória", "Salvador", "BA", 1899, "Barradão", 30618, 69, 1, c("#c8102e", "#111111", "#ffffff")],
  ["juventude", "Esporte Clube Juventude", "Juventude", "Caxias do Sul", "RS", 1913, "Alfredo Jaconi", 19924, 63, 1, c("#046b41", "#ffffff", "#111111")],
  ["mirassol", "Mirassol Futebol Clube", "Mirassol", "Mirassol", "SP", 1925, "Maião", 15000, 61, 1, c("#f5c518", "#046b41", "#ffffff")],

  // ---------------------------------------------------------------- Tier 2
  ["athletico-pr", "Club Athletico Paranaense", "Athletico-PR", "Curitiba", "PR", 1924, "Ligga Arena", 42372, 76, 2, c("#c8102e", "#111111", "#ffffff")],
  ["cuiaba", "Cuiabá Esporte Clube", "Cuiabá", "Cuiabá", "MT", 2001, "Arena Pantanal", 44097, 60, 2, c("#046b41", "#f5c518", "#ffffff")],
  ["coritiba", "Coritiba Foot Ball Club", "Coritiba", "Curitiba", "PR", 1909, "Couto Pereira", 40502, 66, 2, c("#046b41", "#ffffff", "#111111")],
  ["goias", "Goiás Esporte Clube", "Goiás", "Goiânia", "GO", 1943, "Serrinha", 14450, 64, 2, c("#046b41", "#ffffff", "#f5c518")],
  ["america-mg", "América Futebol Clube", "América-MG", "Belo Horizonte", "MG", 1912, "Independência", 23018, 62, 2, c("#046b41", "#ffffff", "#111111")],
  ["atletico-go", "Atlético Clube Goianiense", "Atlético-GO", "Goiânia", "GO", 1937, "Antônio Accioly", 12500, 60, 2, c("#c8102e", "#111111", "#ffffff")],
  ["chapecoense", "Associação Chapecoense de Futebol", "Chapecoense", "Chapecó", "SC", 1973, "Arena Condá", 22600, 57, 2, c("#046b41", "#ffffff", "#111111")],
  ["avai", "Avaí Futebol Clube", "Avaí", "Florianópolis", "SC", 1923, "Ressacada", 17800, 56, 2, c("#1c3f94", "#ffffff", "#111111")],
  ["criciuma", "Criciúma Esporte Clube", "Criciúma", "Criciúma", "SC", 1947, "Heriberto Hülse", 19300, 56, 2, c("#f5c518", "#111111", "#ffffff")],
  ["novorizontino", "Grêmio Novorizontino", "Novorizontino", "Novo Horizonte", "SP", 2010, "Jorge Ismael de Biasi", 16000, 55, 2, c("#f5c518", "#046b41", "#ffffff")],
  ["crb", "Clube de Regatas Brasil", "CRB", "Maceió", "AL", 1912, "Rei Pelé", 17126, 54, 2, c("#c8102e", "#ffffff", "#111111")],
  ["vila-nova", "Vila Nova Futebol Clube", "Vila Nova", "Goiânia", "GO", 1943, "OBA", 12500, 53, 2, c("#c8102e", "#ffffff", "#111111")],
  ["operario-pr", "Operário Ferroviário", "Operário-PR", "Ponta Grossa", "PR", 1912, "Germano Krüger", 10632, 50, 2, c("#111111", "#ffffff", "#c8102e")],
  ["paysandu", "Paysandu Sport Club", "Paysandu", "Belém", "PA", 1914, "Curuzu", 16200, 55, 2, c("#1c3f94", "#ffffff", "#111111")],
  ["remo", "Clube do Remo", "Remo", "Belém", "PA", 1905, "Baenão", 12000, 54, 2, c("#1c3f94", "#ffffff", "#111111")],
  ["ferroviaria", "Associação Ferroviária de Esportes", "Ferroviária", "Araraquara", "SP", 1950, "Fonte Luminosa", 19900, 49, 2, c("#c8102e", "#046b41", "#ffffff")],
  ["amazonas", "Amazonas Futebol Clube", "Amazonas", "Manaus", "AM", 2019, "Arena da Amazônia", 44300, 47, 2, c("#046b41", "#f5c518", "#ffffff")],
  ["botafogo-sp", "Botafogo Futebol Clube", "Botafogo-SP", "Ribeirão Preto", "SP", 1918, "Santa Cruz", 29292, 50, 2, c("#111111", "#ffffff", "#c8102e")],
  ["volta-redonda", "Volta Redonda Futebol Clube", "Volta Redonda", "Volta Redonda", "RJ", 1976, "Raulino de Oliveira", 19000, 46, 2, c("#f5c518", "#111111", "#ffffff")],
  ["athletic-mg", "Athletic Club", "Athletic-MG", "São João del-Rei", "MG", 1909, "Joaquim Portugal", 3000, 44, 2, c("#111111", "#c8102e", "#ffffff")],

  // ---------------------------------------------------------------- Tier 3
  ["ponte-preta", "Associação Atlética Ponte Preta", "Ponte Preta", "Campinas", "SP", 1900, "Moisés Lucarelli", 19722, 52, 3, c("#111111", "#ffffff", "#9aa0a6")],
  ["guarani", "Guarani Futebol Clube", "Guarani", "Campinas", "SP", 1911, "Brinco de Ouro", 29498, 50, 3, c("#046b41", "#ffffff", "#111111")],
  ["nautico", "Clube Náutico Capibaribe", "Náutico", "Recife", "PE", 1901, "Aflitos", 22800, 49, 3, c("#c8102e", "#ffffff", "#111111")],
  ["figueirense", "Figueirense Futebol Clube", "Figueirense", "Florianópolis", "SC", 1921, "Orlando Scarpelli", 19584, 46, 3, c("#111111", "#ffffff", "#9aa0a6")],
  ["abc", "ABC Futebol Clube", "ABC", "Natal", "RN", 1915, "Frasqueirão", 18000, 45, 3, c("#111111", "#ffffff", "#c8102e")],
  ["londrina", "Londrina Esporte Clube", "Londrina", "Londrina", "PR", 1956, "Estádio do Café", 30000, 43, 3, c("#1c3f94", "#ffffff", "#111111")],
  ["brusque", "Brusque Futebol Clube", "Brusque", "Brusque", "SC", 1987, "Augusto Bauer", 5000, 41, 3, c("#f5c518", "#1c3f94", "#ffffff")],
  ["ituano", "Ituano Futebol Clube", "Ituano", "Itu", "SP", 1947, "Novelli Júnior", 18560, 43, 3, c("#c8102e", "#111111", "#ffffff")],
  ["csa", "Centro Sportivo Alagoano", "CSA", "Maceió", "AL", 1913, "Rei Pelé", 17126, 44, 3, c("#1c3f94", "#ffffff", "#111111")],
  ["confianca", "Associação Desportiva Confiança", "Confiança", "Aracaju", "SE", 1936, "Batistão", 15600, 40, 3, c("#1c3f94", "#ffffff", "#111111")],
  ["ypiranga", "Ypiranga Futebol Clube", "Ypiranga-RS", "Erechim", "RS", 1924, "Colosso da Lagoa", 20000, 39, 3, c("#046b41", "#ffffff", "#111111")],
  ["sao-jose-rs", "São José Esporte Clube", "São José-RS", "Porto Alegre", "RS", 1913, "Passo D'Areia", 12000, 37, 3, c("#7a1b3d", "#ffffff", "#111111")],
  ["tombense", "Tombense Futebol Clube", "Tombense", "Tombos", "MG", 1914, "Antônio Guimarães", 5000, 38, 3, c("#046b41", "#ffffff", "#111111")],
  ["botafogo-pb", "Botafogo Futebol Clube", "Botafogo-PB", "João Pessoa", "PB", 1931, "Almeidão", 20000, 40, 3, c("#c8102e", "#111111", "#ffffff")],
  ["floresta", "Floresta Esporte Clube", "Floresta", "Fortaleza", "CE", 1954, "Domingão", 12000, 35, 3, c("#046b41", "#ffffff", "#111111")],
  ["sao-bernardo", "São Bernardo Futebol Clube", "São Bernardo", "São Bernardo do Campo", "SP", 2004, "1º de Maio", 15000, 39, 3, c("#1c3f94", "#f5c518", "#ffffff")],
  ["anapolis", "Anápolis Futebol Clube", "Anápolis", "Anápolis", "GO", 1946, "Jonas Duarte", 14000, 34, 3, c("#1c3f94", "#ffffff", "#111111")],
  ["maringa", "Maringá Futebol Clube", "Maringá", "Maringá", "PR", 2010, "Willie Davids", 13000, 35, 3, c("#046b41", "#ffffff", "#111111")],
  ["caxias", "Sociedade Esportiva e Recreativa Caxias", "Caxias", "Caxias do Sul", "RS", 1935, "Centenário", 22132, 38, 3, c("#1c3f94", "#c8102e", "#ffffff")],
  ["retro", "Retrô Futebol Clube Brasil", "Retrô", "Camaragibe", "PE", 2016, "Arena de Pernambuco", 44300, 36, 3, c("#046b41", "#ffffff", "#111111")],

  // ---------------------------------------------------------------- Tier 4
  ["portuguesa", "Associação Portuguesa de Desportos", "Portuguesa", "São Paulo", "SP", 1920, "Canindé", 21004, 38, 4, c("#c8102e", "#046b41", "#ffffff")],
  ["santa-cruz", "Santa Cruz Futebol Clube", "Santa Cruz", "Recife", "PE", 1914, "Arruda", 60044, 37, 4, c("#c8102e", "#111111", "#ffffff")],
  ["america-rn", "América Futebol Clube", "América-RN", "Natal", "RN", 1915, "Arena das Dunas", 31375, 33, 4, c("#c8102e", "#ffffff", "#111111")],
  ["sampaio-correa", "Sampaio Corrêa Futebol Clube", "Sampaio Corrêa", "São Luís", "MA", 1923, "Castelão-MA", 40149, 34, 4, c("#c8102e", "#f5c518", "#ffffff")],
  ["treze", "Treze Futebol Clube", "Treze", "Campina Grande", "PB", 1925, "Amigão", 22000, 29, 4, c("#111111", "#ffffff", "#c8102e")],
  ["nova-iguacu", "Nova Iguaçu Futebol Clube", "Nova Iguaçu", "Nova Iguaçu", "RJ", 1990, "Laranjão", 6000, 30, 4, c("#f5c518", "#046b41", "#ffffff")],
  ["rio-branco-es", "Rio Branco Atlético Clube", "Rio Branco-ES", "Cariacica", "ES", 1913, "Kleber Andrade", 21152, 28, 4, c("#111111", "#ffffff", "#9aa0a6")],
  ["inter-limeira", "Associação Atlética Internacional", "Inter de Limeira", "Limeira", "SP", 1913, "Major Levy Sobrinho", 18000, 31, 4, c("#1c3f94", "#ffffff", "#111111")],
  ["marcilio-dias", "Clube Náutico Marcílio Dias", "Marcílio Dias", "Itajaí", "SC", 1919, "Hercílio Luz", 5000, 27, 4, c("#c8102e", "#111111", "#ffffff")],
  ["pouso-alegre", "Pouso Alegre Futebol Clube", "Pouso Alegre", "Pouso Alegre", "MG", 1913, "Manduzão", 8000, 28, 4, c("#046b41", "#ffffff", "#111111")],
  ["aparecidense", "Associação Atlética Aparecidense", "Aparecidense", "Aparecida de Goiânia", "GO", 1986, "Anníbal Batista", 4000, 29, 4, c("#046b41", "#f5c518", "#ffffff")],
  ["itabaiana", "Associação Olímpica de Itabaiana", "Itabaiana", "Itabaiana", "SE", 1938, "Etelvino Mendonça", 8000, 26, 4, c("#046b41", "#ffffff", "#111111")],
  ["central", "Central Sport Club", "Central", "Caruaru", "PE", 1919, "Lacerdão", 20000, 25, 4, c("#c8102e", "#ffffff", "#111111")],
  ["manaus", "Manaus Futebol Clube", "Manaus", "Manaus", "AM", 2013, "Arena da Amazônia", 44300, 30, 4, c("#c8102e", "#111111", "#ffffff")],
  ["porto-velho", "Porto Velho Esporte Clube", "Porto Velho", "Porto Velho", "RO", 1953, "Aluízio Ferreira", 6000, 24, 4, c("#1c3f94", "#ffffff", "#111111")],
  ["cascavel", "Futebol Clube Cascavel", "Cascavel", "Cascavel", "PR", 2008, "Olímpico Regional", 24000, 28, 4, c("#1c3f94", "#f5c518", "#ffffff")],
  ["costa-rica", "Costa Rica Esporte Clube", "Costa Rica-MS", "Costa Rica", "MS", 1974, "Laertão", 4000, 24, 4, c("#046b41", "#ffffff", "#111111")],
  ["trem", "Trem Desportivo Clube", "Trem", "Macapá", "AP", 1947, "Zerão", 12000, 22, 4, c("#1c3f94", "#f5c518", "#ffffff")],
  ["humaita", "Humaitá Atlético Clube", "Humaitá", "Porto Acre", "AC", 2003, "Arena da Floresta", 15000, 21, 4, c("#c8102e", "#ffffff", "#111111")],
  ["barra-sc", "Barra Futebol Clube", "Barra-SC", "Balneário Camboriú", "SC", 2015, "Gigante da Barra", 3000, 25, 4, c("#111111", "#f5c518", "#ffffff")],
];
