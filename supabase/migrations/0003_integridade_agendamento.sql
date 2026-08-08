-- ============================================================
-- Barbearia Neto — 0003: Integridade do agendamento
-- Bloqueio por duração + por barbeiro no banco (anti dupla marcação)
-- Aplicar no Supabase: SQL Editor > New query > Run
-- ============================================================

-- 1. Duração gravada no agendamento (fonte da verdade do conflito)
alter table public.agendamentos
  add column if not exists duracao_minutos integer not null default 30;

update public.agendamentos a
  set duracao_minutos = s.duracao_minutos
  from public.servicos s
  where a.servico_id = s.id
    and a.duracao_minutos = 30;

-- 2. Trigger anti-conflito: sobreposição de horários por barbeiro
-- (usa advisory lock para dois clientes simultâneos não passarem juntos)
create or replace function public.verificar_conflito_agendamento()
returns trigger language plpgsql as $$
declare
  inicio timestamp;
  fim timestamp;
  chave uuid;
begin
  if tg_op = 'UPDATE' and new.status = 'cancelado' then
    return new;
  end if;
  chave := coalesce(new.barbeiro_id, '00000000-0000-0000-0000-000000000000');
  inicio := new.data::timestamp + new.horario;
  fim := inicio + (greatest(new.duracao_minutos, 1) * interval '1 minute');
  perform pg_advisory_xact_lock(hashtext(new.data::text || '|' || chave::text));
  if exists (
    select 1 from public.agendamentos a
    where a.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000')
      and a.data = new.data
      and coalesce(a.barbeiro_id, '00000000-0000-0000-0000-000000000000') = chave
      and a.status <> 'cancelado'
      and (a.data::timestamp + a.horario) < fim
      and (a.data::timestamp + a.horario + (greatest(coalesce(a.duracao_minutos, 30), 1) * interval '1 minute')) > inicio
  ) then
    raise exception 'Este horario ja esta ocupado. Escolha outro horario.'
      using errcode = '23P01';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_verificar_conflito on public.agendamentos;
create trigger trg_verificar_conflito
  before insert or update on public.agendamentos
  for each row execute function public.verificar_conflito_agendamento();

-- 3. Colunas esperadas pelo código (admin de serviços e contato)
alter table public.servicos add column if not exists poster_url text;
alter table public.barbearias add column if not exists instagram text;

-- 4. Vídeos Mixkit (leves, 360p) nos serviços
update public.servicos set video_url = case nome
  when 'Corte Masculino' then 'https://assets.mixkit.co/videos/43221/43221-360.mp4'
  when 'Corte + Barba' then 'https://assets.mixkit.co/videos/43222/43222-360.mp4'
  when 'Barba Completa' then 'https://assets.mixkit.co/videos/40130/40130-360.mp4'
  when 'Pigmentação' then 'https://assets.mixkit.co/videos/40120/40120-360.mp4'
  when 'Corte Infantil' then 'https://assets.mixkit.co/videos/43233/43233-360.mp4'
  when 'Pezinho' then 'https://assets.mixkit.co/videos/40127/40127-360.mp4'
  else video_url
end
where video_url is null or video_url = '';
