import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const PADRAO = {
  nome_barbearia: "Studio Natália Braga – Nail Design",
  horario_funcionamento: "Terça a Sábado — 09h às 19h",
  dias_disponiveis: [1, 2, 3, 4, 5, 6],
};

const NOME_DIA = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

function mapConfiguracao(doc: {
  _id: string;
  _creationTime: number;
  nome_barbearia: string;
  logo_url?: string;
  horario_funcionamento?: string;
  dias_disponiveis: number[];
  barbearia_id?: string;
}) {
  return {
    id: doc._id,
    nome_barbearia: doc.nome_barbearia,
    logo_url: doc.logo_url ?? null,
    horario_funcionamento: doc.horario_funcionamento ?? null,
    dias_disponiveis: doc.dias_disponiveis,
    updated_at: new Date(doc._creationTime).toISOString(),
    barbearia_id: doc.barbearia_id ?? null,
  };
}

/** Busca a configuração atual do estúdio (single-row). */
export const get = query({
  handler: async (ctx) => {
    const doc = await ctx.db.query("configuracoes").first();
    if (!doc) return null;
    return mapConfiguracao(doc);
  },
});

/**
 * Abre ou fecha um dia da semana (usado pelo dashboard e pela assistente).
 * Mantém `dias_disponiveis` (calendário) e `horarios` (expediente) em
 * sincronia: dia fechado some do calendário e o expediente é desativado.
 */
export const alternarDia = mutation({
  args: { dia_semana: v.number(), ativo: v.boolean() },
  handler: async (ctx, { dia_semana, ativo }) => {
    if (dia_semana < 0 || dia_semana > 6) {
      throw new Error("Dia da semana inválido (0 = domingo, 6 = sábado).");
    }

    const config = await ctx.db.query("configuracoes").first();
    const atuais = config?.dias_disponiveis ?? PADRAO.dias_disponiveis;
    const dias = new Set(atuais);
    if (ativo) dias.add(dia_semana);
    else dias.delete(dia_semana);
    const novos = [...dias].sort((a, b) => a - b);

    if (config) {
      await ctx.db.patch(config._id, { dias_disponiveis: novos });
    } else {
      await ctx.db.insert("configuracoes", {
        nome_barbearia: PADRAO.nome_barbearia,
        horario_funcionamento: PADRAO.horario_funcionamento,
        dias_disponiveis: novos,
      });
    }

    // Sincroniza o expediente do dia (o agendamento valida por horarios.ativo)
    const horario = await ctx.db
      .query("horarios")
      .filter((q) => q.eq(q.field("dia_semana"), dia_semana))
      .first();
    if (horario) {
      await ctx.db.patch(horario._id, { ativo });
    } else if (ativo) {
      await ctx.db.insert("horarios", {
        dia_semana,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      });
    }

    return {
      ok: true,
      dia_semana,
      nome: NOME_DIA[dia_semana],
      ativo,
      dias_disponiveis: novos,
    };
  },
});

/** Cria ou atualiza a configuração do estúdio (single-row). */
export const salvar = mutation({
  args: {
    nome_barbearia: v.optional(v.string()),
    logo_url: v.optional(v.union(v.string(), v.null())),
    horario_funcionamento: v.optional(v.union(v.string(), v.null())),
    dias_disponiveis: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const existente = await ctx.db.query("configuracoes").first();

    const valores = {
      nome_barbearia:
        args.nome_barbearia?.trim() || existente?.nome_barbearia || PADRAO.nome_barbearia,
      logo_url:
        args.logo_url !== undefined
          ? (args.logo_url ?? undefined)
          : existente?.logo_url,
      horario_funcionamento:
        args.horario_funcionamento !== undefined
          ? (args.horario_funcionamento ?? undefined)
          : existente?.horario_funcionamento,
      dias_disponiveis:
        args.dias_disponiveis ?? existente?.dias_disponiveis ?? PADRAO.dias_disponiveis,
    };

    if (existente) {
      await ctx.db.patch(existente._id, valores);
      const doc = await ctx.db.get(existente._id);
      if (!doc) throw new Error("Erro ao salvar configurações.");
      return mapConfiguracao(doc);
    }

    const id = await ctx.db.insert("configuracoes", valores);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Erro ao salvar configurações.");
    return mapConfiguracao(doc);
  },
});
