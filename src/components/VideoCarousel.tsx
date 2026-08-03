import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { VideoCover } from "@/components/VideoCover";

export interface VideoCarouselItem {
  id: string;
  titulo: string;
  descricao?: string;
  badge?: string;
  preco?: string;
  duracao?: string;
  extra?: string;
  src: string;
  poster: string;
  to: string;
}

interface VideoCarouselProps {
  itens: VideoCarouselItem[];
  /** Intervalo do avanço automático em ms (default 5000). 0 desativa. */
  autoPlayMs?: number;
}

/**
 * Carrossel de vídeos em cards compactos (proporção menor que os cards de
 * serviço). Rolagem com scroll-snap, setas, avanço automático e pausa no
 * hover/toque — leve, sem dependências.
 */
export function VideoCarousel({ itens, autoPlayMs = 5000 }: VideoCarouselProps) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [pausado, setPausado] = useState(false);

  const rolar = (dir: 1 | -1) => {
    const el = trilhoRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const passo = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * passo, behavior: "smooth" });
  };

  // Avanço automático (pausa no hover/toque)
  useEffect(() => {
    if (autoPlayMs <= 0 || itens.length < 2 || pausado) return;
    const id = window.setInterval(() => {
      const el = trilhoRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        rolar(1);
      }
    }, autoPlayMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayMs, itens.length, pausado]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onTouchStart={() => setPausado(true)}
      onTouchEnd={() => window.setTimeout(() => setPausado(false), 2500)}
    >
      <div
        ref={trilhoRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {itens.map((item) => (
          <Link
            key={item.id}
            data-card
            to={item.to}
            className="red-ring-hover group w-[68vw] max-w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-red-500/50 active:scale-[0.98] sm:w-64"
          >
            <div className="relative aspect-[4/3] overflow-hidden border-b border-border/60">
              <VideoCover
                src={item.src}
                poster={item.poster}
                alt={item.titulo}
                className="absolute inset-0 size-full transition-transform duration-700 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              {item.badge && (
                <span className="absolute top-2.5 left-2.5 rounded-full border border-red-500/40 bg-black/70 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-red-300 uppercase backdrop-blur">
                  {item.badge}
                </span>
              )}
              {item.duracao && (
                <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full border border-border bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white/85 backdrop-blur">
                  <Clock className="size-3" />
                  {item.duracao}
                </span>
              )}
              <p className="absolute bottom-2.5 left-3.5 font-display text-base font-bold text-white">
                {item.titulo}
              </p>
            </div>

            <div className="flex flex-col gap-2 p-3.5">
              {item.descricao && (
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {item.descricao}
                </p>
              )}
              {item.extra && (
                <p className="text-[11px] font-medium text-red-300/90">{item.extra}</p>
              )}
              <div className="mt-auto flex items-center justify-between pt-1">
                {item.preco ? (
                  <p className="font-display text-lg font-extrabold text-gradient-red">
                    {item.preco}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">Ver detalhes</span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 transition-transform duration-300 group-hover:translate-x-0.5">
                  Reservar <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Setas */}
      {itens.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => rolar(-1)}
            aria-label="Anterior"
            className="absolute top-1/2 -left-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-black/80 text-white shadow-lg backdrop-blur transition-all hover:border-red-500/60 hover:text-red-400 active:scale-90 md:flex"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => rolar(1)}
            aria-label="Próximo"
            className="absolute top-1/2 -right-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-black/80 text-white shadow-lg backdrop-blur transition-all hover:border-red-500/60 hover:text-red-400 active:scale-90 md:flex"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
