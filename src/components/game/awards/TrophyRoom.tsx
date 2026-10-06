import { Award, Globe2, Medal, Shield, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { EmptySection } from "@/components/game/player/EmptySection";
import type { AwardRecord, PlayerHistory } from "@/game/types";

const SCOPE_ICON: Record<AwardRecord["scope"], LucideIcon> = {
  club: Shield,
  league: Medal,
  continental: Award,
  world: Globe2,
};

interface Shelf {
  name: string;
  count: number;
  seasons: number[];
  detail?: string;
  icon: LucideIcon;
}

function groupBy<T>(items: T[], key: (item: T) => string, build: (items: T[]) => Shelf): Shelf[] {
  const map = new Map<string, T[]>();
  for (const item of items) map.set(key(item), [...(map.get(key(item)) ?? []), item]);
  return [...map.values()].map(build).sort((a, b) => b.count - a.count);
}

/** Trophy cabinet: every title and individual award, grouped and counted. */
export function TrophyRoom({ history }: { history: PlayerHistory }) {
  const titles = groupBy(history.titles, (t) => t.competition, (items) => ({
    name: items[0].competition,
    count: items.length,
    seasons: items.map((t) => t.seasonYear).sort(),
    detail: [...new Set(items.map((t) => t.clubName).filter(Boolean))].join(", "),
    icon: Trophy,
  }));
  const awards = groupBy(history.awards, (a) => a.name, (items) => ({
    name: items[0].name,
    count: items.length,
    seasons: items.map((a) => a.seasonYear).sort(),
    icon: SCOPE_ICON[items[0].scope],
  }));

  if (!titles.length && !awards.length) {
    return (
      <EmptySection
        icon={Trophy}
        title="Sala de troféus vazia"
        description="Títulos e prêmios da gala de fim de temporada ficarão expostos aqui para sempre."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <ShelfGrid title={`Títulos coletivos · ${history.titles.length}`} shelves={titles} />
      <ShelfGrid title={`Prêmios individuais · ${history.awards.length}`} shelves={awards} />
    </div>
  );
}

function ShelfGrid({ title, shelves }: { title: string; shelves: Shelf[] }) {
  if (!shelves.length) return null;
  return (
    <section>
      <h3 className="mb-3 text-display text-lg uppercase">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shelves.map((shelf) => (
          <article
            key={shelf.name}
            className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-2">
              <shelf.icon className="h-8 w-8 text-primary" />
              <span className="text-display text-3xl text-primary">{shelf.count}×</span>
            </div>
            <p className="mt-2 font-semibold leading-tight">{shelf.name}</p>
            {shelf.detail ? <p className="text-xs text-muted-foreground">{shelf.detail}</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">{shelf.seasons.join(" · ")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
