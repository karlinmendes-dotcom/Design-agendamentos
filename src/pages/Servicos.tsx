import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, Clock } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { ErrorState } from "@/components/Feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { useServicos } from "@/hooks/useServicos";
import { useConfiguracao } from "@/hooks/useConfiguracao";

export function Servicos() {
  const { servicos, loading, error, refresh, usandoDemo } = useServicos(true);
  const { horarioFuncionamento } = useConfiguracao();

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-gold/20 bg-gradient-to-b from-graphite to-onyx pt-14 pb-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="animate-slide-up max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-gold-light uppercase">
              Cardápio de serviços
            </p>
            <h1 className="font-display mt-3 text-4xl font-extrabold text-white sm:text-5xl">
              Serviços &amp; <span className="text-gradient-red">preços</span>
            </h1>
            <p className="font-serif mt-4 text-xl leading-relaxed text-cream/80 italic">
              Todos os serviços incluem atendimento personalizado e produtos
              premium — escolha o seu e garanta o horário.
            </p>
            {usandoDemo && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-yellow-600/40 bg-yellow-500/15 px-3 py-1 text-xs text-yellow-300">
                Mostrando dados de demonstração — conecte o Convex para carregar os serviços reais.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border/80 bg-card">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="space-y-2 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : servicos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">
              Nenhum serviço ativo no momento. Volte em breve!
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {servicos.map((servico, i) => (
              <Reveal key={servico.id} delay={(i % 3) * 90}>
                <ServiceCard servico={servico} />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="mt-14">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-gold/25 bg-gradient-to-r from-graphite to-onyx p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-gold-light/30 bg-black/30">
                <Clock className="size-5 text-gold-light" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-white">
                  Funcionamento
                </p>
                <p className="text-sm text-cream/70">
                  {horarioFuncionamento}
                </p>
              </div>
            </div>
            <Button asChild variant="gold">
              <Link to="/agendamento">
                <CalendarCheck className="size-4" />
                Agendar agora
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
