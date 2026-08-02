import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
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

const TITULOS: { prefixo: string; titulo: string }[] = [
  { prefixo: "/admin/agenda", titulo: "Agenda" },
  { prefixo: "/admin/servicos", titulo: "Serviços" },
  { prefixo: "/admin/configuracoes", titulo: "Configurações" },
  { prefixo: "/admin", titulo: "Visão geral" },
];

export function AdminLayout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [colapsado, setColapsado] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  const titulo =
    TITULOS.find((t) => location.pathname.startsWith(t.prefixo))?.titulo ??
    "Administração";

  return (
    <div className="min-h-screen bg-black">
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
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border/70 bg-coal transition-[width] duration-300 lg:flex",
          colapsado ? "w-[76px]" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-border/60",
            colapsado ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          <Link to="/" aria-label="Ver site" className={colapsado ? "mx-auto" : ""}>
            <Logo compact />
          </Link>
          {!colapsado && (
            <button
              type="button"
              onClick={() => setColapsado(true)}
              aria-label="Recolher menu"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {ADMIN_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              title={colapsado ? link.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  colapsado && "justify-center px-0",
                  isActive
                    ? "bg-red-500/12 text-red-300 shadow-[inset_2px_0_0_var(--color-ring)]"
                    : "text-muted-foreground hover:bg-graphite hover:text-white",
                )
              }
            >
              <link.icon className="size-4 shrink-0" />
              {!colapsado && link.label}
            </NavLink>
          ))}
        </nav>

        <div className={cn("border-t border-border/60 p-3", colapsado && "flex justify-center")}>
          {colapsado ? (
            <button
              type="button"
              onClick={() => setColapsado(false)}
              aria-label="Expandir menu"
              className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-graphite hover:text-red-400"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-graphite hover:text-white"
            >
              <ExternalLink className="size-4" />
              Ver site
            </Link>
          )}
        </div>
      </aside>

      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 bg-black/95 px-4 backdrop-blur lg:hidden">
        <Link to="/" aria-label="Ver site">
          <Logo compact />
        </Link>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md text-white transition-colors hover:bg-red-500/10"
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
                end={link.end}                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-red-500/12 text-red-300"
                        : "text-muted-foreground hover:bg-graphite hover:text-white",
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
      <main
        className={cn(
          "px-4 pt-6 pb-16 sm:px-6 lg:px-8",
          colapsado ? "lg:ml-[76px]" : "lg:ml-60",
        )}
      >
        {/* Cabeçalho superior (desktop) */}
        <header className="mb-6 hidden items-center justify-between rounded-xl border border-border/60 bg-coal/60 px-4 py-3 lg:flex">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-red-500" />
            <p className="text-sm font-semibold text-white">{titulo}</p>
            <span className="text-xs text-muted-foreground">
              / painel de gestão
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Conectado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                <span className="size-1.5 rounded-full bg-amber-400" />
                Modo demonstração
              </span>
            )}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-red-500/50 hover:text-red-300"
            >
              <ExternalLink className="size-3.5" />
              Ver site
            </Link>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
