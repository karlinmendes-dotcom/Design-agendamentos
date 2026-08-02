import { requerSupabase } from "@/services/supabase";
import {
  BARBEARIA_NETO_ID,
  type Agendamento,
  type StatusAgendamento,
} from "@/types";

const SELECT_RELS =
  "*, cliente:clientes(nome, telefone), servico:servicos(nome, preco, duracao_minutos), barbeiro:barbeiros(nome)";

export async function listAgendamentos(): Promise<Agendamento[]> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("agendamentos")
    .select(SELECT_RELS)
    .order("data", { ascending: true })
    .order("horario", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Agendamento[];
}

export async function listAgendamentosPorData(
  data: string,
): Promise<Agendamento[]> {
  const db = requerSupabase();
  const { data: rows, error } = await db
    .from("agendamentos")
    .select(SELECT_RELS)
    .eq("data", data)
    .order("horario", { ascending: true });
  if (error) throw new Error(error.message);
  return (rows ?? []) as Agendamento[];
}

export async function listHorariosOcupados(
  data: string,
): Promise<{ horario: string; duracao_minutos: number }[]> {
  const db = requerSupabase();
  const { data: rows, error } = await db
    .from("agendamentos")
    .select("horario, servico:servicos(duracao_minutos)")
    .eq("data", data)
    .neq("status", "cancelado");
  if (error) throw new Error(error.message);
  const list = (rows ?? []) as unknown as {
    horario: string;
    servico: { duracao_minutos: number } | null;
  }[];
  return list.map((r) => ({
    horario: r.horario,
    duracao_minutos: r.servico?.duracao_minutos ?? 30,
  }));
}

export async function criarAgendamento(input: {
  cliente_id: string;
  servico_id: string;
  data: string;
  horario: string;
  barbeiro_id?: string | null;
}): Promise<Agendamento> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("agendamentos")
    .insert({
      cliente_id: input.cliente_id,
      servico_id: input.servico_id,
      data: input.data,
      horario: input.horario,
      status: "confirmado",
      barbearia_id: BARBEARIA_NETO_ID,
      barbeiro_id: input.barbeiro_id ?? null,
    })
    .select(SELECT_RELS)
    .single();
  if (error) throw new Error(error.message);
  return data as Agendamento;
}

export async function atualizarStatusAgendamento(
  id: string,
  status: StatusAgendamento,
): Promise<void> {
  const db = requerSupabase();
  const { error } = await db
    .from("agendamentos")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
