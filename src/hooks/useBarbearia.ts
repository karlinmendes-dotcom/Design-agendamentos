import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex";
import type { Barbearia } from "@/types";

const BARBEARIA_DEMO: Barbearia = {
  id: "00000000-0000-0000-0000-000000000001",
  nome: "Studio Natália Braga – Nail Design",
  slug: "studio-natalia-braga",
  logo_url: null,
  descricao: "Unhas de alto padrão, sofisticação e naturalidade.",
  endereco: "R. Expedicionário Abílio dos Santos, 0184, Sala 209, Centro, Colatina – ES, 29700-070",
  telefone: "(27) 99614-0639",
  instagram: "nataliabraga_nail",
  ativo: true,
  created_at: new Date().toISOString(),
};

export function useBarbearia() {
  const dados = useQuery(api.barbearias.getAtual);
  const usandoDemo = !isConvexConfigured;

  const barbearia: Barbearia = usandoDemo
    ? BARBEARIA_DEMO
    : (dados ?? BARBEARIA_DEMO);

  return {
    barbearia,
    loading: !usandoDemo && dados === undefined,
    refresh: () => Promise.resolve(),
  };
}
