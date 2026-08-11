import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { isConvexConfigured } from "@/lib/convex";
import { DEMO_AGENDAMENTOS } from "@/data/demo";
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

function montarResumo(
  nome: string,
  telefone: string,
  itens: HistoricoCliente["itens"],
): HistoricoCliente {
  const ativos = itens.filter((i) => i.status !== "cancelado");
  const favoritos = new Map<string, number>();
  for (const i of ativos) {
    favoritos.set(i.servico_nome, (favoritos.get(i.servico_nome) ?? 0) + 1);
  }
  return {
    cliente: { id: `demo-${nome}-${telefone}`, nome, telefone },
    itens,
    resumo: {
      visitas: ativos.length,
      total_gasto: ativos.reduce((s, i) => s + i.valor, 0),
      ultima_visita: ativos[0]?.data ?? null,
      servico_favorito:
        [...favoritos.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
      periodo_inicio: itens.length ? itens[itens.length - 1].data : null,
      periodo_fim: itens.length ? itens[0].data : null,
    },
  };
}

/** Busca clientes por nome ou telefone (mínimo 2 caracteres). */
export function useBuscarClientes(termo: string) {
  const dados = useQuery(api.clientes.buscar, { termo });
  const usandoDemo = !isConvexConfigured;

  if (usandoDemo) {
    const t = termo.trim().toLowerCase();
    if (t.length < 2) return { resultados: [] as ClienteResumo[], loading: false };
    const digitos = t.replace(/\D/g, "");
    const mapa = new Map<string, ClienteResumo>();
    for (const a of DEMO_AGENDAMENTOS) {
      const nome = a.cliente?.nome ?? "";
      const telefone = a.cliente?.telefone ?? "";
      const igual =
        nome.toLowerCase().includes(t) ||
        (digitos.length > 0 && telefone.replace(/\D/g, "").includes(digitos));
      if (!igual) continue;
      const chave = `${nome}|${telefone}`;
      const atual = mapa.get(chave) ?? {
        id: `demo-${chave}`,
        nome,
        telefone,
        qtd: 0,
        total: 0,
        ultima: null,
      };
      atual.qtd += 1;
      if (a.status !== "cancelado") atual.total += a.servico?.preco ?? 0;
      if (a.data > (atual.ultima ?? "")) atual.ultima = a.data;
      mapa.set(chave, atual);
    }
    return {
      resultados: [...mapa.values()].sort((x, y) => y.qtd - x.qtd).slice(0, 10),
      loading: false,
    };
  }

  return { resultados: dados ?? [], loading: dados === undefined };
}

/** Data de corte: hoje menos N meses, em YYYY-MM-DD. */
function mesesAtrasISO(meses: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

/** Histórico completo de uma cliente (atendimentos + resumo) — com período. */
export function useHistoricoCliente(
  cliente: ClienteResumo | null,
  meses: number | null = null,
) {
  const usandoDemo = !isConvexConfigured;
  const dados = useQuery(
    api.clientes.historico,
    cliente && !usandoDemo
      ? { cliente_id: cliente.id as Id<"clientes">, meses: meses ?? undefined }
      : "skip",
  );

  if (usandoDemo) {
    if (!cliente) return { historico: null as HistoricoCliente | null, loading: false };
    let rows = DEMO_AGENDAMENTOS.filter(
      (a) => a.cliente?.nome === cliente.nome || a.cliente?.telefone === cliente.telefone,
    );
    if (meses && meses > 0) {
      const corte = mesesAtrasISO(meses);
      rows = rows.filter((a) => a.data >= corte);
    }
    const itens = rows
      .map((a) => ({
        id: a.id,
        data: a.data,
        horario: a.horario,
        status: a.status,
        servico_nome: a.servico?.nome ?? "Serviço",
        valor: a.servico?.preco ?? 0,
      }))
      .sort((x, y) => `${y.data}${y.horario}`.localeCompare(`${x.data}${x.horario}`));
    return { historico: montarResumo(cliente.nome, cliente.telefone, itens), loading: false };
  }

  return {
    historico: (dados ?? null) as HistoricoCliente | null,
    loading: cliente ? dados === undefined : false,
  };
}
