import { useMemo, useState, type FormEvent } from "react";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Hand,
  Phone,
  Receipt,
  RefreshCw,
  Search,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  BarChart,
  BarChartVertical,
  DonutChart,
  useAgendamentosPorDiaSemana,
  useFaturamentoPorDia,
  useFaturamentoPorServico,
} from "@/components/Charts";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import {
  useBuscarClientes,
  useHistoricoCliente,
  type ClienteResumo,
} from "@/hooks/useClientes";
import { formatBRL } from "@/utils/format";
import { formatDateLong, formatDateShort, todayISO } from "@/utils/date";
import { cn } from "@/lib/utils";
import type { Agendamento } from "@/types";

type PeriodoAgenda = "hoje" | "semana" | "mes";

const PERIODOS: { valor: PeriodoAgenda; label: string }[] = [
  { valor: "hoje", label: "Hoje" },
  { valor: "semana", label: "Semana" },
  { valor: "mes", label: "Mês" },
];

/** Filtra agendamentos pelo período e ordena por data/horário. */
function agendarPorPeriodo(
  lista: Agendamento[],
  periodo: PeriodoAgenda,
  hojeISO: string,
): Agendamento[] {
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

/** Cartão compacto de resumo (histórico da cliente). */
function ResumoItem({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/25 px-4 py-3">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {rotulo}
      </p>
      <p className="font-display mt-1 text-lg font-bold text-card-foreground">{valor}</p>
    </div>
  );
}

export function Dashboard() {
  const { agendamentos, loading, refresh, usandoDemo } = useAgendamentos();
  const hoje = todayISO();
  const [periodo, setPeriodo] = useState<PeriodoAgenda>("hoje");

  // -------- Estatísticas rápidas (topo) --------
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
  const proximaSemana = useMemo(
    () =>
      agendamentos.filter(
        (a) => a.status !== "cancelado" && a.data >= hoje && a.data < addDays(hoje, 7),
      ),
    [agendamentos, hoje],
  );

  const agendaDoPeriodo = useMemo(
    () => agendarPorPeriodo(agendamentos, periodo, hoje),
    [agendamentos, periodo, hoje],
  );

  // -------- Ganhos (analytics, mais abaixo) --------
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
          (a) => a.status !== "cancelado" && a.data >= hoje && a.data < addDays(hoje, 30),
        )
        .reduce((soma, a) => soma + (a.servico?.preco ?? 0), 0),
    [agendamentos, hoje],
  );
  const faturamentoTotal = useMemo(
    () => ativos.reduce((soma, a) => soma + (a.servico?.preco ?? 0), 0),
    [ativos],
  );
  const ticketMedio = ativos.length > 0 ? faturamentoTotal / ativos.length : 0;

  // -------- Busca de cliente --------
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState("");
  const [cliente, setCliente] = useState<ClienteResumo | null>(null);
  const [meses, setMeses] = useState<number | null>(null);
  const { resultados, loading: loadingBusca } = useBuscarClientes(busca);
  const { historico, loading: loadingHistorico } = useHistoricoCliente(cliente, meses);

  const executarBusca = (e: FormEvent) => {
    e.preventDefault();
    setCliente(null);
    setBusca(termo.trim());
  };

  // -------- Gráficos --------
  const barrasSemana = useAgendamentosPorDiaSemana(agendamentos);
  const faturamentoPorDia = useFaturamentoPorDia(agendamentos, 14);
  const faturamentoPorServico = useFaturamentoPorServico(agendamentos);

  // Faturamento por mês (últimos 6 meses) — visão de evolução
  const faturamentoPorMes = useMemo(() => {
    const mapa = new Map<string, number>();
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua agenda em destaque — e logo abaixo, o movimento do estúdio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {usandoDemo && (
            <span className="rounded-full border border-yellow-600/40 bg-yellow-500/15 px-3 py-1 text-xs text-yellow-700">
              Dados de demonstração
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            <RefreshCw className="size-3.5" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* AGENDA — a estrela do dashboard: primeira coisa que ela vê */}
      <div className="overflow-hidden rounded-2xl border border-gold/25 bg-card shadow-[0_24px_60px_-42px_rgba(64,53,1,0.55)]">
        {/* Cabeçalho da agenda */}
        <div className="bg-gold-gradient px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-gold-light/40 bg-black/25 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)]">
                <CalendarDays className="size-5 text-gold-light" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-cream sm:text-2xl">
                  Sua agenda
                </h2>
                <p className="mt-0.5 text-xs text-cream/75 sm:text-sm">
                  {periodo === "hoje"
                    ? formatDateLong(hoje)
                    : periodo === "semana"
                      ? "Próximos 7 dias"
                      : "Próximos 30 dias"}
                  {" · "}
                  <span className="font-semibold text-gold-light">
                    {agendaDoPeriodo.length}{" "}
                    {agendaDoPeriodo.length === 1 ? "atendimento" : "atendimentos"}
                  </span>
                  {" · "}
                  {formatBRL(
                    agendaDoPeriodo.reduce((s, a) => s + (a.servico?.preco ?? 0), 0),
                  )}{" "}
                  previstos
                </p>
              </div>
            </div>
            <div className="inline-flex self-start rounded-xl border border-gold-light/30 bg-black/25 p-1 sm:self-auto">
              {PERIODOS.map((p) => (
                <button
                  key={p.valor}
                  type="button"
                  onClick={() => setPeriodo(p.valor)}
                  className={cn(
                    "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                    periodo === p.valor
                      ? "bg-cream text-green-900 shadow"
                      : "text-cream/70 hover:text-cream",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Corpo da agenda */}
        {loading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : agendaDoPeriodo.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              icon={Hand}
              title="Nenhum agendamento no período"
              description="Quando os clientes agendarem, os horários aparecerão aqui em destaque."
            />
          </div>
        ) : (
          <div>
            {/* Próxima cliente em destaque (hoje) */}
            {periodo === "hoje" && (
              <div className="flex flex-wrap items-center gap-4 border-b border-border/60 bg-muted/35 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex flex-col items-center rounded-xl border border-gold/35 bg-gold/15 px-3.5 py-2">
                    <span className="font-display text-2xl leading-none font-extrabold tabular-nums text-green-900">
                      {agendaDoPeriodo[0].horario.slice(0, 2)}
                    </span>
                    <span className="mt-0.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                      {agendaDoPeriodo[0].horario.slice(3)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-blood uppercase">
                      Próxima cliente
                    </p>
                    <p className="font-display mt-0.5 truncate text-xl font-bold text-card-foreground">
                      {agendaDoPeriodo[0].cliente?.nome ?? "—"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {agendaDoPeriodo[0].servico?.nome ?? "—"} ·{" "}
                      {formatBRL(agendaDoPeriodo[0].servico?.preco ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={agendaDoPeriodo[0].status} />
                </div>
              </div>
            )}

            {/* Lista cronológica */}
            <div className="divide-y divide-border/60">
              {agendaDoPeriodo
                .slice(periodo === "hoje" ? 1 : 0)
                .map((a) => (
                  <div
                    key={a.id}
                    className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/25 sm:px-6"
                  >
                    <div className="flex w-14 shrink-0 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 py-2">
                      <span className="font-display text-sm font-extrabold tabular-nums text-green-900">
                        {a.horario}
                      </span>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-gradient font-display text-sm font-bold text-cream shadow-[0_6px_16px_-8px_rgba(64,53,1,0.6)]">
                      {(a.cliente?.nome ?? "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-card-foreground">
                        {a.cliente?.nome ?? "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.servico?.nome ?? "—"}
                        {periodo !== "hoje" ? ` · ${formatDateShort(a.data)}` : ""}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-sm font-bold text-card-foreground">
                        {formatBRL(a.servico?.preco ?? 0)}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
            </div>
          </div>
        )}
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

      {/* BUSCAR CLIENTE — histórico completo pelo nome ou telefone */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4 text-green-800" />
              Buscar cliente
            </CardTitle>
            <CardDescription>
              Digite o nome ou o telefone e veja todo o histórico da cliente — o que ela faz,
              com que frequência e quanto já investiu no estúdio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={executarBusca}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder="Ex.: Maria ou (27) 99614-0639"
                  className="h-10 w-full pl-9"
                  aria-label="Buscar cliente por nome ou telefone"
                />
              </div>
              <Button type="submit" className="h-10">
                <Search className="size-4" />
                Buscar
              </Button>
            </form>

            {/* Histórico da cliente selecionada */}
            {cliente ? (
              <div className="mt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full border border-gold/40 bg-gold/15">
                      <UserRound className="size-5 text-green-800" />
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold text-card-foreground">
                        {cliente.nome}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="size-3" />
                        {cliente.telefone}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={meses ? String(meses) : "tudo"}
                      onValueChange={(v) =>
                        setMeses(v === "tudo" ? null : Number(v))
                      }
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-40"
                        aria-label="Período do histórico"
                      >
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tudo">Todo o histórico</SelectItem>
                        <SelectItem value="3">Últimos 3 meses</SelectItem>
                        <SelectItem value="6">Últimos 6 meses</SelectItem>
                        <SelectItem value="12">Últimos 12 meses</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCliente(null)}
                    >
                      Nova busca
                    </Button>
                  </div>
                </div>

                {loadingHistorico ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                  </div>
                ) : historico ? (
                  <>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <ResumoItem rotulo="Visitas" valor={String(historico.resumo.visitas)} />
                      <ResumoItem
                        rotulo="Total investido"
                        valor={formatBRL(historico.resumo.total_gasto)}
                      />
                      <ResumoItem
                        rotulo="Última visita"
                        valor={
                          historico.resumo.ultima_visita
                            ? formatDateShort(historico.resumo.ultima_visita)
                            : "—"
                        }
                      />
                      <ResumoItem
                        rotulo="Serviço favorito"
                        valor={historico.resumo.servico_favorito ?? "—"}
                      />
                    </div>

                    <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-card">
                      {historico.itens.length === 0 ? (
                        <div className="p-5">
                          <EmptyState
                            icon={Hand}
                            title="Sem atendimentos registrados"
                            description="O histórico desta cliente aparece aqui assim que houver agendamentos."
                          />
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Horário</TableHead>
                              <TableHead>Serviço</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {historico.itens.map((i) => (
                              <TableRow key={i.id}>
                                <TableCell>{formatDateShort(i.data)}</TableCell>
                                <TableCell className="font-semibold tabular-nums text-green-800">
                                  {i.horario}
                                </TableCell>
                                <TableCell>{i.servico_nome}</TableCell>
                                <TableCell className="text-right">
                                  {formatBRL(i.valor)}
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={i.status} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>

                    {historico.resumo.periodo_inicio && historico.resumo.periodo_fim && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {meses
                          ? `Últimos ${meses} ${meses === 1 ? "mês" : "meses"}: `
                          : "Histórico completo: "}
                        de {formatDateShort(historico.resumo.periodo_inicio)} até{" "}
                        {formatDateShort(historico.resumo.periodo_fim)}.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
            ) : loadingBusca ? (
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : resultados.length > 0 ? (
              <ul className="mt-4 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70">
                {resultados.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setCliente(r)}
                      className="flex w-full items-center justify-between gap-3 bg-background/40 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/15">
                          <UserRound className="size-4 text-green-800" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-card-foreground">
                            {r.nome}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="size-3" />
                            {r.telefone}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-card-foreground">
                          {formatBRL(r.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.qtd} atendimento(s)
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : busca.length >= 2 ? (
              <div className="mt-4">
                <EmptyState
                  icon={UserRound}
                  title="Nenhuma cliente encontrada"
                  description="Verifique o nome ou o número digitado. O histórico de quem já agendou fica salvo no banco."
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres e toque em{" "}
                <span className="font-semibold text-card-foreground">Buscar</span>.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

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

/** Data + N dias (ISO) — evita importar utilitário extra aqui. */
function addDays(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}
