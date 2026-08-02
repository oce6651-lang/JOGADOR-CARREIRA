import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Home, Play, Plus, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { Button } from "@/components/ui/button";
import { positionLabel } from "@/game/constants";
import { useGame } from "@/game/GameProvider";

export const Route = createFileRoute("/carreiras")({
  head: () => ({
    meta: [
      { title: "Carreiras Salvas — Project Football Career" },
      {
        name: "description",
        content:
          "Todas as carreiras salvas neste dispositivo: continue de onde parou ou comece uma nova história.",
      },
      { property: "og:title", content: "Carreiras Salvas" },
      {
        property: "og:description",
        content: "Gerencie seus saves e retome qualquer carreira quando quiser.",
      },
    ],
  }),
  component: SavesPage,
});

function SavesPage() {
  const navigate = useNavigate();
  const { saves, hydrated, loadSave, deleteSave, career } = useGame();

  return (
    <GameShell>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <Home className="size-3.5" /> Menu principal
      </Link>

      <PageHeader
        eyebrow="Arquivo de saves"
        title="Carreiras salvas"
        description="Cada carreira é guardada em um espaço próprio e mantém todo o histórico, mesmo após a aposentadoria."
        action={
          <Button onClick={() => navigate({ to: "/novo-jogo" })} className="gap-2">
            <Plus className="size-4" /> Nova carreira
          </Button>
        }
      />

      {!hydrated ? (
        <p className="text-sm text-muted-foreground">Carregando saves...</p>
      ) : saves.length === 0 ? (
        <p className="panel p-6 text-sm text-muted-foreground">
          Nenhuma carreira salva ainda. Crie seu jogador para começar.
        </p>
      ) : (
        <div className="grid gap-3">
          {saves.map((save) => (
            <div
              key={save.id}
              className="panel flex flex-wrap items-center justify-between gap-4 p-5"
            >
              <div>
                <p className="text-display text-2xl uppercase">
                  {save.playerName}
                  {career?.id === save.id ? (
                    <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                      Em jogo
                    </span>
                  ) : null}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {positionLabel(save.position)} · {save.age} anos · Overall {save.overall ?? "—"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {save.clubName
                    ? `${save.clubName}${save.category ? ` · ${save.category}` : ""}`
                    : save.status === "retired"
                      ? "Aposentado"
                      : "Sem clube"}{" "}
                  · Temporada {save.seasonYear}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    if (loadSave(save.id)) navigate({ to: "/carreira" });
                    else toast.error("Não foi possível abrir este save.");
                  }}
                >
                  <Play className="size-4" /> Continuar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Excluir carreira de ${save.playerName}`}
                  onClick={() => {
                    deleteSave(save.id);
                    toast.success("Carreira excluída.");
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
        <UserRound className="size-3.5" /> {saves.length} carreira(s) neste dispositivo
      </p>
    </GameShell>
  );
}
