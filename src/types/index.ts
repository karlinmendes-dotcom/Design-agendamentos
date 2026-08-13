// ============================================================
// Nail Design Studio — Tipos da plataforma SaaS de agendamento
// ============================================================

// ---------- Tenant: Barbearia ----------
export interface Barbearia {
  id: string;
  nome: string;
  slug: string | null;
  logo_url: string | null;
  descricao: string | null;
  endereco: string | null;
  telefone: string | null;
  instagram: string | null;
  /** Link completo do Instagram — destino real do clique (roda pé/contato). */
  instagram_url: string | null;
  ativo: boolean;
  created_at: string;
}

// ---------- Barbeiro ----------
export interface Barbeiro {
  id: string;
  barbearia_id: string | null;
  nome: string;
  especialidade: string | null;
  avatar_url: string | null;
  ativo: boolean;
  created_at: string;
}

// ---------- Biblioteca de mídia ----------
export type TipoMidia = "video" | "imagem" | "banner" | "logo";

export interface Midia {
  id: string;
  barbearia_id: string | null;
  tipo: TipoMidia;
  chave: string; // ex.: 'hero', 'servico-corte', 'logo'
  url: string;
  poster_url: string | null;
  alt: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
  created_at: string;
  // Tenant / mídia
  barbearia_id: string | null;
  midia_id: string | null;
  video_url: string | null;
  poster_url: string | null;
  // Combo: serviço agrupado (mesmo motor de agendamento)
  is_combo: boolean;
  itens_combo: string[];
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  created_at: string;
  barbearia_id: string | null;
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
  duracao_minutos?: number; // duração do serviço gravada na marcação (integridade)
  created_at: string;
  // Tenant / barbeiro
  barbearia_id: string | null;
  barbeiro_id: string | null;
  // Relacionamentos (join do Convex)
  cliente?: Pick<Cliente, "nome" | "telefone"> | null;
  servico?: Pick<Servico, "nome" | "preco" | "duracao_minutos"> | null;
  barbeiro?: Pick<Barbeiro, "nome"> | null;
  /** Pendência da cliente (50% por cancelamento em cima da hora / falta). */
  pendencia?: number | null;
}

export interface Horario {
  id: string;
  dia_semana: number; // 0 = Domingo
  hora_inicio: string; // HH:mm
  hora_fim: string; // HH:mm
  ativo: boolean;
  /** Horários EXATOS de agendamento (quando definidos, só eles são oferecidos). */
  slots_fixos: string[];
  created_at: string;
  barbearia_id: string | null;
}

export interface Configuracao {
  id: string;
  nome_barbearia: string;
  logo_url: string | null;
  horario_funcionamento: string | null;
  dias_disponiveis: number[];
  updated_at: string;
  barbearia_id: string | null;
}

export interface ServicoFormData {
  nome: string;
  descricao: string;
  preco: string;
  duracao_minutos: string;
  video_url: string;
  poster_url: string;
  is_combo: boolean;
  itens_combo: string[];
}

export interface NovoAgendamento {
  servico_id: string;
  data: string;
  horario: string;
  nome: string;
  telefone: string;
  barbeiro_id?: string | null;
}

// ---------- Constantes da plataforma ----------
/** ID fixo do estúdio (primeiro tenant cadastrado). */
export const BARBEARIA_NETO_ID = "00000000-0000-0000-0000-000000000001";
