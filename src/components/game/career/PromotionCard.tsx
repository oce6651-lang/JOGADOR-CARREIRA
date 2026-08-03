import { ArrowUpRight, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PendingPromotion } from "@/game/types";

interface PromotionCardProps {
  promotion: PendingPromotion;
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * The athlete only changes category consciously: the club invites, the
 * player decides. Mandatory invitations mean leaving the club when refused.
 */
export function PromotionCard({ promotion, onAccept, onDecline }: PromotionCardProps) {
  return (
    <section className="panel animate-rise mt-4 space-y-4 border-primary/50 p-5">
      <div className="flex items-start gap-3">
        {promotion.mandatory ? (
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
        ) : (
          <ArrowUpRight className="mt-0.5 size-5 shrink-0 text-primary" />
        )}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Decisão de categoria
          </p>
          <h3 className="text-display text-xl uppercase">
            Subir para o {promotion.categoryLabel}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{promotion.message}</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button onClick={onAccept} className="text-display justify-center uppercase">
          Aceitar subida
        </Button>
        <Button
          variant="secondary"
          onClick={onDecline}
          className="text-display justify-center uppercase"
        >
          {promotion.mandatory ? "Recusar e sair do clube" : "Continuar na categoria"}
        </Button>
      </div>
    </section>
  );
}
