import { useMemo } from "react";
import {
  CalendarCheck,
  CalendarDays,
  RefreshCw,
  Scissors,
  Users,
  Wallet,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, DonutChart, useAgendamentosPorDiaSemana } from "@/components/Charts";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { formatBRL } from "@/utils/format";
import { formatDateShort, todayISO } from "@/utils/date";

export function Dashboard() {
  const { agendamentos, loading, refresh, usandoDemo } = useAgendamentos();
  const hoje = todayISO();

  const ativos = useMemo(
    () => agendamentos.filter((a) => a.status !== "cancelado"),
    [agendamentos],
  );
  const doDia = useMemo(
    () => agendamentos.filter((a) => a.data === hoje && a.status !== "cancelado"),
    [agendamentos, hoje],
  );
  const clientesDoDia = useMemo(
    () => new Set(doDia.map((a) => a.cliente?.telefone ?? a.cliente_id)).size,
    [doDia],
  );
  const faturamentoHoje = useMemo(
    () =>
      doDia
        .filter((a) => a.status === "confirmado")
        .reduce((soma, a) => soma + (a.servico?.preco ?? 0), 0),
    [doDia],
  );

  const barrasSemana = useAgendamentosPorDiaSemana(agendamentos);
  const faturamentoSemana = useMemo(() => {
    const soma = agendamentos
      .filter((a) => a.status === "confirmado")
      .reduce((s, a) => s + (a.servico?.preco ?? 0), 0);
    return soma;
  }, [agendamentos]);

  const segmentosStatus = useMemo(
    () => [
      {
        label: "Confirmados",
        value: agendamentos.filter((a) => a.status === "confirmado").length,
        color: "#C9A227",
      },
      {
        label: "Concluídos",
        value: agendamentos.filter((a) => a.status === "concluido").length,
        color: "#34d399",
      },
      {
        label: "Cancelados",
        value: agendamentos.filter((a) => a.status === "cancelado").length,
        color: "#b3392e",
      },
    ],
    [agendamentos],
  );

  const proximos = useMemo(
    () =>
      [...ativos]
        .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`))
        .filter((a) => a.data >= hoje)
        .slice(0, 8),
    [ativos, hoje],
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe o movimento da barbearia em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {usandoDemo && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
              Dados de demonstração
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => void refresh(true)}>
            <RefreshCw className="size-3.5" />
            Atualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
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
      )}

      {/* Gráficos */}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos por dia da semana</CardTitle>
            <CardDescription>Distribuição da demanda na semana</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : (
              <BarChart items={barrasSemana} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por status</CardTitle>
            <CardDescription>
              Faturamento total:{" "}
              <span className="font-semibold text-gold-light">
                {formatBRL(faturamentoSemana)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-36 w-full rounded-xl" />
            ) : (
              <DonutChart segments={segmentosStatus} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos agendamentos */}
      <div className="mt-8 overflow-hidden rounded-xl border border-border/80 bg-card">
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-cream">
            Próximos agendamentos
          </h2>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : proximos.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Scissors}
              title="Nenhum agendamento futuro"
              description="Quando os clientes agendarem, os próximos horários aparecerão aqui."
            />
          </div>
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
    </div>
  );
}
