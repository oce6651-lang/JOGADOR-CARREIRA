import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Home, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGame } from "@/game/GameProvider";
import { isDeveloper } from "@/game/dev";
import { ATTRIBUTE_CATEGORIES, clampAttribute } from "@/game/player/attributes";
import { removeStatus } from "@/game/player/status";
import { toast } from "sonner";
import type { AttributeKey } from "@/game/types";

export const Route = createFileRoute("/desenvolvedor")({
  head: () => ({
    meta: [
      { title: "Modo Desenvolvedor — Project Football Career" },
      {
        name: "description",
        content: "Ferramentas internas para editar atributos, reputação e economia da carreira.",
      },
      { property: "og:title", content: "Modo Desenvolvedor" },
      { property: "og:description", content: "Ferramentas internas de edição da carreira." },
    ],
  }),
  component: DeveloperPage,
});

function DeveloperPage() {
  const navigate = useNavigate();
  const { career, hydrated, updateCareer } = useGame();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(isDeveloper());
  }, []);

  useEffect(() => {
    if (hydrated && !career) navigate({ to: "/" });
  }, [hydrated, career, navigate]);

  if (!allowed) {
    return (
      <GameShell>
        <PageHeader
          eyebrow="Acesso restrito"
          title="Modo Desenvolvedor"
          description="Esta área está disponível apenas para a conta autorizada."
        />
        <Link to="/configuracoes" className="text-sm text-primary">
          Voltar às configurações
        </Link>
      </GameShell>
    );
  }

  if (!career) {
    return (
      <GameShell>
        <p className="text-sm text-muted-foreground">Carregando carreira...</p>
      </GameShell>
    );
  }

  const setAttribute = (key: AttributeKey, value: number) =>
    updateCareer((current) => ({
      ...current,
      player: {
        ...current.player,
        attributes: Object.fromEntries(
          Object.entries(current.player.attributes).map(([group, values]) => [
            group,
            key in (values as Record<string, number>)
              ? { ...(values as Record<string, number>), [key]: clampAttribute(value) }
              : values,
          ]),
        ) as typeof current.player.attributes,
      },
    }));

  return (
    <GameShell>
      <Link
        to="/configuracoes"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <Home className="size-3.5" /> Configurações
      </Link>

      <PageHeader
        eyebrow="Ferramentas internas"
        title="Modo Desenvolvedor"
        description="Alterações aplicadas diretamente na carreira salva. Use com cuidado."
      />

      <section className="panel mb-6 space-y-3 p-5">
        <h2 className="text-display text-xl uppercase">Ações rápidas</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              updateCareer((current) => ({
                ...current,
                player: {
                  ...current.player,
                  statuses: removeStatus(current.player.statuses, "injured"),
                },
              }));
              toast.success("Lesões removidas.");
            }}
          >
            Curar lesões
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              updateCareer((current) => ({
                ...current,
                ai: { ...current.ai, morale: 100, fitness: 100, coachTrust: 100 },
              }));
              toast.success("Moral, forma e confiança no máximo.");
            }}
          >
            Recuperação total
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              updateCareer((current) => ({
                ...current,
                player: {
                  ...current.player,
                  hidden: { ...current.player.hidden, potential: 99, growthRate: 1.35 },
                },
              }));
              toast.success("Potencial máximo aplicado.");
            }}
          >
            Potencial máximo
          </Button>
          <Button variant="outline" onClick={() => shiftAllAttributes(5)}>
            Atributos +5
          </Button>
          <Button variant="outline" onClick={() => shiftAllAttributes(-5)}>
            Atributos -5
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              updateCareer((current) => ({
                ...current,
                ai: { ...current.ai, reputation: 100 },
              }));
              toast.success("Reputação máxima.");
            }}
          >
            Reputação máxima
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Os limites de overall por idade continuam válidos até os 16 anos.
        </p>
      </section>

      <section className="panel mb-6 grid gap-4 p-5 sm:grid-cols-3">
        <Field
          label="Potencial oculto"
          value={career.player.hidden.potential}
          onChange={(value) =>
            updateCareer((current) => ({
              ...current,
              player: {
                ...current.player,
                hidden: { ...current.player.hidden, potential: clampAttribute(value) },
              },
            }))
          }
        />
        <Field
          label="Reputação"
          value={career.ai.reputation}
          onChange={(value) =>
            updateCareer((current) => ({
              ...current,
              ai: { ...current.ai, reputation: Math.max(0, Math.min(100, value)) },
            }))
          }
        />
        <Field
          label="Moral"
          value={career.ai.morale}
          onChange={(value) =>
            updateCareer((current) => ({
              ...current,
              ai: { ...current.ai, morale: Math.max(0, Math.min(100, value)) },
            }))
          }
        />
        <Field
          label="Forma física"
          value={career.ai.fitness}
          onChange={(value) =>
            updateCareer((current) => ({
              ...current,
              ai: { ...current.ai, fitness: Math.max(0, Math.min(100, value)) },
            }))
          }
        />
        <Field
          label="Confiança do treinador"
          value={career.ai.coachTrust}
          onChange={(value) =>
            updateCareer((current) => ({
              ...current,
              ai: { ...current.ai, coachTrust: Math.max(0, Math.min(100, value)) },
            }))
          }
        />
        {career.ai.club ? (
          <Field
            label="Salário semanal"
            value={career.ai.club.weeklyWage}
            step={100}
            onChange={(value) =>
              updateCareer((current) => ({
                ...current,
                ai: current.ai.club
                  ? { ...current.ai, club: { ...current.ai.club, weeklyWage: Math.max(0, value) } }
                  : current.ai,
              }))
            }
          />
        ) : null}
      </section>

      <h2 className="text-display mb-3 text-xl uppercase">Atributos</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {ATTRIBUTE_CATEGORIES.map((group) => (
          <div key={group.id} className="panel space-y-3 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <ShieldCheck className="size-3.5" /> {group.label}
            </p>
            {group.attributes.map((attribute) => (
              <Field
                key={attribute.key}
                label={attribute.label}
                value={
                  (career.player.attributes as unknown as Record<string, Record<string, number>>)[
                    group.id
                  ][attribute.key]
                }
                onChange={(value) => setAttribute(attribute.key, value)}
              />
            ))}
          </div>
        ))}
      </div>
    </GameShell>
  );
}

function Field({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-8 w-24 text-right"
      />
    </div>
  );
}
