import { useMemo, useState } from "react";
import { Handshake, Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { ClubCrest } from "@/components/game/world/ClubCrest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { offerCategoryLabel } from "@/game/ai";
import { approachAssessment, canApproachClub, promotionAssessment } from "@/game/career";
import { useGame } from "@/game/GameProvider";
import { categoryLabel, clubsInEra, type Club } from "@/game/world";

const RESULT_LIMIT = 12;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * The agent's desk: offer the athlete to any club in the world and push the
 * current club for a promotion. Both actions cost the agent's week.
 */
export function AgentDeskPanel() {
  const { career, offerToClub, requestPromotion } = useGame();
  const [query, setQuery] = useState("");

  const clubs = useMemo(
    () => (career ? clubsInEra(career.timeline.current.seasonYear) : []),
    [career],
  );

  const results = useMemo(() => {
    if (!career) return [] as Club[];
    const term = normalize(query.trim());
    const pool = term
      ? clubs.filter(
          (club) =>
            normalize(club.name).includes(term) ||
            normalize(club.shortName).includes(term) ||
            normalize(club.city).includes(term) ||
            normalize(club.country).includes(term),
        )
      : [...clubs].sort((a, b) => b.reputation - a.reputation);
    return pool.slice(0, RESULT_LIMIT);
  }, [career, clubs, query]);

  if (!career) return null;

  const available = canApproachClub(career);
  const promotion = promotionAssessment(career);

  return (
    <section className="mb-6 space-y-4">
      {career.ai.club ? (
        <div className="panel space-y-3 p-6">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="size-4" />
            <span className="text-xs uppercase tracking-[0.25em]">Promoção interna</span>
          </div>
          {promotion ? (
            <>
              <p className="text-sm text-muted-foreground">
                Pedir ao {career.ai.club.clubName} a subida do{" "}
                {categoryLabel(career.ai.club.category)} para o{" "}
                <strong className="text-foreground">{categoryLabel(promotion.target)}</strong>.
                Chance estimada de aceitação: {Math.round(promotion.chance * 100)}%.
              </p>
              <Button
                disabled={!available}
                onClick={() => {
                  const result = requestPromotion();
                  toast[result.granted ? "success" : "error"](result.message);
                }}
              >
                Solicitar promoção
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              O atleta já está na categoria mais alta que o clube possui.
            </p>
          )}
        </div>
      ) : null}

      <div className="panel space-y-4 p-6">
        <div className="flex items-center gap-2 text-primary">
          <Handshake className="size-4" />
          <span className="text-xs uppercase tracking-[0.25em]">Oferecer o atleta</span>
        </div>
        <p className="text-sm text-muted-foreground">
          O empresário pode bater na porta de qualquer clube do mundo — mas só será ouvido
          onde tiver contatos e onde o nome do atleta signifique alguma coisa.
        </p>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar clube, cidade ou país"
            className="pl-9"
          />
        </div>

        {!available ? (
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            O empresário já trabalhou esta semana. Simule o tempo para tentar de novo.
          </p>
        ) : null}

        <div className="grid gap-2">
          {results.map((club) => {
            const assessment = approachAssessment(career, club);
            const blocked = assessment.block !== "none";
            return (
              <article
                key={club.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3"
              >
                <ClubCrest club={club} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{club.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {club.city}/{club.country} · reputação {club.reputation}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-[0.15em]">
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                      Categoria: {offerCategoryLabel(assessment.category, club.country)}
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                      {blocked
                        ? assessment.block === "noAgent"
                          ? "Sem empresário"
                          : "Fora do alcance"
                        : `Chance: ${Math.round(assessment.chance * 100)}%`}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={blocked ? "ghost" : "default"}
                  disabled={!available || blocked}
                  onClick={() => {
                    const result = offerToClub(club);
                    toast[result.opened ? "success" : "error"](result.message);
                  }}
                >
                  Oferecer
                </Button>
              </article>
            );
          })}
          {!results.length ? (
            <p className="text-sm text-muted-foreground">Nenhum clube encontrado.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
