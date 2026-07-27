import {
  ArrowUpRight,
  Award,
  Cake,
  CalendarCheck,
  CalendarPlus,
  Dumbbell,
  FileSignature,
  Flag,
  HeartPulse,
  Medal,
  Palmtree,
  Repeat,
  Search,
  Shirt,
  Sparkles,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { seasonLabel } from "@/game/calendar";
import { eventDefinition } from "@/game/events";
import { cn } from "@/lib/utils";
import type { GameEvent, GameEventTone, GameEventType } from "@/game/types";

const ICONS: Record<string, LucideIcon> = {
  Dumbbell,
  Shirt,
  Target,
  Stethoscope,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Cake,
  Search,
  Repeat,
  FileSignature,
  Flag,
  Trophy,
  Award,
  ArrowUpRight,
  CalendarPlus,
  CalendarCheck,
  Palmtree,
  Medal,
  Sparkles,
};

const TONE_CLASSES: Record<GameEventTone, string> = {
  neutral: "bg-secondary text-muted-foreground",
  info: "bg-primary/15 text-primary",
  positive: "bg-emerald-500/15 text-emerald-400",
  warning: "bg-amber-500/15 text-amber-400",
  danger: "bg-destructive/15 text-destructive",
};

export function eventIcon(type: GameEventType): LucideIcon {
  return ICONS[eventDefinition(type).icon] ?? Sparkles;
}

export function EventBadge({ type, tone }: { type: GameEventType; tone: GameEventTone }) {
  const Icon = eventIcon(type);
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
        TONE_CLASSES[tone],
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}

export function EventItem({ event, showDate = true }: { event: GameEvent; showDate?: boolean }) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-3">
      <EventBadge type={event.type} tone={event.tone} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{event.title}</p>
        {event.description ? (
          <p className="break-words text-xs text-muted-foreground">{event.description}</p>
        ) : null}
        {showDate ? (
          <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
            {eventDefinition(event.type).label} · {seasonLabel(event.date)} · semana{" "}
            {event.date.week}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function EventList({
  events,
  emptyLabel = "Nenhum evento registrado ainda.",
  showDate = true,
  className,
}: {
  events: GameEvent[];
  emptyLabel?: string;
  showDate?: boolean;
  className?: string;
}) {
  if (!events.length) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <ul className={cn("space-y-2", className)}>
      {events.map((event) => (
        <EventItem key={event.id} event={event} showDate={showDate} />
      ))}
    </ul>
  );
}
