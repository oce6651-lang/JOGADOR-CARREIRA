import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GameShellProps {
  children: ReactNode;
  className?: string;
}

/** Standard page frame: centered column with generous stadium-night spacing. */
export function GameShell({ children, className }: GameShellProps) {
  return (
    <main className={cn("mx-auto w-full max-w-5xl px-5 py-10 sm:py-14", className)}>
      {children}
    </main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-display text-4xl uppercase sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
