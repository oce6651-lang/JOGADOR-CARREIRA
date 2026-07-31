import { CalendarClock, Handshake, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClubCrest } from "@/components/game/world/ClubCrest";
import { OFFER_LABELS, TOPIC_LABELS, offerCategoryLabel, roleLabel, weeksLeft } from "@/game/ai";
import { getClub } from "@/game/world";
import type { ClubOffer, NegotiationTopic } from "@/game/types";

const TOPICS: NegotiationTopic[] = ["wage", "seasons", "role"];

interface OfferCardProps {
  offer: ClubOffer;
  elapsedWeeks: number;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
  onNegotiate: (offerId: string, topic: NegotiationTopic) => void;
  feedback?: string;
}

/** A proposal on the table: accept, counter or refuse. Never automatic. */
export function OfferCard({
  offer,
  elapsedWeeks,
  onAccept,
  onDecline,
  onNegotiate,
  feedback,
}: OfferCardProps) {
  const club = getClub(offer.clubId);
  const left = weeksLeft(offer, elapsedWeeks);

  return (
    <article className="panel space-y-4 p-5">
      <header className="flex items-start gap-3">
        {club ? <ClubCrest club={club} className="size-11 shrink-0" /> : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">
            {OFFER_LABELS[offer.kind]}
          </p>
          <h3 className="text-display text-2xl uppercase leading-tight">{offer.clubName}</h3>
          <p className="text-xs text-muted-foreground">
            {club ? `${club.city}/${club.country}` : "Clube"} · reputação {offer.clubReputation}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
            Categoria: {offerCategoryLabel(offer.category, club?.country)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
          <CalendarClock className="size-3" />
          {left} sem.
        </span>
      </header>

      <p className="text-sm text-muted-foreground">{offer.message}</p>

      {offer.kind === "trial" ? null : (
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Term label="Salário" value={`R$ ${offer.terms.weeklyWage.toLocaleString("pt-BR")}/sem`} />
          <Term label="Duração" value={`${offer.terms.seasons} temporada(s)`} />
          <Term label="Papel" value={roleLabel(offer.terms.role)} />
          <Term
            label="Luvas"
            value={offer.terms.signingBonus ? `R$ ${offer.terms.signingBonus.toLocaleString("pt-BR")}` : "—"}
          />
        </dl>
      )}

      {feedback ? (
        <p className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground">
          {feedback}
        </p>
      ) : null}

      {offer.kind !== "trial" ? (
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Negociar · rodada {offer.rounds}/{offer.maxRounds}
            {offer.finalOffer ? " · proposta final" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => (
              <Button
                key={topic}
                size="sm"
                variant="secondary"
                disabled={offer.finalOffer || offer.rounds >= offer.maxRounds}
                onClick={() => onNegotiate(offer.id, topic)}
              >
                <TrendingUp className="mr-1 size-3.5" />
                {TOPIC_LABELS[topic]}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => onAccept(offer.id)}>
          <Handshake className="mr-1.5 size-4" />
          {offer.kind === "trial" ? "Aceitar convite" : "Assinar"}
        </Button>
        <Button variant="ghost" onClick={() => onDecline(offer.id)}>
          Recusar
        </Button>
      </div>
    </article>
  );
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}
