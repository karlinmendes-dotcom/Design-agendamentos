import { mutation, query, type QueryCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Doc } from "./_generated/dataModel";

type ServicoDoc = Doc<"servicos">;

const TIPO_SERVICO = v.optional(
  v.union(v.literal("servico"), v.literal("combo"), v.literal("todos")),
);

function mapServico(doc: ServicoDoc) {
  return {
    id: doc._id,
    nome: doc.nome,
    descricao: doc.descricao ?? null,
    preco: doc.preco,
    duracao_minutos: doc.duracao_minutos,
    ativo: doc.ativo,
    created_at: new Date(doc._creationTime).toISOString(),
    barbearia_id: doc.barbearia_id ?? null,
    midia_id: null,
    video_url: doc.video_url ?? null,
    poster_url: doc.poster_url ?? null,
    is_combo: doc.is_combo ?? false,
    itens_combo: doc.itens_combo ?? [],
  };
}

/** Lista o cardápio — todos ou apenas os ativos, filtrando por tipo. */
export const list = query({
  args: { apenasAtivos: v.boolean(), tipo: TIPO_SERVICO },
  handler: async (ctx, { apenasAtivos, tipo }) => {
    const docs = await ctx.db.query("servicos").collect();
    const filtrados = docs.filter((d) => {
      if (apenasAtivos && !d.ativo) return false;
      if (tipo === "servico") return !d.is_combo;
      if (tipo === "combo") return d.is_combo === true;
      return true;
    });
    return filtrados
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map(mapServico);
  },
});

/** Cria um serviço ou combo no cardápio (ativo por padrão). */
export const criar = mutation({
  args: {
    nome: v.string(),
    descricao: v.optional(v.union(v.string(), v.null())),
    preco: v.number(),
    duracao_minutos: v.number(),
    video_url: v.optional(v.union(v.string(), v.null())),
    poster_url: v.optional(v.union(v.string(), v.null())),
    is_combo: v.optional(v.boolean()),
    itens_combo: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("servicos", {
      nome: args.nome.trim(),
      descricao: args.descricao?.trim() || undefined,
      preco: args.preco,
      duracao_minutos: args.duracao_minutos,
      video_url: args.video_url?.trim() || undefined,
      poster_url: args.poster_url?.trim() || undefined,
      is_combo: args.is_combo ?? false,
      itens_combo:
        args.is_combo && args.itens_combo
          ? args.itens_combo.map((i) => i.trim()).filter(Boolean)
          : undefined,
      ativo: true,
    });
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Erro ao criar serviço.");
    return mapServico(doc);
  },
});

/** Atualiza nome/descrição/preço/duração/mídia/itens de um serviço ou combo. */
export const atualizar = mutation({
  args: {
    id: v.id("servicos"),
    nome: v.optional(v.string()),
    descricao: v.optional(v.union(v.string(), v.null())),
    preco: v.optional(v.number()),
    duracao_minutos: v.optional(v.number()),
    video_url: v.optional(v.union(v.string(), v.null())),
    poster_url: v.optional(v.union(v.string(), v.null())),
    is_combo: v.optional(v.boolean()),
    itens_combo: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const patch: Partial<{
      nome: string;
      descricao: string;
      preco: number;
      duracao_minutos: number;
      video_url: string;
      poster_url: string;
      is_combo: boolean;
      itens_combo: string[];
    }> = {};
    if (args.nome !== undefined) patch.nome = args.nome.trim();
    if (args.descricao !== undefined)
      patch.descricao = args.descricao?.trim() || "";
    if (args.preco !== undefined) patch.preco = args.preco;
    if (args.duracao_minutos !== undefined)
      patch.duracao_minutos = args.duracao_minutos;
    if (args.video_url !== undefined)
      patch.video_url = args.video_url || undefined;
    if (args.poster_url !== undefined)
      patch.poster_url = args.poster_url || undefined;
    if (args.is_combo !== undefined) patch.is_combo = args.is_combo;
    if (args.itens_combo !== undefined) {
      patch.itens_combo = args.itens_combo
        .map((i) => i.trim())
        .filter(Boolean);
    }
    await ctx.db.patch(args.id, patch);
  },
});

/** Ativa/desativa um serviço. */
export const setAtivo = mutation({
  args: { id: v.id("servicos"), ativo: v.boolean() },
  handler: async (ctx, { id, ativo }) => {
    await ctx.db.patch(id, { ativo });
  },
});

/** Exclui um serviço. */
export const excluir = mutation({
  args: { id: v.id("servicos") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/** Localiza um serviço/combo pelo nome (case-insensitive) — helper interno. */
async function buscarPorNome(ctx: QueryCtx, nome: string) {
  const alvo = nome.trim().toLowerCase();
  const docs = await ctx.db.query("servicos").collect();
  return docs.find((d) => d.nome.trim().toLowerCase() === alvo) ?? null;
}

/**
 * Atualiza um serviço/combo localizado pelo NOME (usado pela assistente).
 * O dashboard continua usando `atualizar` (por id) — esta é só a ponte
 * da IA para o mesmo banco.
 */
export const atualizarPorNome = mutation({
  args: {
    nome: v.string(),
    novo_nome: v.optional(v.string()),
    descricao: v.optional(v.union(v.string(), v.null())),
    preco: v.optional(v.number()),
    duracao_minutos: v.optional(v.number()),
    ativo: v.optional(v.boolean()),
    is_combo: v.optional(v.boolean()),
    itens_combo: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const doc = await buscarPorNome(ctx, args.nome);
    if (!doc) throw new ConvexError("Serviço não encontrado no cardápio.");
    const patch: Partial<{
      nome: string;
      descricao: string;
      preco: number;
      duracao_minutos: number;
      ativo: boolean;
      is_combo: boolean;
      itens_combo: string[];
    }> = {};
    if (args.novo_nome !== undefined) patch.nome = args.novo_nome.trim();
    if (args.descricao !== undefined)
      patch.descricao = args.descricao?.trim() || "";
    if (args.preco !== undefined) patch.preco = args.preco;
    if (args.duracao_minutos !== undefined)
      patch.duracao_minutos = args.duracao_minutos;
    if (args.ativo !== undefined) patch.ativo = args.ativo;
    if (args.is_combo !== undefined) patch.is_combo = args.is_combo;
    if (args.itens_combo !== undefined) {
      patch.itens_combo = args.itens_combo
        .map((i) => i.trim())
        .filter(Boolean);
    }
    await ctx.db.patch(doc._id, patch);
    const atualizado = await ctx.db.get(doc._id);
    if (!atualizado) throw new Error("Erro ao atualizar serviço.");
    return mapServico(atualizado);
  },
});

/** Exclui um serviço/combo localizado pelo NOME (usado pela assistente). */
export const excluirPorNome = mutation({
  args: { nome: v.string() },
  handler: async (ctx, { nome }) => {
    const doc = await buscarPorNome(ctx, nome);
    if (!doc) throw new ConvexError("Serviço não encontrado no cardápio.");
    await ctx.db.delete(doc._id);
    return { ok: true };
  },
});
