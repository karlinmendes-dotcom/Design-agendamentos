import { useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  RefreshCw,
  Scissors,
  TrendingUp,
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
import { cn } from "@/lib/utils";
import type { Agendamento } from "@/types";

type PeriodoAgenda = "hoje" | "semana" | "mes";

const PERIODOS: { valor: PeriodoAgenda; label: string }[] = [
  { valor: "hoje", label: "Hoje" },
  { valor: "semana", label: "Semana" },
  { valor: "mes", label: "Mês" },
];

/** Filtra agendamentos pelo período e ordena por data/horário. */
function agendarPorPeriodo(lista: Agendamento[], periodo: PeriodoAgenda, hojeISO: string): Agendamento[] {
  const inicio = new Date(`${hojeISO}T00:00:00`);
  const fim = new Date(inicio);
  if (periodo === "semana") fim.setDate(inicio.getDate() + 6);
  if (periodo === "mes") fim.setMonth(inicio.getMonth() + 1);

  return lista
    .filter((a) => a.status !== "cancelado")
    .filter((a) => {
      const d = new Date(`${a.data}T00:00:00`);
      return d >= inicio && d < fim;
    })
    .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`));
}

export function Dashboard() {
  const { agendamentos, loading, refresh, usandoDemo } = useAgendamentos();
  const hoje = todayISO();
  const [periodo, setPeriodo] = useState<PeriodoAgenda>("hoje");

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

  const agendaDoPeriodo = useMemo(
    () => agendarPorPeriodo(agendamentos, periodo, hoje),
    [agendamentos, periodo, hoje],
  );

  const barrasSemana = useAgendamentosPorDiaSemana(agendamentos);
  const faturamentoTotal = useMemo(
    () =>
      agendamentos
        .filter((a) => a.status === "confirmado")
        .reduce((s, a) => s + (a.servico?.preco ?? 0), 0),
    [agendamentos],
  );

  // Serviços mais vendidos (por contagem de agendamentos ativos)
  const maisVendidos = useMemo(() => {
    const mapa = new Map<string, { nome: string; qtd: number; receita: number }>();
    for (const a of ativos) {
      const nome = a.servico?.nome ?? "Sem serviço";
      const atual = mapa.get(nome) ?? { nome, qtd: 0, receita: 0 };
      atual.qtd += 1;
      atual.receita += a.servico?.preco ?? 0;
      mapa.set(nome, atual);
    }
    return [...mapa.values()].sort((a, b) => b.qtd - a.qtd).slice(0, 5);
  }, [ativos]);

  const segmentosStatus = useMemo(
    () => [
      {
        label: "Confirmados",
        value: agendamentos.filter((a) => a.status === "confirmado").length,
        color: "#E10600",
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

  const maxVendas = Math.max(1, ...maisVendidos.map((s) => s.qtd));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
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
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
                {formatBRL(faturamentoTotal)}
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

      {/* Serviços mais vendidos */}
      <div className="mt-8">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-4 text-red-500" />
                Serviços mais vendidos
              </CardTitle>
              <CardDescription>Ranking por número de agendamentos</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : maisVendidos.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                Sem vendas registradas ainda.
              </p>
            ) : (
              <div className="space-y-3.5">
                {maisVendidos.map((s, i) => (
                  <div key={s.nome} className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-300">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-white">
                          {s.nome}
                        </p>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {s.qtd}× · {formatBRL(s.receita)}
                        </p>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
                          style={{ width: `${(s.qtd / maxVendas) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agenda: diária / semanal / mensal */}
      <div className="mt-8 overflow-hidden rounded-xl border border-border/80 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold text-white">
            Agenda de agendamentos
          </h2>
          <div className="inline-flex rounded-lg border border-border bg-background p-1">
            {PERIODOS.map((p) => (
              <button
                key={p.valor}
                type="button"
                onClick={() => setPeriodo(p.valor)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  periodo === p.valor
                    ? "bg-red-gradient text-white shadow"
                    : "text-muted-foreground hover:text-white",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : agendaDoPeriodo.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Scissors}
              title="Nenhum agendamento no período"
              description="Quando os clientes agendarem, os horários aparecerão aqui."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {agendaDoPeriodo.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-white">
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
          </div>
        )}
      </div>
    </div>
  );
}
