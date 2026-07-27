import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import { ClubCrest } from "./ClubCrest";
import { categoryLabel } from "@/game/world";
import type { Club } from "@/game/world";
import { FINANCE_LABELS, reputationLabel } from "@/game/world";
import { cn } from "@/lib/utils";

/** Compact club entry used across competition and country listings. */
export function ClubCard({ club, className }: { club: Club; className?: string }) {
  return (
    <Link
      to="/mundo/clube/$clubSlug"
      params={{ clubSlug: club.slug }}
      className={cn(
        "panel group flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/60",
        className,
      )}
    >
      <ClubCrest club={club} />
      <div className="min-w-0 flex-1">
        <p className="text-display truncate text-xl uppercase">{club.shortName}</p>
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {club.city} — {club.state}
        </p>
        <p className="mt-1 truncate text-[11px] uppercase tracking-widest text-muted-foreground">
          {reputationLabel(club.reputation)} · {FINANCE_LABELS[club.financeLevel]} ·{" "}
          {categoryLabel(club.entryCategory)}+
        </p>
      </div>
      <div className="text-right">
        <p className="text-display text-2xl text-primary">{club.reputation}</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Reputação
        </p>
      </div>
    </Link>
  );
}
