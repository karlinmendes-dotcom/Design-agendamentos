import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

type BarbeiroDoc = Doc<"barbeiros">;

function mapBarbeiro(doc: BarbeiroDoc) {
  return {
    id: doc._id,
    barbearia_id: doc.barbearia_id ?? null,
    nome: doc.nome,
    especialidade: doc.especialidade ?? null,
    avatar_url: doc.avatar_url ?? null,
    ativo: doc.ativo,
    created_at: new Date(doc._creationTime).toISOString(),
  };
}

/** Lista os profissionais ativos (área do cliente). */
export const listAtivos = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query("barbeiros").collect();
    return docs
      .filter((b) => b.ativo)
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map(mapBarbeiro);
  },
});

/** Lista todos os profissionais. */
export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query("barbeiros").collect();
    return docs
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map(mapBarbeiro);
  },
});

/** Atualiza um profissional existente (nome, especialidade, avatar, status). */
export const salvar = mutation({
  args: {
    id: v.id("barbeiros"),
    nome: v.optional(v.string()),
    especialidade: v.optional(v.union(v.string(), v.null())),
    avatar_url: v.optional(v.union(v.string(), v.null())),
    ativo: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existente = await ctx.db.get(args.id);
    if (!existente) return null;
    await ctx.db.patch(args.id, {
      ...(args.nome !== undefined ? { nome: args.nome } : {}),
      ...(args.especialidade !== undefined
        ? { especialidade: args.especialidade ?? undefined }
        : {}),
      ...(args.avatar_url !== undefined
        ? { avatar_url: args.avatar_url ?? undefined }
        : {}),
      ...(args.ativo !== undefined ? { ativo: args.ativo } : {}),
    });
    const doc = await ctx.db.get(args.id);
    return doc ? mapBarbeiro(doc) : null;
  },
});
