import type { Agendamento, Configuracao, Horario, Servico } from "@/types";
import { BARBEARIA_NETO_ID } from "@/types";
import { addDaysISO, todayISO } from "@/utils/date";

// Cardápio de demonstração — espelha os serviços REAIS do estúdio
// (valores oficiais 2026-08). Combos continuam gerenciados no painel,
// porém FORA da visualização do cliente (ativo: false).
export const DEMO_SERVICOS: Servico[] = [
  {
    id: "demo-aplicacao-esmaltada",
    nome: "Aplicação Esmaltada",
    descricao:
      "Aplicação completa de alongamento com esmaltação em gel — unhas impecáveis do início ao fim.",
    preco: 250,
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
    id: "demo-aplicacao-natural",
    nome: "Aplicação Natural",
    descricao:
      "Aplicação completa de alongamento com acabamento natural e discreto.",
    preco: 220,
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
    id: "demo-manutencao-esmaltada",
    nome: "Manutenção Esmaltada",
    descricao:
      "Manutenção do alongamento esmaltado — suas unhas sempre prontas.",
    preco: 185,
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
    id: "demo-manutencao-natural",
    nome: "Manutenção Natural",
    descricao:
      "Manutenção do alongamento natural com cuidado e precisão.",
    preco: 165,
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
    id: "demo-banho-gel",
    nome: "Banho de Gel",
    descricao: "Banho de gel para revitalizar e hidratar as unhas.",
    preco: 155,
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
    id: "demo-esmaltacao-maos",
    nome: "Esmaltação em Gel – Mãos",
    descricao: "Esmaltação em gel com brilho intenso e durabilidade — mãos.",
    preco: 115,
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
    id: "demo-esmaltacao-pes",
    nome: "Esmaltação em Gel – Pés",
    descricao: "Esmaltação em gel com brilho intenso e durabilidade — pés.",
    preco: 100,
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
    id: "demo-retirada",
    nome: "Retirada",
    descricao: "Retirada do procedimento em gel existente.",
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
  // ---- Combos de exemplo — gerenciados no painel, FORA da vista do cliente ----
  {
    id: "demo-combo-manicure-pedicure",
    nome: "Combo Manicure + Pedicure",
    descricao:
      "O clássico da casa: mãos e pés impecáveis no mesmo dia, com atendimento exclusivo.",
    preco: 80,
    duracao_minutos: 100,
    ativo: false,
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
    ativo: false,
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
    ativo: false,
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
  // Segunda a quinta: 08h às 18h (almoço 11h–14h fora dos horários fixos)
  { id: "demo-h1", dia_semana: 1, hora_inicio: "08:00", hora_fim: "18:00", ativo: true, slots_fixos: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "17:00"], created_at: "", barbearia_id: BARBEARIA_NETO_ID },
  { id: "demo-h2", dia_semana: 2, hora_inicio: "08:00", hora_fim: "18:00", ativo: true, slots_fixos: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "17:00"], created_at: "", barbearia_id: BARBEARIA_NETO_ID },
  { id: "demo-h3", dia_semana: 3, hora_inicio: "08:00", hora_fim: "18:00", ativo: true, slots_fixos: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "17:00"], created_at: "", barbearia_id: BARBEARIA_NETO_ID },
  { id: "demo-h4", dia_semana: 4, hora_inicio: "08:00", hora_fim: "18:00", ativo: true, slots_fixos: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "17:00"], created_at: "", barbearia_id: BARBEARIA_NETO_ID },
  // Sexta-feira: 08h às 16h (almoço 11h–14h fora dos horários fixos)
  { id: "demo-h5", dia_semana: 5, hora_inicio: "08:00", hora_fim: "16:00", ativo: true, slots_fixos: ["08:00", "09:00", "10:00", "14:00", "15:00"], created_at: "", barbearia_id: BARBEARIA_NETO_ID },
];

export const DEMO_CONFIG: Configuracao = {
  id: "demo-config",
  nome_barbearia: "Studio Natália Braga – Nail Design",
  logo_url: null,
  horario_funcionamento:
    "Segunda a quinta: 08h às 18h · Sexta-feira: 08h às 16h",
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
