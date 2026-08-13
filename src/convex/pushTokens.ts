import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Registro das INSCRIÇÕES de push (Web Push padrão) dos navegadores das
 * clientes (tabela pushTokens). O campo `token` guarda a PushSubscription
 * COMPLETA como JSON. Sem "use node": são mutations puras, rodam no runtime
 * padrão do Convex. O envio em lote fica em push.ts (runtime Node, com a
 * chave privada VAPID — nunca no frontend).
 */

/**
 * Validação da inscrição de push antes de gravar no banco (regra de
 * segurança: nada entra na base sem passar por aqui). Aceita:
 *
 * 1. PushSubscription padrão do navegador como JSON — o formato produzido
 *    por `obterTokenPush` (src/lib/push.ts):
 *    {"endpoint":"https://...","expirationTime":null,"keys":{"p256dh":"...","auth":"..."}}
 * 2. Token FCM legado (string longa com letras/números e ":", "-", "_", ".")
 *    — para não invalidar inscrições já gravadas antes da migração.
 */
function inscricaoValida(token: string): boolean {
  if (token.length < 20 || token.length > 6000) return false;

  // 1) PushSubscription padrão: JSON com endpoint https + chaves p256dh/auth
  try {
    const obj = JSON.parse(token) as {
      endpoint?: unknown;
      keys?: { p256dh?: unknown; auth?: unknown };
    };
    if (
      typeof obj?.endpoint === "string" &&
      obj.endpoint.startsWith("https://") &&
      typeof obj.keys?.p256dh === "string" &&
      obj.keys.p256dh.length > 0 &&
      typeof obj.keys?.auth === "string" &&
      obj.keys.auth.length > 0
    ) {
      return true;
    }
  } catch {
    // não é JSON — tenta o formato legado abaixo
  }

  // 2) Token FCM legado (compatibilidade com registros antigos)
  return /^[A-Za-z0-9_\-:.]+$/.test(token);
}

/** Grava/atualiza a inscrição push de um navegador (chamado pelo frontend). */
export const registrar = mutation({
  args: { token: v.string(), telefone: v.string() },
  handler: async (ctx, { token, telefone }) => {
    const limpo = telefone.replace(/\D/g, "");
    if (!inscricaoValida(token) || limpo.length < 8) {
      throw new ConvexError("Inscrição de notificação inválida.");
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

/** Lista as inscrições vinculadas aos telefones informados (usado pelo envio). */
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
 * Remove TODAS as inscrições de um telefone — usado quando a cliente pede
 * para parar de receber os avisos (botão na Política de Privacidade). Um
 * telefone pode ter inscrições em vários navegadores/aparelhos; apagamos
 * todas.
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
