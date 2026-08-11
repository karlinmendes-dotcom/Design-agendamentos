import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex";
import { DEMO_HORARIOS } from "@/data/demo";
import type { Horario } from "@/types";

export function useHorarios(ativos = false) {
  const dados = useQuery(ativos ? api.horarios.listAtivos : api.horarios.list);
  const usandoDemo = !isConvexConfigured;

  const horarios: Horario[] = usandoDemo
    ? ativos
      ? DEMO_HORARIOS.filter((h) => h.ativo)
      : DEMO_HORARIOS
    : (dados ?? []);

  return {
    horarios,
    loading: !usandoDemo && dados === undefined,
    error: null,
    refresh: () => Promise.resolve(),
  };
}
