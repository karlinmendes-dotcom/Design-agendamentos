import type { Agendamento, Configuracao, Horario, Servico } from "@/types";
import { BARBEARIA_NETO_ID } from "@/types";
import { addDaysISO, todayISO } from "@/utils/date";

export const DEMO_SERVICOS: Servico[] = [
  {
    id: "demo-manicure",
    nome: "Manicure",
    descricao:
      "Cuidados com as cutículas, lixação, formato dos seus sonhos e esmaltação na cor da sua escolha.",
    preco: 40,
    duracao_minutos: 45,
    ativo: true,
    created_at: new Date().toISOString(),
    barbearia_id: BARBEARIA_NETO_ID,
    midia_id: null,
    video_url: null,
    poster_url: null,
    is_combo: false,
    itens_combo: [],
  },
  {
    id: "demo-pedicure",
    nome: "Pedicure",
    descricao:
      "Pés renovados: banho relaxante, cutículas, esfoliação leve e esmaltação impecável.",
    preco: 50,
    duracao_minutos: 60,
    ativo: true,
    created_at: new Date().toISOString(),
    barbearia_id: BARBEARIA_NETO_ID,
    midia_id: null,
    video_url: null,
    poster_url: null,
    is_combo: false,
    itens_combo: [],
  },
  {
    id: "demo-gel",
    nome: "Esmaltação em Gel",
    descricao:
      "Brilho intenso e durabilidade de até 3 semanas com esmalte em gel.",
    preco: 70,
    duracao_minutos: 60,
    ativo: true,
    created_at: new Date().toISOString(),
    barbearia_id: BARBEARIA_NETO_ID,
    midia_id: null,
    video_url: null,
    poster_url: null,
    is_combo: false,
    itens_combo: [],
  },
  {
    id: "demo-alongamento",
    nome: "Alongamento em Gel",
    descricao:
      "Unhas alongadas, leves e resistentes, modeladas no formato ideal para você.",
    preco: 120,
    duracao_minutos: 90,
    ativo: true,
    created_at: new Date().toISOString(),
    barbearia_id: BARBEARIA_NETO_ID,
    midia_id: null,
    video_url: null,
    poster_url: null,
    is_combo: false,
    itens_combo: [],
  },
  {
    id: "demo-nail-art",
    nome: "Nail Art",
    descricao:
      "Designs exclusivos: francesinha, degradê, desenhos personalizados e brilhos.",
    preco: 35,
    duracao_minutos: 30,
    ativo: true,
    created_at: new Date().toISOString(),
    barbearia_id: BARBEARIA_NETO_ID,
    midia_id: null,
    video_url: null,
    poster_url: null,
    is_combo: false,
    itens_combo: [],
  },
  {
    id: "demo-spa",
    nome: "Spa dos Pés",
    descricao:
      "Hidratação profunda, esfoliação e massagem relaxante para os pés.",
    preco: 85,
    duracao_minutos: 75,
    ativo: true,
    created_at: new Date().toISOString(),
    barbearia_id: BARBEARIA_NETO_ID,
    midia_id: null,
    video_url: null,
    poster_url: null,
    is_combo: false,
    itens_combo: [],
  },
  // ---- Combos de exemplo (is_combo=true — mesmo motor de agendamento) ----
  {
    id: "demo-combo-manicure-pedicure",
    nome: "Combo Manicure + Pedicure",
    descricao:
      "O clássico da casa: mãos e pés impecáveis no mesmo dia, com atendimento exclusivo.",
    preco: 80,
    duracao_minutos: 100,
    ativo: true,
    created_at: new Date().toISOString(),
    barbearia_id: BARBEARIA_NETO_ID,
    midia_id: null,
    video_url: null,
    poster_url: null,
    is_combo: true,
    itens_combo: ["Manicure", "Pedicure"],
  },
  {
    id: "demo-combo-spa",
    nome: "Dia de Spa Completo",
    descricao:
      "Manicure + pedicure + spa dos pés para renovar corpo e mente em uma única visita.",
    preco: 160,
    duracao_minutos: 180,
    ativo: true,
    created_at: new Date().toISOString(),
    barbearia_id: BARBEARIA_NETO_ID,
    midia_id: null,
    video_url: null,
    poster_url: null,
    is_combo: true,
    itens_combo: ["Manicure", "Pedicure", "Spa dos Pés"],
  },
  {
    id: "demo-combo-unhas-dos-sonhos",
    nome: "Unhas dos Sonhos",
    descricao:
      "Alongamento em gel + nail art para um visual marcante e duradouro.",
    preco: 145,
    duracao_minutos: 120,
    ativo: true,
    created_at: new Date().toISOString(),
    barbearia_id: BARBEARIA_NETO_ID,
    midia_id: null,
    video_url: null,
    poster_url: null,
    is_combo: true,
    itens_combo: ["Alongamento em Gel", "Nail Art"],
  },
];

