import { CalendarDays, Cake, ChevronsRight, FastForward, Play, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/game/Stats";
import { formatGameDate, seasonLabel } from "@/game/calendar";
import { WEEKS_PER_SEASON } from "@/game/constants";
import type { SimulationScope } from "@/game/simulation";
import type { GameDate } from "@/game/types";

interface TimePanelProps {
  date: GameDate;
  age: number;
  birthDate: string;
  canPlayMatch: boolean;
  busy?: boolean;
  onSimulate: (scope: SimulationScope) => void;
}

/** Time control hub: current date, age, season and the simulation buttons. */
export function TimePanel({
  date,
  age,
  birthDate,
  canPlayMatch,
  busy,
  onSimulate,
}: TimePanelProps) {
  return (
    <section className="panel animate-rise space-y-5 p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <TimeStat
          icon={<CalendarDays className="size-4" />}
          label="Data"
          value={formatGameDate(date)}
          hint={`Semana ${date.week} de ${WEEKS_PER_SEASON}`}
        />
        <TimeStat
          icon={<Cake className="size-4" />}
          label="Idade"
          value={`${age} anos`}
          hint={new Date(`${birthDate}T00:00:00Z`).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })}
        />
        <TimeStat
          icon={<Trophy className="size-4" />}
          label="Temporada"
          value={seasonLabel(date)}
          hint="Calendário automático"
        />
      </div>

      <ProgressBar label="Progresso da temporada" value={date.week} max={WEEKS_PER_SEASON} />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Button
          onClick={() => onSimulate("match")}
          disabled={busy || !canPlayMatch}
          className="text-display justify-center text-base uppercase"
          title={canPlayMatch ? undefined : "É preciso estar em um clube para disputar partidas"}
        >
          <Play className="size-4" /> Próxima partida
        </Button>
        <Button
          variant="secondary"
          onClick={() => onSimulate("week")}
          disabled={busy}
          className="text-display justify-center text-base uppercase"
        >
          <ChevronsRight className="size-4" /> Simular semana
        </Button>
        <Button
          variant="secondary"
          onClick={() => onSimulate("month")}
          disabled={busy}
          className="text-display justify-center text-base uppercase"
        >
          <ChevronsRight className="size-4" />
          <ChevronsRight className="-ml-3 size-4" /> Simular mês
        </Button>
        <Button
          variant="secondary"
          onClick={() => onSimulate("year")}
          disabled={busy}
          className="text-display justify-center text-base uppercase"
          title="Simula a temporada inteira de uma vez"
        >
          <FastForward className="size-4" /> Simular ano
        </Button>
      </div>
      {!canPlayMatch ? (
        <p className="text-xs text-muted-foreground">
          Sem clube: as semanas rendem treinos individuais e convites para peneiras.
        </p>
      ) : null}
    </section>
  );
}

function TimeStat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-display mt-1 text-2xl">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
