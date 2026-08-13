import { useMemo } from "react";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  BarChartVertical,
  DonutChart,
  useAgendamentosPorDiaSemana,
  useFaturamentoPorDia,
  useFaturamentoPorServico,
} from "@/components/Charts";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { formatBRL } from "@/utils/format";
import { formatDateShort, todayISO } from "@/utils/date";

/** Data + N dias (ISO) — evita importar utilitário extra aqui. */
function addDays(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

/**
 * Análises — página exclusiva do painel (rota /admin/analises, protegida por
 * login): ganhos, indicadores e gráficos do estúdio. Fica separada do
 * dashboard para que a frente mostre apenas a agenda e a busca de clientes.
 */
export function Analises() {
  const { agendamentos, loading } = useAgendamentos();
  const hoje = todayISO();

  // -------- Estatísticas rápidas --------
  const ativos = useMemo(
    () => agendamentos.filter((a) => a.status !== "cancelado"),
    [agendamentos],
  );
  const doDia = useMemo(
    () =>
      agendamentos.filter((a) => a.data === hoje && a.status !== "cancelado"),
    [agendamentos, hoje],
  );
  const clientesDoDia = useMemo(
    () =>
      new Set(doDia.map((a) => a.cliente?.telefone ?? a.cliente_id)).size,
    [doDia],
  );
  const proximaSemana = useMemo(
    () =>
      agendamentos.filter(
        (a) =>
          a.status !== "cancelado" && a.data >= hoje && a.data < addDays(hoje, 7),
      ),
    [agendamentos, hoje],
  );

  // -------- Ganhos --------
  const faturamentoHoje = useMemo(
    () => doDia.reduce((soma, a) => soma + (a.servico?.preco ?? 0), 0),
    [doDia],
  );
  const faturamentoSemana = useMemo(
    () => proximaSemana.reduce((soma, a) => soma + (a.servico?.preco ?? 0), 0),
    [proximaSemana],
  );
  const faturamentoMes = useMemo(
    () =>
      agendamentos
        .filter(
          (a) =>
            a.status !== "cancelado" && a.data >= hoje && a.data < addDays(hoje, 30),
        )
        .reduce((soma, a) => soma + (a.servico?.preco ?? 0), 0),
    [agendamentos, hoje],
  );
  const faturamentoTotal = useMemo(
    () => ativos.reduce((soma, a) => soma + (a.servico?.preco ?? 0), 0),
    [ativos],
  );
  const ticketMedio = ativos.length > 0 ? faturamentoTotal / ativos.length : 0;

  // -------- Gráficos --------
  const barrasSemana = useAgendamentosPorDiaSemana(agendamentos);
  const faturamentoPorDia = useFaturamentoPorDia(agendamentos, 14);
  const faturamentoPorServico = useFaturamentoPorServico(agendamentos);

  // Faturamento por mês (últimos 6 meses) — visão de evolução
  const faturamentoPorMes = useMemo(() => {
    const mapa = new Map<string, number>();
    const agora = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      mapa.set(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        0,
      );
    }
    for (const a of ativos) {
      const chave = a.data.slice(0, 7);
      if (mapa.has(chave)) {
        mapa.set(chave, (mapa.get(chave) ?? 0) + (a.servico?.preco ?? 0));
      }
    }
    return [...mapa.entries()].map(([chave, valor]) => {
      const [y, m] = chave.split("-");
      const nome = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(
        "pt-BR",
        { month: "short" },
      );
      return { label: nome, value: valor };
    });
  }, [ativos]);

  // Horários mais procurados — quais horários a cliente mais agenda
  const horariosProcurados = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const a of ativos) {
      const h = a.horario.slice(0, 5);
      mapa.set(h, (mapa.get(h) ?? 0) + 1);
    }
    return [...mapa.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((x, y) => y.value - x.value)
      .slice(0, 6);
  }, [ativos]);

  // Clientes novas vs recorrentes — frequência de retorno
  const recorrencia = useMemo(() => {
    const porCliente = new Map<string, number>();
    for (const a of ativos) {
      const chave = a.cliente?.telefone ?? a.cliente_id;
      porCliente.set(chave, (porCliente.get(chave) ?? 0) + 1);
    }
    let novas = 0;
    let recorrentes = 0;
    for (const qtd of porCliente.values()) {
      if (qtd >= 2) recorrentes += 1;
      else novas += 1;
    }
    return [
      { label: "Recorrentes (2+ visitas)", value: recorrentes, color: "#2f4a3e" },
      { label: "Novas (1 visita)", value: novas, color: "#c9a86a" },
    ];
  }, [ativos]);

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
        color: "#403501",
      },
      {
        label: "Concluídos",
        value: agendamentos.filter((a) => a.status === "concluido").length,
        color: "#7f7a2f",
      },
      {
        label: "Cancelados",
        value: agendamentos.filter((a) => a.status === "cancelado").length,
        color: "#d97b59",
      },
    ],
    [agendamentos],
  );

  const maxVendas = Math.max(1, ...maisVendidos.map((s) => s.qtd));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Análises
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ganhos, indicadores e o movimento do estúdio — exclusivo do painel.
        </p>
      </div>

      {/* Indicadores rápidos */}
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
            label="Agendamentos ativos"
            value={String(ativos.length)}
            sub="total no sistema"
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
            icon={Clock}
            label="Próximos 7 dias"
            value={String(proximaSemana.length)}
            sub="atendimentos agendados"
            accent="green"
          />
        </div>
      )}

      {/* GANHOS E ANALYTICS — cálculos e gráficos */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="size-5 text-green-800" />
          <h2 className="font-display text-xl font-bold text-foreground">
            Ganhos e analytics
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Wallet}
            label="Faturamento hoje"
            value={formatBRL(faturamentoHoje)}
            sub={`${doDia.length} atendimento(s)`}
            accent="green"
          />
          <StatCard
            icon={CalendarDays}
            label="Próximos 7 dias"
            value={formatBRL(faturamentoSemana)}
            sub="previsto"
            accent="gold"
          />
          <StatCard
            icon={TrendingUp}
            label="Próximos 30 dias"
            value={formatBRL(faturamentoMes)}
            sub="previsto"
            accent="bronze"
          />
          <StatCard
            icon={Receipt}
            label="Ticket médio"
            value={formatBRL(ticketMedio)}
            sub="por atendimento"
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Faturamento por dia</CardTitle>
              <CardDescription>Últimos 14 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-44 w-full rounded-xl" />
              ) : (
                <BarChartVertical items={faturamentoPorDia} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por status</CardTitle>
              <CardDescription>
                Faturamento total:{" "}
                <span className="font-semibold text-green-800">
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

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Faturamento por mês</CardTitle>
              <CardDescription>Evolução dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-44 w-full rounded-xl" />
              ) : (
                <BarChartVertical items={faturamentoPorMes} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horários mais procurados</CardTitle>
              <CardDescription>Quais horários mais geram agenda</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              ) : horariosProcurados.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  Sem horários registrados ainda.
                </p>
              ) : (
                <BarChart items={horariosProcurados} maxLabelWidth="w-10" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes novas vs recorrentes</CardTitle>
              <CardDescription>Frequência de retorno ao estúdio</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-36 w-full rounded-xl" />
              ) : (
                <DonutChart segments={recorrencia} />
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Faturamento por serviço</CardTitle>
              <CardDescription>Quais serviços geram mais receita</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              ) : (
                <BarChart items={faturamentoPorServico} maxLabelWidth="w-28" />
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-4 text-green-800" />
                Serviços mais vendidos
              </CardTitle>
              <CardDescription>Ranking por número de agendamentos</CardDescription>
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
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-blood/30 bg-blood/10 text-xs font-bold text-blood">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="truncate text-sm font-semibold text-card-foreground">
                            {s.nome}
                          </p>
                          <p className="shrink-0 text-xs text-muted-foreground">
                            {s.qtd}× · {formatBRL(s.receita)}
                          </p>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="bg-gold-gradient h-full rounded-full transition-all duration-500"
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
      </div>
    </div>
  );
}
