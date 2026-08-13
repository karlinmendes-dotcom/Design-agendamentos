import { mutation, query, type QueryCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Doc } from "./_generated/dataModel";

type AgendamentoDoc = Doc<"agendamentos">;

/** Mensagem amigável quando o horário já foi reservado. */
const ERRO_HORARIO_OCUPADO =
  "Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário.";

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

interface Ocupado {
  horario: string;
  duracao_minutos: number;
}

/** True quando um horário + duração sobrepõe algum agendamento ocupado. */
function isSlotOcupado(
  horario: string,
  duracaoMinutos: number,
  ocupados: Ocupado[],
): boolean {
  const start = toMinutes(horario);
  const end = start + Math.max(duracaoMinutos, 1);
  return ocupados.some((o) => {
    const s = toMinutes(o.horario);
    const e = s + Math.max(o.duracao_minutos, 1);
    return start < e && end > s;
  });
}

async function mapAgendamento(ctx: QueryCtx, doc: AgendamentoDoc) {
  const cliente = doc.cliente_id ? await ctx.db.get(doc.cliente_id) : null;
  const servico = doc.servico_id ? await ctx.db.get(doc.servico_id) : null;
  const barbeiro = doc.barbeiro_id ? await ctx.db.get(doc.barbeiro_id) : null;
  return {
    id: doc._id,
    cliente_id: doc.cliente_id,
    servico_id: doc.servico_id,
    data: doc.data,
    horario: doc.horario,
    status: doc.status,
    duracao_minutos: doc.duracao_minutos,
    pendencia: doc.pendencia ?? null,
    created_at: new Date(doc._creationTime).toISOString(),
    barbearia_id: doc.barbearia_id ?? null,
    barbeiro_id: doc.barbeiro_id ?? null,
    cliente: cliente ? { nome: cliente.nome, telefone: cliente.telefone } : null,
    servico: servico
      ? {
          nome: servico.nome,
          preco: servico.preco,
          duracao_minutos: servico.duracao_minutos,
        }
      : null,
    barbeiro: barbeiro ? { nome: barbeiro.nome } : null,
  };
}

/** Todos os agendamentos (dashboard). */
export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query("agendamentos").collect();
    const items = await Promise.all(docs.map((d) => mapAgendamento(ctx, d)));
    return items.sort((a, b) =>
      `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`),
    );
  },
});

/** Agendamentos de uma data específica (agenda do dia). */
export const listPorData = query({
  args: { data: v.string() },
  handler: async (ctx, { data }) => {
    const docs = await ctx.db
      .query("agendamentos")
      .withIndex("por_data", (q) => q.eq("data", data))
      .collect();
    const items = await Promise.all(docs.map((d) => mapAgendamento(ctx, d)));
    return items.sort((a, b) => a.horario.localeCompare(b.horario));
  },
});

/** Horários ocupados de uma data (e barbeiro) — usado na grade de slots. */
export const listOcupados = query({
  args: { data: v.string(), barbeiroId: v.union(v.id("barbeiros"), v.null()) },
  handler: async (ctx, { data, barbeiroId }) => {
    const docs = await ctx.db
      .query("agendamentos")
      .withIndex("por_data", (q) => q.eq("data", data))
      .collect();
    return docs
      .filter((a) => a.status !== "cancelado")
      .filter((a) => (barbeiroId ? a.barbeiro_id === barbeiroId : true))
      .map((a) => ({
        horario: a.horario,
        duracao_minutos: a.duracao_minutos,
      }));
  },
});

/**
 * Cria um agendamento com checagem anti-conflito dentro da mutation
 * (atômica no Convex — não há corrida entre dois clientes simultâneos).
 */
/** Dia da semana (0=Dom) de uma data YYYY-MM-DD — sem efeito de fuso. */
function diaDaSemana(data: string): number {
  return new Date(`${data}T12:00:00`).getDay();
}

/** Erro amigável quando o dia está desativado ou bloqueado. */
const ERRO_DIA_INDISPONIVEL =
  "Este dia não está disponível para agendamento. Escolha outro dia.";

/**
 * Valida a data/horário contra o expediente (horarios.ativo) e as datas
 * bloqueadas (feriados/folgas) ANTES de gravar — o dashboard manda de
 * verdade, não só o visual do site.
 */
