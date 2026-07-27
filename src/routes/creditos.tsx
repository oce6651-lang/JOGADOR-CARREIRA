import { createFileRoute, Link } from "@tanstack/react-router";
import { Code2, Home, Palette, Sparkles } from "lucide-react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { GAME_NAME, SAVE_VERSION } from "@/game/constants";

export const Route = createFileRoute("/creditos")({
  head: () => ({
    meta: [
      { title: "Créditos — Project Football Career" },
      {
        name: "description",
        content:
          "Sobre o Project Football Career: conceito, tecnologia e a base do simulador de carreira.",
      },
      { property: "og:title", content: "Créditos — Project Football Career" },
      {
        property: "og:description",
        content: "Conceito, tecnologia e construção do simulador de carreira.",
      },
    ],
  }),
  component: CreditsPage,
});

const BLOCKS = [
  {
    icon: Sparkles,
    title: "Conceito",
    body: "Simulador de carreira de jogador. Você não controla clubes nem partidas — apenas as decisões de um atleta rumo ao legado.",
  },
  {
    icon: Code2,
    title: "Tecnologia",
    body: "React + TypeScript + Tailwind CSS. Lógica de jogo isolada da interface, entidades com IDs únicos e sistema de save versionado.",
  },
  {
    icon: Palette,
    title: "Design",
    body: "Tema escuro inspirado em noite de estádio: verde gramado, dourado de troféu e tipografia esportiva condensada.",
  },
];

function CreditsPage() {
  return (
    <GameShell>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <Home className="size-3.5" /> Menu principal
      </Link>

      <PageHeader eyebrow="Créditos" title={GAME_NAME} description="Fundação do projeto." />

      <div className="grid gap-3 sm:grid-cols-3">
        {BLOCKS.map((block, index) => (
          <div
            key={block.title}
            className="panel hover-lift animate-rise p-6"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <block.icon className="mb-3 size-6 text-primary" />
            <h2 className="text-display text-2xl uppercase">{block.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{block.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Save v{SAVE_VERSION} · Construído com Lovable
      </p>
    </GameShell>
  );
}
