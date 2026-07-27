import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Trophy } from "lucide-react";
import { useMemo } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { StatCard } from "@/components/game/Stats";
import { ClubCard } from "@/components/game/world/ClubCard";
import { StandingsTable } from "@/components/game/world/StandingsTable";
import {
  FORMAT_LABELS,
  SCOPE_LABELS,
  categoryLabel,
  createCompetitionSeason,
  getClub,
  getCompetitionBySlug,
  sortByReputation,
} from "@/game/world";

export const Route = createFileRoute("/mundo/competicao/$competitionSlug")({
  head: ({ params }) => {
    const competition = getCompetitionBySlug(params.competitionSlug);
    const title = competition ? `${competition.name} — Mundo do Futebol` : "Competição";
    const description = competition
      ? `${competition.name}: ${competition.clubIds.length} clubes, classificação e informações da temporada.`
      : "Competição não encontrada.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: ({ params }) => {
    const competition = getCompetitionBySlug(params.competitionSlug);
    if (!competition) throw notFound();
    return { slug: competition.slug };
  },
  component: CompetitionPage,
});

function CompetitionPage() {
  const { competitionSlug } = Route.useParams();
  const competition = getCompetitionBySlug(competitionSlug);

  const season = useMemo(
    () => (competition ? createCompetitionSeason(competition.id, new Date().getFullYear()) : null),
    [competition],
  );

  if (!competition || !season) return null;

  const clubs = sortByReputation(
    competition.clubIds.map((id) => getClub(id)).filter((club) => !!club),
  );

  return (
    <GameShell>
      <Link
        to="/mundo"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Mundo
      </Link>

      <PageHeader
        eyebrow={`${SCOPE_LABELS[competition.scope]} · ${categoryLabel(competition.category)}`}
        title={competition.name}
        description={`${FORMAT_LABELS[competition.format]} · ${clubs.length} clubes participantes.`}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatCard icon={Trophy} label="Formato" value={FORMAT_LABELS[competition.format]} />
        <StatCard label="Temporada" value={String(season.seasonYear)} />
        <StatCard
          label="Reputação mínima"
          value={String(competition.reputationFloor)}
          hint="Para disputar"
        />
      </div>

      {competition.format === "league" ? (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Classificação
          </h2>
          <StandingsTable season={season} />
          <p className="mt-2 text-xs text-muted-foreground">
            A tabela é zerada até a simulação das rodadas da temporada.
          </p>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Clubes participantes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </section>
    </GameShell>
  );
}
