import { requerSupabase } from "@/services/supabase";
import type { Midia } from "@/types";

/** Lista a biblioteca de mídia da barbearia (vídeos, imagens, banners, logos). */
export async function listMidias(): Promise<Midia[]> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("midias")
    .select("*")
    .eq("ativo", true)
    .order("ordem");
  if (error) throw new Error(error.message);
  return (data ?? []) as Midia[];
}

/** Busca uma mídia específica pela chave (ex.: 'hero', 'logo'). */
export async function getMidia(chave: string): Promise<Midia | null> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("midias")
    .select("*")
    .eq("chave", chave)
    .eq("ativo", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Midia) ?? null;
}
