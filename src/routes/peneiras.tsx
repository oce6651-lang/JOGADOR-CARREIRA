import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { ClubCrest } from "@/components/game/world/ClubCrest";
import { Button } from "@/components/ui/button";
import { canAttendTrial, careerTrials, playerOverall } from "@/game/career";
import { useGame } from "@/game/GameProvider";
import { categoryLabel } from "@/game/world";
import type { TrialOpportunity } from "@/game/ai";

export const Route = createFileRoute("/peneiras")({
  head: () => ({
    meta: [
      { title: "Peneiras — Project Football Career" },
      {
        name: "description",
        content:
          "Escolha um clube, participe da peneira e conquiste seu primeiro contrato profissional ou de base.",
      },
      { property: "og:title", content: "Peneiras — Project Football Career" },
      {
        property: "og:description",
        content: "Sem clube? Vá às peneiras e mostre seu futebol para conquistar uma vaga.",
      },
    ],
  }),
  component: TrialsPage,
});

function TrialsPage() {
  const navigate = useNavigate();
  const { career, hydrated, attendTrial } = useGame();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !career) navigate({ to: "/" });
  }, [hydrated, career, navigate]);

  const opportunities = useMemo(() => (career ? careerTrials(career) : []), [career]);

  if (!career) {
    return (
      <GameShell>
        <p className="text-sm text-muted-foreground">Carregando carreira...</p>
      </GameShell>
    );
  }

  const available = canAttendTrial(career);

  const handleAttend = (opportunity: TrialOpportunity) => {
    const approved = attendTrial(opportunity);
    setMessage(
      approved
        ? `Aprovado no ${opportunity.club.name}! A proposta está em Negociações.`
        : `O ${opportunity.club.name} não aprovou o atleta desta vez. Simule uma semana e tente novamente.`,
    );
  };

  return (
    <GameShell>
      <Link
        to="/carreira"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Carreira
      </Link>

      <PageHeader
        eyebrow={`Overall ${playerOverall(career)} · Reputação ${Math.round(career.ai.reputation)}`}
        title="Peneiras"
        description="Uma peneira por semana. Clubes maiores exigem mais, mas abrem portas muito melhores."
      />

      {message ? (
        <p className="panel mb-4 p-4 text-sm">{message}</p>
      ) : null}

      {career.ai.club ? (
        <div className="panel p-8 text-center">
          <p className="text-display text-2xl uppercase">Você já tem clube</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Peneiras são exclusivas para atletas sem contrato.
          </p>
        </div>
      ) : !opportunities.length ? (
        <div className="panel p-8 text-center">
          <p className="text-display text-2xl uppercase">Nenhuma peneira aberta</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Treine, simule algumas semanas e volte: novas vagas aparecem conforme o calendário.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {!available ? (
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Já testou nesta semana — simule o tempo para tentar de novo.
            </p>
          ) : null}
          {opportunities.map((opportunity) => (
            <article
              key={opportunity.club.id}
              className="panel flex flex-wrap items-center gap-4 p-5"
            >
              <ClubCrest club={opportunity.club} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-display text-xl uppercase leading-tight">
                  {opportunity.club.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {categoryLabel(opportunity.category)} · {opportunity.club.city} · reputação{" "}
                  {opportunity.club.reputation}
                </p>
              </div>
              <div className="w-32">
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Chance estimada
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-primary"
                    style={{ width: `${Math.round(opportunity.successChance * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs font-semibold">
                  {Math.round(opportunity.successChance * 100)}%
                </p>
              </div>
              <Button disabled={!available} onClick={() => handleAttend(opportunity)}>
                <Target className="mr-1.5 size-4" /> Participar
              </Button>
            </article>
          ))}
        </div>
      )}
    </GameShell>
  );
}
