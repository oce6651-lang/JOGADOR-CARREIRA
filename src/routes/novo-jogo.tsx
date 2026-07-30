import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ageAt } from "@/game/calendar";
import {
  FEET,
  MAX_START_AGE,
  MIN_START_AGE,
  NATIONALITIES,
  POSITIONS,
} from "@/game/constants";
import { useGame } from "@/game/GameProvider";
import type { Foot, PositionCode } from "@/game/types";

export const Route = createFileRoute("/novo-jogo")({
  head: () => ({
    meta: [
      { title: "Novo Jogo — Project Football Career" },
      {
        name: "description",
        content:
          "Crie seu atleta: nome, data de nascimento, nacionalidade, posição e pé dominante.",
      },
      { property: "og:title", content: "Novo Jogo — Project Football Career" },
      {
        property: "og:description",
        content: "Crie seu atleta e comece uma nova carreira sem clube.",
      },
    ],
  }),
  component: NewGamePage,
});

const nameField = z
  .string()
  .trim()
  .min(2, "Mínimo de 2 caracteres")
  .max(30, "Máximo de 30 caracteres");

/** Month/day are cosmetic — generated so the player only picks the age. */
function generateBirthDate(startYear: number, age: number) {
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  const year = startYear - age;
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function NewGamePage() {
  const navigate = useNavigate();
  const { startNewCareer } = useGame();

  const years = useMemo(() => {
    const last = maxStartYear();
    return Array.from({ length: last - MIN_START_YEAR + 1 }, (_, i) => last - i);
  }, []);
  const ages = useMemo(
    () =>
      Array.from(
        { length: MAX_START_AGE - MIN_START_AGE + 1 },
        (_, i) => MIN_START_AGE + i,
      ),
    [],
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [startYear, setStartYear] = useState(maxStartYear());
  const [startAge, setStartAge] = useState(15);
  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("BRA");
  const [position, setPosition] = useState<PositionCode>("ST");
  const [foot, setFoot] = useState<Foot>("right");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = useMemo(
    () =>
      z.object({
        firstName: nameField,
        lastName: nameField,
        birthDate: z
          .string()
          .refine(
            (value) => !value || !Number.isNaN(Date.parse(value)),
            "Data inválida",
          ),
      }),
    [],
  );

  const resolvedBirthDate = birthDate || generateBirthDate(startYear, startAge);
  const age = birthDate ? ageAt(birthDate, `${startYear}-01-08`) : startAge;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = schema.safeParse({ firstName, lastName, birthDate });

    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }
      setErrors(next);
      return;
    }

    if (age < MIN_START_AGE || age > MAX_START_AGE) {
      setErrors({
        birthDate: `A idade deve estar entre ${MIN_START_AGE} e ${MAX_START_AGE} anos`,
      });
      return;
    }

    setErrors({});
    startNewCareer({
      firstName,
      lastName,
      birthDate: resolvedBirthDate,
      nationality,
      position,
      foot,
      startYear,
    });
    navigate({ to: "/carreira" });
  }


  return (
    <GameShell>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Menu principal
      </Link>

      <PageHeader
        eyebrow="Novo jogo"
        title="Crie seu jogador"
        description="Defina quem é o atleta. A carreira começa sem clube — o resto você conquista."
      />

      <form onSubmit={handleSubmit} className="panel animate-rise space-y-6 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome" error={errors.firstName}>
            <Input
              value={firstName}
              maxLength={30}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex.: Gabriel"
            />
          </Field>

          <Field label="Sobrenome" error={errors.lastName}>
            <Input
              value={lastName}
              maxLength={30}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ex.: Andrade"
            />
          </Field>

          <Field
            label="Data de nascimento"
            error={errors.birthDate}
            hint={
              age !== null && !Number.isNaN(age)
                ? `${age} anos`
                : `Idade permitida: ${MIN_START_AGE} a ${MAX_START_AGE} anos`
            }
          >
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </Field>

          <Field label="Nacionalidade">
            <Select value={nationality} onValueChange={setNationality}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NATIONALITIES.map((n) => (
                  <SelectItem key={n.code} value={n.code}>
                    {n.flag} {n.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Posição">
            <Select
              value={position}
              onValueChange={(value) => setPosition(value as PositionCode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.code} · {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Pé dominante">
            <Select value={foot} onValueChange={(value) => setFoot(value as Foot)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEET.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            A carreira é salva automaticamente ao ser criada.
          </p>
          <Button type="submit" size="lg" className="text-display text-lg uppercase">
            Começar carreira
          </Button>
        </div>
      </form>
    </GameShell>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
