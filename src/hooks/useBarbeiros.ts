import { useCallback, useEffect, useState } from "react";
import { listBarbeirosAtivos } from "@/services/barbeiros";
import { isSupabaseConfigured } from "@/services/supabase";
import type { Barbeiro } from "@/types";

/** Barbeiro demo usado quando o Supabase não está configurado. */
const DEMO_BARBEIROS: Barbeiro[] = [
  {
    id: "demo-barbeiro-1",
    barbearia_id: null,
    nome: "Neto",
    especialidade: "Cortes clássicos e degradê",
    avatar_url: null,
    ativo: true,
    created_at: new Date().toISOString(),
  },
];

export function useBarbeiros() {
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setBarbeiros(DEMO_BARBEIROS);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listBarbeirosAtivos();
      setBarbeiros(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar barbeiros");
      setBarbeiros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { barbeiros, loading, error, refresh };
}
