import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

type ServicoDoc = Doc<"servicos">;

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
  };
}

/** Lista o cardápio — todos ou apenas os ativos. */
export const list = query({
  args: { apenasAtivos: v.boolean() },
  handler: async (ctx, { apenasAtivos }) => {
    const docs = await ctx.db.query("servicos").collect();
    const filtrados = apenasAtivos ? docs.filter((d) => d.ativo) : docs;
    return filtrados
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map(mapServico);
  },
});

/** Cria um serviço no cardápio (ativo por padrão). */
export const criar = mutation({
  args: {
    nome: v.string(),
    descricao: v.optional(v.union(v.string(), v.null())),
    preco: v.number(),
    duracao_minutos: v.number(),
    video_url: v.optional(v.union(v.string(), v.null())),
    poster_url: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("servicos", {
      nome: args.nome.trim(),
      descricao: args.descricao?.trim() || undefined,
      preco: args.preco,
      duracao_minutos: args.duracao_minutos,
      video_url: args.video_url?.trim() || undefined,
      poster_url: args.poster_url?.trim() || undefined,
      ativo: true,
    });
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Erro ao criar serviço.");
    return mapServico(doc);
  },
});

/** Atualiza nome/descrição/preço/duração/mídia de um serviço. */
export const atualizar = mutation({
  args: {
    id: v.id("servicos"),
    nome: v.optional(v.string()),
    descricao: v.optional(v.union(v.string(), v.null())),
    preco: v.optional(v.number()),
    duracao_minutos: v.optional(v.number()),
    video_url: v.optional(v.union(v.string(), v.null())),
    poster_url: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const patch: Partial<{
      nome: string;
      descricao: string;
      preco: number;
      duracao_minutos: number;
      video_url: string;
      poster_url: string;
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
