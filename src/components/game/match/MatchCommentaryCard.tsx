import { useState } from "react";
import { ChevronDown, Flag, Goal, Hand, Repeat, Sparkles, Star, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { isStandoutMatch } from "@/game/simulation/narration";
import type { MatchHighlightKind, MatchRecord } from "@/game/types";
import { cn } from "@/lib/utils";

const ICONS: Record<MatchHighlightKind, typeof Goal> = {
  goal: Goal,
  assist: Target,
  teamGoal: Goal,
  concede: Goal,
  chance: Sparkles,
  save: Hand,
  sub: Repeat,
  final: Flag,
};

/** One played match with its scoreline and expandable text commentary. */
export function MatchCommentaryCard({ match, defaultOpen = false }: { match: MatchRecord; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const highlights = match.highlights ?? [];
  const result = match.scoreFor > match.scoreAgainst ? "V" : match.scoreFor < match.scoreAgainst ? "D" : "E";
  const standout = isStandoutMatch(match);

  return (
    <div className={cn("rounded-lg border bg-card", standout ? "border-primary/60" : "border-border")}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={!highlights.length}
        className="flex w-full items-center gap-3 p-3 text-left disabled:cursor-default"
      >
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md text-sm font-bold",
            result === "V" && "bg-primary/20 text-primary",
            result === "E" && "bg-secondary text-foreground",
            result === "D" && "bg-destructive/20 text-destructive",
          )}
        >
          {result}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {match.scoreFor} x {match.scoreAgainst} · {match.opponent}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {match.competition} · {match.minutes} min · {match.goals}G {match.assists}A
          </p>
        </div>
        {standout ? (
          <Badge className="gap-1"><Star className="size-3" />Destaque</Badge>
        ) : null}
        <span className="text-display text-lg">{match.rating.toFixed(1)}</span>
        {highlights.length ? (
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        ) : null}
      </button>
      {open && highlights.length ? (
        <ol className="space-y-1.5 border-t border-border p-3">
          {highlights.map((item, index) => {
            const Icon = ICONS[item.kind];
            return (
              <li key={`${item.minute}-${index}`} className="flex items-start gap-2 text-sm animate-in fade-in">
                <span className="w-8 shrink-0 text-right font-mono text-xs text-muted-foreground">{item.minute}'</span>
                <Icon
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0",
                    item.involvesPlayer ? "text-primary" : item.kind === "concede" ? "text-destructive" : "text-muted-foreground",
                  )}
                />
                <span className={cn(item.involvesPlayer && "font-medium")}>{item.text}</span>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}
