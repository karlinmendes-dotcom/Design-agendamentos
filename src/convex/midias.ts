import { query } from "./_generated/server";
import { v } from "convex/values";

/** Lista a biblioteca de mídia ativa (vídeos, imagens, banners, logos). */
export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query("midias").collect();
    return docs
      .filter((m) => m.ativo)
      .sort((a, b) => a.ordem - b.ordem)
      .map((m) => ({
        id: m._id,
        barbearia_id: m.barbearia_id ?? null,
        tipo: m.tipo,
        chave: m.chave,
        url: m.url,
        poster_url: m.poster_url ?? null,
        alt: m.alt ?? null,
        ordem: m.ordem,
        ativo: m.ativo,
        created_at: new Date(m._creationTime).toISOString(),
      }));
  },
});

/** Busca uma mídia pela chave (ex.: 'hero', 'logo'). */
export const getByChave = query({
  args: { chave: v.string() },
  handler: async (ctx, { chave }) => {
    const doc = await ctx.db
      .query("midias")
      .filter((q) => q.eq(q.field("chave"), chave))
      .filter((q) => q.eq(q.field("ativo"), true))
      .first();
    if (!doc) return null;
    return {
      id: doc._id,
      barbearia_id: doc.barbearia_id ?? null,
      tipo: doc.tipo,
      chave: doc.chave,
      url: doc.url,
      poster_url: doc.poster_url ?? null,
      alt: doc.alt ?? null,
      ordem: doc.ordem,
      ativo: doc.ativo,
      created_at: new Date(doc._creationTime).toISOString(),
    };
  },
});
