import { Award, CalendarCheck, Flag, Stethoscope, Target, Trophy, Users } from "lucide-react";

import { AttributeDeltaList } from "@/components/game/simulation/AttributeDeltaList";
import { StatCard } from "@/components/game/Stats";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { averageRating } from "@/game/player";
import { injurySeverityLabel } from "@/game/simulation";
import type { SeasonSummary } from "@/game/types";

/** End-of-season review — one of the most important screens of the game. */
export function SeasonSummaryDialog({
  summary,
  open,
  onClose,
}: {
  summary: SeasonSummary | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!summary) return null;
  const overallDelta = summary.overallEnd - summary.overallStart;
  const { stats } = summary;

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Fim de temporada
          </p>
          <DialogTitle className="text-display text-3xl uppercase">
            {summary.seasonYear}/{String((summary.seasonYear + 1) % 100).padStart(2, "0")}
          </DialogTitle>
          <DialogDescription>
            {summary.clubName ?? "Sem clube"}
            {summary.category ? ` · ${summary.category}` : ""} · {summary.ageStart} →{" "}
            {summary.ageEnd} anos
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={CalendarCheck} label="Idade" value={`${summary.ageEnd}`} hint="Anos" />
          <StatCard
            icon={Trophy}
            label="Overall"
            value={String(summary.overallEnd)}
            hint={
              overallDelta === 0
                ? "Sem alteração"
                : `${overallDelta > 0 ? "+" : ""}${overallDelta} na temporada`
            }
          />
          <StatCard icon={Users} label="Jogos" value={String(stats.appearances)} />
          <StatCard icon={Target} label="Gols" value={String(stats.goals)} />
          <StatCard icon={Users} label="Assistências" value={String(stats.assists)} />
          <StatCard
            icon={Award}
            label="Nota média"
            value={stats.appearances ? averageRating(stats).toFixed(2) : "—"}
          />
          <StatCard
            icon={Stethoscope}
            label="Lesões"
            value={String(summary.injuries.length)}
          />
          <StatCard icon={Flag} label="Convocações" value={String(summary.callUps.length)} />
        </div>

        <section>
          <h3 className="mb-2 text-display text-lg uppercase">Evolução dos atributos</h3>
          <AttributeDeltaList
            changes={summary.attributeChanges}
            emptyLabel="Nenhum atributo mudou nesta temporada."
          />
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <ListBlock
            title="Títulos"
            items={summary.titles.map((title) => `${title.competition}`)}
            empty="Nenhum título."
          />
          <ListBlock
            title="Prêmios individuais"
            items={summary.awards.map((award) => award.name)}
            empty="Nenhum prêmio."
          />
          <ListBlock
            title="Lesões"
            items={summary.injuries.map(
              (injury) => `${injury.name} · ${injurySeverityLabel(injury.severity)}`,
            )}
            empty="Nenhuma lesão."
          />
        </div>

        <section className="rounded-xl border border-border bg-secondary/40 p-4">
          <h3 className="mb-2 text-display text-lg uppercase">Resumo</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {summary.highlights.map((highlight) => (
              <li key={highlight}>• {highlight}</li>
            ))}
            <li>
              •{" "}
              {summary.categoryChange
                ? `Mudança de categoria: ${summary.categoryChange}.`
                : "Sem mudança de categoria."}
            </li>
          </ul>
        </section>

        <DialogFooter>
          <Button onClick={onClose} className="text-display uppercase">
            Iniciar nova temporada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ListBlock({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <h4 className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h4>
      {items.length ? (
        <ul className="space-y-1 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}
