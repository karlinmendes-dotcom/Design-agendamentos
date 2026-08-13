import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Barbearia } from "@/types";

export function useBarbearia() {
  const dados = useQuery(api.barbearias.getAtual);

  return {
    barbearia: (dados ?? null) as Barbearia | null,
    loading: dados === undefined,
    refresh: () => Promise.resolve(),
  };
}
