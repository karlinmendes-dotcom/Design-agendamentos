import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Verdadeiro quando o Supabase foi configurado no .env */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

/** Erro amigável exibido quando o backend não está configurado */
export const ERRO_SEM_CONFIGURACAO =
  "O banco de dados ainda não foi configurado. Adicione as chaves do Supabase em .env e reinicie.";

export function requerSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(ERRO_SEM_CONFIGURACAO);
  }
  return supabase;
}
