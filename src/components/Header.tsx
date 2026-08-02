import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { CalendarPlus, Menu, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/", label: "Início" },
  { to: "/servicos", label: "Serviços" },
  { to: "/agendamento", label: "Agendar" },
];

export function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        rolou || menuAberto
          ? "border-b border-border/70 bg-charcoal/90 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[72px] sm:px-6">
        <Link to="/" aria-label="Página inicial">
          <Logo />
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-gold-light"
                    : "text-muted-foreground hover:text-cream",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin">
              <Settings className="size-3.5" />
              Área do barbeiro
            </Link>
          </Button>
          <Button asChild variant="gold" size="sm">
            <Link to="/agendamento">
              <CalendarPlus className="size-4" />
              Agendar horário
            </Link>
          </Button>
        </div>

        {/* Botão menu mobile */}
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-md text-cream transition-colors hover:bg-gold/10 md:hidden"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
        >
          {menuAberto ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div className="animate-slide-down border-t border-border/70 bg-charcoal/95 px-4 pb-5 pt-3 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gold/10 text-gold-light"
                      : "text-muted-foreground hover:bg-graphite hover:text-cream",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin">Área do barbeiro</Link>
              </Button>
              <Button asChild variant="gold" size="sm">
                <Link to="/agendamento">Agendar horário</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
