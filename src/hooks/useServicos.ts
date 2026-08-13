import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Servico } from "@/types";

export type TipoCardapio = "servico" | "combo" | "todos";

export function useServicos(apenasAtivos = false, tipo: TipoCardapio = "todos") {
  const dados = useQuery(api.servicos.list, { apenasAtivos, tipo });

  return {
    servicos: (dados ?? []) as Servico[],
    loading: dados === undefined,
    error: null,
    // Convex é reativo: as queries atualizam sozinhas após mutations
    refresh: () => Promise.resolve(),
  };
}
