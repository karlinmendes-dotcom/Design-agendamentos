import { Badge } from "@/components/ui/badge";
import { STATUS_AGENDAMENTO, type StatusAgendamento } from "@/types";

const VARIANTE_POR_STATUS: Record<StatusAgendamento, "gold" | "success" | "destructive"> = {
  confirmado: "gold",
  concluido: "success",
  cancelado: "destructive",
};

export function StatusBadge({ status }: { status: StatusAgendamento }) {
  return (
    <Badge variant={VARIANTE_POR_STATUS[status]}>
      {STATUS_AGENDAMENTO[status]}
    </Badge>
  );
}
