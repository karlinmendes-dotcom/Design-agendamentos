import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Registro dos tokens FCM dos navegadores dos clientes (tabela pushTokens).
 * Sem "use node": são mutations puras, rodam no runtime padrão do Convex.
 * O envio em lote fica em push.ts (runtime Node, com a chave do Firebase).
 */

/** Grava/atualiza o token FCM de um navegador (chamado pelo frontend). */
export const registrar = mutation({
  args: { token: v.string(), telefone: v.string() },
  handler: async (ctx, { token, telefone }) => {
    const existente = await ctx.db
      .query("pushTokens")
      .withIndex("por_token", (q) => q.eq("token", token))
      .first();
    if (existente) {
      await ctx.db.patch(existente._id, {
        telefone,
        ultimo_uso: Date.now(),
      });
    } else {
      await ctx.db.insert("pushTokens", {
        token,
        telefone,
        ultimo_uso: Date.now(),
      });
    }
  },
});

/** Lista os tokens vinculados aos telefones informados (usado pelo envio). */
export const listarPorTelefones = query({
  args: { telefones: v.array(v.string()) },
  handler: async (ctx, { telefones }) => {
    const resultado: { token: string; telefone: string }[] = [];
    for (const telefone of telefones) {
      const docs = await ctx.db
        .query("pushTokens")
        .withIndex("por_telefone", (q) => q.eq("telefone", telefone))
        .collect();
      for (const d of docs) {
        resultado.push({ token: d.token, telefone: d.telefone });
      }
    }
    return resultado;
  },
});

/** Remove um token inválido (ex.: navegador revogou a permissão). */
export const remover = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const doc = await ctx.db
      .query("pushTokens")
      .withIndex("por_token", (q) => q.eq("token", token))
      .first();
    if (doc) await ctx.db.delete(doc._id);
  },
});
