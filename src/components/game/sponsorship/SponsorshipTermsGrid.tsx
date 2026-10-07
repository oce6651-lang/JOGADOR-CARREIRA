import { formatMoney } from "@/game/format";
import type { SponsorshipTerms } from "@/game/types";

export function SponsorshipTermsGrid({ terms }: { terms: SponsorshipTerms }) {
  const rows = [
    ["Por temporada", formatMoney(terms.seasonalFee)],
    ["Por gol", formatMoney(terms.goalBonus)],
    ["Por título", formatMoney(terms.titleBonus)],
    ["Por convocação", formatMoney(terms.callUpBonus)],
  ];
  return <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
    {rows.map(([label, value]) => <div key={label}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-semibold text-foreground">{value}</dd>
    </div>)}
  </dl>;
}