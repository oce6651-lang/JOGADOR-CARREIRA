import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Globe2, Trophy, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { StatCard } from "@/components/game/Stats";
import { ClubCard } from "@/components/game/world/ClubCard";
import { CompetitionCard } from "@/components/game/world/CompetitionCard";
import {
  COUNTRIES,
  clubsByCountry,
  competitionsByCountry,
  sortByReputation,
} from "@/game/world";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mundo/")({
  head: () => ({
    meta: [
      { title: "Mundo do Futebol — Clubes, Ligas e Competições" },
      {
        name: "description",
        content:
          "Explore países, competições e clubes do Project Football Career: reputação, estádios, categorias de base e tabelas.",
      },
      { property: "og:title", content: "Mundo do Futebol — Project Football Career" },
      {
        property: "og:description",
        content:
          "Todos os clubes, ligas e competições que formam o mundo vivo da sua carreira.",
      },
    ],
  }),
  component: WorldPage,
});

type ViewMode = "competitions" | "clubs";

function WorldPage() {
  const [countryCode, setCountryCode] = useState("BRA");
  const [mode, setMode] = useState<ViewMode>("competitions");

  const clubs = useMemo(() => sortByReputation(clubsByCountry(countryCode)), [countryCode]);
  const competitions = useMemo(() => competitionsByCountry(countryCode), [countryCode]);
  const activeCompetitions = competitions.filter((item) => item.status === "active");
  const grouped = useMemo(
    () => ({
      national: activeCompetitions.filter(
        (item) => item.scope === "national" && item.category === "PRO",
      ),
      youth: activeCompetitions.filter((item) => item.category !== "PRO"),
      state: activeCompetitions.filter((item) => item.scope === "state"),
      planned: competitions.filter((item) => item.status === "planned"),
    }),
    [activeCompetitions, competitions],
  );

  return (
    <GameShell>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Menu
      </Link>

      <PageHeader
        eyebrow="Mundo do futebol"
        title="O mundo"
        description="Países, competições e clubes que existem independentemente da sua carreira."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={Globe2} label="Países" value={String(COUNTRIES.filter((c) => c.playable).length)} hint="Mais países em breve" />
        <StatCard icon={Building2} label="Clubes" value={String(clubs.length)} />
        <StatCard icon={Trophy} label="Competições" value={String(activeCompetitions.length)} />
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          País
        </h2>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((country) => (
            <button
              key={country.id}
              type="button"
              disabled={!country.playable}
              onClick={() => setCountryCode(country.code)}
              className={cn(
                "rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors",
                country.code === countryCode
                  ? "border-primary bg-primary/15 text-primary"
                  : "bg-secondary/40 hover:bg-secondary",
                !country.playable && "cursor-not-allowed opacity-40",
              )}
            >
              <span className="mr-2">{country.flag}</span>
              {country.name}
              {!country.playable ? (
                <span className="ml-2 text-[10px] uppercase tracking-widest">Em breve</span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <div className="mb-5 inline-flex rounded-xl border border-border bg-secondary/40 p-1">
        <ModeButton active={mode === "competitions"} onClick={() => setMode("competitions")} icon={Trophy}>
          Competições
        </ModeButton>
        <ModeButton active={mode === "clubs"} onClick={() => setMode("clubs")} icon={Users}>
          Clubes
        </ModeButton>
      </div>

      {mode === "competitions" ? (
        <div className="space-y-8">
          <CompetitionGroup title="Nacionais" items={grouped.national} />
          <CompetitionGroup title="Categorias de base" items={grouped.youth} />
          <CompetitionGroup title="Estaduais" items={grouped.state} />
          <CompetitionGroup title="Futuras competições" items={grouped.planned} />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      )}
    </GameShell>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Trophy;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}

function CompetitionGroup({
  title,
  items,
}: {
  title: string;
  items: ReturnType<typeof competitionsByCountry>;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((competition) => (
          <CompetitionCard key={competition.id} competition={competition} />
        ))}
      </div>
    </section>
  );
}
