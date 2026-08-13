import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Datas bloqueadas (feriados / dias sem atendimento) definidas no dashboard.
 * Retorna também um Set com as datas (YYYY-MM-DD) para consulta rápida.
 */
export function useDatasBloqueadas() {
  const dados = useQuery(api.datasBloqueadas.list);

  const datas = dados ?? [];

  const bloqueadas = new Set(datas.map((d) => d.data));

  return {
    datas,
    bloqueadas,
    loading: dados === undefined,
    refresh: () => Promise.resolve(),
  };
}
