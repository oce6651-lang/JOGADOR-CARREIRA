import { TrendingDown, TrendingUp } from "lucide-react";

import { attributeLabel } from "@/game/player";
import type { AttributeChange } from "@/game/types";

/** Shared renderer for attribute gains/losses across reports and summaries. */
export function AttributeDeltaList({
  changes,
  emptyLabel = "Nenhum atributo mudou no período.",
}: {
  changes: AttributeChange[];
  emptyLabel?: string;
}) {
  if (!changes.length) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {changes.map((change) => {
        const delta = change.after - change.before;
        const positive = delta > 0;
        return (
          <li
            key={change.key}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
              positive
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            <span className="text-foreground">{attributeLabel(change.key)}</span>
            <span className="font-semibold">
              {change.before} → {change.after}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
