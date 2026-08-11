-- ============================================================
-- Nail Design Studio — 0004: Transformação da identidade
-- Barbearia → Estúdio de Nail Design (manicure, pedicure, gel...)
-- Aplicar no Supabase: SQL Editor > New query > Run
-- ============================================================

-- 1. Identidade do tenant
update public.barbearias
set nome = 'Nail Design Studio',
    slug = 'nail-design-studio',
    descricao = 'Elegância e cuidado em cada detalhe.'
where id = '00000000-0000-0000-0000-000000000001';

update public.configuracoes
set nome_barbearia = 'Nail Design Studio',
    horario_funcionamento = 'Terça a Sábado — 09h às 19h'
where barbearia_id = '00000000-0000-0000-0000-000000000001'
   or id = (select id from public.configuracoes limit 1);

-- 2. Serviços antigos (barbearia) saem do cardápio — desativados,
--    preservando o histórico de agendamentos (FK restrict)
update public.servicos set ativo = false
where nome in (
  'Corte Masculino', 'Corte + Barba', 'Barba Completa',
  'Pigmentação', 'Corte Infantil', 'Pezinho'
);

-- 3. Novo cardápio de nail design
insert into public.servicos (nome, descricao, preco, duracao_minutos, ativo, barbearia_id, video_url) values
  ('Manicure', 'Cuidados com as cutículas, lixação, formato dos seus sonhos e esmaltação na cor da sua escolha.', 40.00, 45, true, '00000000-0000-0000-0000-000000000001', 'https://assets.mixkit.co/videos/15806/15806-360.mp4'),
  ('Pedicure', 'Pés renovados: banho relaxante, cutículas, esfoliação leve e esmaltação impecável.', 50.00, 60, true, '00000000-0000-0000-0000-000000000001', 'https://assets.mixkit.co/videos/27906/27906-360.mp4'),
  ('Esmaltação em Gel', 'Brilho intenso e durabilidade de até 3 semanas com esmalte em gel.', 70.00, 60, true, '00000000-0000-0000-0000-000000000001', 'https://assets.mixkit.co/videos/13084/13084-360.mp4'),
  ('Alongamento em Gel', 'Unhas alongadas, leves e resistentes, modeladas no formato ideal para você.', 120.00, 90, true, '00000000-0000-0000-0000-000000000001', 'https://assets.mixkit.co/videos/24817/24817-360.mp4'),
  ('Nail Art', 'Designs exclusivos: francesinha, degradê, desenhos personalizados e brilhos.', 35.00, 30, true, '00000000-0000-0000-0000-000000000001', 'https://assets.mixkit.co/videos/36905/36905-360.mp4'),
  ('Spa dos Pés', 'Hidratação profunda, esfoliação e massagem relaxante para os pés.', 85.00, 75, true, '00000000-0000-0000-0000-000000000001', 'https://assets.mixkit.co/videos/21970/21970-360.mp4')
on conflict (nome) do nothing;

-- 4. Profissional da equipe (estrutura multi-profissional preservada)
update public.barbeiros
set nome = 'Camila',
    especialidade = 'Manicure, pedicure e nail art'
where nome = 'Neto';

-- 5. Biblioteca de mídia → nail design (trocável sem código pelo admin)
update public.midias
set url = 'https://assets.mixkit.co/videos/15125/15125-360.mp4',
    poster_url = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=70',
    alt = 'Estúdio em ação'
where chave = 'hero';

update public.midias
set url = 'https://assets.mixkit.co/videos/15806/15806-360.mp4',
    poster_url = 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=70',
    alt = 'Manicure'
where chave = 'servico-corte';

update public.midias
set url = 'https://assets.mixkit.co/videos/27906/27906-360.mp4',
    poster_url = 'https://images.unsplash.com/photo-1599553478940-d7d2d66cf9af?auto=format&fit=crop&w=1200&q=70',
    alt = 'Pedicure'
where chave = 'servico-barba';
