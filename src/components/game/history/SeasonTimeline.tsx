import { TrendingDown, TrendingUp } from "lucide-react";

import { formatMoney, formatRating } from "@/game/format";
import { cn } from "@/lib/utils";
import type { SeasonRecord } from "@/game/types";

/**
 * Football Manager style career table: one row per season, with everything
 * that matters — club, category, competition, age, output and value.
 */
export function SeasonTimeline({ seasons }: { seasons: SeasonRecord[] }) {
  if (!seasons.length) {
    return (
      <p className="panel p-6 text-sm text-muted-foreground">
        Nenhuma temporada concluída ainda. Simule o tempo para construir seu histórico.
      </p>
    );
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <Th className="text-left">Temp.</Th>
            <Th className="text-left">Clube</Th>
            <Th className="text-left">Categoria</Th>
            <Th className="text-left">Competição</Th>
            <Th>Idade</Th>
            <Th>J</Th>
            <Th>G</Th>
            <Th>A</Th>
            <Th>Nota</Th>
            <Th>Overall</Th>
            <Th className="text-right">Valor</Th>
          </tr>
        </thead>
        <tbody>
          {seasons.map((season) => {
            const delta = season.overallEnd - season.overallStart;
            return (
              <tr
                key={season.id}
                className="border-b border-border/50 last:border-0 hover:bg-secondary/40"
              >
                <Td className="text-left font-semibold">{season.seasonYear}</Td>
                <Td className="text-left">{season.clubName ?? "Sem clube"}</Td>
                <Td className="text-left text-muted-foreground">{season.category ?? "—"}</Td>
                <Td
                  className="text-left text-muted-foreground"
                  title={season.competitions?.join(" · ")}
                >
                  {season.competitions?.length
                    ? season.competitions.slice(0, 2).join(", ") +
                      (season.competitions.length > 2 ? ` +${season.competitions.length - 2}` : "")
                    : (season.competitionName ?? "—")}
                </Td>
                <Td>{season.age ?? "—"}</Td>
                <Td>{season.stats.appearances}</Td>
                <Td className="font-semibold text-primary">{season.stats.goals}</Td>
                <Td>{season.stats.assists}</Td>
                <Td>{formatRating(season.stats.ratingSum, season.stats.appearances)}</Td>
                <Td>
                  <span className="inline-flex items-center gap-1">
                    {season.overallEnd}
                    {delta !== 0 ? (
                      <span
                        className={cn(
                          "inline-flex items-center text-xs",
                          delta > 0 ? "text-primary" : "text-destructive",
                        )}
                      >
                        {delta > 0 ? (
                          <TrendingUp className="size-3" />
                        ) : (
                          <TrendingDown className="size-3" />
                        )}
                        {Math.abs(delta)}
                      </span>
                    ) : null}
                  </span>
                </Td>
                <Td className="text-right">{formatMoney(season.marketValue)}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-3 py-3 text-center font-semibold", className)}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-2.5 text-center", className)}>{children}</td>;
}
