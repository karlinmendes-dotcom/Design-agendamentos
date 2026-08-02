import { useCallback, useEffect, useState } from "react";
import {
  listAgendamentos,
  listAgendamentosPorData,
  listHorariosOcupados,
} from "@/services/agendamentos";
import { isSupabaseConfigured } from "@/services/supabase";
import { DEMO_AGENDAMENTOS } from "@/data/demo";
import type { Agendamento } from "@/types";

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usandoDemo, setUsandoDemo] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setAgendamentos(DEMO_AGENDAMENTOS);
      setUsandoDemo(true);
      setError(null);
      setLoading(false);
      return;
    }
    setUsandoDemo(false);
    setLoading(true);
    try {
      const data = await listAgendamentos();
      setAgendamentos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { agendamentos, loading, error, refresh, usandoDemo };
}

export function useAgendamentosPorData(data: string) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [ocupados, setOcupados] = useState<
    { horario: string; duracao_minutos: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      if (!data) {
        setAgendamentos([]);
        setOcupados([]);
        setLoading(false);
        return;
      }
      if (!isSupabaseConfigured) {
        const rows = DEMO_AGENDAMENTOS.filter(
          (a) => a.data === data && a.status !== "cancelado",
        );
        if (!ativo) return;
        setAgendamentos(rows);
        setOcupados(
          rows.map((r) => ({
            horario: r.horario,
            duracao_minutos: r.servico?.duracao_minutos ?? 30,
          })),
        );
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [rows, ocup] = await Promise.all([
          listAgendamentosPorData(data),
          listHorariosOcupados(data),
        ]);
        if (!ativo) return;
        setAgendamentos(rows);
        setOcupados(ocup);
      } catch {
        if (!ativo) return;
        setAgendamentos([]);
        setOcupados([]);
      } finally {
        if (ativo) setLoading(false);
      }
    }
    void carregar();
    return () => {
      ativo = false;
    };
  }, [data]);

  return { agendamentos, ocupados, loading };
}
