import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  CalendarDays,
  Fingerprint,
  Flag,
  Footprints,
  Heart,
  Home,
  Repeat,
  Ruler,
  Shirt,
  Sparkles,
  Stethoscope,
  Target,
  Trophy,
  Users,
  Wallet,
  Weight,
} from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { AttributeGroup } from "@/components/game/player/AttributeGrid";
import { EmptySection } from "@/components/game/player/EmptySection";
import { StatCard } from "@/components/game/Stats";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatGameDate, seasonLabel } from "@/game/calendar";
import { playerAge } from "@/game/career";
import { footLabel, nationalityLabel, positionLabel } from "@/game/constants";
import { useGame } from "@/game/GameProvider";
import {
  ATTRIBUTE_CATEGORIES,
  averageRating,
  calculateOverall,
  categoryAverage,
  flattenAttributes,
  keyAttributes,
  primaryStatus,
  STATUS_LABELS,
} from "@/game/player";
import type { AttributeKey } from "@/game/types";

export const Route = createFileRoute("/jogador")({
  head: () => ({
    meta: [
      { title: "Ficha do jogador — Project Football Career" },
      {
        name: "description",
        content:
          "Ficha completa do atleta: dados pessoais, atributos técnicos, mentais e físicos, personalidade, estatísticas e histórico de carreira.",
      },
      { property: "og:title", content: "Ficha do jogador — Project Football Career" },
      {
        property: "og:description",
        content:
          "Atributos, personalidade, estatísticas e histórico permanente do seu atleta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayerPage,
});

function PlayerPage() {
  const navigate = useNavigate();
  const { career, hydrated } = useGame();

  useEffect(() => {
    if (hydrated && !career) navigate({ to: "/" });
  }, [hydrated, career, navigate]);

  if (!career) {
    return (
      <GameShell>
        <p className="text-sm text-muted-foreground">Carregando jogador...</p>
      </GameShell>
    );
  }

  const { player } = career;
  const overall = calculateOverall(player.attributes, player.position);
  const values = flattenAttributes(player.attributes);
  const highlight = new Set<AttributeKey>(keyAttributes(player.position, 6));
  const status = primaryStatus(player.statuses);
  const totals = player.history.totals;

  return (
    <GameShell>
      <Link
        to="/carreira"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <Home className="size-3.5" /> Painel da carreira
      </Link>

      <PageHeader
        eyebrow={`${player.code} · Temporada ${seasonLabel(career.timeline.current)}`}
        title={player.fullName}
        description={`${positionLabel(player.position)} · ${playerAge(career)} anos · ${nationalityLabel(player.nationality)}`}
      />

      <section className="panel animate-rise mb-4 flex flex-wrap items-center gap-6 p-6">
        <div className="flex size-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-primary">
          <span className="text-display text-4xl leading-none text-primary-foreground">
            {overall}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/80">
            Overall
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="uppercase tracking-widest">
              {STATUS_LABELS[status].label}
            </Badge>
            <Badge variant="outline">{player.position}</Badge>
            {player.secondaryPositions.map((code) => (
              <Badge key={code} variant="outline" className="opacity-60">
                {code}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {player.personality.map((trait) => (
              <span
                key={trait.id}
                title={trait.description}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs"
              >
                <Sparkles className="size-3 text-primary" />
                {trait.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {ATTRIBUTE_CATEGORIES.map((category) => (
            <div key={category.id} className="rounded-xl bg-secondary/50 px-4 py-3">
              <p className="text-display text-2xl">
                {categoryAverage(player.attributes, category.id)}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {category.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Tabs defaultValue="info" className="animate-rise">
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary/50 p-1">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="attributes">Atributos</TabsTrigger>
          <TabsTrigger value="career">Carreira</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="grid gap-4 lg:grid-cols-2">
          <div className="panel space-y-3 p-6">
            <h3 className="text-display text-xl uppercase">Dados pessoais</h3>
            <InfoRow icon={Fingerprint} label="Identificador" value={player.code} />
            <InfoRow icon={Shirt} label="Nome" value={player.firstName} />
            <InfoRow icon={Shirt} label="Sobrenome" value={player.lastName} />
            <InfoRow icon={Shirt} label="Nome completo" value={player.fullName} />
            <InfoRow
              icon={CalendarDays}
              label="Nascimento"
              value={new Date(`${player.birthDate}T00:00:00Z`).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })}
            />
            <InfoRow icon={Heart} label="Idade" value={`${playerAge(career)} anos`} />
            <InfoRow
              icon={Flag}
              label="Nacionalidade"
              value={nationalityLabel(player.nationality)}
            />
            <InfoRow icon={Flag} label="País" value={nationalityLabel(player.country)} />
          </div>

          <div className="panel space-y-3 p-6">
            <h3 className="text-display text-xl uppercase">Perfil técnico</h3>
            <InfoRow
              icon={Target}
              label="Posição principal"
              value={positionLabel(player.position)}
            />
            <InfoRow
              icon={Repeat}
              label="Posições secundárias"
              value={
                player.secondaryPositions.length
                  ? player.secondaryPositions.map(positionLabel).join(", ")
                  : "Nenhuma"
              }
            />
            <InfoRow
              icon={Footprints}
              label="Pé dominante"
              value={footLabel(player.foot)}
            />
            <InfoRow icon={Ruler} label="Altura" value={`${player.heightCm} cm`} />
            <InfoRow icon={Weight} label="Peso" value={`${player.weightKg} kg`} />
            <InfoRow
              icon={Trophy}
              label="Overall atual"
              value={String(overall)}
            />
            <InfoRow
              icon={CalendarDays}
              label="Data no jogo"
              value={formatGameDate(career.timeline.current)}
            />
          </div>
        </TabsContent>

        <TabsContent value="attributes" className="grid gap-4 lg:grid-cols-3">
          {ATTRIBUTE_CATEGORIES.map((category) => (
            <AttributeGroup
              key={category.id}
              title={category.label}
              average={categoryAverage(player.attributes, category.id)}
              attributes={category.attributes}
              values={values}
              highlight={highlight}
            />
          ))}
          <p className="text-xs text-muted-foreground lg:col-span-3">
            Atributos destacados são os mais importantes para {positionLabel(player.position)}.
          </p>
        </TabsContent>

        <TabsContent value="career" className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={Shirt}
              label="Clubes"
              value={String(player.history.clubs.length)}
              hint="Passagens registradas"
            />
            <StatCard
              icon={CalendarDays}
              label="Temporadas"
              value={String(player.history.seasons.length)}
              hint="Disputadas"
            />
            <StatCard
              icon={Repeat}
              label="Transferências"
              value={String(player.history.transfers.length)}
            />
          </div>
          {player.history.clubs.length ? (
            <HistoryList
              title="Passagens por clubes"
              items={player.history.clubs.map((spell) => ({
                id: spell.id,
                title: `${spell.clubName} · ${spell.category}`,
                detail: `${spell.from.date} — ${spell.to?.date ?? "atual"} · ${SPELL_LABELS[spell.type]}`,
              }))}
            />
          ) : (
            <EmptySection
              icon={Shirt}
              title="Ainda sem clube"
              description="Quando o atleta entrar em um clube, cada passagem, categoria de base e empréstimo aparecerá aqui permanentemente."
            />
          )}
          {player.history.transfers.length ? (
            <HistoryList
              title="Transferências"
              items={player.history.transfers.map((transfer) => ({
                id: transfer.id,
                title: `${transfer.fromClub ?? "Sem clube"} → ${transfer.toClub}`,
                detail: `${transfer.date.date} · ${transfer.type}`,
              }))}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="stats" className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Shirt} label="Jogos" value={String(totals.appearances)} />
            <StatCard icon={Target} label="Gols" value={String(totals.goals)} />
            <StatCard icon={Users} label="Assistências" value={String(totals.assists)} />
            <StatCard
              icon={Award}
              label="Nota média"
              value={averageRating(totals).toFixed(2)}
            />
            <StatCard icon={CalendarDays} label="Minutos" value={String(totals.minutes)} />
            <StatCard
              icon={Flag}
              label="Cartões amarelos"
              value={String(totals.yellowCards)}
            />
            <StatCard icon={Flag} label="Cartões vermelhos" value={String(totals.redCards)} />
            <StatCard
              icon={Trophy}
              label="Jogos sem sofrer gol"
              value={String(totals.cleanSheets)}
            />
          </div>
          <EmptySection
            icon={Target}
            title="Nenhuma partida disputada"
            description="As estatísticas serão acumuladas automaticamente a cada partida simulada da carreira."
          />
        </TabsContent>

        <TabsContent value="history" className="grid gap-4 md:grid-cols-2">
          <HistoryBlock
            icon={Trophy}
            title="Títulos"
            empty="Cada taça conquistada ficará registrada para sempre."
            items={player.history.titles.map((item) => ({
              id: item.id,
              title: item.competition,
              detail: `${item.seasonYear}${item.clubName ? ` · ${item.clubName}` : ""}`,
            }))}
          />
          <HistoryBlock
            icon={Award}
            title="Prêmios individuais"
            empty="Prêmios de melhor jogador e artilharia aparecerão aqui."
            items={player.history.awards.map((item) => ({
              id: item.id,
              title: item.name,
              detail: String(item.seasonYear),
            }))}
          />
          <HistoryBlock
            icon={Users}
            title="Convocações"
            empty="Convocações para as seleções serão listadas aqui."
            items={player.history.callUps.map((item) => ({
              id: item.id,
              title: `${item.nationalTeam} ${item.level}`,
              detail: `${item.seasonYear} · ${item.caps} jogo(s) · ${item.goals} gol(s)`,
            }))}
          />
          <HistoryBlock
            icon={Stethoscope}
            title="Lesões"
            empty="Todo o histórico médico do atleta aparecerá aqui."
            items={player.history.injuries.map((item) => ({
              id: item.id,
              title: item.name,
              detail: `${item.date.date} · ${item.weeksOut} semana(s) fora`,
            }))}
          />
          <HistoryBlock
            icon={Wallet}
            title="Salários e valor de mercado"
            empty="A evolução financeira será registrada temporada após temporada."
            items={[
              ...player.history.salaries.map((item) => ({
                id: item.id,
                title: `R$ ${item.amount.toLocaleString("pt-BR")}/semana`,
                detail: `${item.date.date}${item.clubName ? ` · ${item.clubName}` : ""}`,
              })),
              ...player.history.marketValues.map((item) => ({
                id: `mv-${item.date.date}`,
                title: `Valor de mercado: R$ ${item.value.toLocaleString("pt-BR")}`,
                detail: item.date.date,
              })),
            ]}
          />
          <HistoryBlock
            icon={Sparkles}
            title="Evolução de overall"
            empty="O overall de cada temporada ficará salvo para comparação."
            items={player.history.overallBySeason.map((item) => ({
              id: `ov-${item.seasonYear}`,
              title: `Temporada ${item.seasonYear}`,
              detail: `Overall ${item.overall} · ${item.age} anos`,
            }))}
          />
        </TabsContent>
      </Tabs>
    </GameShell>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flag;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2 text-sm last:border-0 last:pb-0">
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

const SPELL_LABELS: Record<"youth" | "permanent" | "loan", string> = {
  youth: "Base",
  permanent: "Contrato",
  loan: "Empréstimo",
};

interface HistoryItem {
  id: string;
  title: string;
  detail: string;
}

/** Permanent archive list — every career record is rendered the same way. */
function HistoryList({ title, items }: { title: string; items: HistoryItem[] }) {
  return (
    <section className="panel space-y-3 p-6">
      <h3 className="text-display text-xl uppercase">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2"
          >
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HistoryBlock({
  icon,
  title,
  empty,
  items,
}: {
  icon: LucideIcon;
  title: string;
  empty: string;
  items: HistoryItem[];
}) {
  if (!items.length) {
    return <EmptySection icon={icon} title={title} description={empty} />;
  }
  return <HistoryList title={title} items={items} />;
}
