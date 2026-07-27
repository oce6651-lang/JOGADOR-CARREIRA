import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

interface MenuCardProps {
  to: "/" | "/novo-jogo" | "/carreira" | "/configuracoes" | "/creditos";
  icon: LucideIcon;
  title: string;
  description: string;
  disabled?: boolean;
  accent?: "primary" | "gold" | "neutral";
  delay?: number;
}

/** Big touch-friendly main-menu entry. */
export function MenuCard({
  to,
  icon: Icon,
  title,
  description,
  disabled,
  accent = "neutral",
  delay = 0,
}: MenuCardProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl border border-border",
          accent === "primary" && "bg-gradient-primary text-primary-foreground border-transparent",
          accent === "gold" && "bg-gradient-gold text-gold-foreground border-transparent",
          accent === "neutral" && "bg-secondary text-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-display block text-2xl uppercase">{title}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </>
  );

  const base =
    "panel hover-lift flex w-full items-center gap-4 p-5 text-left animate-rise";

  if (disabled) {
    return (
      <div
        style={{ animationDelay: `${delay}ms` }}
        className={cn(base, "cursor-not-allowed opacity-40 hover:translate-y-0")}
        aria-disabled
      >
        {content}
      </div>
    );
  }

  return (
    <Link to={to} style={{ animationDelay: `${delay}ms` }} className={base}>
      {content}
    </Link>
  );
}
