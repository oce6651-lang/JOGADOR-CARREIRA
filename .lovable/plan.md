## Objetivo

Reformular os sistemas centrais do Modo Carreira: peneiras mais difíceis e nacionais, categorias por temporada (sem Veterano), empresário com contatos reais, propostas com categoria explícita, histórico estilo Football Manager, crescimento físico, prêmios e histórico permanente de competições.

O escopo é grande demais para uma única entrega segura, então proponho 5 fases. Cada fase deixa o jogo jogável e testado.

---

## Fase 1 — Categorias e crescimento físico (base de tudo)

- Remover a categoria `VET` de `src/game/world/categories.ts`, tipos, clubes e telas.
- Categoria passa a ser calculada pela **idade na temporada** (idade completada durante o ano), não pela idade atual. Nova função `categoryForSeason(birthDate, seasonYear)`.
- Na virada de temporada, o atleta migra automaticamente para a categoria seguinte quando deixa de ser elegível.
- `U23` ganha função própria: destino de atletas acima da base que ainda não têm nível de profissional mas seguem nos planos do clube (regra de decisão em `src/game/ai/clubMoves.ts`).
- Novo `src/game/player/growth.ts`: altura cresce de ~7 a 18/19 anos com curva por genética; depois estabiliza. Peso varia continuamente com treino, lesão e condicionamento. Registrado no histórico anual.

## Fase 2 — Peneiras e categoria nas propostas

- Peneiras passam a ser **quase todas nacionais** (país onde o atleta atua/nasceu). Internacionais só liberadas por: overall/potencial alto, indicação do empresário (contatos), convite específico gerado por evento ou torneio internacional.
- Cada peneira ganha **nível de dificuldade** derivado da reputação do clube (Fácil → Elite), com chances de aprovação bem mais duras que hoje (grandes clubes tornam-se realmente raros).
- Toda oferta (`ClubOffer`) passa a carregar e exibir a categoria de destino, inclusive rótulo "Equipe B" para clubes europeus — mostrado em `/negociacoes`, `/peneiras` e no card da proposta.
- Categoria de destino depende do **planejamento do clube**, não só da idade: clube pequeno pode subir o atleta direto ao profissional; clube grande pode contratá-lo para o Sub-17/Sub-20 para adaptação.

## Fase 3 — Empresário, transferências e contratos

- Tela `/empresario` ganha busca de **qualquer clube do mundo** para oferecer o atleta.
- Sucesso em abrir negociação depende de: reputação e contatos do empresário, reputação do atleta, nível do clube, categoria, valor de mercado e desempenho recente. Empresários iniciantes só alcançam clubes pequenos/médios.
- Empresário pode pedir **promoção interna de categoria** (Sub-17 → Sub-20 → Profissional), avaliada por desempenho, idade, qualidade, necessidade do clube e treinador.
- Fim de contrato sem renovação → atleta vira **agente livre** de verdade: sem clube, treinando individualmente, podendo receber propostas e ir a peneiras.

## Fase 4 — Históricos (carreira, clubes, saves)

- Histórico de clubes em linha única por temporada, estilo FM: Clube, Categoria, Liga, Temporada, Jogos, Gols, Assistências, Nota média, Valor de mercado, Overall, Idade.
- Nova página no menu inicial: **Carreiras** — lista todos os saves com a ficha completa do atleta (inclusive aposentados).
- Prêmios individuais anuais (Bola de Ouro, Melhor da Liga, Melhor Jovem, Melhor por posição, Artilheiro, Líder de assistências, Revelação, Seleção da Temporada), gravados para sempre no histórico.

## Fase 5 — Competições e seu histórico permanente

- Completar o quadro de competições reais (Séries A–D, Copa do Brasil, estaduais, Libertadores, Sul-Americana, Champions, Europa, Conference, Mundial, Copa do Mundo, Eurocopa, Copa América).
- Cada competição com calendário, tabela, mata-mata, classificação, artilharia e assistências.
- Histórico permanente por temporada: campeão, vice, terceiro, artilheiro, líder de assistências, melhor jogador e melhor goleiro — consultável em qualquer momento da carreira.

---

## Detalhes técnicos

- Toda a lógica continua em `src/game/` (puro, sem React); telas apenas leem e disparam ações.
- `SAVE_VERSION` sobe e ganha migração: saves antigos com `VET` são convertidos para `PRO`, e históricos existentes são preenchidos com campos novos vazios.
- Novos módulos previstos: `game/player/growth.ts`, `game/ai/scouting.ts` (contatos do empresário), `game/ai/promotion.ts`, `game/awards/`, `game/world/history.ts`.
- Persistência segue em armazenamento local do navegador, sem backend.

Começo pela Fase 1 assim que aprovar — ou digo qual fase priorizar se preferir outra ordem.