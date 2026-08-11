import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Utilitário de armazenamento — resolve um arquivo enviado pelo painel
 * do Convex (Armazenamento de arquivos) para URL pública + metadados.
 * Retorna null se o ID não existir.
 */
export const get = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const meta = await ctx.storage.getMetadata(args.storageId as never);
    if (!meta) return null;
    const url = await ctx.storage.getUrl(args.storageId as never);
    return {
      url,
      size: meta.size,
      contentType: meta.contentType,
    };
  },
});