export const DEMO_HORARIOS: Horario[] = [
  { id: "demo-h1", dia_semana: 1, hora_inicio: "09:00", hora_fim: "19:00", ativo: true, created_at: "", barbearia_id: BARBEARIA_NETO_ID },
  { id: "demo-h2", dia_semana: 2, hora_inicio: "09:00", hora_fim: "19:00", ativo: true, created_at: "", barbearia_id: BARBEARIA_NETO_ID },
  { id: "demo-h3", dia_semana: 3, hora_inicio: "09:00", hora_fim: "19:00", ativo: true, created_at: "", barbearia_id: BARBEARIA_NETO_ID },
  { id: "demo-h4", dia_semana: 4, hora_inicio: "09:00", hora_fim: "19:00", ativo: true, created_at: "", barbearia_id: BARBEARIA_NETO_ID },
  { id: "demo-h5", dia_semana: 5, hora_inicio: "09:00", hora_fim: "19:00", ativo: true, created_at: "", barbearia_id: BARBEARIA_NETO_ID },
  { id: "demo-h6", dia_semana: 6, hora_inicio: "08:00", hora_fim: "18:00", ativo: true, created_at: "", barbearia_id: BARBEARIA_NETO_ID },
];

export const DEMO_CONFIG: Configuracao = {
  id: "demo-config",
  nome_barbearia: "Studio Natália Braga – Nail Design",
  logo_url: null,
  horario_funcionamento: "Terça a Sábado — 09h às 19h",
  dias_disponiveis: [1, 2, 3, 4, 5, 6],
  updated_at: new Date().toISOString(),
  barbearia_id: BARBEARIA_NETO_ID,
};

function demoAgendamento(
  id: string,
  dataOffset: number,
  horario: string,
  nome: string,
  telefone: string,
  servicoId: string,
  status: Agendamento["status"],
): Agendamento {
  const servico = DEMO_SERVICOS.find((s) => s.id === servicoId) ?? DEMO_SERVICOS[0];
  return {
    id,
    cliente_id: `demo-c-${id}`,
    servico_id: servicoId,
    data: addDaysISO(dataOffset),
    horario,
    status,
    created_at: new Date().toISOString(),
    barbearia_id: BARBEARIA_NETO_ID,
    barbeiro_id: null,
    barbeiro: { nome: "Natália Braga" },
    cliente: { nome, telefone },
    servico: {
      nome: servico.nome,
      preco: servico.preco,
      duracao_minutos: servico.duracao_minutos,
    },
  };
}

export const DEMO_AGENDAMENTOS: Agendamento[] = [
  demoAgendamento("demo-a1", 0, "09:00", "Ana Souza", "(11) 98877-1234", "demo-alongamento", "confirmado"),
  demoAgendamento("demo-a2", 0, "10:30", "Marina Lima", "(11) 97766-4321", "demo-manicure", "confirmado"),
  demoAgendamento("demo-a3", 0, "14:00", "Juliana Castro", "(21) 96655-7788", "demo-pedicure", "confirmado"),
  demoAgendamento("demo-a4", 1, "09:30", "Juliana Castro", "(31) 95544-1122", "demo-gel", "confirmado"),
  demoAgendamento("demo-a5", 1, "11:00", "Beatriz Ferreira", "(41) 94433-5566", "demo-nail-art", "cancelado"),
  demoAgendamento("demo-a6", 2, "16:30", "Larissa Alves", "(11) 93322-8899", "demo-spa", "confirmado"),
];

export const hojeISODemo = todayISO();
