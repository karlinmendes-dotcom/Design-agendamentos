import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Acesso do painel administrativo (/admin).
 *
 * A senha vive AQUI no backend do Convex — nunca vai para o navegador,
 * então não dá para "ver" no código do site. Para trocar a senha, edite a
 * constante abaixo e publique as funções (bun convex dev --once).
 *
 * Em produção, o ideal é mover para a variável de ambiente ADMIN_SENHA
 * (Convex → Project Settings → Environment Variables) — se ela existir,
 * tem prioridade sobre este valor.
 */
const SENHA_ADMIN = "natali2026";

/** Confere a senha digitada no login do painel. Retorna true/false. */
export const verificarSenha = mutation({
  args: { senha: v.string() },
  handler: async (_ctx, { senha }) => senha === SENHA_ADMIN,
});
