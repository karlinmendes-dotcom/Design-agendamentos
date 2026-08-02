import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { LoadingState, ErrorState } from "@/components/Feedback";
import { Button } from "@/components/ui/button";
import { useServicos } from "@/hooks/useServicos";
import { useConfiguracao } from "@/hooks/useConfiguracao";

export function Servicos() {
  const { servicos, loading, error, refresh, usandoDemo } = useServicos(true);
  const { horarioFuncionamento } = useConfiguracao();

  return (
    <div className="bg-texture min-h-screen bg-charcoal">
      <Header />

      <section className="border-b border-border/60 bg-coal">
        <div className="mx-auto max-w-6xl px-4 pt-32 pb-14 sm:px-6">
          <div className="animate-slide-up max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
              Cardápio de serviços
            </p>
            <h1 className="font-display mt-3 text-4xl font-black text-cream sm:text-5xl">
              Serviços &amp; <span className="text-gradient-gold">preços</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Todos os serviços incluem atendimento personalizado e produtos
              premium. Escolha o seu e garanta o horário.
            </p>
            {usandoDemo && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                Mostrando dados de demonstração — conecte o Supabase para carregar os serviços reais.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {loading ? (
          <LoadingState label="Carregando serviços..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : servicos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">
              Nenhum serviço ativo no momento. Volte em breve!
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {servicos.map((servico, i) => (
              <div
                key={servico.id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <ServiceCard servico={servico} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-gold/25 bg-gradient-to-r from-graphite to-coal p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10">
              <Clock className="size-5 text-gold" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-cream">
                Funcionamento
              </p>
              <p className="text-sm text-muted-foreground">
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
      </section>

      <Footer />
    </div>
  );
}
