import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  nome?: string;
  className?: string;
  compact?: boolean;
}

export function Logo({ nome = "Barbearia Neto", className, compact }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gradient-to-br from-graphite to-charcoal shadow-[0_0_16px_-4px_rgba(201,162,39,0.5)]">
        <Scissors className="size-4 text-gold" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display text-lg font-bold tracking-wide text-cream">
            {nome.split(" ")[0]}{" "}
            <span className="text-gradient-gold">
              {nome.split(" ").slice(1).join(" ")}
            </span>
          </p>
          <p className="text-[10px] font-medium tracking-[0.35em] text-muted-foreground uppercase">
            Barber Shop
          </p>
        </div>
      )}
    </div>
  );
}
