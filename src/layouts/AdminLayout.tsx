import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  CalendarDays,
  LayoutDashboard,
  Menu,
  Scissors,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { isSupabaseConfigured } from "@/services/supabase";

const ADMIN_LINKS = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/admin/servicos", label: "Serviços", icon: Scissors },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminLayout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-charcoal">
      {!isSupabaseConfigured && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-xs text-amber-300 sm:text-sm">
          ⚠️ Banco de dados ainda não configurado. Adicione{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono">
            VITE_SUPABASE_URL
          </code>{" "}
          e{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono">
            VITE_SUPABASE_ANON_KEY
          </code>{" "}
          no .env para salvar e consultar dados.
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border/70 bg-coal lg:flex">
        <div className="flex h-16 items-center border-b border-border/60 px-5">
          <Link to="/" aria-label="Ver site">
            <Logo compact />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {ADMIN_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gold/12 text-gold-light shadow-[inset_2px_0_0_var(--color-gold)]"
                    : "text-muted-foreground hover:bg-graphite hover:text-cream",
                )
              }
            >
              <link.icon className="size-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border/60 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-graphite hover:text-cream"
          >
            ← Ver site
          </Link>
        </div>
      </aside>

      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 bg-coal/95 px-4 backdrop-blur lg:hidden">
        <Link to="/" aria-label="Ver site">
          <Logo compact />
        </Link>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md text-cream transition-colors hover:bg-gold/10"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
        >
          {menuAberto ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuAberto && (
        <div className="animate-slide-down border-b border-border/70 bg-coal px-3 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {ADMIN_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gold/12 text-gold-light"
                      : "text-muted-foreground hover:bg-graphite hover:text-cream",
                  )
                }
              >
                <link.icon className="size-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Conteúdo */}
      <main className="px-4 pt-6 pb-16 sm:px-6 lg:ml-60 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
