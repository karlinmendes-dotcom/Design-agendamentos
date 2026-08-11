import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex";
import { DEMO_SERVICOS } from "@/data/demo";
import type { Servico } from "@/types";

export function useServicos(apenasAtivos = false) {
  const dados = useQuery(api.servicos.list, { apenasAtivos });
  const usandoDemo = !isConvexConfigured;

  const servicos: Servico[] = usandoDemo
    ? apenasAtivos
      ? DEMO_SERVICOS.filter((s) => s.ativo)
      : DEMO_SERVICOS
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
