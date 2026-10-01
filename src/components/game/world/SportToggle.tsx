import { SPORTS } from "@/game/constants";
import type { Sport } from "@/game/types";
import { cn } from "@/lib/utils";

/** Football / futsal switch shared by every world-browsing screen. */
export function SportToggle({ value, onChange }: { value: Sport; onChange: (sport: Sport) => void }) {
  return (
    <div className="mb-5 inline-flex rounded-xl border border-border bg-secondary/40 p-1">
      {SPORTS.map((sport) => (
        <button
          key={sport.value}
          type="button"
          onClick={() => onChange(sport.value)}
          className={cn(
            "rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors",
            value === sport.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {sport.label}
        </button>
      ))}
    </div>
  );
}
