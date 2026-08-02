export interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
  created_at: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  created_at: string;
}

export type StatusAgendamento = "confirmado" | "concluido" | "cancelado";

export const STATUS_AGENDAMENTO: Record<StatusAgendamento, string> = {
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export interface Agendamento {
  id: string;
  cliente_id: string;
  servico_id: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  status: StatusAgendamento;
  created_at: string;
  // Relacionamentos (join do Supabase)
  cliente?: Pick<Cliente, "nome" | "telefone"> | null;
  servico?: Pick<Servico, "nome" | "preco" | "duracao_minutos"> | null;
}

export interface Horario {
  id: string;
  dia_semana: number; // 0 = Domingo
  hora_inicio: string; // HH:mm
  hora_fim: string; // HH:mm
  ativo: boolean;
  created_at: string;
}

export interface Configuracao {
  id: string;
  nome_barbearia: string;
  logo_url: string | null;
  horario_funcionamento: string | null;
  dias_disponiveis: number[];
  updated_at: string;
}

export interface ServicoFormData {
  nome: string;
  descricao: string;
  preco: string;
  duracao_minutos: string;
}

export interface NovoAgendamento {
  servico_id: string;
  data: string;
  horario: string;
  nome: string;
  telefone: string;
}
