import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

type DataBloqueadaDoc = Doc<"datasBloqueadas">;

function mapDataBloqueada(doc: DataBloqueadaDoc) {
  return {
    id: doc._id,
    data: doc.data,
    motivo: doc.motivo ?? null,
    barbearia_id: doc.barbearia_id ?? null,
    created_at: new Date(doc._creationTime).toISOString(),
  };
}

/** Todas as datas bloqueadas (feriados/dias sem atendimento), em ordem. */
export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query("datasBloqueadas").collect();
    return docs.sort((a, b) => a.data.localeCompare(b.data)).map(mapDataBloqueada);
  },
});

/** Bloqueia (ou desbloqueia) uma data específica — ex.: feriado, folga. */
export const adicionar = mutation({
  args: {
    data: v.string(), // YYYY-MM-DD
    motivo: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const existente = await ctx.db
      .query("datasBloqueadas")
      .withIndex("por_data", (q) => q.eq("data", args.data))
      .first();

    if (existente) {
      await ctx.db.patch(existente._id, {
        motivo: args.motivo ?? undefined,
      });
      const doc = await ctx.db.get(existente._id);
      if (!doc) throw new Error("Erro ao atualizar data bloqueada.");
      return mapDataBloqueada(doc);
    }

    const id = await ctx.db.insert("datasBloqueadas", {
      data: args.data,
      motivo: args.motivo ?? undefined,
    });
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Erro ao criar data bloqueada.");
    return mapDataBloqueada(doc);
  },
});

/** Remove o bloqueio de uma data específica. */
export const remover = mutation({
  args: { data: v.string() },
  handler: async (ctx, { data }) => {
    const existente = await ctx.db
      .query("datasBloqueadas")
      .withIndex("por_data", (q) => q.eq("data", data))
      .first();
    if (existente) await ctx.db.delete(existente._id);
  },
});
