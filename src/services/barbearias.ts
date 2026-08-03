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

/**
 * Atualiza dados de contato/locação da barbearia (telefone/WhatsApp,
 * Instagram e endereço). Usado no painel admin → Configurações.
 */
export async function salvarBarbearia(
  patch: Partial<
    Pick<Barbearia, "telefone" | "instagram" | "endereco" | "logo_url">
  >,
): Promise<Barbearia | null> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("barbearias")
    .update(patch)
    .eq("id", BARBEARIA_NETO_ID)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return (data as Barbearia) ?? null;
}
