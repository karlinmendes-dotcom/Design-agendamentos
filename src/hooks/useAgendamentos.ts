import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Agendamento } from "@/types";

export function useAgendamentos() {
  const dados = useQuery(api.agendamentos.list);

  return {
    agendamentos: (dados ?? []) as Agendamento[],
    loading: dados === undefined,
    error: null,
    refresh: () => Promise.resolve(),
  };
}

export function useAgendamentosPorData(data: string, barbeiroId?: string | null) {
  const agendamentos = useQuery(api.agendamentos.listPorData, { data });
  const ocupados = useQuery(api.agendamentos.listOcupados, {
    data,
    barbeiroId: (barbeiroId ?? null) as Id<"barbeiros"> | null,
  });

  return {
    agendamentos: agendamentos ?? [],
    ocupados: ocupados ?? [],
    loading: agendamentos === undefined || ocupados === undefined,
  };
}
