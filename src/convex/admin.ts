import { mutation, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

/**
 * Acesso do painel administrativo (/admin).
 *
 * Os administradores ficam na tabela `admins` do banco (Convex). A dona
 * gerencia pela tela "Equipe" do painel — sem JSON, sem mexer no código.
 *
 * Todas as operações de gerenciamento exigem as credenciais de um admin
 * ativo (quem já consegue entrar no painel pode gerenciar a equipe).
 */

/** Fallback do acesso original — garante que o painel nunca fique travado
 *  mesmo se a tabela estiver vazia. */
const ADMIN_PADRAO = { usuario: "admin", senha: "123456" };

/** Usuário + senha são de um admin ativo? (tabela ou fallback padrão) */
async function ehAdmin(
  ctx: MutationCtx,
  usuario: string,
  senha: string,
): Promise<boolean> {
  const u = await ctx.db
    .query("admins")
    .withIndex("por_usuario", (q) =>
      q.eq("usuario", usuario.trim().toLowerCase()),
    )
    .first();
  if (u) return u.ativo !== false && u.senha === senha;
  return (
    usuario.trim().toLowerCase() === ADMIN_PADRAO.usuario &&
    senha === ADMIN_PADRAO.senha
  );
}

/** Confere usuário + senha no cadastro de administradores (login). */
export const verificarSenha = mutation({
  args: { usuario: v.string(), senha: v.string() },
  handler: async (ctx, { usuario, senha }) =>
    ehAdmin(ctx, usuario, senha),
});

/** Lista os administradores cadastrados (só para quem já é admin). */
export const listar = mutation({
  args: { adminUsuario: v.string(), adminSenha: v.string() },
  handler: async (ctx, args) => {
    if (!(await ehAdmin(ctx, args.adminUsuario, args.adminSenha))) {
      throw new Error("Sem permissão para gerenciar a equipe.");
    }
    const docs = await ctx.db.query("admins").collect();
    return docs.map((d) => ({
      id: d._id,
      usuario: d.usuario,
      senha: d.senha,
      nome: d.nome ?? null,
      ativo: d.ativo,
      criado_em: new Date(d._creationTime).toISOString(),
    }));
  },
});

/** Cria um novo administrador (só para quem já é admin). */
export const criar = mutation({
  args: {
    adminUsuario: v.string(),
    adminSenha: v.string(),
    usuario: v.string(),
    senha: v.string(),
    nome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!(await ehAdmin(ctx, args.adminUsuario, args.adminSenha))) {
      throw new Error("Sem permissão para gerenciar a equipe.");
    }
    const usuario = args.usuario.trim().toLowerCase();
    if (usuario.length < 2) throw new Error("Informe um usuário válido.");
    if (args.senha.length < 4) {
      throw new Error("A senha precisa ter pelo menos 4 caracteres.");
    }
    const existente = await ctx.db
      .query("admins")
      .withIndex("por_usuario", (q) => q.eq("usuario", usuario))
      .first();
    if (existente) {
      throw new Error("Já existe um administrador com esse usuário.");
    }
    await ctx.db.insert("admins", {
      usuario,
      senha: args.senha,
      nome: args.nome?.trim() || undefined,
      ativo: true,
    });
    return { ok: true };
  },
});

/** Quantos admins ativos restariam sem o alvo? (protege o último admin) */
async function restariamAtivosAlemDe(
  ctx: MutationCtx,
  id: Id<"admins"> | null,
): Promise<number> {
  const docs = await ctx.db.query("admins").collect();
  return docs.filter((d) => {
    if (id && d._id === id) return false;
    return d.ativo !== false;
  }).length;
}

