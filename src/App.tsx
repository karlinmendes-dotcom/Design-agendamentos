import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Home } from "@/pages/Home";
import { ToastProvider } from "@/contexts/ToastContext";
import { LoadingState } from "@/components/Feedback";
import { BottomNav } from "@/components/BottomNav";
import { SplashScreen } from "@/components/SplashScreen";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PushListener } from "@/components/PushListener";
import { EntrarCliente } from "@/components/EntrarCliente";
import { useIdentidadeCliente } from "@/hooks/useIdentidadeCliente";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Carregamento sob demanda — reduz o bundle inicial
const Servicos = lazy(() =>
  import("@/pages/Servicos").then((m) => ({ default: m.Servicos })),
);
const Agendamento = lazy(() =>
  import("@/pages/Agendamento").then((m) => ({ default: m.Agendamento })),
);
const Sucesso = lazy(() =>
  import("@/pages/Sucesso").then((m) => ({ default: m.Sucesso })),
);
const AdminLayout = lazy(() =>
  import("@/layouts/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const Dashboard = lazy(() =>
  import("@/pages/admin/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Agenda = lazy(() =>
  import("@/pages/admin/Agenda").then((m) => ({ default: m.Agenda })),
);
const ServicosAdmin = lazy(() =>
  import("@/pages/admin/ServicosAdmin").then((m) => ({
    default: m.ServicosAdmin,
  })),
);
const Configuracoes = lazy(() =>
  import("@/pages/admin/Configuracoes").then((m) => ({
    default: m.Configuracoes,
  })),
);
const AdminLogin = lazy(() =>
  import("@/pages/admin/AdminLogin").then((m) => ({ default: m.AdminLogin })),
);
const Promocoes = lazy(() =>
  import("@/pages/Promocoes").then((m) => ({ default: m.Promocoes })),
);
const Contato = lazy(() =>
  import("@/pages/Contato").then((m) => ({ default: m.Contato })),
);
const Reagendar = lazy(() =>
  import("@/pages/Reagendar").then((m) => ({ default: m.Reagendar })),
);

/**
 * Porta de entrada da cliente: pede nome + WhatsApp (e autoriza os avisos)
 * antes de deixar navegar. A tela de /reagendar fica aberta de propósito —
 * quem tocou na notificação de cancelamento precisa remarcar mesmo sem ter
 * "entrado" antes.
 */
function GateCliente() {
  const { identidade, salvar } = useIdentidadeCliente();
  const location = useLocation();

  if (!identidade && !location.pathname.startsWith("/reagendar")) {
    return <EntrarCliente onEntrar={(d) => salvar(d.nome, d.telefone)} />;
  }
  return <Outlet />;
}

/** Layout da área do cliente: BottomNav fixa + WhatsApp flutuante. */
function ClientLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 md:pb-24">
        <Outlet />
      </main>
      <BottomNav />
      <WhatsAppFloat />
      <PushListener />
    </div>
  );
}

/** Protege o painel: sem login, manda para /admin/entrar. */
function ExigirAdmin() {
  const { autenticado } = useAdminAuth();
  const location = useLocation();
  if (!autenticado) {
    return (
      <Navigate
        to="/admin/entrar"
        replace
        state={{ from: location.pathname }}
      />
    );
  }
  return <Outlet />;
}

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingState label="Carregando..." />
    </div>
  );
}

/**
 * Rola para o topo a cada troca de rota — ao clicar no menu, a página
 * sempre começa pelo início (comportamento esperado em celulares).
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export default function App() {
  const [splashOk, setSplashOk] = useState(false);

  return (
    <ToastProvider>
      {!splashOk && <SplashScreen onFinish={() => setSplashOk(true)} />}
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Área do cliente — sem menu superior, com bottom nav */}
            <Route element={<GateCliente />}>
              <Route element={<ClientLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/servicos" element={<Servicos />} />
                <Route path="/agendamento" element={<Agendamento />} />
                <Route path="/promocoes" element={<Promocoes />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/sucesso" element={<Sucesso />} />
                <Route path="/reagendar" element={<Reagendar />} />
              </Route>
            </Route>

            {/* Login do painel — aberto, para a dona entrar */}
            <Route path="/admin/entrar" element={<AdminLogin />} />

            {/* Dashboard administrativo — protegido por login */}
            <Route path="/admin" element={<ExigirAdmin />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="servicos" element={<ServicosAdmin />} />
                <Route path="configuracoes" element={<Configuracoes />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}
