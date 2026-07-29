import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Handshake } from "lucide-react";
import { useEffect, useState } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { OfferCard } from "@/components/game/negotiation/OfferCard";
import { useGame } from "@/game/GameProvider";
import type { NegotiationTopic } from "@/game/types";

export const Route = createFileRoute("/negociacoes")({
  head: () => ({
    meta: [
      { title: "Negociações — Project Football Career" },
      {
        name: "description",
        content:
          "Analise propostas de contrato, renovação, empréstimo e convites de peneira: aceite, negocie ou recuse.",
      },
      { property: "og:title", content: "Negociações — Project Football Career" },
      {
        property: "og:description",
        content: "Cada proposta é decidida por você: salário, duração e papel no elenco.",
      },
    ],
  }),
  component: NegotiationsPage,
});

function NegotiationsPage() {
  const navigate = useNavigate();
  const { career, hydrated, acceptOffer, declineOffer, negotiateOffer } = useGame();
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hydrated && !career) navigate({ to: "/" });
  }, [hydrated, career, navigate]);

  if (!career) {
    return (
      <GameShell>
        <p className="text-sm text-muted-foreground">Carregando carreira...</p>
      </GameShell>
    );
  }

  const offers = career.ai.offers;

  const handleNegotiate = (offerId: string, topic: NegotiationTopic) => {
    const result = negotiateOffer(offerId, topic);
    if (!result) return;
    setFeedback((prev) => ({ ...prev, [offerId]: result.message }));
  };

  return (
    <GameShell>
      <Link
        to="/carreira"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Carreira
      </Link>

      <PageHeader
        eyebrow="Mesa de negociação"
        title="Negociações"
        description="Nenhum contrato é assinado sem a sua palavra. Peça mais salário, mais tempo ou mais espaço no elenco — mas cuidado: clubes desistem."
      />

      {offers.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              elapsedWeeks={career.timeline.elapsedWeeks}
              feedback={feedback[offer.id]}
              onAccept={acceptOffer}
              onDecline={declineOffer}
              onNegotiate={handleNegotiate}
            />
          ))}
        </div>
      ) : (
        <div className="panel flex flex-col items-center gap-3 p-10 text-center">
          <Handshake className="size-8 text-muted-foreground" />
          <p className="text-display text-2xl uppercase">Nenhuma proposta na mesa</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Simule o tempo, mantenha boas atuações e aumente sua reputação. Sem clube? Vá às
            peneiras para forçar uma oportunidade.
          </p>
          <Link to="/peneiras" className="text-sm text-primary hover:underline">
            Ir para peneiras
          </Link>
        </div>
      )}
    </GameShell>
  );
}
