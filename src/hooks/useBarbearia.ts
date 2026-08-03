import { useCallback, useEffect, useState } from "react";
import { getBarbeariaAtual } from "@/services/barbearias";
import { isSupabaseConfigured } from "@/services/supabase";
import type { Barbearia } from "@/types";

const BARBEARIA_DEMO: Barbearia = {
  id: "00000000-0000-0000-0000-000000000001",
  nome: "Barbearia Neto",
  slug: "barbearia-neto",
  logo_url: null,
  descricao: "Tradição e estilo em cada corte.",
  endereco: null,
  telefone: "(00) 00000-0000",
  instagram: null,
  ativo: true,
  created_at: new Date().toISOString(),
};

export function useBarbearia() {
  const [barbearia, setBarbearia] = useState<Barbearia | null>(BARBEARIA_DEMO);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setBarbearia(BARBEARIA_DEMO);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getBarbeariaAtual();
      setBarbearia(data ?? BARBEARIA_DEMO);
    } catch {
      setBarbearia(BARBEARIA_DEMO);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { barbearia, loading, refresh };
}
