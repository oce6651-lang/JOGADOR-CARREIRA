import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Award, Building2, History, Home, Medal, Shirt, Trophy } from "lucide-react";
import { useEffect, useMemo } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { SeasonTimeline } from "@/components/game/history/SeasonTimeline";
import { StatCard } from "@/components/game/Stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/game/GameProvider";
import { ClubCrest } from "@/components/game/world/ClubCrest";
import { formatFee, formatMoney, formatPosition, formatRating, transferRoute } from "@/game/format";
import { categoryLabel, getClubBySlug } from "@/game/world";

const TRANSFER_TYPE_LABEL: Record<string, string> = {
  youth: "Categoria de base",
  free: "Transferência livre",
  permanent: "Transferência definitiva",
  loan: "Empréstimo",
  release: "Dispensa",
};

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico da Carreira — Project Football Career" },
      {
        name: "description",
        content:
          "Linha do tempo completa da carreira: temporadas, clubes, títulos, prêmios, transferências e evolução do overall.",
      },
      { property: "og:title", content: "Histórico da Carreira" },
      {
        property: "og:description",
        content: "Cada temporada, clube, título e prêmio registrado para sempre.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const { career, hydrated } = useGame();

  useEffect(() => {
    if (hydrated && !career) navigate({ to: "/" });
  }, [hydrated, career, navigate]);

  const honours = useMemo(() => {
    if (!career) return [];
    return [...career.competitionHistory].filter((entry) => entry.playerChampion);
  }, [career]);

  /**
   * One row per competition the athlete actually took part in. Season stats are
   * the aggregate of the campaign — the club and category tell where he played.
   */
  const playerCompetitions = useMemo(() => {
    if (!career) return [];
    const { seasons } = career.player.history;
    return seasons
      .flatMap((season) => {
        const rows = season.competitionStats?.length
          ? season.competitionStats
          : (season.competitions?.length
              ? season.competitions
              : season.competitionName
                ? [season.competitionName]
                : []
            ).map((competitionName) => ({
              competitionId: undefined,
              competitionName,
              clubName: season.clubName,
              category: season.category,
              stats: season.stats,
              position: undefined,
              champion: (season.titles ?? []).some(
                (title) => title.competition === competitionName,
              ),
            }));

        return rows.map((row, index) => ({
          key: `${season.id}-${row.competitionName}-${index}`,
          seasonYear: season.seasonYear,
          competition: row.competitionName,
          clubName: row.clubName ?? season.clubName ?? "Sem clube",
          category: row.category ?? season.category ?? "—",
          appearances: row.stats.appearances,
          goals: row.stats.goals,
          assists: row.stats.assists,
          minutes: row.stats.minutes,
          position: row.position,
          champion:
            row.champion ??
            (season.titles ?? []).some((title) => title.competition === row.competitionName),
          rating: formatRating(row.stats.ratingSum, row.stats.appearances),
        }));
      })
      .sort((a, b) => b.seasonYear - a.seasonYear);
  }, [career]);

  if (!career) {
    return (
      <GameShell>
        <p className="text-sm text-muted-foreground">Carregando histórico...</p>
      </GameShell>
    );
  }

  const { history } = career.player;
  const totals = history.totals;

  return (
    <GameShell>
      <Link
        to="/carreira"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <Home className="size-3.5" /> Carreira
      </Link>

      <PageHeader
        eyebrow="Arquivo permanente"
        title="Histórico"
        description={`${career.player.fullName} · ${history.seasons.length} temporada(s) registrada(s).`}
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Shirt} label="Jogos" value={String(totals.appearances)} />
        <StatCard
          icon={Trophy}
          label="Gols"
          value={String(totals.goals)}
          hint={`${totals.assists} assistências`}
        />
        <StatCard
          icon={Medal}
          label="Títulos"
          value={String(history.titles.length)}
          hint={`${history.awards.length} prêmios`}
        />
        <StatCard
          icon={History}
          label="Nota média"
          value={formatRating(totals.ratingSum, totals.appearances)}
        />
      </section>

      <Tabs defaultValue="seasons">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="seasons">Temporadas</TabsTrigger>
          <TabsTrigger value="clubs">Clubes</TabsTrigger>
          <TabsTrigger value="honours">Conquistas</TabsTrigger>
          <TabsTrigger value="competitions">Competições</TabsTrigger>
          <TabsTrigger value="transfers">Transferências</TabsTrigger>
          <TabsTrigger value="finance">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="seasons">
          <SeasonTimeline seasons={history.seasons} />
        </TabsContent>

        <TabsContent value="clubs" className="space-y-3">
          {history.clubs.length ? (
            history.clubs.map((spell) => (
              <div key={spell.id} className="panel flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-display text-xl uppercase">{spell.clubName}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {spell.category} ·{" "}
                    {spell.type === "loan"
                      ? "Empréstimo"
                      : spell.type === "youth"
                        ? "Base"
                        : "Definitivo"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {spell.from.seasonYear} — {spell.to ? spell.to.seasonYear : "atual"}
                </p>
              </div>
            ))
          ) : (
            <Empty label="Nenhuma passagem por clube registrada." />
          )}

          <h3 className="text-display pt-4 text-xl uppercase">Transferências</h3>
          {history.transfers.length ? (
            history.transfers.map((transfer) => (
              <div key={transfer.id} className="panel flex items-center justify-between gap-4 p-4">
                <p className="text-sm">{transferRoute(transfer)}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {transfer.date.seasonYear} · {formatFee(transfer.fee)}
                </p>
              </div>
            ))
          ) : (
            <Empty label="Nenhuma transferência registrada." />
          )}
        </TabsContent>

        <TabsContent value="honours" className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-display text-xl uppercase">Títulos</h3>
            {history.titles.length ? (
              history.titles.map((title) => (
                <div key={title.id} className="panel flex items-center gap-3 p-4">
                  <Trophy className="size-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{title.competition}</p>
                    <p className="text-xs text-muted-foreground">
                      {title.seasonYear} · {title.clubName ?? "—"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <Empty label="Nenhum título conquistado ainda." />
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-display text-xl uppercase">Prêmios</h3>
            {history.awards.length ? (
              history.awards.map((award) => (
                <div key={award.id} className="panel flex items-center gap-3 p-4">
                  <Award className="size-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{award.name}</p>
                    <p className="text-xs text-muted-foreground">{award.seasonYear}</p>
                  </div>
                </div>
              ))
            ) : (
              <Empty label="Nenhum prêmio individual ainda." />
            )}
          </div>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-3">
          <h3 className="text-display text-xl uppercase">Competições disputadas</h3>
          {playerCompetitions.length ? (
            <div className="panel overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <th className="px-3 py-3 text-left">Temp.</th>
                    <th className="px-3 py-3 text-left">Competição</th>
                    <th className="px-3 py-3 text-left">Clube</th>
                    <th className="px-3 py-3 text-left">Categoria</th>
                    <th className="px-3 py-3 text-right">J</th>
                    <th className="px-3 py-3 text-right">Min</th>
                    <th className="px-3 py-3 text-right">G</th>
                    <th className="px-3 py-3 text-right">A</th>
                    <th className="px-3 py-3 text-right">Nota</th>
                    <th className="px-3 py-3 text-right">Posição</th>
                    <th className="px-3 py-3 text-left">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {playerCompetitions.map((row) => (
                    <tr key={row.key} className="border-b border-border/50 last:border-0">
                      <td className="px-3 py-2.5 font-semibold">{row.seasonYear}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">{row.competition}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">{row.clubName}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                        {row.category}
                      </td>
                      <td className="px-3 py-2.5 text-right">{row.appearances}</td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">
                        {row.minutes}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-primary">
                        {row.goals}
                      </td>
                      <td className="px-3 py-2.5 text-right">{row.assists}</td>
                      <td className="px-3 py-2.5 text-right">{row.rating}</td>
                      <td className="px-3 py-2.5 text-right">{formatPosition(row.position)}</td>
                      <td className="px-3 py-2.5 text-xs text-primary">
                        {row.champion ? "Campeão" : row.position === 2 ? "Vice-campeão" : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty label="O atleta ainda não disputou competições." />
          )}

          <h3 className="text-display mt-6 text-xl uppercase">Edições concluídas</h3>
          <p className="text-sm text-muted-foreground">
            Todas as edições disputadas pelos clubes do atleta ficam registradas para sempre.
            {honours.length ? ` Você venceu ${honours.length} delas.` : ""}
          </p>
          {career.competitionHistory.length ? (
            career.competitionHistory.map((entry) => (
              <div key={entry.id} className="panel flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-semibold">
                    {entry.competitionName} · {entry.seasonYear}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Campeão: {entry.championClubName}
                    {entry.runnerUpClubName ? ` · Vice: ${entry.runnerUpClubName}` : ""}
                  </p>
                </div>
                {entry.playerChampion ? (
                  <Trophy className="size-5 shrink-0 text-primary" />
                ) : (
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))
          ) : (
            <Empty label="Nenhuma edição concluída durante esta carreira." />
          )}
        </TabsContent>

        <TabsContent value="transfers" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Cada mudança de clube fica registrada com valor, tipo e categoria de destino.
          </p>
          {history.transfers.length ? (
            [...history.transfers]
              .sort((a, b) => b.date.seasonYear - a.date.seasonYear)
              .map((transfer) => {
                const club =
                  transfer.type !== "release" && transfer.toClubSlug
                    ? getClubBySlug(transfer.toClubSlug)
                    : undefined;
                return (
                  <div
                    key={transfer.id}
                    className="panel flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div className="flex items-center gap-3">
                      {club ? <ClubCrest club={club} size="md" /> : null}
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {transfer.date.seasonYear}
                          {transfer.age ? ` · ${transfer.age} anos` : ""}
                          {transfer.overall ? ` · OVR ${transfer.overall}` : ""}
                        </p>
                        <p className="text-display text-lg uppercase leading-tight">
                          {transferRoute(transfer)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {TRANSFER_TYPE_LABEL[transfer.type]}
                          {transfer.category ? ` · ${categoryLabel(transfer.category)}` : ""}
                          {transfer.contractSeasons
                            ? ` · ${transfer.contractSeasons} temporada(s)`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-display text-xl uppercase text-primary">
                        {transfer.type === "release" ? "Dispensado" : formatFee(transfer.fee)}
                      </p>
                      {transfer.weeklyWage ? (
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(transfer.weeklyWage)}/semana
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })
          ) : (
            <Empty label="Nenhuma transferência registrada." />
          )}
        </TabsContent>

        <TabsContent value="finance" className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-display text-xl uppercase">Salários</h3>
            {history.salaries.length ? (
              history.salaries.map((salary) => (
                <div key={salary.id} className="panel flex items-center justify-between p-4">
                  <p className="text-sm">{salary.clubName ?? "—"}</p>
                  <p className="text-sm font-semibold">
                    {formatMoney(salary.amount)}
                    <span className="text-xs text-muted-foreground"> /semana</span>
                  </p>
                </div>
              ))
            ) : (
              <Empty label="Nenhum salário registrado." />
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-display text-xl uppercase">Valor de mercado</h3>
            {history.marketValues.length ? (
              history.marketValues.slice(0, 20).map((value, index) => (
                <div
                  key={`${value.date.seasonYear}-${index}`}
                  className="panel flex items-center justify-between p-4"
                >
                  <p className="text-sm">{value.date.seasonYear}</p>
                  <p className="text-sm font-semibold">{formatMoney(value.value)}</p>
                </div>
              ))
            ) : (
              <Empty label="Sem avaliações de mercado ainda." />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </GameShell>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="panel p-5 text-sm text-muted-foreground">{label}</p>;
}
