-- ============================================================
-- Barbearia Neto — Schema inicial
-- Aplicar no Supabase: SQL Editor > New query > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tabelas ----------

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  descricao text,
  preco numeric(10, 2) not null default 0,
  duracao_minutos integer not null default 30,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.horarios (
  id uuid primary key default gen_random_uuid(),
  dia_semana integer not null unique check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fim time not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  servico_id uuid not null references public.servicos(id) on delete restrict,
  data date not null,
  horario time not null,
  status text not null default 'confirmado'
    check (status in ('confirmado', 'concluido', 'cancelado')),
  created_at timestamptz not null default now()
);

create table if not exists public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  nome_barbearia text not null default 'Barbearia Neto',
  logo_url text,
  horario_funcionamento text,
  dias_disponiveis integer[] not null default '{1,2,3,4,5,6}',
  updated_at timestamptz not null default now()
);

-- ---------- Índices ----------

create index if not exists idx_agendamentos_data on public.agendamentos(data);
create index if not exists idx_agendamentos_servico on public.agendamentos(servico_id);
create index if not exists idx_agendamentos_cliente on public.agendamentos(cliente_id);

-- ---------- Row Level Security (acesso aberto, sem auth) ----------

alter table public.clientes enable row level security;
alter table public.servicos enable row level security;
alter table public.horarios enable row level security;
alter table public.agendamentos enable row level security;
alter table public.configuracoes enable row level security;

create policy "clientes_leitura_publica" on public.clientes for select using (true);
create policy "clientes_escrita_publica" on public.clientes for all using (true) with check (true);

create policy "servicos_leitura_publica" on public.servicos for select using (true);
create policy "servicos_escrita_publica" on public.servicos for all using (true) with check (true);

create policy "horarios_leitura_publica" on public.horarios for select using (true);
create policy "horarios_escrita_publica" on public.horarios for all using (true) with check (true);

create policy "agendamentos_leitura_publica" on public.agendamentos for select using (true);
create policy "agendamentos_escrita_publica" on public.agendamentos for all using (true) with check (true);

create policy "configuracoes_leitura_publica" on public.configuracoes for select using (true);
create policy "configuracoes_escrita_publica" on public.configuracoes for all using (true) with check (true);

-- ---------- Seed: serviços iniciais ----------

insert into public.servicos (nome, descricao, preco, duracao_minutos) values
  ('Corte Masculino', 'Corte moderno com máquina e tesoura, finalização com pomada e consultoria de estilo.', 45.00, 40),
  ('Corte + Barba', 'Pacote completo: corte na régua e barba alinhada com toalha quente e navalha.', 70.00, 70),
  ('Barba Completa', 'Modelagem da barba com toalha quente, navalha e finalização com óleo de barba.', 35.00, 30),
  ('Pigmentação', 'Preenchimento de falhas na barba ou cabelo para um visual cheio e definido.', 30.00, 25),
  ('Corte Infantil', 'Corte para a criançada com paciência e cuidado, deixando o pequeno estiloso.', 35.00, 30),
  ('Pezinho', 'Acabamento rápido do contorno e pezinho do cabelo para manter o corte sempre alinhado.', 15.00, 15)
on conflict (nome) do nothing;

-- ---------- Seed: horários (terça a sábado) ----------

insert into public.horarios (dia_semana, hora_inicio, hora_fim) values
  (1, '09:00', '19:00'),
  (2, '09:00', '19:00'),
  (3, '09:00', '19:00'),
  (4, '09:00', '19:00'),
  (5, '09:00', '19:00'),
  (6, '08:00', '18:00')
on conflict (dia_semana) do nothing;

-- ---------- Seed: configuração inicial ----------

insert into public.configuracoes (nome_barbearia, horario_funcionamento, dias_disponiveis)
values ('Barbearia Neto', 'Terça a Sábado — 09h às 19h', '{1,2,3,4,5,6}')
on conflict do nothing;
