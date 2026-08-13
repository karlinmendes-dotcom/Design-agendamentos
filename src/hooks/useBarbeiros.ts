import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Barbeiro } from "@/types";

export function useBarbeiros() {
  const dados = useQuery(api.barbeiros.listAtivos);

  return {
    barbeiros: (dados ?? []) as Barbeiro[],
    loading: dados === undefined,
    error: null,
    refresh: () => Promise.resolve(),
  };
}
