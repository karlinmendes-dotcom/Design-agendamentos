import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Servicos } from "@/pages/Servicos";
import { Agendamento } from "@/pages/Agendamento";
import { Sucesso } from "@/pages/Sucesso";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Dashboard } from "@/pages/admin/Dashboard";
import { Agenda } from "@/pages/admin/Agenda";
import { ServicosAdmin } from "@/pages/admin/ServicosAdmin";
import { Configuracoes } from "@/pages/admin/Configuracoes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Área do cliente */}
        <Route path="/" element={<Home />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/agendamento" element={<Agendamento />} />
        <Route path="/sucesso" element={<Sucesso />} />

        {/* Dashboard administrativo */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="servicos" element={<ServicosAdmin />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