async function validarDisponibilidade(
  ctx: QueryCtx,
  data: string,
  horario: string,
  duracaoMinutos: number,
): Promise<void> {
  // 1. Dia da semana precisa ter expediente ATIVO
  const horarios = await ctx.db.query("horarios").collect();
  const expediente = horarios.find(
    (h) => h.dia_semana === diaDaSemana(data) && h.ativo,
  );
  if (!expediente) throw new ConvexError(ERRO_DIA_INDISPONIVEL);

  // 2. Data não pode estar bloqueada (feriado / dia sem atendimento)
  const bloqueada = await ctx.db
    .query("datasBloqueadas")
    .withIndex("por_data", (q) => q.eq("data", data))
    .first();
  if (bloqueada) {
    throw new ConvexError(
      bloqueada.motivo
        ? `Indisponível neste dia: ${bloqueada.motivo}.`
        : "Este dia está bloqueado (feriado/folga). Escolha outro dia.",
    );
  }

  // 3. Horário precisa caber dentro do expediente do dia
  const inicio = toMinutes(expediente.hora_inicio);
  const fim = toMinutes(expediente.hora_fim);
  const slot = toMinutes(horario);
  if (slot < inicio || slot + Math.max(duracaoMinutos, 1) > fim) {
    throw new ConvexError(
      `Atendemos das ${expediente.hora_inicio} às ${expediente.hora_fim} neste dia. Escolha um horário dentro do expediente.`,
    );
  }

  // 4. Se o dia tem horários FIXOS definidos (ex.: almoço 11h–14h fora da
  //    lista), o horário precisa ser exatamente um deles — o servidor recusa
  //    12h30, 13h, etc. mesmo que caia dentro do expediente. Isso vale para
  //    o site E para a assistente (criarViaAssistente usa esta função).
  const fixos = expediente.slots_fixos ?? [];
  if (fixos.length > 0 && !fixos.includes(horario)) {
    throw new ConvexError(
      `Os horários disponíveis neste dia são: ${fixos.join(", ")}. Escolha um desses horários.`,
    );
  }
}

export const criar = mutation({
  args: {
    cliente_id: v.id("clientes"),
    servico_id: v.id("servicos"),
    data: v.string(),
    horario: v.string(),
    duracao_minutos: v.number(),
    barbeiro_id: v.optional(v.union(v.id("barbeiros"), v.null())),
  },
  handler: async (ctx, args) => {
    // Fonte da verdade: o dashboard controla os dias — recusa fora do expediente
    await validarDisponibilidade(
      ctx,
      args.data,
      args.horario,
      args.duracao_minutos,
    );

    const existentes = await ctx.db
      .query("agendamentos")
      .withIndex("por_data", (q) => q.eq("data", args.data))
      .collect();

    const ocupados = existentes
      .filter((a) => a.status !== "cancelado")
      .filter((a) => (args.barbeiro_id ? a.barbeiro_id === args.barbeiro_id : true))
      .map((a) => ({
        horario: a.horario,
        duracao_minutos: a.duracao_minutos,
      }));

    if (isSlotOcupado(args.horario, args.duracao_minutos, ocupados)) {
      throw new ConvexError(ERRO_HORARIO_OCUPADO);
    }

    const id = await ctx.db.insert("agendamentos", {
      cliente_id: args.cliente_id,
      servico_id: args.servico_id,
      barbeiro_id: args.barbeiro_id ?? undefined,
      data: args.data,
      horario: args.horario,
      status: "confirmado",
      duracao_minutos: args.duracao_minutos,
    });

    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Erro ao criar agendamento.");
    return mapAgendamento(ctx, doc);
  },
});

/**
 * Cria um agendamento a partir de nomes (assistente Gemini): resolve o
 * cliente (cria se não existir, por telefone) e o serviço (por nome) e
 * aplica TODAS as validações do fluxo normal (dia ativo, expediente,
 * anti-sobreposição) — o dashboard continua mandando de verdade.
 */
export const criarViaAssistente = mutation({
  args: {
    nome_cliente: v.string(),
    telefone_cliente: v.string(),
    servico_nome: v.string(),
    data: v.string(),
    horario: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Resolve o serviço pelo nome
    const servicos = await ctx.db.query("servicos").collect();
    const servico = servicos.find(
      (s) => s.nome.trim().toLowerCase() === args.servico_nome.trim().toLowerCase(),
    );
    if (!servico) {
      throw new ConvexError(
        `Serviço "${args.servico_nome}" não encontrado no cardápio.`,
      );
    }

    // 2. Resolve o cliente (cria se for novo, por telefone — mesmo fluxo do app)
    const telefone = args.telefone_cliente.replace(/\D/g, "");
    if (telefone.length < 8) {
      throw new ConvexError("Informe um telefone válido com DDD.");
    }
    const existente = await ctx.db
      .query("clientes")
      .filter((q) => q.eq(q.field("telefone"), telefone))
      .first();
    const cliente_id = existente
      ? existente._id
      : await ctx.db.insert("clientes", {
          nome: args.nome_cliente.trim(),
          telefone,
        });

    // 3. Valida disponibilidade + anti-sobreposição (idêntico ao criar normal)
    await validarDisponibilidade(ctx, args.data, args.horario, servico.duracao_minutos);
    const existentes = await ctx.db
      .query("agendamentos")
      .withIndex("por_data", (q) => q.eq("data", args.data))
      .collect();
    const ocupados = existentes
      .filter((a) => a.status !== "cancelado")
      .map((a) => ({
        horario: a.horario,
        duracao_minutos: a.duracao_minutos,
      }));
    if (isSlotOcupado(args.horario, servico.duracao_minutos, ocupados)) {
      throw new ConvexError(ERRO_HORARIO_OCUPADO);
    }

    const id = await ctx.db.insert("agendamentos", {
      cliente_id,
      servico_id: servico._id,
      data: args.data,
      horario: args.horario,
      status: "confirmado",
      duracao_minutos: servico.duracao_minutos,
    });

    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Erro ao criar agendamento.");
    return mapAgendamento(ctx, doc);
  },
});

