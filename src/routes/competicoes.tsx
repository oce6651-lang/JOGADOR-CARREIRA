import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/GameProvider";
import {
  COMPETITIONS,
  COUNTRIES,
  SCOPE_LABELS,
  countryLabel,
  rollOfHonour,
  titleCount,
} from "@/game/world";

export const Route = createFileRoute("/competicoes")({
  head: () => ({
    meta: [
      { title: "Histórico das Competições — Project Football Career" },
      {
        name: "description",
        content:
          "Galeria de campeões de todas as ligas e copas do mundo do jogo, temporada a temporada.",
      },
      { property: "og:title", content: "Histórico das Competições" },
      {
        property: "og:description",
        content: "Escolha um campeonato e veja todos os campeões e os maiores vencedores.",
      },
    ],
  }),
  component: CompetitionsHistoryPage,
});

/** How many seasons back the roll of honour goes. */
const HISTORY_DEPTH = 40;

function CompetitionsHistoryPage() {
  const { career } = useGame();
  const currentYear = career?.timeline.current.seasonYear ?? new Date().getFullYear();

  const countries = useMemo(() => COUNTRIES.filter((country) => country.playable), []);
  const [country, setCountry] = useState(countries[0]?.code ?? "BRA");
  const [selected, setSelected] = useState<string | null>(null);

  const list = useMemo(
    () =>
      COMPETITIONS.filter(
        (competition) =>
          competition.country === country || competition.scope === "world",
      ),
    [country],
  );

  const competition = selected
    ? (COMPETITIONS.find((item) => item.id === selected) ?? null)
    : null;

  const fromYear = competition
    ? Math.max(competition.foundedYear, currentYear - HISTORY_DEPTH)
    : currentYear;

  const editions = useMemo(
    () => (competition ? rollOfHonour(competition.id, fromYear, currentYear) : []),
    [competition, fromYear, currentYear],
  );

  const winners = useMemo(
    () => (competition ? titleCount(competition.id, fromYear, currentYear).slice(0, 8) : []),
    [competition, fromYear, currentYear],
  );

  return (
    <GameShell>
      <Link
        to="/carreira"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <Home className="size-3.5" /> Carreira
      </Link>

      <PageHeader
        eyebrow="Arquivo do futebol"
        title="Histórico das competições"
        description="Escolha um campeonato para ver todos os campeões e os maiores vencedores."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {countries.map((item) => (
          <Button
            key={item.code}
            size="sm"
            variant={item.code === country ? "default" : "secondary"}
            onClick={() => {
              setCountry(item.code);
              setSelected(null);
            }}
          >
            {item.flag} {countryLabel(item.code)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <section className="panel max-h-[560px] space-y-1 overflow-y-auto p-3">
          {list.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                item.id === selected ? "bg-primary/15 text-primary" : "hover:bg-secondary/60"
              }`}
            >
              <span>{item.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {SCOPE_LABELS[item.scope]}
              </span>
            </button>
          ))}
        </section>

        <section className="space-y-4">
          {!competition ? (
            <p className="panel p-6 text-sm text-muted-foreground">
              Selecione um campeonato à esquerda para abrir o histórico de campeões.
            </p>
          ) : (
            <>
              <div className="panel p-5">
                <h2 className="text-display text-2xl uppercase">{competition.name}</h2>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Fundado em {competition.foundedYear} · {SCOPE_LABELS[competition.scope]} ·{" "}
                  {competition.clubIds.length} clubes
                </p>
              </div>

              {winners.length ? (
                <div className="panel p-5">
                  <h3 className="text-display mb-3 text-lg uppercase">Maiores vencedores</h3>
                  <div className="space-y-2">
                    {winners.map((winner) => (
                      <div
                        key={winner.clubId}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{winner.clubName}</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-primary">
                          <Trophy className="size-3.5" /> {winner.titles}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="panel overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      <th className="px-4 py-3 text-left">Temporada</th>
                      <th className="px-4 py-3 text-left">Campeão</th>
                      <th className="px-4 py-3 text-left">Vice</th>
                      <th className="px-4 py-3 text-left">Artilheiro</th>
                      <th className="px-4 py-3 text-left">Assistências</th>
                      <th className="px-4 py-3 text-left">Melhor jogador</th>
                      <th className="px-4 py-3 text-left">Melhor goleiro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editions.length ? (
                      editions.map((edition) => (
                        <tr
                          key={`${edition.competitionId}-${edition.seasonYear}`}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="px-4 py-2.5 font-semibold">{edition.seasonYear}</td>
                          <td className="whitespace-nowrap px-4 py-2.5">
                            {edition.championClubName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                            {edition.runnerUpClubName ?? "—"}
                          </td>
                          <AwardCell award={edition.topScorer} suffix="gols" />
                          <AwardCell award={edition.topAssists} suffix="assist." />
                          <AwardCell award={edition.bestPlayer} />
                          <AwardCell award={edition.bestGoalkeeper} />
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-4 text-muted-foreground" colSpan={7}>
                          Sem edições disputadas neste período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </GameShell>
  );
}
