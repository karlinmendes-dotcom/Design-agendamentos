import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Registro dos tokens FCM dos navegadores dos clientes (tabela pushTokens).
 * Sem "use node": são mutations puras, rodam no runtime padrão do Convex.
 * O envio em lote fica em push.ts (runtime Node, com a chave do Firebase).
 */

/**
 * Validação mínima do token FCM web antes de gravar no banco (regra de
 * segurança: nada entra na base sem passar por aqui). Tokens FCM são strings
 * longas (tipicamente 100+ caracteres) com letras/números e caracteres como
 * ":", "-", "_", ".".
 */
function tokenFcmValido(token: string): boolean {
  return (
    token.length >= 20 &&
    token.length <= 500 &&
    /^[A-Za-z0-9_\-:.]+$/.test(token)
  );
}

/** Grava/atualiza o token FCM de um navegador (chamado pelo frontend). */
export const registrar = mutation({
  args: { token: v.string(), telefone: v.string() },
  handler: async (ctx, { token, telefone }) => {
    const limpo = telefone.replace(/\D/g, "");
    if (!tokenFcmValido(token) || limpo.length < 8) {
      throw new ConvexError("Token de notificação inválido.");
    }
    const existente = await ctx.db
      .query("pushTokens")
      .withIndex("por_token", (q) => q.eq("token", token))
      .first();
    if (existente) {
      await ctx.db.patch(existente._id, {
        telefone: limpo,
        ultimo_uso: Date.now(),
      });
    } else {
      await ctx.db.insert("pushTokens", {
        token,
        telefone: limpo,
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

/**
 * Remove TODOS os tokens de um telefone — usado quando a cliente pede para
 * parar de receber os avisos (botão na Política de Privacidade). Um telefone
 * pode ter tokens em vários navegadores/aparelhos; apagamos todos.
 */
export const removerPorTelefone = mutation({
  args: { telefone: v.string() },
  handler: async (ctx, { telefone }) => {
    const limpo = telefone.replace(/\D/g, "");
    if (limpo.length < 8) return;
    const docs = await ctx.db
      .query("pushTokens")
      .withIndex("por_telefone", (q) => q.eq("telefone", limpo))
      .collect();
    await Promise.all(docs.map((d) => ctx.db.delete(d._id)));
  },
});
