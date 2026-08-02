import { useEffect, useState } from "react";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  /** Tempo da animação (ms). Depois disso, onFinish é chamado. */
  duracaoMs?: number;
  onFinish: () => void;
}

/**
 * Splash Screen — tela inicial animada com o logotipo da barbearia.
 * Mostra o nome, uma animação de abertura (logo + traço + nome) e
 * dispara onFinish automaticamente para abrir a Home.
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
        "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black transition-all duration-500",
        saida ? "pointer-events-none scale-110 opacity-0" : "opacity-100",
      )}
    >
      {/* Glow vermelho de fundo */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/15 blur-[120px]" />

      {/* Logotipo */}
      <div className="animate-splash-logo relative flex size-24 items-center justify-center rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#1a0a0a] to-black shadow-[0_0_60px_-10px_rgba(225,6,0,0.55)]">
        <Scissors className="size-10 text-red-500" />
        <span className="absolute inset-0 rounded-2xl ring-1 ring-red-500/20" />
      </div>

      {/* Nome */}
      <div className="mt-6 text-center">
        <h1 className="animate-splash-text font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
          Barbearia <span className="text-gradient-red">Neto</span>
        </h1>
        <div className="animate-splash-line mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        <p className="animate-splash-text mt-3 text-[11px] font-semibold tracking-[0.35em] text-muted-foreground uppercase">
          Estilo · Tradição · Atitude
        </p>
      </div>

      {/* Indicador de carregamento */}
      <div className="absolute bottom-14 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-splash-dot size-1.5 rounded-full bg-red-500"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}
