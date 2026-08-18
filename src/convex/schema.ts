import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Nail Design Studio — schema do banco Convex.
 *
 * Estrutura por domínio: tenant (barbearias = estúdio), profissionais
 * (barbeiros), cardápio (servicos), agenda (agendamentos), clientes,
 * horários, configurações e notificações Web Push (pushTokens).
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
    instagram: v.optional(v.string()), // apelido exibido (ex.: @nataliabraga_nail)
    instagram_url: v.optional(v.string()), // link completo (destino do clique)
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
  // Um registro pode ser um serviço comum (is_combo=false) ou um combo
  // (is_combo=true). Os combos usam o mesmo motor de agendamento — por isso
  // vivem aqui e não em outra tabela: preço, duração, agenda e WhatsApp já
  // funcionam sem código extra.
  servicos: defineTable({
    barbearia_id: v.optional(v.id("barbearias")),
    nome: v.string(),
    descricao: v.optional(v.string()),
    preco: v.number(),
    duracao_minutos: v.number(),
    ativo: v.boolean(),
    video_url: v.optional(v.string()),
    poster_url: v.optional(v.string()),
    is_combo: v.optional(v.boolean()),
    itens_combo: v.optional(v.array(v.string())), // nomes dos serviços inclusos (exibição)
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
    // Horários EXATOS de agendamento (ex.: ["08:00","09:00","10:00",
    // "14:00",...] com o almoço fora). Quando definidos, o agendamento
    // oferece SOMENTE estes horários (nada de grade automática de 30 min).
    slots_fixos: v.optional(v.array(v.string())),
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
    chave: v.string(), // ex.: 'hero', 'logo' (ou nome do arquivo enviado)
    url: v.string(),
    poster_url: v.optional(v.string()),
    alt: v.optional(v.string()),
    ordem: v.number(),
    ativo: v.boolean(),
    // Se a mídia foi enviada pelo painel (Convex file storage), guarda o
    // storageId para conseguir apagar o arquivo quando a mídia for removida.
    storage_id: v.optional(v.string()),
  }),

  // ---------- Administradores do painel (login /admin) ----------
  // A dona adiciona novos direto no dashboard (Convex → Data → admins →
  // Insert) — libera no login automaticamente, sem mexer em código.
  admins: defineTable({
    usuario: v.string(),
    senha: v.string(),
    nome: v.optional(v.string()),
    ativo: v.boolean(),
  }).index("por_usuario", ["usuario"]),

  // ---------- Uso da assistente Gemini (cota mensal do dashboard) ----------
  gemini_uso: defineTable({
    mes: v.string(), // YYYY-MM
    usos: v.number(), // perguntas respondidas hoje (cota DIÁRIA)
  }).index("por_mes", ["mes"]),

  // ---------- Uso da atendente GROQ (Q&A das clientes, cota mensal) ----------
  atendente_uso: defineTable({
    mes: v.string(), // YYYY-MM
    usos: v.number(), // perguntas respondidas hoje (cota DIÁRIA)
  }).index("por_mes", ["mes"]),

  // ---------- Inscrições de Web Push dos navegadores das clientes ----------
  // O campo `token` guarda a PushSubscription completa em JSON (Web Push
  // padrão — sem Firebase). Um telefone pode ter vários navegadores/aparelhos.
  pushTokens: defineTable({
    token: v.string(), // PushSubscription (JSON) do navegador da cliente
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
    // Pendência da cliente por cancelamento em cima da hora / falta (regra do
    // estúdio): 50% do valor. Preenchido quando a dona cancela individualmente;
    // zera quando a dona marca como quitado (quitarPendencia). O agendamento
    // da cliente mostra um aviso se ela tiver alguma pendência em aberto.
    pendencia: v.optional(v.number()),
  })
    .index("por_data", ["data"])
    .index("por_cliente", ["cliente_id"]),
});