/** Atualiza um administrador (nome, senha, acesso) — só para quem já é admin. */
export const atualizar = mutation({
  args: {
    adminUsuario: v.string(),
    adminSenha: v.string(),
    id: v.id("admins"),
    usuario: v.string(),
    senha: v.string(),
    nome: v.optional(v.string()),
    ativo: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!(await ehAdmin(ctx, args.adminUsuario, args.adminSenha))) {
      throw new Error("Sem permissão para gerenciar a equipe.");
    }
    const usuario = args.usuario.trim().toLowerCase();
    if (usuario.length < 2) throw new Error("Informe um usuário válido.");
    if (args.senha.length < 4) {
      throw new Error("A senha precisa ter pelo menos 4 caracteres.");
    }
    if (!args.ativo) {
      const restantes = await restariamAtivosAlemDe(ctx, args.id);
      if (restantes < 1) {
        throw new Error(
          "Não é possível desativar o último administrador ativo — o painel ficaria sem acesso.",
        );
      }
    }
    await ctx.db.patch(args.id, {
      usuario,
      senha: args.senha,
      nome: args.nome?.trim() || undefined,
      ativo: args.ativo,
    });
    return { ok: true };
  },
});

/** Remove um administrador (só para quem já é admin). */
export const remover = mutation({
  args: {
    adminUsuario: v.string(),
    adminSenha: v.string(),
    id: v.id("admins"),
  },
  handler: async (ctx, args) => {
    if (!(await ehAdmin(ctx, args.adminUsuario, args.adminSenha))) {
      throw new Error("Sem permissão para gerenciar a equipe.");
    }
    const restantes = await restariamAtivosAlemDe(ctx, args.id);
    if (restantes < 1) {
      throw new Error(
        "Não é possível remover o último administrador ativo — o painel ficaria sem acesso.",
      );
    }
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

/**
 * Cria um admin sem exigir credenciais — usado pela assistente Gemini
 * (a action roda no servidor e não tem a senha do admin na mão). Mesma
 * validação da tela Equipe: usuário único + senha >= 4 caracteres.
 */
export const criarViaAssistente = mutation({
  args: {
    usuario: v.string(),
    senha: v.string(),
    nome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const usuario = args.usuario.trim().toLowerCase();
    if (usuario.length < 2) throw new Error("Informe um usuário válido.");
    if (args.senha.length < 4) {
      throw new Error("A senha precisa ter pelo menos 4 caracteres.");
    }
    const existente = await ctx.db
      .query("admins")
      .withIndex("por_usuario", (q) => q.eq("usuario", usuario))
      .first();
    if (existente) {
      throw new Error("Já existe um administrador com esse usuário.");
    }
    await ctx.db.insert("admins", {
      usuario,
      senha: args.senha,
      nome: args.nome?.trim() || undefined,
      ativo: true,
    });
    return { ok: true };
  },
});

/**
 * Remove um admin sem exigir credenciais — usado pela assistente Gemini.
 * Mantém a proteção do último admin ativo (o painel nunca fica travado).
 */
export const removerViaAssistente = mutation({
  args: { usuario: v.string() },
  handler: async (ctx, { usuario }) => {
    const u = usuario.trim().toLowerCase();
    const doc = await ctx.db
      .query("admins")
      .withIndex("por_usuario", (q) => q.eq("usuario", u))
      .first();
    if (!doc) throw new Error("Administrador não encontrado.");
    const restantes = await restariamAtivosAlemDe(ctx, doc._id);
    if (restantes < 1) {
      throw new Error(
        "Não é possível remover o último administrador ativo — o painel ficaria sem acesso.",
      );
    }
    await ctx.db.delete(doc._id);
    return { ok: true };
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
    const usuario = (args.usuario ?? ADMIN_PADRAO.usuario).trim().toLowerCase();
    const senha = args.senha ?? ADMIN_PADRAO.senha;
    const nome = args.nome ?? "Proprietária";
    const existente = await ctx.db
      .query("admins")
      .withIndex("por_usuario", (q) => q.eq("usuario", usuario))
      .first();
    if (existente) return { ok: true, ja_existia: true };
    await ctx.db.insert("admins", {
      usuario,
      senha,
      nome: nome ?? undefined,
      ativo: true,
    });
    return { ok: true, ja_existia: false };
  },
});
