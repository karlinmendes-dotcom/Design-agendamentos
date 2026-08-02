import { requerSupabase } from "@/services/supabase";
import type { Configuracao } from "@/types";

export const CONFIGURACAO_PADRAO: Omit<Configuracao, "id" | "updated_at"> = {
  nome_barbearia: "Barbearia Neto",
  logo_url: null,
  horario_funcionamento: "Terça a Sábado — 09h às 19h",
  dias_disponiveis: [1, 2, 3, 4, 5, 6],
};

export async function getConfiguracao(): Promise<Configuracao | null> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("configuracoes")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Configuracao) ?? null;
}

export async function salvarConfiguracao(
  patch: Partial<
    Pick<Configuracao, "nome_barbearia" | "logo_url" | "horario_funcionamento" | "dias_disponiveis">
  >,
): Promise<Configuracao> {
  const db = requerSupabase();

  const atual = await getConfiguracao();
  const payload = {
    ...CONFIGURACAO_PADRAO,
    ...(atual
      ? {
          nome_barbearia: atual.nome_barbearia,
          logo_url: atual.logo_url,
          horario_funcionamento: atual.horario_funcionamento,
          dias_disponiveis: atual.dias_disponiveis,
        }
      : {}),
    ...patch,
    updated_at: new Date().toISOString(),
  };

  if (atual) {
    const { data, error } = await db
      .from("configuracoes")
      .update(payload)
      .eq("id", atual.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Configuracao;
  }

  const { data, error } = await db
    .from("configuracoes")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Configuracao;
}
