-- ============================================================
-- Barbearia Neto — Plataforma SaaS multi-barbearias
-- Preparação de arquitetura: múltiplas barbearias, unidades,
-- administradores, barbeiros, agendas e biblioteca de mídia.
-- Aplicar no Supabase: SQL Editor > New query > Run
-- ============================================================

-- ---------- Tabela: barbearias (tenant principal) ----------
create table if not exists public.barbearias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique,
  logo_url text,
  descricao text,
  endereco text,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Tabela: barbeiros (membros da equipe) ----------
create table if not exists public.barbeiros (
  id uuid primary key default gen_random_uuid(),
  barbearia_id uuid references public.barbearias(id) on delete cascade,
  nome text not null,
  especialidade text,
  avatar_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Tabela: midias (biblioteca de conteúdo) ----------
-- Vídeos, imagens, banners e logotipos gerenciáveis sem código.
create table if not exists public.midias (
  id uuid primary key default gen_random_uuid(),
  barbearia_id uuid references public.barbearias(id) on delete cascade,
  tipo text not null check (tipo in ('video', 'imagem', 'banner', 'logo')),
  chave text not null,          -- ex.: 'hero', 'servico-corte', 'logo'
  url text not null,            -- arquivo hospedado (Supabase Storage, CDN...)
  poster_url text,              -- imagem de capa (para vídeos)
  alt text,
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (barbearia_id, tipo, chave)
);

-- ---------- Colunas tenant nas tabelas existentes ----------
-- (nullable para manter compatibilidade; a aplicação define o tenant)
alter table public.clientes
  add column if not exists barbearia_id uuid references public.barbearias(id) on delete cascade;

alter table public.servicos
  add column if not exists barbearia_id uuid references public.barbearias(id) on delete cascade,
  add column if not exists midia_id uuid references public.midias(id) on delete set null,
  add column if not exists video_url text;

alter table public.agendamentos
  add column if not exists barbearia_id uuid references public.barbearias(id) on delete cascade,
  add column if not exists barbeiro_id uuid references public.barbeiros(id) on delete set null;

alter table public.horarios
  add column if not exists barbearia_id uuid references public.barbearias(id) on delete cascade;

alter table public.configuracoes
  add column if not exists barbearia_id uuid references public.barbearias(id) on delete cascade;

-- ---------- Índices tenant ----------
create index if not exists idx_servicos_barbearia on public.servicos(barbearia_id);
create index if not exists idx_agendamentos_barbearia on public.agendamentos(barbearia_id);
create index if not exists idx_agendamentos_barbeiro on public.agendamentos(barbeiro_id);
create index if not exists idx_barbeiros_barbearia on public.barbeiros(barbearia_id);
create index if not exists idx_midias_barbearia on public.midias(barbearia_id);

-- ---------- Row Level Security (acesso aberto, sem auth) ----------
alter table public.barbearias enable row level security;
alter table public.barbeiros enable row level security;
alter table public.midias enable row level security;

create policy "barbearias_leitura_publica" on public.barbearias for select using (true);
create policy "barbearias_escrita_publica" on public.barbearias for all using (true) with check (true);

create policy "barbeiros_leitura_publica" on public.barbeiros for select using (true);
create policy "barbeiros_escrita_publica" on public.barbeiros for all using (true) with check (true);

create policy "midias_leitura_publica" on public.midias for select using (true);
create policy "midias_escrita_publica" on public.midias for all using (true) with check (true);

-- ---------- Seed: Barbearia Neto (primeira barbearia) ----------
insert into public.barbearias (id, nome, slug, descricao, telefone)
values (
  '00000000-0000-0000-0000-000000000001',
  'Barbearia Neto',
  'barbearia-neto',
  'Tradição e estilo em cada corte.',
  '(00) 00000-0000'
)
on conflict (id) do nothing;

-- Vincula os registros existentes à Barbearia Neto
update public.clientes set barbearia_id = '00000000-0000-0000-0000-000000000001'
  where barbearia_id is null;
update public.servicos set barbearia_id = '00000000-0000-0000-0000-000000000001'
  where barbearia_id is null;
update public.agendamentos set barbearia_id = '00000000-0000-0000-0000-000000000001'
  where barbearia_id is null;
update public.horarios set barbearia_id = '00000000-0000-0000-0000-000000000001'
  where barbearia_id is null;
update public.configuracoes set barbearia_id = '00000000-0000-0000-0000-000000000001'
  where barbearia_id is null;

-- ---------- Seed: biblioteca de mídia padrão ----------
-- O administrador poderá trocar estas URLs (Storage/CDN) sem código.
insert into public.midias (barbearia_id, tipo, chave, url, poster_url, alt, ordem) values
  (
    '00000000-0000-0000-0000-000000000001',
    'video', 'hero',
    'https://upload.wikimedia.org/wikipedia/commons/e/e9/CUT_%26_SHAVE_%E2%80%A2_Penang%27s_Vintage_Barbershop_%E2%80%A2_George_Town_%E2%80%A2_MALAYSIA.webm',
    'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1600&q=70',
    'Barbearia em ação', 1
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'video', 'servico-corte',
    'https://upload.wikimedia.org/wikipedia/commons/7/7f/Haircut_practice_-_Tokyo_area_-_2013_1_30.webm',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=70',
    'Corte masculino', 10
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'video', 'servico-barba',
    'https://upload.wikimedia.org/wikipedia/commons/0/08/President_Obama_drops_by_his_old_barbershop_for_a_haircut.webm',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=70',
    'Barba completa', 20
  )
on conflict (barbearia_id, tipo, chave) do nothing;

-- ---------- Seed: barbeiros (estrutura preparada) ----------
-- A seleção de barbeiro aparece no fluxo assim que houver barbeiros ativos.
insert into public.barbeiros (barbearia_id, nome, especialidade, avatar_url) values
  (
    '00000000-0000-0000-0000-000000000001',
    'Neto',
    'Cortes clássicos e degradê',
    null
  )
on conflict do nothing;
