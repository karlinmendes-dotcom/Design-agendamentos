import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Nail Design Studio — schema do banco Convex.
 *
 * Estrutura espelha o modelo anterior (Supabase) para manter os tipos
 * de domínio da aplicação sem reescrita: tenant (barbearias = estúdio),
 * profissionais (barbeiros), cardápio (servicos), agenda (agendamentos),
 * clientes, horários e configurações.
 */
export default defineSchema({
  // ---------- Tenant: estúdio ----------
  barbearias: defineTable({
    nome: v.string(),
    slug: v.optional(v.string()),
    logo_url: v.optional(v.string()),
    descricao: v.optional(v.string()),
    endereco: v.optional(v.string()),
    telefone: v.optional(v.string()),
    instagram: v.optional(v.string()),
    ativo: v.boolean(),
  }),

  // ---------- Configurações do estúdio ----------
  configuracoes: defineTable({
    barbearia_id: v.optional(v.id("barbearias")),
    nome_barbearia: v.string(),
    logo_url: v.optional(v.string()),
    horario_funcionamento: v.optional(v.string()),
    dias_disponiveis: v.array(v.number()),
  }),

  // ---------- Cardápio ----------
  servicos: defineTable({
    barbearia_id: v.optional(v.id("barbearias")),
    nome: v.string(),
    descricao: v.optional(v.string()),
    preco: v.number(),
    duracao_minutos: v.number(),
    ativo: v.boolean(),
    video_url: v.optional(v.string()),
    poster_url: v.optional(v.string()),
  }),

  // ---------- Profissionais (estrutura multi-profissional) ----------
  barbeiros: defineTable({
    barbearia_id: v.optional(v.id("barbearias")),
    nome: v.string(),
    especialidade: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    ativo: v.boolean(),
  }),

  // ---------- Expediente por dia da semana ----------
  horarios: defineTable({
    barbearia_id: v.optional(v.id("barbearias")),
    dia_semana: v.number(), // 0 = Domingo
    hora_inicio: v.string(), // HH:mm
    hora_fim: v.string(), // HH:mm
    ativo: v.boolean(),
  }),

  // ---------- Clientes (reutilizados por telefone) ----------
  clientes: defineTable({
    barbearia_id: v.optional(v.id("barbearias")),
    nome: v.string(),
    telefone: v.string(),
  }),

  // ---------- Biblioteca de mídia ----------
  midias: defineTable({
    barbearia_id: v.optional(v.id("barbearias")),
    tipo: v.union(
      v.literal("video"),
      v.literal("imagem"),
      v.literal("banner"),
      v.literal("logo"),
    ),
    chave: v.string(), // ex.: 'hero', 'logo'
    url: v.string(),
    poster_url: v.optional(v.string()),
    alt: v.optional(v.string()),
    ordem: v.number(),
    ativo: v.boolean(),
  }),

  // ---------- Uso da assistente Gemini (cota mensal do dashboard) ----------
  gemini_uso: defineTable({
    mes: v.string(), // YYYY-MM
    usos: v.number(), // perguntas respondidas no mês
  }).index("por_mes", ["mes"]),

  // ---------- Tokens de push (FCM) dos navegadores dos clientes ----------
  pushTokens: defineTable({
    token: v.string(), // token FCM do navegador da cliente
    telefone: v.string(), // telefone (só dígitos) — vincula o token à cliente
    ultimo_uso: v.number(), // timestamp do último registro
  })
    .index("por_token", ["token"])
    .index("por_telefone", ["telefone"]),

  // ---------- Datas bloqueadas (feriados / dias sem atendimento) ----------
  datasBloqueadas: defineTable({
    barbearia_id: v.optional(v.id("barbearias")),
    data: v.string(), // YYYY-MM-DD
    motivo: v.optional(v.string()),
  }).index("por_data", ["data"]),

  // ---------- Agendamentos ----------
  agendamentos: defineTable({
    barbearia_id: v.optional(v.id("barbearias")),
    cliente_id: v.id("clientes"),
    servico_id: v.id("servicos"),
    barbeiro_id: v.optional(v.id("barbeiros")),
    data: v.string(), // YYYY-MM-DD
    horario: v.string(), // HH:mm
    status: v.union(
      v.literal("confirmado"),
      v.literal("concluido"),
      v.literal("cancelado"),
    ),
    duracao_minutos: v.number(), // duração gravada na marcação (integridade)
  })
    .index("por_data", ["data"])
    .index("por_cliente", ["cliente_id"]),
});
