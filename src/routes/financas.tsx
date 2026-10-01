import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { StatCard } from "@/components/game/Stats";
import { FINANCE_CATEGORY_LABELS, ensureFinances } from "@/game/finance";
import { formatMoney } from "@/game/format";
import { useGame } from "@/game/GameProvider";
import type { FinanceCategory } from "@/game/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/financas")({
  head: () => ({
    meta: [
      { title: "Finanças — Project Football Career" },
      { name: "description", content: "Saldo, receitas, despesas e extrato completo da carreira do atleta." },
      { property: "og:title", content: "Finanças — Project Football Career" },
      { property: "og:description", content: "Acompanhe salários, bônus, prêmios e multas do seu jogador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FinancePage,
});

type Filter = "all" | FinanceCategory;

function FinancePage() {
  const navigate = useNavigate();
  const { career, hydrated } = useGame();
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (hydrated && !career) navigate({ to: "/" });
  }, [hydrated, career, navigate]);

  const finances = ensureFinances(career?.finances);
  const byCategory = useMemo(() => {
    const totals = new Map<FinanceCategory, number>();
    for (const t of finances.transactions) totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
    return [...totals.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  }, [finances.transactions]);
  const rows = finances.transactions.filter((t) => filter === "all" || t.category === filter);

  if (!career) {
    return (
      <GameShell>
        <p className="text-sm text-muted-foreground">Carregando carreira...</p>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <Link
        to="/carreira"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Carreira
      </Link>
      <PageHeader eyebrow="Finanças pessoais" title="Saldo e extrato" description="Tudo o que o atleta recebeu e gastou na carreira." />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Saldo atual" value={formatMoney(finances.balance)} />
        <StatCard icon={ArrowUpRight} label="Total recebido" value={formatMoney(finances.totalEarned)} />
        <StatCard icon={ArrowDownRight} label="Total gasto" value={formatMoney(finances.totalSpent)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>Tudo</FilterChip>
        {byCategory.map(([category, total]) => (
          <FilterChip key={category} active={filter === category} onClick={() => setFilter(category)}>
            {FINANCE_CATEGORY_LABELS[category]} · {formatMoney(total)}
          </FilterChip>
        ))}
      </div>

      <div className="panel divide-y divide-border">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Nenhuma transação registrada ainda.</p>
        ) : (
          rows.map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.label}</p>
                <p className="text-xs text-muted-foreground">
                  {t.date.date.split("-").reverse().join("/")} · {FINANCE_CATEGORY_LABELS[t.category]}
                  {t.clubName ? ` · ${t.clubName}` : ""}
                </p>
              </div>
              <span className={cn("font-mono text-sm font-bold", t.amount >= 0 ? "text-primary" : "text-destructive")}>
                {t.amount >= 0 ? "+" : "−"}
                {formatMoney(Math.abs(t.amount))}
              </span>
            </div>
          ))
        )}
      </div>
    </GameShell>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? "border-primary bg-primary/15 text-primary" : "bg-secondary/40 hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}
