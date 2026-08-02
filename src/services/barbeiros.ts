import { requerSupabase } from "@/services/supabase";
import type { Barbeiro } from "@/types";

/** Lista os barbeiros ativos da barbearia atual (estrutura multi-barbeiro). */
export async function listBarbeirosAtivos(): Promise<Barbeiro[]> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("barbeiros")
    .select("*")
    .eq("ativo", true)
    .order("nome");
  if (error) throw new Error(error.message);
  return (data ?? []) as Barbeiro[];
}

export async function listBarbeiros(): Promise<Barbeiro[]> {
  const db = requerSupabase();
  const { data, error } = await db.from("barbeiros").select("*").order("nome");
  if (error) throw new Error(error.message);
  return (data ?? []) as Barbeiro[];
}
