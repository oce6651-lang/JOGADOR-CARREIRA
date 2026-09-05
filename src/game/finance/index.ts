import { createId } from "../ids";
import type {
  FinanceCategory,
  FinanceTransaction,
  GameDate,
  PlayerFinances,
} from "../types";

/**
 * Personal finances of the athlete. Pure functions only: every mutation
 * returns a brand new PlayerFinances so saves stay immutable and traceable.
 */

/** Keeps the save small while still holding a long, useful history. */
const MAX_TRANSACTIONS = 400;

export function createFinances(): PlayerFinances {
  return { balance: 0, totalEarned: 0, totalSpent: 0, transactions: [] };
}

export function ensureFinances(finances?: PlayerFinances | null): PlayerFinances {
  if (!finances) return createFinances();
  return {
    balance: finances.balance ?? 0,
    totalEarned: finances.totalEarned ?? 0,
    totalSpent: finances.totalSpent ?? 0,
    transactions: finances.transactions ?? [],
  };
}

export interface FinanceEntryInput {
  date: GameDate;
  /** Positive = income, negative = expense. */
  amount: number;
  category: FinanceCategory;
  label: string;
  clubName?: string;
}

export function registerTransaction(
  finances: PlayerFinances,
  entry: FinanceEntryInput,
): PlayerFinances {
  const base = ensureFinances(finances);
  const amount = Math.round(entry.amount);
  if (!amount) return base;

  const transaction: FinanceTransaction = {
    id: createId("fin"),
    date: entry.date,
    amount,
    category: entry.category,
    label: entry.label,
    clubName: entry.clubName,
  };

  return {
    balance: base.balance + amount,
    totalEarned: base.totalEarned + (amount > 0 ? amount : 0),
    totalSpent: base.totalSpent + (amount < 0 ? -amount : 0),
    transactions: [transaction, ...base.transactions].slice(0, MAX_TRANSACTIONS),
  };
}

export function canAfford(finances: PlayerFinances, amount: number) {
  return ensureFinances(finances).balance >= Math.round(amount);
}

export const FINANCE_CATEGORY_LABELS: Record<FinanceCategory, string> = {
  wage: "Salário",
  bonus: "Bônus",
  prize: "Premiação",
  sponsorship: "Patrocínio",
  signing: "Luvas",
  commission: "Comissão do empresário",
  penalty: "Multa",
  other: "Outros",
};
