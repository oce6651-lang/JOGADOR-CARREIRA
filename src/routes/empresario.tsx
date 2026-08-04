import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, UserRoundCheck } from "lucide-react";
import { useEffect } from "react";

import { AgentDeskPanel } from "@/components/game/agent/AgentDeskPanel";
import { GameShell, PageHeader } from "@/components/game/GameShell";
import { Button } from "@/components/ui/button";
import { agentMarket, netWage, reputationLabel } from "@/game/ai";
import { ageAt } from "@/game/calendar";
import { calculateOverall } from "@/game/player";
import { useGame } from "@/game/GameProvider";

export const Route = createFileRoute("/empresario")({
  head: () => ({
    meta: [
      { title: "Empresário — Project Football Career" },
      {
        name: "description",
        content:
          "Contrate um empresário para conseguir peneiras melhores, salários maiores e mais poder de negociação.",
      },
      { property: "og:title", content: "Empresário — Project Football Career" },
      {
        property: "og:description",
        content: "Escolha quem representa o atleta e quanto ele leva de cada salário.",
      },
    ],
  }),
  component: AgentPage,
});

function AgentPage() {
  const navigate = useNavigate();
  const { career, hydrated, hireAgent, dismissAgent } = useGame();

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

  const current = career.ai.agent;
  const market = agentMarket({
    player: career.player,
    ai: career.ai,
    overall: calculateOverall(career.player.attributes, career.player.position),
    age: ageAt(career.player.birthDate, career.timeline.current),
    totals: career.player.history.totals,
    spells: career.player.history.clubs.length,
  });
  const options = market.filter((entry) => entry.interested).map((entry) => entry.template);
  const refused = market.filter((entry) => !entry.interested);
  const wage = career.ai.club?.weeklyWage ?? 0;

  return (
    <GameShell>
      <Link
        to="/carreira"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Carreira
      </Link>

      <PageHeader
        eyebrow={`Reputação: ${reputationLabel(career.ai.reputation)}`}
        title="Empresário"
        description="Um bom empresário melhora as propostas, aumenta as rodadas de negociação e abre portas em clubes maiores."
      />

      {current ? (
        <div className="panel mb-4 space-y-3 p-6">
          <div className="flex items-center gap-2 text-primary">
            <UserRoundCheck className="size-4" />
            <span className="text-xs uppercase tracking-[0.25em]">Representante atual</span>
          </div>
          <p className="text-display text-3xl uppercase">{current.name}</p>
          <p className="text-sm text-muted-foreground">{current.description}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Info label="Qualidade" value={`${current.quality}/100`} />
            <Info label="Comissão" value={`${current.commission}%`} />
            <Info
              label="Salário líquido"
              value={wage ? `R$ ${netWage(wage, current).toLocaleString("pt-BR")}/sem` : "—"}
            />
          </div>
          <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={dismissAgent}>
            Dispensar empresário
          </Button>
        </div>
      ) : null}

      <AgentDeskPanel />

      <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Empresários disponíveis
      </p>
      <div className="grid gap-3">
        {options
          .filter((agent) => agent.name !== current?.name)
          .map((agent) => (
            <article key={agent.name} className="panel flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="text-display text-xl uppercase leading-tight">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.description}</p>
              </div>
              <div className="flex gap-2 text-xs">
                <Info label="Qualidade" value={`${agent.quality}`} />
                <Info label="Comissão" value={`${agent.commission}%`} />
              </div>
              <Button onClick={() => hireAgent(agent)}>
                <BadgeCheck className="mr-1.5 size-4" /> Contratar
              </Button>
            </article>
          ))}
      </div>

      {options.length <= (current ? 1 : 0) ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Aumente sua reputação em campo para atrair empresários mais influentes.
        </p>
      ) : null}
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
