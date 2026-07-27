import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

import type { Competition } from "@/game/world";
import { FORMAT_LABELS, SCOPE_LABELS, categoryLabel } from "@/game/world";
import { cn } from "@/lib/utils";

/** Competition entry with a coloured spine matching the trophy identity. */
export function CompetitionCard({ competition }: { competition: Competition }) {
  const planned = competition.status === "planned";

  const inner = (
    <>
      <span
        className="h-full w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: competition.colors.primary }}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="text-display block truncate text-xl uppercase">
          {competition.name}
        </span>
        <span className="block text-xs text-muted-foreground">
          {SCOPE_LABELS[competition.scope]} · {FORMAT_LABELS[competition.format]} ·{" "}
          {categoryLabel(competition.category)}
        </span>
      </span>
      <span className="text-right">
        {planned ? (
          <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Em breve
          </span>
        ) : (
          <>
            <span className="text-display block text-2xl">
              {competition.clubIds.length}
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
              Clubes
            </span>
          </>
        )}
      </span>
    </>
  );

  const className = cn(
    "panel flex items-stretch gap-4 p-4 transition-all",
    planned ? "opacity-55" : "hover:-translate-y-0.5 hover:border-primary/60",
  );

  if (planned) {
    return (
      <div className={className}>
        <Trophy className="sr-only" />
        {inner}
      </div>
    );
  }

  return (
    <Link
      to="/mundo/competicao/$competitionSlug"
      params={{ competitionSlug: competition.slug }}
      className={className}
    >
      {inner}
    </Link>
  );
}
