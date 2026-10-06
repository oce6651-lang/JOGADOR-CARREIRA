import { Crown, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/game/format";
import type { GalaAward } from "@/game/types";

/** Award-by-award reveal of the end-of-season gala. */
export function GalaCeremony({ awards }: { awards: GalaAward[] }) {
  const wins = awards.filter((award) => award.isPlayer).length;
  return (
    <section className="rounded-xl border border-primary/40 bg-primary/5 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-display text-lg uppercase">
          <Crown className="h-5 w-5 text-primary" /> Gala de fim de temporada
        </h3>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {wins ? `${wins} prêmio(s) para você` : "Sem prêmios desta vez"}
        </span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {awards.map((award, index) => (
          <li
            key={award.key + award.label}
            style={{ animationDelay: `${index * 120}ms` }}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-2 fill-mode-both rounded-lg border p-3",
              award.isPlayer ? "border-primary bg-primary/15" : "border-border bg-secondary/30",
            )}
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {award.label}
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-semibold">
              {award.isPlayer ? <Star className="h-4 w-4 fill-primary text-primary" /> : null}
              {award.winnerName}
            </p>
            <p className="text-xs text-muted-foreground">
              {award.clubName}
              {award.value !== undefined ? ` · ${award.value}` : ""}
              {award.isPlayer && award.prize > 0 ? ` · +${formatMoney(award.prize)}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
