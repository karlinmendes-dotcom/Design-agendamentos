"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Acesso do painel administrativo (/admin).
 *
 * A senha vive no backend do Convex — nunca vai para o navegador, então
 * não dá para "ver" no código do site.
 *
 * Para trocar a senha sem tocar no código: defina a variável de ambiente
 * ADMIN_SENHA (Convex → Project Settings → Environment Variables) — ela
 * tem prioridade sobre o padrão abaixo. Se quiser trocar no código, edite
 * SENHA_PADRAO e publique as funções (bun convex dev --once).
 */
const SENHA_PADRAO = "123456";

/** Confere a senha digitada no login do painel. Retorna true/false. */
export const verificarSenha = action({
  args: { senha: v.string() },
  handler: async (_ctx, { senha }) => {
    const esperada = process.env.ADMIN_SENHA ?? SENHA_PADRAO;
    return senha === esperada;
  },
});
