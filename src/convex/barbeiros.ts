import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type BarbeiroDoc = Doc<"barbeiros">;

function mapBarbeiro(doc: BarbeiroDoc) {
  return {
    id: doc._id,
    barbearia_id: doc.barbearia_id ?? null,
    nome: doc.nome,
    especialidade: doc.especialidade ?? null,
    avatar_url: doc.avatar_url ?? null,
    ativo: doc.ativo,
    created_at: new Date(doc._creationTime).toISOString(),
  };
}

/** Lista os profissionais ativos (área do cliente). */
export const listAtivos = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query("barbeiros").collect();
    return docs
      .filter((b) => b.ativo)
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map(mapBarbeiro);
  },
});


