import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Globe2, Play, Settings, Sparkles, Trophy } from "lucide-react";

import { GameShell } from "@/components/game/GameShell";
import { FolderOpen } from "lucide-react";
import { MenuCard } from "@/components/game/MenuCard";
import { GAME_NAME, positionLabel } from "@/game/constants";
import { playerAge, playerFullName } from "@/game/career";
import { seasonLabel } from "@/game/calendar";
import { useGame } from "@/game/GameProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Football Career — Simulador de Carreira de Futebol" },
      {
        name: "description",
        content:
          "Viva a carreira de um jogador de futebol: decisões, temporadas, títulos e legado até a aposentadoria.",
      },
      { property: "og:title", content: "Project Football Career" },
      {
        property: "og:description",
        content:
          "Simulador de carreira de futebol: comece sem clube e construa um legado temporada após temporada.",
      },
    ],
  }),
  component: MainMenu,
});

function MainMenu() {
  const { career, hydrated, saves } = useGame();

  return (
    <GameShell className="flex min-h-screen flex-col justify-center">
      <div className="mb-10 animate-rise text-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          <Gamepad2 className="size-3.5" /> Temporada 01
        </p>
        <h1 className="text-display text-6xl uppercase leading-none sm:text-8xl">
          Project
          <span className="block bg-gradient-primary bg-clip-text text-transparent">
            Football Career
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Uma carreira. Um jogador. Cada decisão conta.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-xl gap-3">
        <MenuCard
          to="/novo-jogo"
          icon={Play}
          title="Novo Jogo"
          description="Crie seu jogador e comece do zero"
          accent="primary"
          delay={60}
        />
        <MenuCard
          to="/carreira"
          icon={Trophy}
          title="Continuar"
          description={
            hydrated && career
              ? `${playerFullName(career)} · ${positionLabel(career.player.position)} · ${playerAge(career)} anos · ${seasonLabel(career.timeline.current)}`
              : "Nenhuma carreira salva encontrada"
          }
          accent="gold"
          disabled={!hydrated || !career}
          delay={120}
        />
        <MenuCard
          to="/carreiras"
          icon={FolderOpen}
          title="Carreiras Salvas"
          description={
            hydrated && saves.length
              ? `${saves.length} carreira(s) neste dispositivo`
              : "Gerencie e retome seus saves"
          }
          delay={150}
        />
        <MenuCard
          to="/mundo"
          icon={Globe2}
          title="Mundo do Futebol"
          description="Clubes, ligas e competições"
          delay={180}
        />
        <MenuCard
          to="/configuracoes"
          icon={Settings}
          title="Configurações"
          description="Áudio, animações e salvamento"
          delay={300}
        />

        <MenuCard
          to="/creditos"
          icon={Sparkles}
          title="Créditos"
          description="Sobre o projeto e sua construção"
          delay={300}
        />
      </div>

      <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {GAME_NAME} · Fundação v1 ·{" "}
        <Link to="/creditos" className="text-primary hover:underline">
          Saiba mais
        </Link>
      </p>
    </GameShell>
  );
}
