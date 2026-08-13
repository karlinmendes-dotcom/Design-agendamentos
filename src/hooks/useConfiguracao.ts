import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex";
import { DEMO_CONFIG } from "@/data/demo";
import type { Configuracao } from "@/types";

export const CONFIGURACAO_PADRAO: Pick<
  Configuracao,
  "nome_barbearia" | "logo_url" | "horario_funcionamento" | "dias_disponiveis"
> = {
  nome_barbearia: "Studio Natália Braga – Nail Design",
  logo_url: null,
  horario_funcionamento:
    "Segunda a quinta: 08h às 18h · Sexta-feira: 08h às 16h",
  dias_disponiveis: [1, 2, 3, 4, 5, 6],
};

export function useConfiguracao() {
  const dados = useQuery(api.configuracoes.get);
  const usandoDemo = !isConvexConfigured;

  const configuracao: Configuracao | null = usandoDemo
    ? DEMO_CONFIG
    : (dados ?? null);

  const nomeBarbearia =
    configuracao?.nome_barbearia ?? CONFIGURACAO_PADRAO.nome_barbearia;
  const logoUrl = configuracao?.logo_url ?? CONFIGURACAO_PADRAO.logo_url;
  const horarioFuncionamento =
    configuracao?.horario_funcionamento ??
    CONFIGURACAO_PADRAO.horario_funcionamento;
  const diasDisponiveis =
    configuracao?.dias_disponiveis ?? CONFIGURACAO_PADRAO.dias_disponiveis;

  return {
    configuracao,
    loading: !usandoDemo && dados === undefined,
    refresh: () => Promise.resolve(),
    nomeBarbearia,
    logoUrl,
    horarioFuncionamento,
    diasDisponiveis,
  };
}
