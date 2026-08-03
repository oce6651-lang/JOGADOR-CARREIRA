/** Shared display formatters. Keep every money/number label consistent. */

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function formatMoney(value?: number) {
  if (!value) return "—";
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  if (value >= 10_000) return `R$ ${Math.round(value / 1000)} mil`;
  return currency.format(value);
}

/** Transfer fee label: zero means a free move. */
export function formatFee(value?: number) {
  if (!value) return "Livre";
  return formatMoney(value);
}

export function formatRating(sum: number, appearances: number) {
  if (!appearances) return "—";
  return (sum / appearances).toFixed(2).replace(".", ",");
}

export function formatDelta(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}
