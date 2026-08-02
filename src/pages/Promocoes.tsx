import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  Crown,
  Gift,
  Scissors,
  Sparkles,
  Tag,
  Ticket,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { Button } from "@/components/ui/button";
import { useServicos } from "@/hooks/useServicos";
import { formatBRL, formatMinutes } from "@/utils/format";

/**
 * Combos da casa — montados a partir dos serviços reais do banco.
 * Quando o programa de fidelidade/cupons for ativado, esta página passa
 * a consumir a estrutura de promoções (tabela futura).
 */
export function Promocoes() {
  const { servicos, loading, error, refresh } = useServicos(true);

  const corte = servicos.find((s) => s.nome.toLowerCase().includes("corte masculino"));
  const barba = servicos.find((s) => s.nome.toLowerCase().includes("barba completa"));
  const pigmentacao = servicos.find((s) =>
    s.nome.toLowerCase().includes("pigment"),
  );

  const combos = [
    {
      nome: "Combo Corte + Barba",
      descricao:
        "O clássico da casa: corte na régua + barba com toalha quente e navalha.",
      itens: [corte, barba].filter(Boolean),
      badge: "Mais pedido",
      icon: Scissors,
    },
    {
      nome: "Visual completo",
      descricao:
        "Corte + barba + pigmentação para um visual cheio, definido e pronto.",
      itens: [corte, barba, pigmentacao].filter(Boolean),
      badge: "Transformação",
      icon: Sparkles,
    },
  ].filter((c) => c.itens.length > 0);

  const totalCombo = (itens: (typeof corte | null)[]) =>
    itens.reduce((soma, i) => soma + (i?.preco ?? 0), 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Cabeçalho */}
      <section className="border-b border-border/60 bg-gradient-to-b from-[#120303] to-black pt-14 pb-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="animate-slide-up max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-red-500 uppercase">
              <Tag className="size-4" /> Ofertas da casa
            </p>
            <h1 className="font-display mt-3 text-4xl font-extrabold text-white sm:text-5xl">
              Promoções &amp; <span className="text-gradient-red">combos</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Combos pensados para quem quer o melhor da casa em um só
              atendimento. Preços calculados direto do cardápio.
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
          <div className="grid gap-5 lg:grid-cols-2">
            {combos.map((combo, i) => (
              <Reveal key={combo.nome} delay={i * 100}>
                <div className="red-ring-hover group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-7">
                  <div className="pointer-events-none absolute -top-20 -right-16 size-48 rounded-full bg-red-500/10 blur-3xl transition-opacity group-hover:opacity-100" />
                  <span className="absolute top-5 right-5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[10px] font-bold tracking-wide text-red-300 uppercase">
                    {combo.badge}
                  </span>

                  <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/10">
                    <combo.icon className="size-6 text-red-500" />
                  </div>
                  <h2 className="font-display mt-5 text-xl font-bold text-white">
                    {combo.nome}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {combo.descricao}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {combo.itens.map((item) => (
                      <li
                        key={item!.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3.5 py-2.5 text-sm"
                      >
                        <span className="flex items-center gap-2 text-white">
                          <span className="size-1.5 rounded-full bg-red-500" />
                          {item!.nome}
                        </span>
                        <span className="flex items-center gap-3 text-xs text-muted-foreground">
                          {formatMinutes(item!.duracao_minutos)}
                          <span className="font-semibold text-red-400">
                            {formatBRL(item!.preco)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-5">
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase">
                        Total do combo
                      </p>
                      <p className="font-display text-2xl font-extrabold text-gradient-red">
                        {formatBRL(totalCombo(combo.itens))}
                      </p>
                    </div>
                    <Button asChild variant="gold">
                      <Link to="/agendamento">
                        <CalendarCheck className="size-4" />
                        Agendar
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* Programa de fidelidade — estrutura preparada */}
        <Reveal className="mt-14">
          <div className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-br from-[#1a0505] via-black to-black p-8 sm:p-10">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-44 w-[30rem] -translate-x-1/2 rounded-full bg-red-500/12 blur-3xl" />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
                <Crown className="size-7 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-red-500 uppercase">
                  <Gift className="size-4" /> Em preparação
                </p>
                <h2 className="font-display mt-2 text-2xl font-extrabold text-white">
                  Programa de fidelidade &amp; cupons
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Cashback, cortes acumulados e cupons exclusivos. A arquitetura
                  já está preparada — em breve você acumula pontos a cada visita.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <Ticket className="size-5 text-red-400" />
                <span className="text-sm font-semibold text-white">
                  Em breve
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
