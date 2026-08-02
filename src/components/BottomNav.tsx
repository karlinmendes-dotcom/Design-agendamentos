import { NavLink } from "react-router-dom";
import { CalendarPlus, Home, Info, Scissors, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const ITENS = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/servicos", label: "Serviços", icon: Scissors, end: false },
  { to: "/agendamento", label: "Agendar", icon: CalendarPlus, end: false },
  { to: "/promocoes", label: "Promoções", icon: Tag, end: false },
  { to: "/contato", label: "Contato", icon: Info, end: false },
];

/**
 * Bottom Navigation — barra fixa na parte inferior da área do cliente.
 * Mobile-first: visível sempre no celular; no desktop vira uma barra
 * flutuante centralizada com a mesma identidade.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-black/90 backdrop-blur-xl md:inset-x-auto md:bottom-5 md:left-1/2 md:-translate-x-1/2 md:rounded-full md:border md:border-red-900/40 md:shadow-[0_20px_60px_-15px_rgba(225,6,0,0.35)]"
    >
      <ul className="grid grid-cols-5 gap-0.5 px-1.5 pt-1.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] md:flex md:items-center md:gap-1 md:px-3 md:pb-1.5">
        {ITENS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group relative flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all duration-300 md:flex-row md:gap-2 md:px-3",
                  isActive
                    ? "text-red-500"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-red-500 to-transparent md:hidden" />
                  )}
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full transition-all duration-300",
                      isActive
                        ? "bg-red-500/15 text-red-500 shadow-[0_0_20px_-4px_rgba(225,6,0,0.6)]"
                        : "bg-transparent group-hover:bg-white/5",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-5 transition-transform duration-300",
                        isActive && "scale-110",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-semibold tracking-wide uppercase md:text-[11px]",
                      isActive && "text-red-400",
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
