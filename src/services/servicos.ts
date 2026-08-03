import { requerSupabase } from "@/services/supabase";
import { BARBEARIA_NETO_ID, type Servico, type ServicoFormData } from "@/types";

export async function listServicos(apenasAtivos = false): Promise<Servico[]> {
  const db = requerSupabase();
  let query = db.from("servicos").select("*");
  if (apenasAtivos) query = query.eq("ativo", true);
  query = query.order("nome");
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Servico[];
}

export async function criarServico(
  form: ServicoFormData,
): Promise<Servico> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("servicos")
    .insert({
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      preco: Number(form.preco.replace(",", ".")),
      duracao_minutos: Number(form.duracao_minutos),
      video_url: form.video_url.trim() || null,
      poster_url: form.poster_url.trim() || null,
      barbearia_id: BARBEARIA_NETO_ID,
      ativo: true,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Servico;
}

export async function atualizarServico(
  id: string,
  patch: Partial<
    Pick<
      Servico,
      | "nome"
      | "descricao"
      | "preco"
      | "duracao_minutos"
      | "video_url"
      | "poster_url"
    >
  >,
): Promise<void> {
  const db = requerSupabase();
  const { error } = await db.from("servicos").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setServicoAtivo(id: string, ativo: boolean): Promise<void> {
  const db = requerSupabase();
  const { error } = await db.from("servicos").update({ ativo }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function excluirServico(id: string): Promise<void> {
  const db = requerSupabase();
  const { error } = await db.from("servicos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
