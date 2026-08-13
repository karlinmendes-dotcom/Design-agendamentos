import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Horario } from "@/types";

export function useHorarios(ativos = false) {
  const dados = useQuery(ativos ? api.horarios.listAtivos : api.horarios.list);

  return {
    horarios: (dados ?? []) as Horario[],
    loading: dados === undefined,
    error: null,
    refresh: () => Promise.resolve(),
  };
}
