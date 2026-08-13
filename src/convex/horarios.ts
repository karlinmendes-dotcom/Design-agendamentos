import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

type HorarioDoc = Doc<"horarios">;

function mapHorario(doc: HorarioDoc) {
  return {
    id: doc._id,
    dia_semana: doc.dia_semana,
    hora_inicio: doc.hora_inicio,
    hora_fim: doc.hora_fim,
    ativo: doc.ativo,
    slots_fixos: doc.slots_fixos ?? [],
    created_at: new Date(doc._creationTime).toISOString(),
    barbearia_id: doc.barbearia_id ?? null,
  };
}

/** Todos os horários de expediente, ordenados por dia da semana. */
export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query("horarios").collect();
    return docs.sort((a, b) => a.dia_semana - b.dia_semana).map(mapHorario);
  },
});

/** Apenas horários ativos (área do cliente). */
export const listAtivos = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query("horarios").collect();
    return docs
      .filter((h) => h.ativo)
      .sort((a, b) => a.dia_semana - b.dia_semana)
      .map(mapHorario);
  },
});

/** Insere/atualiza o horário de um dia da semana (upsert por dia_semana). */
export const upsert = mutation({
  args: {
    dia_semana: v.number(),
    hora_inicio: v.string(),
    hora_fim: v.string(),
    ativo: v.boolean(),
    slots_fixos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existente = await ctx.db
      .query("horarios")
      .filter((q) => q.eq(q.field("dia_semana"), args.dia_semana))
      .first();

    if (existente) {
      await ctx.db.patch(existente._id, {
        hora_inicio: args.hora_inicio,
        hora_fim: args.hora_fim,
        ativo: args.ativo,
        // Preserva os slots fixos existentes se não vierem no update
        ...(args.slots_fixos !== undefined
          ? { slots_fixos: args.slots_fixos }
          : {}),
      });
      const doc = await ctx.db.get(existente._id);
      if (!doc) throw new Error("Erro ao atualizar horário.");
      return mapHorario(doc);
    }

    const id = await ctx.db.insert("horarios", {
      dia_semana: args.dia_semana,
      hora_inicio: args.hora_inicio,
      hora_fim: args.hora_fim,
      ativo: args.ativo,
      ...(args.slots_fixos !== undefined
        ? { slots_fixos: args.slots_fixos }
        : {}),
    });
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Erro ao criar horário.");
    return mapHorario(doc);
  },
});

