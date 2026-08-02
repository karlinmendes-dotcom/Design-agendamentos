import { useCallback, useEffect, useState } from "react";
import { listServicos } from "@/services/servicos";
import { isSupabaseConfigured } from "@/services/supabase";
import { DEMO_SERVICOS } from "@/data/demo";
import type { Servico } from "@/types";

export function useServicos(apenasAtivos = false) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usandoDemo, setUsandoDemo] = useState(false);

  const refresh = useCallback(
    async (silencioso = false) => {
      if (!isSupabaseConfigured) {
        setServicos(
          apenasAtivos ? DEMO_SERVICOS.filter((s) => s.ativo) : DEMO_SERVICOS,
        );
        setUsandoDemo(true);
        setError(null);
        setLoading(false);
        return;
      }
      setUsandoDemo(false);
      if (!silencioso) setLoading(true);
      try {
        const data = await listServicos(apenasAtivos);
        setServicos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar serviços");
      } finally {
        if (!silencioso) setLoading(false);
      }
    },
    [apenasAtivos],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { servicos, loading, error, refresh, usandoDemo };
}
