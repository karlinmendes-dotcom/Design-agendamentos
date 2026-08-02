import { useCallback, useEffect, useState } from "react";
import { listHorarios, listHorariosAtivos } from "@/services/horarios";
import { isSupabaseConfigured } from "@/services/supabase";
import { DEMO_HORARIOS } from "@/data/demo";
import type { Horario } from "@/types";

export function useHorarios(ativos = false) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setHorarios(ativos ? DEMO_HORARIOS.filter((h) => h.ativo) : DEMO_HORARIOS);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = ativos ? await listHorariosAtivos() : await listHorarios();
      setHorarios(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar horários");
    } finally {
      setLoading(false);
    }
  }, [ativos]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { horarios, loading, error, refresh };
}
