# 🏗️ ARCHITECTURE — Arquitetura da Base

Plataforma de **agendamento online** com área do cliente (sem login) e dashboard
admin em `/admin`. Arquitetura **SaaS multi-negócio em preparação**: a tabela
`barbearias` é o *tenant* e todos os registros carregam `barbearia_id`.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript (strict) + Vite 8 |
| Estilo | Tailwind CSS 4 (tokens em `src/index.css`) + shadcn/ui (Radix) |
| Roteamento | react-router-dom 7 (SPA com rotas no cliente) |
| Banco | Supabase (PostgreSQL) — RLS aberto, sem autenticação |
| Ícones | lucide-react |
| Deploy | **Vercel** (atual, `vercel.json` com rewrite SPA) · Netlify (legado, `netlify.toml`) |
| Gerenciador | Bun |

## Estrutura de pastas

```
src/
├── main.tsx / App.tsx   # Bootstrap, ToastProvider, rotas, SplashScreen
├── components/          # Componentes reutilizáveis do cliente e do admin
│   └── ui/              # Componentes base shadcn/ui (button, card, dialog...)
├── pages/               # Páginas do cliente (Home, Servicos, Agendamento,
│   │                    #   Promocoes, Contato, Sucesso) + admin/ (Dashboard,
│   └── admin/           #   Agenda, ServicosAdmin, Configuracoes)
├── layouts/             # AdminLayout (menu lateral do painel)
├── hooks/               # useServicos, useBarbeiros, useHorarios, useAgendamentos,
│                        #   useConfiguracao, useBarbearia (dados + estado)
├── contexts/            # ToastContext (notificações)
├── services/            # Camada de dados: cliente Supabase + chamadas por entidade
├── types/               # Tipos de domínio + constante BARBEARIA_NETO_ID
├── utils/               # date, format, phone, slots (motor), media, videos,
│                        #   whatsapp, serviceIcon
└── data/                # demo.ts — dados de demonstração (fallback sem Supabase)

supabase/migrations/     # 0001_init.sql · 0002_saas_platform.sql · 0003_integridade_agendamento.sql
```

## Modelo de dados (Supabase)

| Tabela | Papel |
|---|---|
| `barbearias` | Tenant principal (nome, slug, logo, descrição, endereço, telefone, Instagram, ativo) |
| `barbeiros` | Profissionais da equipe (nome, especialidade, avatar, ativo) |
| `servicos` | Catálogo (nome, descrição, preço, `duracao_minutos`, ativo, `video_url`, `poster_url`) |
| `horarios` | Expediente por dia da semana (`dia_semana`, `hora_inicio`, `hora_fim`, ativo) |
| `agendamentos` | Marcações (cliente, serviço, data, horário, status, `duracao_minutos` gravada, barbeiro) |
| `clientes` | Clientes (nome, telefone — reutilizados por telefone) |
| `configuracoes` | Nome, logo, horário de funcionamento, dias disponíveis |
| `midias` | Biblioteca de conteúdo (vídeo/imagem/banner/logo, por chave) |

- **RLS**: todas as tabelas com leitura/escrita pública (sem auth — app aberto).
- **Tenant**: colunas `barbearia_id` em todas as tabelas; a aplicação fixa o
  tenant atual via `BARBEARIA_NETO_ID`.
- **Integridade (migration 0003)**: trigger `verificar_conflito_agendamento`
  impede sobreposição de horário **por barbeiro e por dia**; a duração do
  serviço é gravada no agendamento; colunas `poster_url` (servicos) e
  `instagram` (barbearias).

## Motor de agendamento (`src/utils/slots.ts` + `src/services/agendamentos.ts`)

1. `gerarSlots` — cria a grade entre abertura/fechamento respeitando a duração.
2. `filtrarSlotsOcupados` / `slotsBloqueados` — remove/marca slots que **começam
   dentro** de um intervalo já ocupado (ex.: 14h com 40 min bloqueia 14h30).
3. `filtrarSlotsPassados` — só no dia atual; **permite agendar no mesmo dia**.
4. `criarAgendamento` — pré-checagem no cliente + **trigger no banco** como
   garantia final contra corridas (erro amigável `ERRO_HORARIO_OCUPADO`).
5. Cancelamento (status) libera a vaga automaticamente.

## Resolução de mídia (`src/utils/media.ts`)

Prioridade: `servico.video_url` (admin) → biblioteca `midias` (Supabase) →
fallback local `src/utils/videos.ts`. O admin troca vídeos/imagens **sem código**.

## Confirmação no WhatsApp (`src/utils/whatsapp.ts`)

Sem integração e sem chaves: ao confirmar, o app abre `wa.me/<55+DDD+número>`
com a mensagem de confirmação pronta (serviço, valor, profissional, data,
horário). Botão flutuante de contato usa o mesmo mecanismo.

## Variáveis de ambiente (nomes — valores fora do git)

```
VITE_SUPABASE_URL      # Project URL do Supabase
VITE_SUPABASE_ANON_KEY # chave anon/publishable do Supabase
```

- Declaradas em `src/vite-env.d.ts` e lidas em `src/services/supabase.ts`.
- **Sem as chaves**, o app roda em **modo demonstração** (`src/data/demo.ts`).
- `.env`/`.env.local` estão no `.gitignore` — nunca commit.

## Deploy

- **Vercel (produção atual)**: `vercel.json` reescreve todas as rotas para
  `index.html` (SPA). Build: `npm run build` → `dist/`.
- **Netlify (legado)**: `netlify.toml` com redirect `/* → /index.html`.
- Para uma cópia, criar projeto Vercel próprio e definir as env vars **do banco
  da cópia**.
