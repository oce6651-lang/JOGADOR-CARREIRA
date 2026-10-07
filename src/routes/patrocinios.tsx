import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock3, Handshake, Shirt, Wallet, X } from "lucide-react";
import { useEffect } from "react";
import { GameShell, PageHeader } from "@/components/game/GameShell";
import { SponsorshipTermsGrid } from "@/components/game/sponsorship/SponsorshipTermsGrid";
import { StatCard } from "@/components/game/Stats";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/GameProvider";
import { formatMoney } from "@/game/format";
import { eligibleSponsorBrands, ensureSponsorships } from "@/game/sponsorships";

export const Route = createFileRoute("/patrocinios")({
  head: () => ({ meta: [
    { title: "Patrocínios — Project Football Career" },
    { name: "description", content: "Propostas de marcas esportivas, contratos e bônus de patrocínio da carreira." },
    { property: "og:title", content: "Patrocínios — Project Football Career" },
    { property: "og:description", content: "Acompanhe acordos de material esportivo e as receitas comerciais do atleta." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SponsorshipsPage,
});

const dateLabel = (date: string) => date.split("-").reverse().join("/");

function SponsorshipsPage() {
  const { career, hydrated, acceptSponsorOffer, declineSponsorOffer } = useGame();
  const navigate = useNavigate();
  useEffect(() => { if (hydrated && !career) navigate({ to: "/" }); }, [hydrated, career, navigate]);
  if (!career) return <GameShell><p className="text-sm text-muted-foreground">Carregando carreira...</p></GameShell>;
  const state = ensureSponsorships(career.sponsorships);
  const active = state.contracts.find((contract) => contract.status === "active");
  const offers = state.offers.filter((offer) => offer.expiresWeek > career.timeline.elapsedWeeks);
  const eligible = eligibleSponsorBrands(career);
  const past = state.contracts.filter((contract) => contract.status !== "active");
  return <GameShell>
    <Button variant="link" asChild className="mb-5 px-0 text-muted-foreground"><Link to="/carreira"><ArrowLeft /> Carreira</Link></Button>
    <PageHeader eyebrow={career.sport === "futsal" ? "Material de quadra" : "Material de campo"} title="Patrocínios" />
    <div className="mb-8 grid gap-3 sm:grid-cols-3">
      <StatCard icon={Shirt} label="Marca atual" value={active?.brandName ?? "Sem patrocínio"} />
      <StatCard icon={Wallet} label="Recebido em acordos" value={formatMoney(state.contracts.reduce((sum, contract) => sum + contract.totalReceived, 0))} />
      <StatCard icon={Handshake} label="Propostas" value={String(offers.length)} />
    </div>
    {active ? <section className="mb-8 border-y border-border py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs uppercase text-primary">Contrato ativo</p><h2 className="mt-2 text-display text-4xl">{active.brandName}</h2></div>
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" /> Até {dateLabel(active.endDate)}</span>
      </div>
      <SponsorshipTermsGrid terms={active.terms} />
      <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">Assinado em {dateLabel(active.signedDate)}</span>
        <span>Recebido: <strong className="text-primary">{formatMoney(active.totalReceived)}</strong></span>
      </div>
    </section> : null}
    {!active && career.status !== "retired" ? <section className="mb-8">
      <h2 className="mb-4 text-display text-2xl">Propostas de material esportivo</h2>
      {offers.length ? <div className="grid gap-4 md:grid-cols-2">{offers.map((offer) => {
        const canAccept = eligible.some((brand) => brand.id === offer.brandId);
        return <article key={offer.id} className="rounded-lg border border-border bg-card p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs text-muted-foreground">{offer.terms.seasons} anos · acordo exclusivo</p><h3 className="mt-2 text-display text-3xl">{offer.brandName}</h3></div>
            <Shirt className="size-6 text-gold" />
          </div>
          <SponsorshipTermsGrid terms={offer.terms} />
          <p className="mt-5 text-xs text-muted-foreground">Proposta válida por mais {offer.expiresWeek - career.timeline.elapsedWeeks} semana(s)</p>
          {!canAccept ? <p className="mt-2 text-xs text-destructive">Seu clube ou reputação não atende mais aos requisitos da marca.</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => acceptSponsorOffer(offer.id)} disabled={!canAccept}><Check /> Assinar com {offer.brandName}</Button>
            <Button variant="outline" onClick={() => declineSponsorOffer(offer.id)}><X /> Recusar</Button>
          </div>
        </article>;
      })}</div> : <div className="flex items-center gap-4 border-y border-border py-8 text-muted-foreground"><Handshake className="size-7 shrink-0" /><p>{!career.ai.club ? "Sem propostas · atleta sem clube" : "Nenhuma proposta comercial no momento"}</p></div>}
    </section> : null}
    <section className="mb-6">
      <h2 className="mb-4 text-display text-2xl">Histórico de acordos</h2>
      {past.length ? <div className="divide-y divide-border">{past.map((contract) => <div key={contract.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div><h3 className="text-display text-xl">{contract.brandName}</h3><p className="text-xs text-muted-foreground">{dateLabel(contract.signedDate)} — {dateLabel(contract.endDate)} · {contract.status === "retired" ? "Encerrado por aposentadoria" : "Concluído"}</p></div>
        <span className="font-mono text-sm text-primary">{formatMoney(contract.totalReceived)}</span>
      </div>)}</div> : <p className="text-sm text-muted-foreground">Nenhum acordo encerrado.</p>}
    </section>
    <Button variant="outline" asChild><Link to="/financas"><Wallet /> Ver extrato financeiro</Link></Button>
  </GameShell>;
}