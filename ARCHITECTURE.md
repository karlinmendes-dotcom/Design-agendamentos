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
| Banco | **Convex** — queries reativas + mutations, sem auth (app aberto) |
| Ícones | lucide-react |
| Deploy | **Vercel** (atual, `vercel.json` com rewrite SPA) |
| Gerenciador | Bun |

## Estrutura de pastas

```
src/
├── main.tsx / App.tsx   # Bootstrap, ConvexProvider, ToastProvider, rotas, SplashScreen
├── components/          # Componentes reutilizáveis do cliente e do admin
│   └── ui/              # Componentes base shadcn/ui (button, card, dialog...)
├── convex/              # Backend: schema.ts + funções por entidade + seed.ts
├── pages/               # Páginas do cliente (Home, Servicos, Agendamento,
│   │                    #   Promocoes, Contato, Sucesso) + admin/ (Dashboard,
│   └── admin/           #   Agenda, ServicosAdmin, Configuracoes)
├── layouts/             # AdminLayout (menu lateral do painel)
├── hooks/               # useServicos, useBarbeiros, useHorarios, useAgendamentos,
│                        #   useConfiguracao, useBarbearia (queries reativas)
├── contexts/            # ToastContext (notificações)
├── lib/                 # Cliente Convex + isConvexConfigured + erroMensagem
├── types/               # Tipos de domínio + constante BARBEARIA_NETO_ID
├── utils/               # date, format, phone, slots (motor), media, videos,
│                        #   whatsapp, serviceIcon
└── data/                # demo.ts — dados de demonstração (fallback sem Convex)

supabase/migrations/     # histórico do banco antigo (mantido por regra da base)
convex.json              # aponta o CLI Convex para src/convex
```

## Modelo de dados (Convex — `src/convex/schema.ts`)

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
| `datasBloqueadas` | Feriados/folgas (data + motivo) — indexada por data |

- **Acesso**: sem autenticação (app aberto) — as funções Convex leem/escrevem
  publicamente.
- **Tenant**: campo `barbearia_id` em todas as tabelas; a aplicação fixa o
  tenant atual via `BARBEARIA_NETO_ID` (nome de schema legado — o conteúdo é
  nail design).
- **Integridade (validação no servidor — o dashboard manda de verdade)**: a
  mutation `agendamentos.criar` chama `validarDisponibilidade` (dia da semana
  precisa ter expediente ativo em `horarios`, data não pode estar em
  `datasBloqueadas`, horário+duração dentro do expediente) e depois pré-checa
  sobreposição **por barbeiro e por dia** (incluindo a duração do serviço) —
  lança erros amigáveis em português e, por ser mutation atômica do Convex,
  não há corrida entre dois clientes simultâneos.

## Motor de agendamento (`src/utils/slots.ts` + `src/convex/agendamentos.ts`)

1. `gerarSlots` — cria a grade entre abertura/fechamento respeitando a duração.
2. `filtrarSlotsOcupados` / `slotsBloqueados` — remove/marca slots que **começam
   dentro** de um intervalo já ocupado (ex.: 14h com 40 min bloqueia 14h30).
3. `filtrarSlotsPassados` — só no dia atual; **permite agendar no mesmo dia**.
4. `criar` (mutation Convex) — valida no servidor: dia ativo (`horarios`),
   data não bloqueada (`datasBloqueadas`), horário dentro do expediente e
   sobreposição contra agendamentos existentes (erros amigáveis em PT-BR).
5. Cancelamento (status) libera a vaga automaticamente.

## Resolução de mídia (`src/utils/media.ts`)

Prioridade: `servico.video_url` (admin) → biblioteca `midias` (Convex) →
fallback local `src/utils/videos.ts`. O admin troca vídeos/imagens **sem código**.

## Confirmação no WhatsApp (`src/utils/whatsapp.ts`)

Sem integração e sem chaves: ao confirmar, o app abre `wa.me/<55+DDD+número>`
com a mensagem de confirmação pronta (serviço, valor, profissional, data,
horário). Botão flutuante de contato usa o mesmo mecanismo.

## Variáveis de ambiente (nomes — valores fora do git)

```
VITE_CONVEX_URL        # URL pública do deployment Convex (ex.: https://x.convex.cloud)
```

- Declarada em `src/vite-env.d.ts` e lida em `src/lib/convex.ts`.
- **Sem a URL**, o app roda em **modo demonstração** (`src/data/demo.ts`).
- `.env`/`.env.local` estão no `.gitignore` — nunca commit.

## Deploy

- **Vercel (produção atual)**: `vercel.json` reescreve todas as rotas para
  `index.html` (SPA). Build: `bun run build` → `dist/`.
- Env var obrigatória na Vercel: `VITE_CONVEX_URL`.
- Para uma cópia, criar projeto Vercel próprio e definir a env var **do banco
  da cópia**.
