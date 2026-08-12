import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Crown,
  Gift,
  Sparkles,
  Tag,
  Ticket,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { VideoCover } from "@/components/VideoCover";
import { Button } from "@/components/ui/button";
import { useServicos } from "@/hooks/useServicos";
import { mediaParaServico } from "@/utils/media";
import { formatBRL, formatMinutes } from "@/utils/format";

/**
 * Combos da casa — lidos direto do banco (aba "Combos" do painel). Cada
 * combo é um serviço agrupado (is_combo) e pode ser agendado normalmente.
 */
export function Promocoes() {
  const { servicos: combos, loading, error, refresh } = useServicos(true, "combo");

  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho */}
      <section className="border-b border-gold/20 bg-gradient-to-b from-graphite to-onyx pt-14 pb-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="animate-slide-up max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-gold-light uppercase">
              <Tag className="size-4" /> Ofertas da casa
            </p>
            <h1 className="font-display mt-3 text-4xl font-extrabold text-white sm:text-5xl">
              Promoções &amp; <span className="text-gradient-light">combos</span>
            </h1>
            <p className="font-serif mt-4 text-xl leading-relaxed text-cream/80 italic">
              Combos pensados para quem quer o melhor da casa em um só
              atendimento — com o carinho e a técnica de sempre.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        {loading ? (
          <LoadingState label="Carregando ofertas..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : combos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">
              Em breve teremos combos exclusivos para você.
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-foreground uppercase">
              <CalendarCheck className="size-4" /> Navegue pelos combos
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {combos.map((combo, i) => {
                const video = mediaParaServico(combo);
                return (
                  <Reveal key={combo.id} delay={(i % 3) * 90}>
                    <div className="red-ring-hover group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card">
                      <div className="relative aspect-video overflow-hidden border-b border-border/60">
                        <VideoCover
                          src={video.src}
                          poster={video.poster}
                          alt={combo.nome}
                          className="absolute inset-0 size-full transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-gold-light/40 bg-black/60 px-2.5 py-1 text-[10px] font-bold tracking-wide text-gold-light uppercase backdrop-blur">
                          <Sparkles className="size-3" />
                          Combo
                        </span>
                        <p className="absolute bottom-3 left-4 font-display text-lg font-bold text-white">
                          {combo.nome}
                        </p>
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
                          {combo.descricao ?? "Atendimento com as melhores profissionais."}
                        </p>
                        {combo.itens_combo.length > 0 && (
                          <p className="flex items-center gap-1.5 rounded-lg bg-charcoal/5 px-3 py-2 text-xs font-medium text-charcoal/80">
                            <Gift className="size-3.5 shrink-0 text-gold" />
                            Inclui: {combo.itens_combo.join(" + ")}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-1">
                          <div>
                            <p className="font-display text-2xl font-extrabold text-gradient-red">
                              {formatBRL(combo.preco)}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              {formatMinutes(combo.duracao_minutos)}
                            </p>
                          </div>
                          <Link
                            to={`/agendamento?servico=${combo.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-green-800/25 bg-green-800/5 px-3 py-1.5 text-xs font-semibold text-green-800 transition-all duration-300 hover:bg-gold-gradient hover:text-cream active:scale-95"
                          >
                            Agendar
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        )}

        {/* Programa de fidelidade — estrutura preparada */}
        <Reveal className="mt-14">
          <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-graphite via-coal to-onyx p-8 sm:p-10">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-44 w-[30rem] -translate-x-1/2 rounded-full bg-gold-light/10 blur-3xl" />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-gold-light/30 bg-black/30">
                <Crown className="size-7 text-gold-light" />
              </div>
              <div className="flex-1">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-gold-light uppercase">
                  <Gift className="size-4" /> Em preparação
                </p>
                <h2 className="font-display mt-2 text-2xl font-extrabold text-white">
                  Programa de fidelidade &amp; cupons
                </h2>
                <p className="mt-2 max-w-xl text-sm text-cream/70">
                  Cashback, visitas acumuladas e cupons exclusivos. A arquitetura
                  já está preparada — em breve você acumula pontos a cada visita.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-gold/25 bg-white/10 px-4 py-3">
                <Ticket className="size-5 text-gold-light" />
                <span className="text-sm font-semibold text-white">
                  Em breve
                </span>
              </div>
            </div>
            <div className="relative mt-6">
              <Button asChild variant="outline">
                <Link to="/servicos">
                  Ver cardápio completo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
