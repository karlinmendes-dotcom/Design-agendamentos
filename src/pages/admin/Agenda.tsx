import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingState } from "@/components/Feedback";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAgendamentosPorData } from "@/hooks/useAgendamentos";
import { atualizarStatusAgendamento } from "@/services/agendamentos";
import { formatBRL } from "@/utils/format";
import { addDaysISO, formatDateLong, formatDateShort, todayISO } from "@/utils/date";
import { STATUS_AGENDAMENTO, type StatusAgendamento } from "@/types";

export function Agenda() {
  const [data, setData] = useState(todayISO());
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const { agendamentos, loading } = useAgendamentosPorData(data);

  const ordenados = useMemo(
    () =>
      [...agendamentos].sort((a, b) =>
        a.horario.localeCompare(b.horario),
      ),
    [agendamentos],
  );

  const mudarStatus = async (id: string, status: StatusAgendamento) => {
    setSalvandoId(id);
    try {
      await atualizarStatusAgendamento(id, status);
    } catch {
      // erro silencioso: o refresh re-consulta o estado real
    } finally {
      setSalvandoId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
          Agenda
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os horários do dia e atualize o status de cada atendimento.
        </p>
      </div>

      {/* Filtro de data */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setData((d) => addDaysISO(-1, new Date(`${d}T12:00:00`)))}
            aria-label="Dia anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value || todayISO())}
            className="w-fit"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setData((d) => addDaysISO(1, new Date(`${d}T12:00:00`)))}
            aria-label="Próximo dia"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-cream">{formatDateLong(data)}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateShort(data)} · {ordenados.length} agendamento(s)
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? (
          <LoadingState label="Carregando agenda..." />
        ) : ordenados.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-muted-foreground">
            Nenhum agendamento para este dia. 🪒
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordenados.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-display text-base font-bold text-gold-light tabular-nums">
                    {a.horario}
                  </TableCell>
                  <TableCell className="font-medium text-cream">
                    {a.cliente?.nome ?? "—"}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {a.cliente?.telefone ?? "—"}
                  </TableCell>
                  <TableCell>{a.servico?.nome ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {formatBRL(a.servico?.preco ?? 0)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      <Select
                        value={a.status}
                        onValueChange={(v) => void mudarStatus(a.id, v as StatusAgendamento)}
                        disabled={salvandoId === a.id}
                      >
                        <SelectTrigger size="sm" className="w-32" aria-label="Alterar status">
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
