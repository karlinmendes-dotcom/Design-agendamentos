import { useState } from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Logomarca real da Natália (enviada por ela, armazenada no Convex). */
const LOGO_URL =
  "https://hardy-aardvark-221.convex.cloud/api/storage/5d0b20de-9dde-4e03-a091-38e820380855";

interface LogoProps {
  nome?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Marca Studio Natália Braga — logomarca real da Natália (selo creme com
 * coroa), seguida pelo nome do estúdio. Se a imagem não carregar, cai para
 * o monograma "NB" em serifa (mesma identidade).
 */
export function Logo({ nome = "Studio Natália Braga – Nail Design", className, compact }: LogoProps) {
  const [falhou, setFalhou] = useState(false);

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative mt-1 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/50 bg-[#fbf3ea] p-1 shadow-[0_6px_16px_-6px_rgba(47,74,62,0.5)]">
        <Crown
          className="absolute -top-2 left-1/2 z-10 size-4 -translate-x-1/2 text-gold drop-shadow-[0_1px_2px_rgba(47,74,62,0.45)]"
          fill="currentColor"
          strokeWidth={1.5}
        />
        {falhou ? (
          <span className="font-display text-sm font-bold tracking-tight text-green-900">
            NB
          </span>
        ) : (
          <img
            src={LOGO_URL}
            alt=""
            aria-hidden
            className="size-full object-contain"
            loading="lazy"
            onError={() => setFalhou(true)}
            draggable={false}
          />
        )}
        <span className="absolute inset-0 rounded-full ring-1 ring-white/20 ring-inset" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display text-base font-bold tracking-wide text-foreground sm:text-lg">
            {nome}
          </p>
          <p className="font-script text-sm leading-none text-gold">
            studio nails · alto padrão
          </p>
        </div>
      )}
    </div>
  );
}
