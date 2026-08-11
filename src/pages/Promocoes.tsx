import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, Crown, Gift, Tag, Ticket } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { VideoCarousel, type VideoCarouselItem } from "@/components/VideoCarousel";
import { Button } from "@/components/ui/button";
import { useServicos } from "@/hooks/useServicos";
import { mediaParaServico } from "@/utils/media";
import { formatBRL, formatMinutes } from "@/utils/format";

/**
 * Combos da casa — montados a partir dos serviços reais do banco (vídeo,
 * preço e duração vêm direto do cardápio). Quando o programa de
 * fidelidade/cupons for ativado, esta página passa a consumir a estrutura
 * de promoções (tabela futura).
 */
export function Promocoes() {
  const { servicos, loading, error, refresh } = useServicos(true);

  const manicure = servicos.find((s) => s.nome.toLowerCase().includes("manicure"));
  const pedicure = servicos.find((s) => s.nome.toLowerCase().includes("pedicure"));
  const gel = servicos.find((s) => s.nome.toLowerCase().includes("gel"));
  const alongamento = servicos.find((s) =>
    s.nome.toLowerCase().includes("alongamento"),
  );
  const nailArt = servicos.find((s) => s.nome.toLowerCase().includes("nail art"));
  const spa = servicos.find((s) => s.nome.toLowerCase().includes("spa"));

  const combos = [
    {
      nome: "Combo Manicure + Pedicure",
      descricao:
        "O clássico da casa: mãos e pés impecáveis no mesmo dia.",
      itens: [manicure, pedicure].filter(Boolean),
      badge: "Mais pedido",
    },
    {
      nome: "Dia de spa completo",
      descricao:
        "Manicure + pedicure + spa dos pés para renovar corpo e mente.",
      itens: [manicure, pedicure, spa].filter(Boolean),
      badge: "Transformação",
    },
    {
      nome: "Unhas dos sonhos",
      descricao: "Alongamento em gel + nail art para um visual marcante e duradouro.",
      itens: [alongamento, nailArt].filter(Boolean),
      badge: "Destaque",
    },
    {
      nome: "Brilho que dura",
      descricao: "Esmaltação em gel + nail art para arrasar por semanas.",
      itens: [gel, nailArt].filter(Boolean),
      badge: "Durabilidade",
    },
  ]
    .filter((c) => c.itens.length > 0)
    .map((c) => ({
      ...c,
      itens: c.itens as NonNullable<(typeof servicos)[number]>[],
    }));

  const totalCombo = (itens: { preco: number }[]) =>
    itens.reduce((soma, i) => soma + (i.preco ?? 0), 0);

  const carrossel: VideoCarouselItem[] = combos.map((combo) => {
    const primeiro = combo.itens[0];
    const video = mediaParaServico(primeiro);
    return {
      id: combo.nome,
      titulo: combo.nome,
      descricao: combo.descricao,
      badge: combo.badge,
      preco: formatBRL(totalCombo(combo.itens)),
      duracao: formatMinutes(
        combo.itens.reduce((soma, i) => soma + (i.duracao_minutos ?? 0), 0),
      ),
      extra: `Inclui: ${combo.itens.map((i) => i.nome).join(" + ")}`,
      src: video.src,
      poster: video.poster,
      to: "/agendamento",
    };
  });

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
        ) : carrossel.length === 0 ? (
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
            <VideoCarousel itens={carrossel} />
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
