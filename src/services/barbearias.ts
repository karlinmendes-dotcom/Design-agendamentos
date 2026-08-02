import { requerSupabase } from "@/services/supabase";
import { BARBEARIA_NETO_ID, type Barbearia } from "@/types";

/** Busca a barbearia atual (tenant principal da plataforma). */
export async function getBarbeariaAtual(): Promise<Barbearia | null> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("barbearias")
    .select("*")
    .eq("id", BARBEARIA_NETO_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Barbearia) ?? null;
}
