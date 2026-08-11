import { NavLink } from "react-router-dom";
import { CalendarPlus, Hand, Home, Info, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const ITENS = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/servicos", label: "Serviços", icon: Hand, end: false },
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/25 bg-[#fbf3ea]/92 backdrop-blur-xl md:inset-x-auto md:bottom-5 md:left-1/2 md:-translate-x-1/2 md:rounded-full md:border md:shadow-[0_20px_60px_-20px_rgba(64,53,1,0.35)]"
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
                    ? "text-green-800"
                    : "text-muted-foreground hover:text-charcoal",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent md:hidden" />
                  )}
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full transition-all duration-300",
                      isActive
                        ? "bg-gold-gradient text-cream shadow-[0_6px_18px_-6px_rgba(64,53,1,0.55)]"
                        : "bg-transparent group-hover:bg-green-800/5",
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
                      isActive && "text-green-800",
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
