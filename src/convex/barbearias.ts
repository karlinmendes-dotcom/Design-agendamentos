import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function mapBarbearia(doc: {
  _id: string;
  _creationTime: number;
  nome: string;
  slug?: string;
  logo_url?: string;
  descricao?: string;
  endereco?: string;
  telefone?: string;
  instagram?: string;
  instagram_url?: string;
  ativo: boolean;
}) {
  return {
    id: doc._id,
    nome: doc.nome,
    slug: doc.slug ?? null,
    logo_url: doc.logo_url ?? null,
    descricao: doc.descricao ?? null,
    endereco: doc.endereco ?? null,
    telefone: doc.telefone ?? null,
    instagram: doc.instagram ?? null,
    instagram_url: doc.instagram_url ?? null,
    ativo: doc.ativo,
    created_at: new Date(doc._creationTime).toISOString(),
  };
}

/** Busca o estúdio atual (tenant principal da plataforma). */
export const getAtual = query({
  handler: async (ctx) => {
    const doc = await ctx.db.query("barbearias").first();
    if (!doc) return null;
    return mapBarbearia(doc);
  },
});

/** Atualiza dados de contato/locação do estúdio. */
export const salvar = mutation({
  args: {
    nome: v.optional(v.union(v.string(), v.null())),
    descricao: v.optional(v.union(v.string(), v.null())),
    telefone: v.optional(v.union(v.string(), v.null())),
    instagram: v.optional(v.union(v.string(), v.null())),
    instagram_url: v.optional(v.union(v.string(), v.null())),
    endereco: v.optional(v.union(v.string(), v.null())),
    logo_url: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const existente = await ctx.db.query("barbearias").first();
    if (!existente) return null;

    const patch: Record<string, string> = {};
    if (args.nome !== undefined) patch.nome = args.nome ?? "";
    if (args.descricao !== undefined) patch.descricao = args.descricao ?? "";
    if (args.telefone !== undefined) patch.telefone = args.telefone ?? "";
    if (args.instagram !== undefined) patch.instagram = args.instagram ?? "";
    if (args.instagram_url !== undefined)
      patch.instagram_url = args.instagram_url ?? "";
    if (args.endereco !== undefined) patch.endereco = args.endereco ?? "";
    if (args.logo_url !== undefined) patch.logo_url = args.logo_url ?? "";
    await ctx.db.patch(existente._id, patch);

    const doc = await ctx.db.get(existente._id);
    if (!doc) return null;
    return mapBarbearia(doc);
  },
});
