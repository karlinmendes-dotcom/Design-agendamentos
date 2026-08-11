import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex";
import type { Barbeiro } from "@/types";

/** Profissional demo usado quando o Convex não está configurado. */
const DEMO_BARBEIROS: Barbeiro[] = [
  {
    id: "demo-barbeiro-1",
    barbearia_id: null,
    nome: "Natália Braga",
    especialidade: "Nail Designer · unhas de alto padrão",
    avatar_url: null,
    ativo: true,
    created_at: new Date().toISOString(),
  },
];

export function useBarbeiros() {
  const dados = useQuery(api.barbeiros.listAtivos);
  const usandoDemo = !isConvexConfigured;

  const barbeiros: Barbeiro[] = usandoDemo ? DEMO_BARBEIROS : (dados ?? []);

  return {
    barbeiros,
    loading: !usandoDemo && dados === undefined,
    error: null,
    refresh: () => Promise.resolve(),
  };
}
