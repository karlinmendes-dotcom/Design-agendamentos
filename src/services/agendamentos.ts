import { requerSupabase } from "@/services/supabase";
import {
  BARBEARIA_NETO_ID,
  type Agendamento,
  type StatusAgendamento,
} from "@/types";
import { isSlotOcupado, type Ocupado } from "@/utils/slots";

/** Mensagem amigável quando o horário já foi reservado (validação de integridade). */
export const ERRO_HORARIO_OCUPADO =
  "Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário.";

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
  barbeiroId?: string | null,
): Promise<Ocupado[]> {
  const db = requerSupabase();
  let query = db
    .from("agendamentos")
    .select("horario, duracao_minutos")
    .eq("data", data)
    .neq("status", "cancelado");
  // Bloqueio por barbeiro: cada barbeiro tem sua própria agenda
  if (barbeiroId) {
    query = query.eq("barbeiro_id", barbeiroId);
  }
  const { data: rows, error } = await query;
  if (error) throw new Error(error.message);
  const list = (rows ?? []) as {
    horario: string;
    duracao_minutos: number | null;
  }[];
  return list.map((r) => ({
    horario: r.horario,
    duracao_minutos: r.duracao_minutos ?? 30,
  }));
}

export async function criarAgendamento(input: {
  cliente_id: string;
  servico_id: string;
  data: string;
  horario: string;
  duracao_minutos: number;
  barbeiro_id?: string | null;
}): Promise<Agendamento> {
  const db = requerSupabase();

  // Pré-checagem amigável — o banco também protege contra corridas (trigger)
  const ocupados = await listHorariosOcupados(input.data, input.barbeiro_id);
  if (isSlotOcupado(input.horario, input.duracao_minutos, ocupados)) {
    throw new Error(ERRO_HORARIO_OCUPADO);
  }

  const { data, error } = await db
    .from("agendamentos")
    .insert({
      cliente_id: input.cliente_id,
      servico_id: input.servico_id,
      data: input.data,
      horario: input.horario,
      duracao_minutos: input.duracao_minutos,
      status: "confirmado",
      barbearia_id: BARBEARIA_NETO_ID,
      barbeiro_id: input.barbeiro_id ?? null,
    })
    .select(SELECT_RELS)
    .single();
  if (error) {
    // 23P01 = conflito de horário do trigger; 23505 = duplicado
    if (
      error.code === "23P01" ||
      error.code === "23505" ||
      /ocupado/i.test(error.message)
    ) {
      throw new Error(ERRO_HORARIO_OCUPADO);
    }
    throw new Error(error.message);
  }
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
