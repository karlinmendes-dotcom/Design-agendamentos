import { useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Hand,
  List,
  Loader2,
  Search,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DetalhesAgendamento } from "@/components/admin/DetalhesAgendamento";
import { CalendarioAgenda } from "@/components/admin/CalendarioAgenda";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAgendamentos, useAgendamentosPorData } from "@/hooks/useAgendamentos";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { erroMensagem } from "@/lib/convex";
import { cn } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";
import { formatBRL } from "@/utils/format";
import {
  addDaysISO,
  formatDateLong,
  formatDateShort,
  formatDateWeekday,
  todayISO,
} from "@/utils/date";
import {
  STATUS_AGENDAMENTO,
  type Agendamento,
  type StatusAgendamento,
} from "@/types";

const POR_PAGINA = 8;

export function Agenda() {
  const [data, setData] = useState(todayISO());
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | StatusAgendamento>("todos");
  const [pagina, setPagina] = useState(1);
  const [visao, setVisao] = useState<"lista" | "calendario">("calendario");
  const [semana, setSemana] = useState(() => {
    // Segunda-feira da semana atual (início da semana do calendário)
    const hoje = new Date();
    return addDaysISO(-((hoje.getDay() + 6) % 7));
  });
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [cancelandoDia, setCancelandoDia] = useState(false);
  const [selecionado, setSelecionado] = useState<Agendamento | null>(null);
  const { toast } = useToast();
  const { agendamentos, loading } = useAgendamentosPorData(data);
  const atualizarStatus = useMutation(api.agendamentos.atualizarStatus);
  const enviarAviso = useAction(api.push.enviarParaTelefones);
  const cancelarDiaCompleto = useAction(api.push.cancelarDiaCompleto);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return [...agendamentos]
      .filter((a) => (filtroStatus === "todos" ? true : a.status === filtroStatus))
      .filter((a) => {
        if (!termo) return true;
        return (
          a.cliente?.nome?.toLowerCase().includes(termo) ||
          a.cliente?.telefone?.toLowerCase().includes(termo) ||
          a.servico?.nome?.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => a.horario.localeCompare(b.horario));
  }, [agendamentos, busca, filtroStatus]);

  // ---------- Dados do calendário semanal ----------
  const { agendamentos: todosAgendamentos, loading: loadingTudo } = useAgendamentos();
  const semanaDias = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        addDaysISO(i, new Date(`${semana}T12:00:00`)),
      ),
    [semana],
  );
  const fimSemana = addDaysISO(6, new Date(`${semana}T12:00:00`));
  const agendamentosSemana = useMemo(
    () =>
      todosAgendamentos.filter(
        (a) => a.data >= semana && a.data <= fimSemana,
      ),
    [todosAgendamentos, semana, fimSemana],
  );
  const filtradosCalendario = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return agendamentosSemana
      .filter((a) =>
        filtroStatus === "todos" ? true : a.status === filtroStatus,
      )
      .filter((a) => {
        if (!termo) return true;
        return (
          a.cliente?.nome?.toLowerCase().includes(termo) ||
          a.cliente?.telefone?.toLowerCase().includes(termo) ||
          a.servico?.nome?.toLowerCase().includes(termo)
        );
      });
  }, [agendamentosSemana, busca, filtroStatus]);

  const mudarSemana = (semanas: number) => {
    setSemana((s) => addDaysISO(semanas * 7, new Date(`${s}T12:00:00`)));
  };
  const voltarParaHoje = () => {
    const hoje = new Date();
    setSemana(addDaysISO(-((hoje.getDay() + 6) % 7)));
  };

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice(
    (paginaAtual - 1) * POR_PAGINA,
    paginaAtual * POR_PAGINA,
  );

  const mudarFiltro = (fn: () => void) => {
    fn();
    setPagina(1);
  };

  const mudarStatus = async (id: string, status: StatusAgendamento) => {
    setSalvandoId(id);
    try {
      await atualizarStatus({ id: id as Id<"agendamentos">, status });
      toast("success", `Agendamento atualizado para "${STATUS_AGENDAMENTO[status]}".`);
      // Cancelou um horário individual → avisa a cliente por notificação
      if (status === "cancelado") {
        const ag = agendamentos.find((a) => a.id === id);
        if (ag?.cliente?.telefone) {
          void enviarAviso({ telefones: [ag.cliente.telefone], data }).catch(
            () => {},
          );
        }
      }
    } catch (err) {
      toast(
        "error",
        erroMensagem(err, "Não foi possível atualizar o status."),
      );
    } finally {
      setSalvandoId(null);
    }
  };

  const cancelarDiaInteiro = async () => {
    if (
      !window.confirm(
        `Cancelar TODOS os agendamentos de ${formatDateLong(data)}?\n\nAs clientes afetadas serão avisadas por notificação.`,
      )
    )
      return;
    setCancelandoDia(true);
    try {
      const resultado = await cancelarDiaCompleto({ data });
      if (resultado.push?.sem_configuracao) {
        toast(
          "success",
          `${resultado.cancelados} agendamento(s) cancelado(s). ⚠️ Aviso por notificação não enviado: falta a VAPID_PRIVATE_KEY no Convex (Environment Variables).`,
        );
      } else {
        toast(
          "success",
          `${resultado.cancelados} agendamento(s) cancelado(s) · ${resultado.push?.enviados ?? 0} cliente(s) avisado(s) por notificação.`,
        );
      }
    } catch (err) {
      toast("error", erroMensagem(err, "Não foi possível cancelar o dia."));
    } finally {
      setCancelandoDia(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Agenda
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toque em qualquer atendimento para ver os detalhes e gerenciar o
          horário.
        </p>
      </div>

      {/* Alternador: Calendário (semana) ou Lista (dia) */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border/70 bg-card p-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => setVisao("calendario")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              visao === "calendario"
                ? "bg-green-800 text-cream"
                : "text-muted-foreground hover:bg-green-800/10 hover:text-green-900",
            )}
          >
            <CalendarDays className="size-4" />
            Calendário
          </button>
          <button
            type="button"
            onClick={() => setVisao("lista")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              visao === "lista"
                ? "bg-green-800 text-cream"
                : "text-muted-foreground hover:bg-green-800/10 hover:text-green-900",
            )}
          >
            <List className="size-4" />
            Lista
          </button>
        </div>
        {visao === "calendario" && (
          <p className="text-xs text-muted-foreground">
            Toque em qualquer horário pintado para ver os detalhes e gerenciar.
          </p>
        )}
      </div>

      {/* Barra de controles */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {visao === "lista" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setData((d) => addDaysISO(-1, new Date(`${d}T12:00:00`)));
                  setPagina(1);
                }}
                aria-label="Dia anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Input
                type="date"
                value={data}
                onChange={(e) => {
                  setData(e.target.value || todayISO());
                  setPagina(1);
                }}
                className="h-10 w-fit"
                aria-label="Data da agenda"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setData((d) => addDaysISO(1, new Date(`${d}T12:00:00`)));
                  setPagina(1);
                }}
                aria-label="Próximo dia"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}

          {visao === "calendario" && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => mudarSemana(-1)}
                aria-label="Semana anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={voltarParaHoje}>
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => mudarSemana(1)}
                aria-label="Próxima semana"
              >
                <ChevronRight className="size-4" />
              </Button>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatDateShort(semana)} a {formatDateShort(fimSemana)}
              </span>
            </div>
          )}

          {visao === "lista" && (
            <Button
              variant="destructive"
              size="sm"
              disabled={cancelandoDia}
              onClick={() => void cancelarDiaInteiro()}
              aria-label="Cancelar todos os agendamentos do dia"
            >
              {cancelandoDia ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CalendarX className="size-3.5" />
              )}
              Cancelar dia
            </Button>
          )}

          <div className="relative min-w-0">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => mudarFiltro(() => setBusca(e.target.value))}
              placeholder="Buscar cliente, telefone ou serviço..."
              className="h-10 w-full pl-9 sm:w-64"
            />
          </div>

          <Select
            value={filtroStatus}
            onValueChange={(v) =>
              mudarFiltro(() => setFiltroStatus(v as "todos" | StatusAgendamento))
            }
          >
            <SelectTrigger className="w-40" aria-label="Filtrar por status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {(Object.keys(STATUS_AGENDAMENTO) as StatusAgendamento[]).map(
                (status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_AGENDAMENTO[status]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm lg:text-right">
          {visao === "lista" ? (
            <>
              <p className="font-semibold text-foreground">
                {formatDateLong(data)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateShort(data)} · {filtrados.length} agendamento(s)
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">
                Semana de {formatDateWeekday(semana)} a{" "}
                {formatDateWeekday(fimSemana)}
              </p>
              <p className="text-xs text-muted-foreground">
                {filtradosCalendario.length} agendamento(s) nesta semana
              </p>
            </>
          )}
        </div>
      </div>

      {visao === "calendario" ? (
        <div className="space-y-4">
          {loadingTudo ? (
            <div className="rounded-xl border border-border/80 bg-card p-5">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <CalendarioAgenda
              dias={semanaDias}
              agendamentos={filtradosCalendario}
              onSelecionar={setSelecionado}
            />
          )}

          {/* Legenda */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-green-600" /> Confirmado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-gold" /> Concluído
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-muted ring-1 ring-border/60" />{" "}
              Cancelado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-gold/[0.18] ring-1 ring-gold/30" />{" "}
              Almoço (11h–14h)
            </span>
          </div>
        </div>
      ) : (
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Hand}
              title={
                busca || filtroStatus !== "todos"
                  ? "Nenhum resultado encontrado"
                  : "Nenhum agendamento para este dia"
              }
              description={
                busca || filtroStatus !== "todos"
                  ? "Ajuste a busca ou o filtro de status."
                  : "Quando os clientes agendarem, os horários aparecerão aqui."
              }
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiveis.map((a) => (
                  <TableRow
                    key={a.id}
                    onClick={() => setSelecionado(a)}
                    className="cursor-pointer transition-colors hover:bg-gold/5"
                    aria-label={`Ver detalhes do agendamento de ${a.cliente?.nome ?? "cliente"} às ${a.horario}`}
                  >
                    <TableCell className="font-display text-base font-bold text-green-800 tabular-nums">
                      {a.horario}
                    </TableCell>
                    <TableCell className="font-medium text-card-foreground">
                      {a.cliente?.nome ?? "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {a.cliente?.telefone ?? "—"}
                    </TableCell>
                    <TableCell>{a.servico?.nome ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.barbeiro?.nome ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatBRL(a.servico?.preco ?? 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={a.status} />
                        {/* stopPropagation: clicar no seletor de status NÃO abre o modal */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={a.status}
                            onValueChange={(v) =>
                              void mudarStatus(a.id, v as StatusAgendamento)
                            }
                            disabled={salvandoId === a.id}
                          >
                            <SelectTrigger
                              size="sm"
                              className="w-32"
                              aria-label="Alterar status"
                            >
                              {salvandoId === a.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(STATUS_AGENDAMENTO) as StatusAgendamento[]).map(
                                (status) => (
                                  <SelectItem key={status} value={status}>
                                    {STATUS_AGENDAMENTO[status]}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
                <p className="text-xs text-muted-foreground">
                  Página {paginaAtual} de {totalPaginas} · {filtrados.length}{" "}
                  agendamento(s)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paginaAtual <= 1}
                    onClick={() => setPagina((p) => p - 1)}
                  >
                    <ChevronLeft className="size-3.5" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paginaAtual >= totalPaginas}
                    onClick={() => setPagina((p) => p + 1)}
                  >
                    Próxima
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* Modal de detalhes do agendamento (compartilhado com o Dashboard) */}
      <DetalhesAgendamento
        agendamento={selecionado}
        onFechar={() => setSelecionado(null)}
      />
    </div>
  );
}