/**
 * Cancela TODOS os agendamentos ativos de um dia inteiro (usado pela dona no
 * dashboard ou pela Gemini). Retorna quantos foram cancelados e os telefones
 * dos clientes afetados para o disparo de notificação push (FCM).
 */
export const cancelarDia = mutation({
  args: { data: v.string() },
  handler: async (ctx, { data }) => {
    // Segurança: nunca cancela dias no passado
    const agora = new Date();
    const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    if (data < hoje) {
      throw new ConvexError("Não é possível cancelar um dia que já passou.");
    }

    const docs = await ctx.db
      .query("agendamentos")
      .withIndex("por_data", (q) => q.eq("data", data))
      .collect();
    const afetados = docs.filter((a) => a.status !== "cancelado");

    for (const a of afetados) {
      await ctx.db.patch(a._id, { status: "cancelado" });
    }

    const clientes = await Promise.all(afetados.map((a) => ctx.db.get(a.cliente_id)));
    const telefones = [
      ...new Set(
        clientes
          .filter((c) => c !== null)
          .map((c) => (c as { telefone: string }).telefone),
      ),
    ];

    return { data, cancelados: afetados.length, telefones };
  },
});

/** Atualiza o status (confirmado → concluído / cancelado). */
export const atualizarStatus = mutation({
  args: {
    id: v.id("agendamentos"),
    status: v.union(
      v.literal("confirmado"),
      v.literal("concluido"),
      v.literal("cancelado"),
    ),
  },
  handler: async (ctx, { id, status }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new ConvexError("Agendamento não encontrado.");

    const patch: {
      status: "confirmado" | "concluido" | "cancelado";
      pendencia?: number;
    } = { status };
    // Cancelamento individual feito pela dona → fica a pendência de 50% do
    // valor (regra do estúdio para desmarcar em cima da hora / falta). O
    // cancelamento em massa (cancelarDia — imprevisto do estúdio) NÃO gera
    // pendência, pois não é culpa da cliente.
    if (status === "cancelado" && doc.pendencia === undefined) {
      const servico = doc.servico_id ? await ctx.db.get(doc.servico_id) : null;
      if (servico?.preco) {
        patch.pendencia = Math.round(servico.preco * 0.5 * 100) / 100;
      }
    }
    await ctx.db.patch(id, patch);
  },
});

/**
 * Pendências em aberto de uma cliente (por telefone) — usada no agendamento
 * para avisar que, para remarcar, a cliente precisa acertar o valor pendente
 * (regra de cancelamento em cima da hora / falta).
 */
export const pendenciasPorTelefone = query({
  args: { telefone: v.string() },
  handler: async (ctx, { telefone }) => {
    const digitos = telefone.replace(/\D/g, "");
    if (digitos.length < 8) return [];

    const docs = await ctx.db.query("agendamentos").collect();
    const itens: {
      id: string;
      data: string;
      horario: string;
      servico: string;
      pendencia: number;
    }[] = [];

    for (const a of docs) {
      if (a.status !== "cancelado" || !a.pendencia) continue;
      const cliente = a.cliente_id ? await ctx.db.get(a.cliente_id) : null;
      if (!cliente || cliente.telefone.replace(/\D/g, "") !== digitos) continue;
      const servico = a.servico_id ? await ctx.db.get(a.servico_id) : null;
      itens.push({
        id: a._id,
        data: a.data,
        horario: a.horario,
        servico: servico?.nome ?? "Procedimento",
        pendencia: a.pendencia,
      });
    }

    return itens.sort((x, y) => y.data.localeCompare(x.data));
  },
});

/**
 * Marca a pendência de um agendamento como QUITADA (a dona recebeu o valor
 * dos 50% e libera a remarcação da cliente).
 */
export const quitarPendencia = mutation({
  args: { id: v.id("agendamentos") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new ConvexError("Agendamento não encontrado.");
    await ctx.db.patch(id, { pendencia: undefined });
  },
});
