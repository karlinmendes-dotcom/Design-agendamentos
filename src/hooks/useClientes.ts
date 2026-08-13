import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { StatusAgendamento } from "@/types";

export interface ClienteResumo {
  id: string;
  nome: string;
  telefone: string;
  qtd: number;
  total: number;
  ultima: string | null;
}

export interface HistoricoCliente {
  cliente: { id: string; nome: string; telefone: string };
  itens: {
    id: string;
    data: string;
    horario: string;
    status: StatusAgendamento;
    servico_nome: string;
    valor: number;
  }[];
  resumo: {
    visitas: number;
    total_gasto: number;
    ultima_visita: string | null;
    servico_favorito: string | null;
    periodo_inicio: string | null;
    periodo_fim: string | null;
  };
}

/** Busca clientes por nome ou telefone (mínimo 2 caracteres). */
export function useBuscarClientes(termo: string) {
  const dados = useQuery(api.clientes.buscar, { termo });
  return { resultados: dados ?? [], loading: dados === undefined };
}

/** Histórico completo de uma cliente (atendimentos + resumo) — com período. */
export function useHistoricoCliente(
  cliente: ClienteResumo | null,
  meses: number | null = null,
) {
  const dados = useQuery(
    api.clientes.historico,
    cliente
      ? { cliente_id: cliente.id as Id<"clientes">, meses: meses ?? undefined }
      : "skip",
  );

  return {
    historico: (dados ?? null) as HistoricoCliente | null,
    loading: cliente ? dados === undefined : false,
  };
}
