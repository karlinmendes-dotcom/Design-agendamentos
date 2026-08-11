import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Reutiliza o cliente existente pelo telefone ou cria um novo.
 * Retorna sempre um cliente válido para vincular ao agendamento.
 */
export const findOrCreate = mutation({
  args: { nome: v.string(), telefone: v.string() },
  handler: async (ctx, { nome, telefone }) => {
    const existente = await ctx.db
      .query("clientes")
      .filter((q) => q.eq(q.field("telefone"), telefone))
      .first();

    if (existente) {
      return {
        id: existente._id,
        nome: existente.nome,
        telefone: existente.telefone,
        created_at: new Date(existente._creationTime).toISOString(),
        barbearia_id: existente.barbearia_id ?? null,
      };
    }

    const id = await ctx.db.insert("clientes", {
      nome: nome.trim(),
      telefone,
    });
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Erro ao criar cliente.");
    return {
      id: doc._id,
      nome: doc.nome,
      telefone: doc.telefone,
      created_at: new Date(doc._creationTime).toISOString(),
      barbearia_id: doc.barbearia_id ?? null,
    };
  },
});

/** Busca clientes por nome ou telefone (contém) com resumo de consumo. */
export const buscar = query({
  args: { termo: v.string() },
  handler: async (ctx, { termo }) => {
    const t = termo.trim().toLowerCase();
    if (t.length < 2) return [];

    const todos = await ctx.db.query("clientes").collect();
    const digitos = t.replace(/\D/g, "");
    const candidatos = todos.filter(
      (c) =>
        c.nome.toLowerCase().includes(t) ||
        (digitos.length > 0 && c.telefone.replace(/\D/g, "").includes(digitos)),
    );
    if (candidatos.length === 0) return [];

    const servicos = await ctx.db.query("servicos").collect();
    const precoPorId = new Map(servicos.map((s) => [s._id, s.preco]));

    const itens = await Promise.all(
      candidatos.slice(0, 10).map(async (c) => {
        const ags = await ctx.db
          .query("agendamentos")
          .withIndex("por_cliente", (q) => q.eq("cliente_id", c._id))
          .collect();
        const ativos = ags.filter((a) => a.status !== "cancelado");
        const total = ativos.reduce((s, a) => s + (precoPorId.get(a.servico_id) ?? 0), 0);
        const ultima =
          ativos
            .slice()
            .sort((x, y) => `${y.data}${y.horario}`.localeCompare(`${x.data}${x.horario}`))[0]
            ?.data ?? null;
        return {
          id: c._id,
          nome: c.nome,
          telefone: c.telefone,
          qtd: ativos.length,
          total,
          ultima,
        };
      }),
    );

    return itens.sort((a, b) => b.qtd - a.qtd);
  },
});

/** Data de corte: hoje menos N meses, em YYYY-MM-DD (fuso local). */
function mesesAtrasISO(meses: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

/**
 * Histórico completo de uma cliente: todos os atendimentos + resumo.
 * Aceita um filtro de período (meses) — ex.: 3, 6, 12 — para a dona
 * consultar "o que a Maria fez nos últimos 3 meses" antes de dar um brinde.
 */
export const historico = query({
  args: {
    cliente_id: v.id("clientes"),
    meses: v.optional(v.number()),
  },
  handler: async (ctx, { cliente_id, meses }) => {
    const cliente = await ctx.db.get(cliente_id);
    if (!cliente) return null;

    const servicos = await ctx.db.query("servicos").collect();
    const nomePorId = new Map(servicos.map((s) => [s._id, s.nome]));
    const precoPorId = new Map(servicos.map((s) => [s._id, s.preco]));

    const docs = await ctx.db
      .query("agendamentos")
      .withIndex("por_cliente", (q) => q.eq("cliente_id", cliente_id))
      .collect();

    // Filtro opcional por período (últimos N meses)
    const corte = meses && meses > 0 ? mesesAtrasISO(meses) : null;
    const docsFiltrados = corte ? docs.filter((a) => a.data >= corte) : docs;

    const itens = docsFiltrados
      .map((a) => ({
        id: a._id,
        data: a.data,
        horario: a.horario,
        status: a.status,
        servico_nome: nomePorId.get(a.servico_id) ?? "Serviço removido",
        valor: precoPorId.get(a.servico_id) ?? 0,
      }))
      .sort((x, y) => `${y.data}${y.horario}`.localeCompare(`${x.data}${x.horario}`));

    const ativos = itens.filter((i) => i.status !== "cancelado");
    const totalGasto = ativos.reduce((s, i) => s + i.valor, 0);

    const favoritos = new Map<string, number>();
    for (const i of ativos) {
      favoritos.set(i.servico_nome, (favoritos.get(i.servico_nome) ?? 0) + 1);
    }
    const servicoFavorito =
      [...favoritos.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      cliente: { id: cliente._id, nome: cliente.nome, telefone: cliente.telefone },
      itens,
      resumo: {
        visitas: ativos.length,
        total_gasto: totalGasto,
        ultima_visita: ativos[0]?.data ?? null,
        servico_favorito: servicoFavorito,
        periodo_inicio: itens.length ? itens[itens.length - 1].data : null,
        periodo_fim: itens.length ? itens[0].data : null,
      },
    };
  },
});
