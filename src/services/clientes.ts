import { requerSupabase } from "@/services/supabase";
import { BARBEARIA_NETO_ID, type Cliente } from "@/types";

export async function findClientePorTelefone(
  telefone: string,
): Promise<Cliente | null> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("clientes")
    .select("*")
    .eq("telefone", telefone)
    .eq("barbearia_id", BARBEARIA_NETO_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Cliente) ?? null;
}

export async function criarCliente(
  nome: string,
  telefone: string,
): Promise<Cliente> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("clientes")
    .insert({ nome: nome.trim(), telefone, barbearia_id: BARBEARIA_NETO_ID })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Cliente;
}

/** Reutiliza o cliente existente pelo telefone ou cria um novo. */
export async function findOrCreateCliente(
  nome: string,
  telefone: string,
): Promise<Cliente> {
  const existente = await findClientePorTelefone(telefone);
  if (existente) return existente;
  return criarCliente(nome, telefone);
}
