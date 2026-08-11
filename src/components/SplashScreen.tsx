import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  /** Tempo da animação (ms). Depois disso, onFinish é chamado. */
  duracaoMs?: number;
  onFinish: () => void;
}

/**
 * Splash Screen — tela inicial animada com o monograma NB do estúdio.
 * Mostra a marca (monograma + traço + nome) e dispara onFinish
 * automaticamente para abrir a Home.
 */
export function SplashScreen({ duracaoMs = 2200, onFinish }: SplashScreenProps) {
  const [saida, setSaida] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSaida(true), duracaoMs - 300);
    const t2 = setTimeout(onFinish, duracaoMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duracaoMs, onFinish]);

  return (
    <div
      aria-hidden={saida}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gold-gradient transition-all duration-500",
        saida ? "pointer-events-none scale-110 opacity-0" : "opacity-100",
      )}
    >
      {/* Brilho champanhe de fundo */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-light/15 blur-[120px]" />
      {/* Linha ornamental fina */}
      <div className="pointer-events-none absolute top-8 left-1/2 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold-light/40 to-transparent" />

      {/* Monograma NB com coroa — entra animado */}
      <div className="animate-splash-logo relative mt-3 flex size-24 items-center justify-center rounded-2xl border border-gold-light/40 bg-[#22382e] shadow-[0_0_60px_-10px_rgba(201,168,106,0.45)]">
        <Crown
          className="absolute -top-6 size-7 text-gold-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          fill="currentColor"
          strokeWidth={1.4}
        />
        <span className="font-display text-4xl font-bold tracking-tight text-gold-light">
          NB
        </span>
        <span className="absolute inset-0 rounded-2xl ring-1 ring-gold-light/25 ring-inset" />
        <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-gold-light" />
      </div>

      {/* Nome */}
      <div className="mt-6 text-center">
        <h1 className="animate-splash-text font-display text-2xl font-bold tracking-wide text-cream sm:text-3xl">
          Studio Natália Braga
        </h1>
        <div className="animate-splash-line mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-gold-light to-transparent" />
        <p className="animate-splash-text font-script mt-3 text-xl text-gold-light">
          nail design · elegância
        </p>
      </div>

      {/* Indicador de carregamento */}
      <div className="absolute bottom-14 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-splash-dot size-1.5 rounded-full bg-gold-light"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}
