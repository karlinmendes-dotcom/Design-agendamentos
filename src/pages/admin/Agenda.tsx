import { useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarX,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hand,
  Loader2,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Tag,
  User,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAgendamentosPorData } from "@/hooks/useAgendamentos";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { erroMensagem } from "@/lib/convex";
import { useToast } from "@/contexts/ToastContext";
import { formatBRL } from "@/utils/format";
import { addDaysISO, formatDateLong, formatDateShort, todayISO } from "@/utils/date";
import {
  STATUS_AGENDAMENTO,
  type Agendamento,
  type StatusAgendamento,
} from "@/types";

const POR_PAGINA = 8;

/** Telefone no formato do wa.me (55 + dígitos) — para falar com a cliente. */
function waMe(telefone?: string | null): string | null {
  const digitos = (telefone ?? "").replace(/\D/g, "");
  if (digitos.length < 8) return null;
  return `https://wa.me/55${digitos.slice(-11)}`;
}

export function Agenda() {
  const [data, setData] = useState(todayISO());
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | StatusAgendamento>("todos");
  const [pagina, setPagina] = useState(1);
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

  /** Troca o status a partir do modal de detalhes (mantém o modal aberto). */
  const mudarStatusDetalhe = async (status: StatusAgendamento) => {
    if (!selecionado) return;
    await mudarStatus(selecionado.id, status);
    // Atualiza o agendamento exibido no modal com o novo status
    setSelecionado((atual) =>
      atual ? { ...atual, status } : atual,
    );
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
          `${resultado.cancelados} agendamento(s) cancelado(s). ⚠️ Notificação ainda não configurada (FIREBASE_SERVICE_ACCOUNT).`,
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

  /** Confirmação explícita antes de cancelar pelo modal de detalhes. */
  const cancelarIndividual = async () => {
    if (!selecionado) return;
    const nome = selecionado.cliente?.nome ?? "esta cliente";
    if (
      !window.confirm(
        `Cancelar o horário das ${selecionado.horario} de ${nome}?\n\nA cliente será avisada por notificação.`,
      )
    )
      return;
    await mudarStatusDetalhe("cancelado");
  };

  const whatsCliente = selecionado ? waMe(selecionado.cliente?.telefone) : null;

  const InfoItem = ({
    icon: Icon,
    rotulo,
    valor,
  }: {
    icon: typeof User;
    rotulo: string;
    valor: string;
  }) => (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 px-3.5 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          {rotulo}
        </p>
        <p className="mt-0.5 text-sm font-semibold break-words text-card-foreground">
          {valor}
        </p>
      </div>
    </div>
  );

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

      {/* Barra de controles */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
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
          <p className="font-semibold text-foreground">{formatDateLong(data)}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateShort(data)} · {filtrados.length} agendamento(s)
          </p>
        </div>
      </div>

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

      {/* ===== Modal de detalhes do agendamento ===== */}
      <Dialog
        open={selecionado !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setSelecionado(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {selecionado && (
            <>
              <DialogHeader className="text-left">
                <div className="flex items-center justify-between gap-3 pr-8">
                  <DialogTitle className="text-2xl">
                    {selecionado.cliente?.nome ?? "Cliente"}
                  </DialogTitle>
                  <StatusBadge status={selecionado.status} />
                </div>
                <DialogDescription className="flex items-center gap-2">
                  <Clock className="size-3.5 text-gold" />
                  {formatDateLong(selecionado.data)} · às {selecionado.horario}
                </DialogDescription>
              </DialogHeader>

              {/* Resumo do horário */}
              <div className="rounded-2xl bg-gold-gradient px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.25em] text-cream/70 uppercase">
                      Atendimento
                    </p>
                    <p className="font-display text-2xl font-extrabold text-cream">
                      {formatDateShort(selecionado.data)} · {selecionado.horario}
                    </p>
                  </div>
                  <p className="font-display text-2xl font-extrabold text-cream">
                    {formatBRL(selecionado.servico?.preco ?? 0)}
                  </p>
                </div>
              </div>

              {/* Informações em grade */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                <InfoItem
                  icon={User}
                  rotulo="Cliente"
                  valor={selecionado.cliente?.nome ?? "—"}
                />
                <InfoItem
                  icon={Phone}
                  rotulo="WhatsApp"
                  valor={selecionado.cliente?.telefone ?? "—"}
                />
                <InfoItem
                  icon={Tag}
                  rotulo="Serviço"
                  valor={selecionado.servico?.nome ?? "—"}
                />
                <InfoItem
                  icon={Sparkles}
                  rotulo="Duração"
                  valor={`${selecionado.duracao_minutos ?? selecionado.servico?.duracao_minutos ?? "—"} minutos`}
                />
                <InfoItem
                  icon={User}
                  rotulo="Profissional"
                  valor={selecionado.barbeiro?.nome ?? "Estúdio"}
                />
                <InfoItem
                  icon={CalendarDays}
                  rotulo="Status"
                  valor={STATUS_AGENDAMENTO[selecionado.status]}
                />
              </div>

              {/* Ações */}
              <div className="mt-1 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      Mudar status
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Marque quando o atendimento acontecer ou for cancelado.
                    </p>
                  </div>
                  <Select
                    value={selecionado.status}
                    onValueChange={(v) =>
                      void mudarStatusDetalhe(v as StatusAgendamento)
                    }
                    disabled={salvandoId === selecionado.id}
                  >
                    <SelectTrigger
                      size="sm"
                      className="w-36"
                      aria-label="Alterar status"
                    >
                      {salvandoId === selecionado.id ? (
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

                <DialogFooter className="gap-2 sm:flex-row">
                  {selecionado.status !== "concluido" && (
                    <Button
                      variant="gold"
                      className="flex-1"
                      disabled={salvandoId === selecionado.id}
                      onClick={() => void mudarStatusDetalhe("concluido")}
                    >
                      {salvandoId === selecionado.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Concluir
                    </Button>
                  )}
                  {selecionado.status !== "cancelado" && (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={salvandoId === selecionado.id}
                      onClick={() => void cancelarIndividual()}
                    >
                      {salvandoId === selecionado.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      Cancelar
                    </Button>
                  )}
                  {whatsCliente && (
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                    >
                      <a
                        href={whatsCliente}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="size-4 text-green-700" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
