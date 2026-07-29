import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Flag } from "lucide-react";
import { useEffect } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import {
  LEVEL_LABELS,
  eligibleLevel,
  nationalTeamName,
  reputationLabel,
} from "@/game/ai";
import { playerAge } from "@/game/career";
import { useGame } from "@/game/GameProvider";

export const Route = createFileRoute("/selecoes")({
  head: () => ({
    meta: [
      { title: "Seleções — Project Football Career" },
      {
        name: "description",
        content:
          "Acompanhe convocações, jogos e gols pela seleção: do Sub-15 à seleção principal, tudo por mérito.",
      },
      { property: "og:title", content: "Seleções — Project Football Career" },
      {
        property: "og:description",
        content: "Convocações dependem apenas do seu desempenho e da sua reputação.",
      },
    ],
  }),
  component: NationalTeamPage,
});

function NationalTeamPage() {
  const navigate = useNavigate();
  const { career, hydrated } = useGame();

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

  const callUps = career.player.history.callUps;
  const eligible = eligibleLevel(playerAge(career), career.ai.reputation);
  const totals = callUps.reduce(
    (acc, record) => ({ caps: acc.caps + record.caps, goals: acc.goals + record.goals }),
    { caps: 0, goals: 0 },
  );

  return (
    <GameShell>
      <Link
        to="/carreira"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Carreira
      </Link>

      <PageHeader
        eyebrow={nationalTeamName(career.player.nationality)}
        title="Seleções"
        description="A comissão da seleção observa minutos, notas e gols. Nada é roteirizado: entregue em campo e o convite chega."
      />

      <div className="panel mb-4 grid gap-2 p-6 sm:grid-cols-3">
        <Info label="Reputação" value={reputationLabel(career.ai.reputation)} />
        <Info
          label="Nível atual"
          value={career.ai.nationalTeamLevel ? LEVEL_LABELS[career.ai.nationalTeamLevel] : "Nunca convocado"}
        />
        <Info
          label="Elegível hoje"
          value={eligible ? LEVEL_LABELS[eligible] : "Abaixo do exigido"}
        />
      </div>

      {callUps.length ? (
        <>
          <div className="panel mb-4 grid gap-2 p-6 sm:grid-cols-2">
            <Info label="Jogos pela seleção" value={String(totals.caps)} />
            <Info label="Gols pela seleção" value={String(totals.goals)} />
          </div>
          <ul className="grid gap-3">
            {callUps.map((record) => (
              <li key={record.id} className="panel flex items-center gap-4 p-4">
                <Flag className="size-5 text-primary" />
                <div className="flex-1">
                  <p className="text-display text-lg uppercase leading-tight">
                    {LEVEL_LABELS[record.level]} · {record.seasonYear}
                  </p>
                  <p className="text-xs text-muted-foreground">{record.nationalTeam}</p>
                </div>
                <p className="text-sm">
                  {record.caps} jogo(s) · {record.goals} gol(s)
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="panel p-8 text-center">
          <p className="text-display text-2xl uppercase">Nenhuma convocação ainda</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Jogue com regularidade, mantenha notas altas e a reputação sobe até o radar da seleção.
          </p>
        </div>
      )}
    </GameShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
