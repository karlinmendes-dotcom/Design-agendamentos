import { CalendarCheck, CalendarDays, Users, Wallet } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingState } from "@/components/Feedback";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { formatBRL } from "@/utils/format";
import { formatDateShort, todayISO } from "@/utils/date";

export function Dashboard() {
  const { agendamentos, loading, usandoDemo } = useAgendamentos();
  const hoje = todayISO();

  const ativos = agendamentos.filter((a) => a.status !== "cancelado");
  const doDia = agendamentos.filter(
    (a) => a.data === hoje && a.status !== "cancelado",
  );
  const clientesDoDia = new Set(
    doDia.map((a) => a.cliente?.telefone ?? a.cliente_id),
  ).size;
  const faturamentoHoje = doDia
    .filter((a) => a.status === "confirmado")
    .reduce((soma, a) => soma + (a.servico?.preco ?? 0), 0);

  const proximos = [...ativos]
    .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`))
    .filter((a) => a.data >= hoje)
    .slice(0, 8);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe o movimento da barbearia em tempo real.
          </p>
        </div>
        {usandoDemo && (
          <span className="w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            Dados de demonstração
          </span>
        )}
      </div>

      {loading ? (
        <LoadingState label="Carregando dados..." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={CalendarDays}
              label="Total de agendamentos"
              value={String(ativos.length)}
              sub="agendamentos ativos"
            />
            <StatCard
              icon={Users}
              label="Clientes do dia"
              value={String(clientesDoDia)}
              sub={formatDateShort(hoje)}
              accent="bronze"
            />
            <StatCard
              icon={CalendarCheck}
              label="Horários marcados hoje"
              value={String(doDia.length)}
              sub={`${doDia.filter((a) => a.status === "confirmado").length} confirmados`}
            />
            <StatCard
              icon={Wallet}
              label="Faturamento previsto"
              value={formatBRL(faturamentoHoje)}
              sub="agendamentos de hoje"
              accent="green"
            />
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-border/80 bg-card">
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-cream">
                Próximos agendamentos
              </h2>
            </div>
            {proximos.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                Nenhum agendamento futuro por enquanto.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proximos.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-cream">
                        {a.cliente?.nome ?? "—"}
                      </TableCell>
                      <TableCell>{a.servico?.nome ?? "—"}</TableCell>
                      <TableCell>{formatDateShort(a.data)}</TableCell>
                      <TableCell className="font-semibold tabular-nums text-gold-light">
                        {a.horario}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBRL(a.servico?.preco ?? 0)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
