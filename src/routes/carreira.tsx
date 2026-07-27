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
import { useEffect } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { ProgressBar, StatCard } from "@/components/game/Stats";
import { Button } from "@/components/ui/button";
import { formatGameDate, seasonLabel } from "@/game/calendar";
import { playerAge, playerFullName } from "@/game/career";
import {
  WEEKS_PER_SEASON,
  footLabel,
  nationalityLabel,
  positionLabel,
} from "@/game/constants";
import { useGame } from "@/game/GameProvider";

export const Route = createFileRoute("/carreira")({
  head: () => ({
    meta: [
      { title: "Carreira — Project Football Career" },
      {
        name: "description",
        content:
          "Painel da carreira: temporada atual, calendário, perfil do atleta e histórico de eventos.",
      },
      { property: "og:title", content: "Carreira — Project Football Career" },
      {
        property: "og:description",
        content: "Acompanhe temporada, calendário e evolução do seu atleta.",
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
  "Evolução",
  "Lesões",
];

function CareerPage() {
  const navigate = useNavigate();
  const { career, hydrated, advanceWeek, abandonCareer } = useGame();

  useEffect(() => {
    if (hydrated && !career) navigate({ to: "/" });
  }, [hydrated, career, navigate]);

  if (!career) {
    return (
      <GameShell>
        <p className="text-sm text-muted-foreground">Carregando carreira...</p>
      </GameShell>
    );
  }

  const { current } = career.timeline;

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
        description={`${positionLabel(career.player.position)} · ${playerAge(career)} anos · Sem clube`}
        action={
          <Button
            onClick={advanceWeek}
            size="lg"
            className="text-display text-lg uppercase"
          >
            Avançar semana <ChevronsRight className="size-5" />
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Semana"
          value={`${current.week}/${WEEKS_PER_SEASON}`}
          hint={formatGameDate(current)}
        />
        <StatCard
          icon={Trophy}
          label="Temporadas"
          value={String(career.timeline.completedSeasons)}
          hint="Completas"
        />
        <StatCard
          icon={UserRound}
          label="Overall"
          value={String(playerOverall(career))}
          hint={career.player.code}
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


      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="panel space-y-5 p-6 lg:col-span-2">
          <h2 className="text-display text-2xl uppercase">Temporada</h2>
          <ProgressBar
            label="Progresso da temporada"
            value={current.week}
            max={WEEKS_PER_SEASON}
          />
          <ProgressBar label="Preparação física" value={62} tone="gold" />
          <ProgressBar label="Moral" value={78} />

          <div>
            <h3 className="mb-3 text-display text-xl uppercase">Histórico</h3>
            <ul className="space-y-2">
              {career.log.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-3"
                >
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-semibold">{entry.title}</p>
                    {entry.description ? (
                      <p className="text-xs text-muted-foreground">
                        {entry.description}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                      {seasonLabel(entry.date)} · semana {entry.date.week}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="panel space-y-3 p-6">
            <h2 className="text-display text-2xl uppercase">Perfil</h2>
            <InfoRow label="Posição" value={positionLabel(career.player.position)} />
            <InfoRow
              label="Pé dominante"
              value={footLabel(career.player.foot)}
              icon={<Footprints className="size-3.5" />}
            />
            <InfoRow label="Nascimento" value={career.player.birthDate} />
            <InfoRow label="ID" value={career.player.id.slice(0, 14) + "…"} />
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
        </aside>
      </section>
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
