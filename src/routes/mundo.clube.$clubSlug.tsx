import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Building2, CalendarDays, MapPin, Star, Users } from "lucide-react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { ProgressBar, StatCard } from "@/components/game/Stats";
import { ClubCrest } from "@/components/game/world/ClubCrest";
import { CompetitionCard } from "@/components/game/world/CompetitionCard";
import {
  FINANCE_LABELS,
  categoryLabel,
  competitionsForClub,
  countryLabel,
  getClubBySlug,
  reputationLabel,
  sortCategories,
  stateLabel,
} from "@/game/world";

export const Route = createFileRoute("/mundo/clube/$clubSlug")({
  head: ({ params }) => {
    const club = getClubBySlug(params.clubSlug);
    const title = club ? `${club.shortName} — Mundo do Futebol` : "Clube";
    const description = club
      ? `${club.name}: fundado em ${club.foundedYear}, joga no ${club.stadium.name}, em ${club.city}.`
      : "Clube não encontrado.";
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
    const club = getClubBySlug(params.clubSlug);
    if (!club) throw notFound();
    return { slug: club.slug };
  },
  component: ClubPage,
});

function ClubPage() {
  const { clubSlug } = Route.useParams();
  const club = getClubBySlug(clubSlug);
  if (!club) return null;

  const competitions = competitionsForClub(club.id);

  return (
    <GameShell>
      <Link
        to="/mundo"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Mundo
      </Link>

      <div
        className="panel mb-6 flex flex-wrap items-center gap-5 p-6 animate-rise"
        style={{
          background: `linear-gradient(120deg, ${club.colors.primary}22, transparent 65%)`,
        }}
      >
        <ClubCrest club={club} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {countryLabel(club.country)} · {stateLabel(club.country, club.state)}
          </p>
          <h1 className="text-display text-4xl uppercase leading-tight">{club.shortName}</h1>
          <p className="text-sm text-muted-foreground">{club.name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" /> {club.city} — {club.state}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3" /> Fundado em {club.foundedYear}
            </span>
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Star} label="Reputação" value={String(club.reputation)} hint={reputationLabel(club.reputation)} />
        <StatCard icon={Building2} label="Estádio" value={club.stadium.name} hint={`${club.stadium.capacity.toLocaleString("pt-BR")} lugares`} />
        <StatCard label="Finanças" value={FINANCE_LABELS[club.financeLevel]} />
        <StatCard icon={Users} label="Base" value={String(club.academyRating)} hint="Qualidade da academia" />
      </div>

      <section className="panel mb-6 space-y-4 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Força do clube
        </h2>
        <ProgressBar label="Reputação" value={club.reputation} />
        <ProgressBar label="Categorias de base" value={club.academyRating} tone="gold" />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Categorias disponíveis
        </h2>
        <div className="flex flex-wrap gap-2">
          {sortCategories(club.categories).map((category) => (
            <span
              key={category}
              className="rounded-xl border border-border bg-secondary/50 px-4 py-2 text-sm font-semibold"
            >
              {categoryLabel(category)}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Porta de entrada para peneiras: {categoryLabel(club.entryCategory)}.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Competições disputadas
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {competitions.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </div>
      </section>
    </GameShell>
  );
}
