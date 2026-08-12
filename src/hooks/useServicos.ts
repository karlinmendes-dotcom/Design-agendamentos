import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex";
import { DEMO_SERVICOS } from "@/data/demo";
import type { Servico } from "@/types";

export type TipoCardapio = "servico" | "combo" | "todos";

export function useServicos(apenasAtivos = false, tipo: TipoCardapio = "todos") {
  const dados = useQuery(api.servicos.list, { apenasAtivos, tipo });
  const usandoDemo = !isConvexConfigured;

  const servicos: Servico[] = usandoDemo
    ? DEMO_SERVICOS.filter((s) => {
        if (apenasAtivos && !s.ativo) return false;
        if (tipo === "servico") return !s.is_combo;
        if (tipo === "combo") return s.is_combo;
        return true;
      })
    : (dados ?? []);

  return {
    servicos,
    loading: !usandoDemo && dados === undefined,
    error: null,
    // Convex é reativo: as queries atualizam sozinhas após mutations
    refresh: () => Promise.resolve(),
    usandoDemo,
  };
}
