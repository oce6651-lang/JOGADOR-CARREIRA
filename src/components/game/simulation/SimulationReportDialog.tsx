import { Activity, Award, Star, Target, Users } from "lucide-react";

import { EventList } from "@/components/game/events/EventList";
import { AttributeDeltaList } from "@/components/game/simulation/AttributeDeltaList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { seasonLabel } from "@/game/calendar";
import { averageRating } from "@/game/player";
import { injurySeverityLabel } from "@/game/simulation";
import type { SimulationReport } from "@/game/types";

const SCOPE_LABEL: Record<SimulationReport["scope"], string> = {
  match: "Próxima partida",
  week: "Semana simulada",
  month: "Mês simulado",
};

/** Post-simulation digest: what actually happened in the period. */
export function SimulationReportDialog({
  report,
  open,
  onClose,
}: {
  report: SimulationReport | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!report) return null;
  const { stats } = report;
  const overallDelta = report.overallAfter - report.overallBefore;

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-display text-2xl uppercase">
            {SCOPE_LABEL[report.scope]}
          </DialogTitle>
          <DialogDescription>
            {report.weeks} semana(s) · até {seasonLabel(report.to)} · semana {report.to.week}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStat icon={<Activity className="size-3.5" />} label="Treinos" value={String(report.trainings)} />
          <MiniStat icon={<Users className="size-3.5" />} label="Jogos" value={String(stats.appearances)} />
          <MiniStat icon={<Target className="size-3.5" />} label="Gols" value={String(stats.goals)} />
          <MiniStat icon={<Star className="size-3.5" />} label="Assistências" value={String(stats.assists)} />
          <MiniStat
            icon={<Award className="size-3.5" />}
            label="Nota média"
            value={stats.appearances ? averageRating(stats).toFixed(2) : "—"}
          />
          <MiniStat
            icon={<Activity className="size-3.5" />}
            label="Overall"
            value={
              overallDelta === 0
                ? `${report.overallAfter}`
                : `${report.overallBefore} → ${report.overallAfter}`
            }
          />
          <MiniStat label="Idade" value={`${report.ageAfter} anos`} />
          <MiniStat label="Lesões" value={String(report.injuries.length)} />
        </div>

        {report.injuries.length ? (
          <p className="text-sm text-destructive">
            {report.injuries
              .map((injury) => `${injury.name} (${injurySeverityLabel(injury.severity)}, ${injury.weeksOut} sem.)`)
              .join(" · ")}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma lesão no período.</p>
        )}

        <section>
          <h3 className="mb-2 text-display text-lg uppercase">Evolução</h3>
          <AttributeDeltaList changes={report.attributeChanges} />
        </section>

        <section>
          <h3 className="mb-2 text-display text-lg uppercase">Acontecimentos</h3>
          <EventList events={report.events} showDate={false} />
        </section>

        <DialogFooter>
          <Button onClick={onClose} className="text-display uppercase">
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-display text-xl">{value}</p>
    </div>
  );
}
