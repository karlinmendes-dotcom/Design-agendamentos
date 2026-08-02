import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ToastProvider } from "@/contexts/ToastContext";
import { LoadingState } from "@/components/Feedback";
import { BottomNav } from "@/components/BottomNav";
import { SplashScreen } from "@/components/SplashScreen";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

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
const Promocoes = lazy(() =>
  import("@/pages/Promocoes").then((m) => ({ default: m.Promocoes })),
);
const Contato = lazy(() =>
  import("@/pages/Contato").then((m) => ({ default: m.Contato })),
);

/** Layout da área do cliente: BottomNav fixa + WhatsApp flutuante. */
function ClientLayout() {
  return (
    <div className="min-h-screen bg-black">
      <main className="pb-24 md:pb-24">
        <Outlet />
      </main>
      <BottomNav />
      <WhatsAppFloat />
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <LoadingState label="Carregando..." />
    </div>
  );
}

export default function App() {
  const [splashOk, setSplashOk] = useState(false);

  return (
    <ToastProvider>
      {!splashOk && <SplashScreen onFinish={() => setSplashOk(true)} />}
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Área do cliente — sem menu superior, com bottom nav */}
            <Route element={<ClientLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/agendamento" element={<Agendamento />} />
              <Route path="/promocoes" element={<Promocoes />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/sucesso" element={<Sucesso />} />
            </Route>

            {/* Dashboard administrativo */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="servicos" element={<ServicosAdmin />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}
