import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Doc } from "./_generated/dataModel";

type MidiaDoc = Doc<"midias">;

function mapMidia(doc: MidiaDoc) {
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
    storage_id: doc.storage_id ?? null,
    created_at: new Date(doc._creationTime).toISOString(),
  };
}

/** Lista a biblioteca de mídia ativa (vídeos, imagens, banners, logos). */
export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query("midias").collect();
    return docs
      .filter((m) => m.ativo)
      .sort((a, b) => a.ordem - b.ordem)
      .map(mapMidia);
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
    return mapMidia(doc);
  },
});

/**
 * Salva um arquivo recém-enviado (Convex storage) na biblioteca de mídia.
 * O painel de Mídias envia o arquivo, recebe o storageId e chama esta
 * mutation — aqui resolvemos a URL pública e guardamos nome/tipo/ordem.
 */
export const salvarArquivo = mutation({
  args: {
    storageId: v.string(),
    tipo: v.union(v.literal("video"), v.literal("imagem")),
    nome: v.optional(v.string()),
  },
  handler: async (ctx, { storageId, tipo, nome }) => {
    const url = await ctx.storage.getUrl(storageId as never);
    if (!url) {
      throw new ConvexError("Arquivo não encontrado no armazenamento.");
    }
    const existentes = await ctx.db.query("midias").collect();
    const ordem =
      existentes.length === 0
        ? 0
        : Math.max(...existentes.map((m) => m.ordem)) + 1;
    const chave = (nome ?? "").trim() || `arquivo-${ordem}`;
    const id = await ctx.db.insert("midias", {
      tipo,
      chave,
      url,
      storage_id: storageId,
      ordem,
      ativo: true,
    });
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Erro ao salvar mídia.");
    return mapMidia(doc);
  },
});

/** Exclui uma mídia da biblioteca (e apaga o arquivo do storage, se houver). */
export const remover = mutation({
  args: { id: v.id("midias") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new ConvexError("Mídia não encontrada.");
    if (doc.storage_id) {
      await ctx.storage.delete(doc.storage_id as never);
    }
    await ctx.db.delete(id);
    return { ok: true };
  },
});
