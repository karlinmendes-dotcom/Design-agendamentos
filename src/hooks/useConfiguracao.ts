import { useCallback, useEffect, useState } from "react";
import { CONFIGURACAO_PADRAO, getConfiguracao } from "@/services/configuracoes";
import { isSupabaseConfigured } from "@/services/supabase";
import { DEMO_CONFIG } from "@/data/demo";
import type { Configuracao } from "@/types";

export function useConfiguracao() {
  const [configuracao, setConfiguracao] = useState<Configuracao | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setConfiguracao(DEMO_CONFIG);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getConfiguracao();
      setConfiguracao(data);
    } catch {
      setConfiguracao(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
    loading,
    refresh,
    nomeBarbearia,
    logoUrl,
    horarioFuncionamento,
    diasDisponiveis,
  };
}
