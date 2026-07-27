import type { AttributeDefinition, AttributeKey } from "@/game/types";
import { cn } from "@/lib/utils";

function toneFor(value: number) {
  if (value >= 85) return "bg-gradient-gold";
  if (value >= 70) return "bg-gradient-primary";
  if (value >= 50) return "bg-primary/60";
  if (value >= 30) return "bg-muted-foreground/70";
  return "bg-destructive/70";
}

export function AttributeRow({
  definition,
  value,
  highlighted,
}: {
  definition: AttributeDefinition<AttributeKey>;
  value: number;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 transition-colors",
        highlighted && "border-primary/40 bg-primary/5",
      )}
    >
      <span
        className={cn(
          "w-40 shrink-0 truncate text-sm",
          highlighted ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {definition.label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", toneFor(value))}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-display w-9 shrink-0 text-right text-base tabular-nums">
        {value}
      </span>
    </div>
  );
}

export function AttributeGroup({
  title,
  average,
  attributes,
  values,
  highlight,
}: {
  title: string;
  average: number;
  attributes: AttributeDefinition<AttributeKey>[];
  values: Record<AttributeKey, number>;
  highlight: Set<AttributeKey>;
}) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-display text-xl uppercase">{title}</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Média <span className="text-display text-foreground">{average}</span>
        </span>
      </div>
      <div className="space-y-0.5">
        {attributes.map((definition) => (
          <AttributeRow
            key={definition.key}
            definition={definition}
            value={values[definition.key] ?? 0}
            highlighted={highlight.has(definition.key)}
          />
        ))}
      </div>
    </div>
  );
}
