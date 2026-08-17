import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Gera uma URL de upload única (Convex file storage). O painel de Mídias
 * faz POST do arquivo nessa URL e recebe o storageId de volta, que é salvo
 * na tabela `midias` junto com nome/tipo (fluxo: dona sobe fotos/vídeos do
 * celular e depois o agente encaixa cada um no lugar certo do site).
 */
export const gerarUrlUpload = mutation({
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

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
