import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { isConvexConfigured } from "@/lib/convex";
import { DEMO_AGENDAMENTOS } from "@/data/demo";
import type { Agendamento } from "@/types";

export function useAgendamentos() {
  const dados = useQuery(api.agendamentos.list);
  const usandoDemo = !isConvexConfigured;

  const agendamentos: Agendamento[] = usandoDemo
    ? DEMO_AGENDAMENTOS
    : (dados ?? []);

  return {
    agendamentos,
    loading: !usandoDemo && dados === undefined,
    error: null,
    refresh: () => Promise.resolve(),
    usandoDemo,
  };
}

export function useAgendamentosPorData(data: string, barbeiroId?: string | null) {
  const agendamentos = useQuery(api.agendamentos.listPorData, { data });
  const ocupados = useQuery(api.agendamentos.listOcupados, {
    data,
    barbeiroId: (barbeiroId ?? null) as Id<"barbeiros"> | null,
  });
  const usandoDemo = !isConvexConfigured;

  if (usandoDemo) {
    const rows = DEMO_AGENDAMENTOS.filter(
      (a) => a.data === data && a.status !== "cancelado",
    );
    return {
      agendamentos: rows,
      ocupados: rows.map((r) => ({
        horario: r.horario,
        duracao_minutos: r.servico?.duracao_minutos ?? 30,
      })),
      loading: false,
    };
  }

  return {
    agendamentos: agendamentos ?? [],
    ocupados: ocupados ?? [],
    loading: agendamentos === undefined || ocupados === undefined,
  };
}
