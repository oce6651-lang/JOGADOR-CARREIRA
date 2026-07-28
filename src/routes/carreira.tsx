import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronsRight,
  Flag,
  Footprints,
  Home,
  Lock,
  Trophy,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EventList } from "@/components/game/events/EventList";
import { GameShell, PageHeader } from "@/components/game/GameShell";
import { SeasonSummaryDialog } from "@/components/game/simulation/SeasonSummaryDialog";
import { SimulationReportDialog } from "@/components/game/simulation/SimulationReportDialog";
import { TimePanel } from "@/components/game/simulation/TimePanel";
import { StatCard } from "@/components/game/Stats";
import { Button } from "@/components/ui/button";
import { seasonLabel } from "@/game/calendar";
import { playerAge, playerFullName, playerOverall } from "@/game/career";
import { footLabel, nationalityLabel, positionLabel } from "@/game/constants";
import { EVENT_DEFINITIONS } from "@/game/events";
import { useGame } from "@/game/GameProvider";
import { STATUS_LABELS, primaryStatus } from "@/game/player";
import { hasClub } from "@/game/simulation";
import { roleLabel } from "@/game/ai";
import { categoryLabel } from "@/game/world";

import type { GameEventType } from "@/game/types";

export const Route = createFileRoute("/carreira")({
  head: () => ({
    meta: [
      { title: "Carreira — Project Football Career" },
      {
        name: "description",
        content:
          "Painel da carreira: simule partidas, semanas e meses, acompanhe temporada, idade e todo o histórico de eventos.",
      },
      { property: "og:title", content: "Carreira — Project Football Career" },
      {
        property: "og:description",
        content: "Simule o tempo e acompanhe cada evento da carreira do seu atleta.",
      },
    ],
  }),
  component: CareerPage,
});

const LOCKED = [
  "Peneiras",
  "Clubes",
  "Transferências",
  "Empresários",
  "Campeonatos",
  "Seleções",
];

const FILTERS: { id: "all" | GameEventType; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "match", label: "Partidas" },
  { id: "training", label: "Treinos" },
  { id: "growth", label: "Evolução" },
  { id: "injury", label: "Lesões" },
  { id: "seasonEnd", label: "Temporadas" },
];

function CareerPage() {
  const navigate = useNavigate();
  const {
    career,
    hydrated,
    simulate,
    simulating,
    lastReport,
    dismissReport,
    dismissSeasonSummary,
    abandonCareer,
  } = useGame();
  const [filter, setFilter] = useState<"all" | GameEventType>("all");

  useEffect(() => {
    if (hydrated && !career) navigate({ to: "/" });
  }, [hydrated, career, navigate]);

  const events = useMemo(() => {
    if (!career) return [];
    const list = filter === "all" ? career.events : career.events.filter((e) => e.type === filter);
    return list.slice(0, 40);
  }, [career, filter]);

  if (!career) {
    return (
      <GameShell>
        <p className="text-sm text-muted-foreground">Carregando carreira...</p>
      </GameShell>
    );
  }

  const { current } = career.timeline;
  const pendingSummary = career.pendingSeasonSummaries[0] ?? null;
  const status = primaryStatus(career.player.statuses);
  const totals = career.player.history.totals;

  return (
    <GameShell>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <Home className="size-3.5" /> Menu principal
      </Link>

      <PageHeader
        eyebrow={`Temporada ${seasonLabel(current)}`}
        title={playerFullName(career)}
        description={`${positionLabel(career.player.position)} · ${playerAge(career)} anos · ${STATUS_LABELS[status].label}`}
      />

      <TimePanel
        date={current}
        age={playerAge(career)}
        birthDate={career.player.birthDate}
        canPlayMatch={hasClub(career.player)}
        busy={simulating}
        onSimulate={simulate}
      />

      <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UserRound}
          label="Overall"
          value={String(playerOverall(career))}
          hint={career.player.code}
        />
        <StatCard
          icon={CalendarDays}
          label="Jogos"
          value={String(totals.appearances)}
          hint={`${totals.goals} gols · ${totals.assists} assistências`}
        />
        <StatCard
          icon={Trophy}
          label="Temporadas"
          value={String(career.timeline.completedSeasons)}
          hint="Completas"
        />
        <StatCard
          icon={Flag}
          label="Nacionalidade"
          value={nationalityLabel(career.player.nationality)}
        />
      </section>

      <Link
        to="/jogador"
        className="panel mt-4 flex items-center justify-between gap-4 p-5 transition-colors hover:border-primary/60"
      >
        <div>
          <p className="text-display text-2xl uppercase">Ficha do jogador</p>
          <p className="text-sm text-muted-foreground">
            Atributos, personalidade, estatísticas e histórico completo.
          </p>
        </div>
        <ChevronsRight className="size-6 text-primary" />
      </Link>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel space-y-3 p-6">
          <h2 className="text-display text-2xl uppercase">Perfil</h2>
          <InfoRow label="Situação" value={STATUS_LABELS[status].label} />
          <InfoRow
            label="Clube"
            value={
              career.ai.club
                ? `${career.ai.club.clubName} · ${categoryLabel(career.ai.club.category)}`
                : "Sem clube"
            }
          />
          <InfoRow
            label="Papel no elenco"
            value={career.ai.club ? roleLabel(career.ai.club.role) : "—"}
          />
          <InfoRow label="Moral" value={`${Math.round(career.ai.morale)}/100`} />
          <InfoRow label="Condição física" value={`${Math.round(career.ai.fitness)}/100`} />
          <InfoRow label="Posição" value={positionLabel(career.player.position)} />
          <InfoRow
            label="Pé dominante"
            value={footLabel(career.player.foot)}
            icon={<Footprints className="size-3.5" />}
          />
          <InfoRow label="Nascimento" value={career.player.birthDate} />
          <InfoRow label="Identificador" value={career.player.code} />
        </div>

        <div className="space-y-4">
          <div className="panel space-y-3 p-6">
            <h2 className="text-display text-2xl uppercase">Interesse de clubes</h2>
            {career.ai.scouting.length ? (
              <ul className="space-y-2">
                {career.ai.scouting.map((interest) => (
                  <li
                    key={interest.clubId}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold">{interest.clubName}</span>
                    <span className="text-xs text-muted-foreground">
                      interesse {Math.round(interest.level)}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum olheiro acompanhando o atleta no momento.
              </p>
            )}
          </div>

          <div className="panel space-y-3 p-6">
            <h2 className="text-display text-2xl uppercase">Em breve</h2>
            <div className="flex flex-wrap gap-2">
              {LOCKED.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground"
                >
                  <Lock className="size-3" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => {
              abandonCareer();
              navigate({ to: "/" });
            }}
          >
            Abandonar carreira
          </Button>
        </div>
      </section>

      <section className="panel mt-4 space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-display text-2xl uppercase">Histórico de eventos</h2>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  filter === item.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <EventList
          events={events}
          emptyLabel={`Nenhum evento do tipo ${
            filter === "all" ? "registrado" : EVENT_DEFINITIONS[filter].label
          } ainda.`}
        />
      </section>


      <SeasonSummaryDialog
        summary={pendingSummary}
        open={Boolean(pendingSummary)}
        onClose={() => pendingSummary && dismissSeasonSummary(pendingSummary.id)}
      />
      <SimulationReportDialog
        report={lastReport}
        open={Boolean(lastReport) && !pendingSummary}
        onClose={dismissReport}
      />
    </GameShell>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0 last:pb-0">
      <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
