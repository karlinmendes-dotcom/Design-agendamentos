import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  Phone,
  Sparkles,
  Tag,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
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
import { erroMensagem } from "@/lib/convex";
import { useToast } from "@/contexts/ToastContext";
import { formatBRL } from "@/utils/format";
import { formatDateLong, formatDateShort } from "@/utils/date";
import {
  STATUS_AGENDAMENTO,
  type Agendamento,
  type StatusAgendamento,
} from "@/types";

/** Telefone no formato do wa.me (55 + dígitos) — para falar com a cliente. */
function waMe(telefone?: string | null): string | null {
  const digitos = (telefone ?? "").replace(/\D/g, "");
  if (digitos.length < 8) return null;
  return `https://wa.me/55${digitos.slice(-11)}`;
}

interface Props {
  /** Agendamento em exibição — null fecha o modal. */
  agendamento: Agendamento | null;
  onFechar: () => void;
}

/**
 * Modal de detalhes do agendamento — compartilhado entre a aba Agenda e o
 * Dashboard (visão geral). Mostra cliente, WhatsApp, serviço, duração,
 * profissional, data/horário e valor, com ações de concluir, cancelar (com
 * confirmação + aviso por notificação) e falar no WhatsApp. Quando o
 * atendimento foi cancelado individualmente, mostra a pendência de 50% e o
 * botão "Pendência quitada" para a dona liberar a remarcação.
 */
