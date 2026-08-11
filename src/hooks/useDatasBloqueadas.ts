import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex";

/**
 * Datas bloqueadas (feriados / dias sem atendimento) definidas no dashboard.
 * Retorna também um Set com as datas (YYYY-MM-DD) para consulta rápida.
 */
export function useDatasBloqueadas() {
  const dados = useQuery(api.datasBloqueadas.list);
  const usandoDemo = !isConvexConfigured;

  const datas = usandoDemo ? [] : (dados ?? []);

  const bloqueadas = new Set(datas.map((d) => d.data));

  return {
    datas,
    bloqueadas,
    loading: !usandoDemo && dados === undefined,
    refresh: () => Promise.resolve(),
  };
}
