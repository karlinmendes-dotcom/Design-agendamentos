# 💈 Barbearia Neto — Plataforma de Agendamento para Barbearias

Aplicativo completo de agendamento para a **Barbearia Neto**, com área do cliente
(sem login) e dashboard administrativo em `/admin`. Arquitetura **SaaS
multi-barbearia**: a Barbearia Neto é a primeira barbearia cadastrada, mas a
estrutura está pronta para várias barbearias, unidades e profissionais.

## Stack

- **React 19 + TypeScript + Vite** — SPA rápida e tipada
- **Tailwind CSS 4** — tema escuro premium (preto + vermelho)
- **Shadcn UI** — componentes acessíveis e elegantes
- **Supabase** — banco de dados PostgreSQL
- **Netlify** — deploy contínuo (SPA com redirects)

## Estrutura

```
src/
├── components/   # Componentes reutilizáveis (ServiceCard, BottomNav, VideoCover...)
│   └── ui/       # Componentes base shadcn/ui
├── pages/        # Páginas do cliente + admin/
├── layouts/      # AdminLayout (menu lateral profissional)
├── hooks/        # useServicos, useAgendamentos, useHorarios, useConfiguracao, useBarbeiros
├── contexts/     # ToastContext (notificações)
├── services/     # Cliente do Supabase + chamadas por entidade (tenant-aware)
├── types/        # Interfaces de domínio + tipos SaaS (Barbearia, Barbeiro, Midia)
├── utils/        # Formatadores, slots, biblioteca de mídia (media.ts)
└── data/         # Dados de demonstração (quando o Supabase não está conectado)
```

## Como rodar

```bash
bun install        # instalar dependências
bun run dev        # ambiente de desenvolvimento
bun run typecheck  # checagem de tipos (tsc)
```

## Configurando o Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. Abra **SQL Editor** e execute o conteúdo de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e
   depois [`supabase/migrations/0002_saas_platform.sql`](supabase/migrations/0002_saas_platform.sql).
   - `0001` cria as tabelas base (`clientes`, `servicos`, `horarios`,
     `agendamentos`, `configuracoes`), ativa RLS e insere os 6 serviços +
     horários padrão.
   - `0002` cria a estrutura SaaS: `barbearias` (tenant), `barbeiros`,
     `midias` (biblioteca de conteúdo) e colunas `barbearia_id`/`barbeiro_id`/
     `video_url` nas tabelas existentes, com seeds (Barbearia Neto, 1 barbeiro,
     vídeos da biblioteca).
3. Copie as chaves em **Project Settings → API**:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon / public key` → `VITE_SUPABASE_ANON_KEY`
4. Crie o arquivo `.env` na raiz:

```bash
# .env
VITE_SUPABASE_URL=cole-a-url-do-projeto
VITE_SUPABASE_ANON_KEY=cole-a-chave-anon
```

> Sem as chaves, o app roda em **modo demonstração** com dados de exemplo e
> exibe um aviso amarelo no painel admin.

## Área do cliente (sem login)

Navegação por **bottom navigation** fixa (mobile-first), com splash screen
animada na abertura.

| Rota           | Descrição                                              |
| -------------- | ------------------------------------------------------ |
| `/`            | Hero cinematográfico em vídeo + seções da barbearia    |
| `/servicos`    | Cards com vídeo em loop, preço e duração               |
| `/agendamento` | Fluxo em etapas: serviço → barbeiro (se houver) → data → horário → dados → confirmação |
| `/sucesso`     | Confirmação do agendamento                             |

## Dashboard admin (`/admin`, sem proteção)

| Rota                      | Descrição                                        |
| ------------------------- | ------------------------------------------------ |
| `/admin`                  | Indicadores, agenda diária/semanal/mensal, serviços mais vendidos, gráficos |
| `/admin/agenda`           | Agenda por dia com busca, filtros, paginação e mudança de status |
| `/admin/servicos`         | CRUD de serviços: preço, duração, vídeo (URL) e ativar/desativar |
| `/admin/configuracoes`    | Nome da barbearia, logo, horários por dia e dias disponíveis |

## Arquitetura SaaS (preparação)

- **Multi-barbearia**: tabela `barbearias` como tenant; todos os registros têm
  `barbearia_id`. A constante `BARBEARIA_NETO_ID` define o tenant atual.
- **Múltiplos barbeiros**: tabela `barbeiros`; o fluxo de agendamento mostra a
  etapa de escolha do barbeiro assim que houver profissionais ativos.
- **Biblioteca de conteúdo**: tabela `midias` (vídeos, imagens, banners, logo)
  + `video_url` por serviço. O admin troca mídias **sem alterar código**;
  a camada `src/utils/media.ts` resolve a prioridade: vídeo do serviço →
  biblioteca → fallback local.

## Biblioteca de vídeos

Vídeos curtos e leves (360p, ~0,5–1,6 MB) do **Mixkit** (licença livre para uso
comercial), com reprodução automática, sem áudio e em loop. Trocáveis **sem
código**: painel admin → Serviços → campo de vídeo, ou tabela `midias`.

| Uso | URL | Peso |
| --- | --- | --- |
| Banner (hero) | `https://assets.mixkit.co/videos/43242/43242-360.mp4` | 740 KB |
| Corte Masculino | `https://assets.mixkit.co/videos/43221/43221-360.mp4` | 527 KB |
| Corte + Barba | `https://assets.mixkit.co/videos/43222/43222-360.mp4` | 1,0 MB |
| Barba Completa | `https://assets.mixkit.co/videos/40130/40130-360.mp4` | 483 KB |
| Pigmentação | `https://assets.mixkit.co/videos/40120/40120-360.mp4` | 798 KB |
| Corte Infantil | `https://assets.mixkit.co/videos/43233/43233-360.mp4` | 733 KB |
| Pezinho | `https://assets.mixkit.co/videos/40127/40127-360.mp4` | 626 KB |
| Seção "Conheça a Barbearia" | `https://assets.mixkit.co/videos/43223/43223-360.mp4` | 702 KB |

Trocou a URL? O app usa a prioridade: `video_url` do serviço → biblioteca
`midias` → fallback local (`src/utils/videos.ts`).

## Futuras funcionalidades (estrutura preparada)

WhatsApp automático, pagamentos online (PIX/cartão/Apple Pay/Google Pay),
programa de fidelidade, cupons, múltiplas unidades, relatórios financeiros,
PWA, notificações push e integração com redes sociais.

## Deploy na Netlify

1. Crie o repositório no GitHub (ex.: `barbearia-neto`) e faça o push:

```bash
git init && git add . && git commit -m "chore: plataforma Barbearia Neto"
git remote add origin https://github.com/SEU_USUARIO/barbearia-neto.git
git push -u origin main
```

2. Em [app.netlify.com](https://app.netlify.com) → **Add new site → Import an
   existing project** → escolha o repositório.
3. O Netlify detecta o `netlify.toml` automaticamente (`npm run build` →
   pasta `dist`). O redirect SPA já está configurado para `/admin` e demais
   rotas.
4. Em **Site settings → Environment variables**, adicione `VITE_SUPABASE_URL`
   e `VITE_SUPABASE_ANON_KEY`.
5. Deploy! Cada push na `main` publica automaticamente.