export function DetalhesAgendamento({ agendamento, onFechar }: Props) {
  const [exibido, setExibido] = useState<Agendamento | null>(agendamento);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [quitando, setQuitando] = useState(false);
  const { toast } = useToast();
  const atualizarStatus = useMutation(api.agendamentos.atualizarStatus);
  const quitarPendencia = useMutation(api.agendamentos.quitarPendencia);
  const enviarAviso = useAction(api.push.enviarParaTelefones);

  // Sincroniza com o agendamento escolhido pelo pai (abre/atualiza o modal)
  useEffect(() => {
    setExibido(agendamento);
    if (!agendamento) setSalvandoId(null);
  }, [agendamento]);

  const mudarStatus = async (
    id: string,
    status: StatusAgendamento,
    data: string,
    telefone?: string | null,
  ) => {
    setSalvandoId(id);
    try {
      await atualizarStatus({ id: id as Id<"agendamentos">, status });
      toast("success", `Agendamento atualizado para "${STATUS_AGENDAMENTO[status]}".`);
      // Cancelou um horário individual → avisa a cliente por notificação
      if (status === "cancelado" && telefone) {
        void enviarAviso({ telefones: [telefone], data }).catch(() => {});
      }
      setExibido((atual) => (atual ? { ...atual, status } : atual));
    } catch (err) {
      toast("error", erroMensagem(err, "Não foi possível atualizar o status."));
    } finally {
      setSalvandoId(null);
    }
  };

  /** Dona confirma que recebeu os 50% → libera a remarcação da cliente. */
  const quitar = async () => {
    if (!exibido) return;
    setQuitando(true);
    try {
      await quitarPendencia({ id: exibido.id as Id<"agendamentos"> });
      setExibido((atual) => (atual ? { ...atual, pendencia: undefined } : atual));
      toast("success", "Pendência quitada — a cliente já pode remarcar. 💛");
    } catch (err) {
      toast("error", erroMensagem(err, "Não foi possível quitar a pendência."));
    } finally {
      setQuitando(false);
    }
  };

  /** Confirmação explícita antes de cancelar pelo modal de detalhes. */
  const cancelarIndividual = async () => {
    if (!exibido) return;
    const nome = exibido.cliente?.nome ?? "esta cliente";
    if (
      !window.confirm(
        `Cancelar o horário das ${exibido.horario} de ${nome}?\n\nA cliente será avisada por notificação.`,
      )
    )
      return;
    await mudarStatus(
      exibido.id,
      "cancelado",
      exibido.data,
      exibido.cliente?.telefone,
    );
  };

  const whatsCliente = exibido ? waMe(exibido.cliente?.telefone) : null;

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
    <Dialog open={exibido !== null} onOpenChange={(aberto) => !aberto && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {exibido && (
          <>
            <DialogHeader className="text-left">
              <div className="flex items-center justify-between gap-3 pr-8">
                <DialogTitle className="text-2xl">
                  {exibido.cliente?.nome ?? "Cliente"}
                </DialogTitle>
                <StatusBadge status={exibido.status} />
              </div>
              <DialogDescription className="flex items-center gap-2">
                <Clock className="size-3.5 text-gold" />
                {formatDateLong(exibido.data)} · às {exibido.horario}
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
                    {formatDateShort(exibido.data)} · {exibido.horario}
                  </p>
                </div>
                <p className="font-display text-2xl font-extrabold text-cream">
                  {formatBRL(exibido.servico?.preco ?? 0)}
                </p>
              </div>
            </div>

            {/* Informações em grade */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              <InfoItem
                icon={User}
                rotulo="Cliente"
                valor={exibido.cliente?.nome ?? "—"}
              />
              <InfoItem
                icon={Phone}
                rotulo="WhatsApp"
                valor={exibido.cliente?.telefone ?? "—"}
              />
              <InfoItem
                icon={Tag}
                rotulo="Serviço"
                valor={exibido.servico?.nome ?? "—"}
              />
              <InfoItem
                icon={Sparkles}
                rotulo="Duração"
                valor={`${exibido.duracao_minutos ?? exibido.servico?.duracao_minutos ?? "—"} minutos`}
              />
              <InfoItem
                icon={User}
                rotulo="Profissional"
                valor={exibido.barbeiro?.nome ?? "Estúdio"}
              />
              <InfoItem
                icon={CalendarDays}
                rotulo="Status"
                valor={STATUS_AGENDAMENTO[exibido.status]}
              />
            </div>

            {/* Pendência em aberto (cancelamento em cima da hora / falta) */}
            {exibido.status === "cancelado" && (exibido.pendencia ?? 0) > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700">
                    <Wallet className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-amber-800">
                      Pendência de {formatBRL(exibido.pendencia ?? 0)}
                    </p>
                    <p className="text-xs leading-relaxed text-amber-800/80">
                      50% do valor (regra de cancelamento em cima da hora /
                      falta). Enquanto não for quitada, a cliente vê o aviso ao
                      tentar remarcar.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-600/40 text-amber-800"
                  disabled={quitando}
                  onClick={() => void quitar()}
                >
                  {quitando ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                  Pendência quitada
                </Button>
              </div>
            )}

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
                  value={exibido.status}
                  onValueChange={(v) =>
                    void mudarStatus(
                      exibido.id,
                      v as StatusAgendamento,
                      exibido.data,
                      exibido.cliente?.telefone,
                    )
                  }
                  disabled={salvandoId === exibido.id}
                >
                  <SelectTrigger
                    size="sm"
                    className="w-36"
                    aria-label="Alterar status"
                  >
                    {salvandoId === exibido.id ? (
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
                {exibido.status !== "concluido" && (
                  <Button
                    variant="gold"
                    className="flex-1"
                    disabled={salvandoId === exibido.id}
                    onClick={() =>
                      void mudarStatus(
                        exibido.id,
                        "concluido",
                        exibido.data,
                        exibido.cliente?.telefone,
                      )
                    }
                  >
                    {salvandoId === exibido.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Concluir
                  </Button>
                )}
                {exibido.status !== "cancelado" && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={salvandoId === exibido.id}
                    onClick={() => void cancelarIndividual()}
                  >
                    {salvandoId === exibido.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    Cancelar
                  </Button>
                )}
                {whatsCliente && (
                  <Button asChild variant="outline" className="flex-1">
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
  );
}
