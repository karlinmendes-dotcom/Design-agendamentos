import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Acesso do painel administrativo (/admin).
 *
 * Os administradores ficam na tabela `admins` do banco (Convex). A dona
 * adiciona quantos quiser direto no dashboard:
 *
 *   https://dashboard.convex.dev/t/karlinmendes/design-agendamento/hardy-aardvark-221
 *   → Data → tabela `admins` → Insert document:
 *     { "usuario": "ana", "senha": "minhasenha", "nome": "Ana", "ativo": true }
 *
 * O login libera automaticamente — sem mexer em código nem fazer deploy.
 */

/** Fallback do acesso original — garante que o painel nunca fique travado
 *  mesmo se a tabela estiver vazia. */
const ADMIN_PADRAO = { usuario: "admin", senha: "123456" };

/** Confere usuário + senha no cadastro de administradores. */
export const verificarSenha = mutation({
  args: { usuario: v.string(), senha: v.string() },
  handler: async (ctx, { usuario, senha }) => {
    const u = await ctx.db
      .query("admins")
      .withIndex("por_usuario", (q) => q.eq("usuario", usuario.trim()))
      .first();
    if (u) return u.ativo !== false && u.senha === senha;
    return (
      usuario.trim() === ADMIN_PADRAO.usuario && senha === ADMIN_PADRAO.senha
    );
  },
});

/**
 * Garante o admin padrão na tabela (usa uma vez na instalação). Também
 * aceita criar outro admin pelo CLI: `bun convex run admin:seedAdminPadrao
 * --args '{"usuario":"ana","senha":"x","nome":"Ana"}'`.
 */
export const seedAdminPadrao = mutation({
  args: {
    usuario: v.optional(v.string()),
    senha: v.optional(v.string()),
    nome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const usuario = (args.usuario ?? ADMIN_PADRAO.usuario).trim();
    const senha = args.senha ?? ADMIN_PADRAO.senha;
    const nome = args.nome ?? "Proprietária";
    const existente = await ctx.db
      .query("admins")
      .withIndex("por_usuario", (q) => q.eq("usuario", usuario))
      .first();
    if (existente) return { ok: true, ja_existia: true };
    await ctx.db.insert("admins", { usuario, senha, nome, ativo: true });
    return { ok: true, ja_existia: false };
  },
});
