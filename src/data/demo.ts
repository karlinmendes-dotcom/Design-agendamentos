import type { Agendamento, Configuracao, Horario, Servico } from "@/types";
import { addDaysISO, todayISO } from "@/utils/date";

export const DEMO_SERVICOS: Servico[] = [
  {
    id: "demo-corte",
    nome: "Corte Masculino",
    descricao:
      "Corte moderno com máquina e tesoura, finalização com pomada e consultoria de estilo.",
    preco: 45,
    duracao_minutos: 40,
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-corte-barba",
    nome: "Corte + Barba",
    descricao:
      "Pacote completo: corte na régua e barba alinhada com toalha quente e navalha.",
    preco: 70,
    duracao_minutos: 70,
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-barba",
    nome: "Barba Completa",
    descricao:
      "Modelagem da barba com toalha quente, navalha e finalização com óleo de barba.",
    preco: 35,
    duracao_minutos: 30,
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-pigmentacao",
    nome: "Pigmentação",
    descricao:
      "Preenchimento de falhas na barba ou cabelo para um visual cheio e definido.",
    preco: 30,
    duracao_minutos: 25,
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-infantil",
    nome: "Corte Infantil",
    descricao:
      "Corte para a criançada com paciência e cuidado, deixando o pequeno estiloso.",
    preco: 35,
    duracao_minutos: 30,
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-pezinho",
    nome: "Pezinho",
    descricao:
      "Acabamento rápido do contorno e pezinho do cabelo para manter o corte sempre alinhado.",
    preco: 15,
    duracao_minutos: 15,
    ativo: true,
    created_at: new Date().toISOString(),
  },
];

export const DEMO_HORARIOS: Horario[] = [
  { id: "demo-h1", dia_semana: 1, hora_inicio: "09:00", hora_fim: "19:00", ativo: true, created_at: "" },
  { id: "demo-h2", dia_semana: 2, hora_inicio: "09:00", hora_fim: "19:00", ativo: true, created_at: "" },
  { id: "demo-h3", dia_semana: 3, hora_inicio: "09:00", hora_fim: "19:00", ativo: true, created_at: "" },
  { id: "demo-h4", dia_semana: 4, hora_inicio: "09:00", hora_fim: "19:00", ativo: true, created_at: "" },
  { id: "demo-h5", dia_semana: 5, hora_inicio: "09:00", hora_fim: "19:00", ativo: true, created_at: "" },
  { id: "demo-h6", dia_semana: 6, hora_inicio: "08:00", hora_fim: "18:00", ativo: true, created_at: "" },
];

export const DEMO_CONFIG: Configuracao = {
  id: "demo-config",
  nome_barbearia: "Barbearia Neto",
  logo_url: null,
  horario_funcionamento: "Terça a Sábado — 09h às 19h",
  dias_disponiveis: [1, 2, 3, 4, 5, 6],
  updated_at: new Date().toISOString(),
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
    cliente: { nome, telefone },
    servico: {
      nome: servico.nome,
      preco: servico.preco,
      duracao_minutos: servico.duracao_minutos,
    },
  };
}

export const DEMO_AGENDAMENTOS: Agendamento[] = [
  demoAgendamento("demo-a1", 0, "09:00", "Rafael Souza", "(11) 98877-1234", "demo-corte-barba", "confirmado"),
  demoAgendamento("demo-a2", 0, "10:30", "Marcos Lima", "(11) 97766-4321", "demo-corte", "confirmado"),
  demoAgendamento("demo-a3", 0, "14:00", "Pedro Henrique", "(21) 96655-7788", "demo-barba", "confirmado"),
  demoAgendamento("demo-a4", 1, "09:30", "João Carlos", "(31) 95544-1122", "demo-pigmentacao", "confirmado"),
  demoAgendamento("demo-a5", 1, "11:00", "Bruno Ferreira", "(41) 94433-5566", "demo-infantil", "cancelado"),
  demoAgendamento("demo-a6", 2, "16:30", "Diego Alves", "(11) 93322-8899", "demo-corte-barba", "confirmado"),
];

export const hojeISODemo = todayISO();
