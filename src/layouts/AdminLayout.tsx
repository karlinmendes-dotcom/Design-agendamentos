import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ExternalLink,
  Hand,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Tags,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { AssistenteAdmin } from "@/components/admin/AssistenteAdmin";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const ADMIN_LINKS = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/admin/servicos", label: "Serviços", icon: Hand },
  { to: "/admin/combos", label: "Combos", icon: Tags },
  { to: "/admin/midias", label: "Mídias", icon: Images },
  { to: "/admin/equipe", label: "Equipe", icon: Users },
  { to: "/admin/analises", label: "Análises", icon: TrendingUp },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

const TITULOS: { prefixo: string; titulo: string }[] = [
  { prefixo: "/admin/agenda", titulo: "Agenda" },
  { prefixo: "/admin/servicos", titulo: "Serviços" },
  { prefixo: "/admin/combos", titulo: "Combos" },
  { prefixo: "/admin/midias", titulo: "Mídias" },
  { prefixo: "/admin/equipe", titulo: "Equipe" },
  { prefixo: "/admin/analises", titulo: "Análises" },
  { prefixo: "/admin/configuracoes", titulo: "Configurações" },
  { prefixo: "/admin", titulo: "Visão geral" },
];

export function AdminLayout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [colapsado, setColapsado] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { sair } = useAdminAuth();

  const handleSair = () => {
    sair();
    navigate("/", { replace: true });
  };

  // Toda troca de página fecha o menu mobile E rola a tela para o topo:
  // no celular, quem tocou num item do menu precisa ver a página nova
  // desde o começo — sem continuar no meio da página anterior.
  useEffect(() => {
    setMenuAberto(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const titulo =
    TITULOS.find((t) => location.pathname.startsWith(t.prefixo))?.titulo ??
    "Administração";

  return (
    <div className="min-h-screen bg-background">
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
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-gold-light"
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
                    ? "bg-gold-light/10 text-gold-light shadow-[inset_2px_0_0_var(--color-ring)]"
                    : "text-muted-foreground hover:bg-white/10 hover:text-cream",
                )
              }
            >
              <link.icon className="size-4 shrink-0" />
              {!colapsado && link.label}
            </NavLink>
          ))}
        </nav>

        <div className={cn("border-t border-border/60 p-3", colapsado && "flex flex-col items-center gap-1")}>
          {colapsado ? (
            <>
              <button
                type="button"
                onClick={() => setColapsado(false)}
                aria-label="Expandir menu"
                className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-gold-light"
              >
                <PanelLeftOpen className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleSair}
                aria-label="Sair do painel"
                title="Sair"
                className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <div className="space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-cream"
              >
                <ExternalLink className="size-4" />
                Ver site
              </Link>
              <button
                type="button"
                onClick={handleSair}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gold/20 bg-[#2c3b31]/95 px-4 backdrop-blur lg:hidden">
        <Link to="/" aria-label="Ver site">
          <Logo compact />
        </Link>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md text-cream transition-colors hover:bg-white/10"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
        >
          {menuAberto ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuAberto && (
        <>
          {/* Fundo escurecido — toque fora para fechar */}
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[2px] lg:hidden"
          />
          <div className="animate-slide-down fixed inset-x-0 top-14 z-40 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-border/70 bg-coal px-3 py-3 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] lg:hidden">
          <nav className="flex flex-col gap-1">
            {ADMIN_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gold-light/10 text-gold-light"
                        : "text-muted-foreground hover:bg-white/10 hover:text-cream",
                    )
                  }
              >
                <link.icon className="size-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleSair}
            className="mt-1 flex w-full items-center gap-3 rounded-lg border-t border-border/70 px-3 py-2.5 pt-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="size-4" />
            Sair do painel
          </button>
          </div>
        </>
      )}

      {/* Assistente IA — flutuante, visível apenas no dashboard */}
      <AssistenteAdmin />

      {/* Conteúdo */}
      <main
        className={cn(
          "px-4 pt-6 pb-16 sm:px-6 lg:px-8",
          colapsado ? "lg:ml-[76px]" : "lg:ml-60",
        )}
      >
        {/* Cabeçalho superior (desktop) */}
        <header className="mb-6 hidden items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 lg:flex">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-gold" />
            <p className="text-sm font-semibold text-foreground">{titulo}</p>
            <span className="text-xs text-muted-foreground">
              / painel de gestão
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-green-600/30 bg-green-500/15 px-3 py-1 text-xs text-green-700">
              <span className="size-1.5 rounded-full bg-green-600" />
              Conectado
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-charcoal/40 hover:text-charcoal"
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
