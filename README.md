# 💈 Barbearia Neto — Agendamento Online

Aplicativo completo de agendamento para a **Barbearia Neto**, com área do cliente
(sem login) e dashboard administrativo em `/admin`.

## Stack

- **React 19 + TypeScript + Vite** — SPA rápida e tipada
- **Tailwind CSS 4** — tema escuro premium (carvão, grafite, dourado e bronze)
- **Shadcn UI** — componentes acessíveis e elegantes
- **Supabase** — banco de dados PostgreSQL
- **Netlify** — deploy contínuo (SPA com redirects)

## Estrutura

```
src/
├── components/   # Componentes reutilizáveis (Header, ServiceCard, AdminLayout...)
│   └── ui/       # Componentes base shadcn/ui
├── pages/        # Páginas do cliente + admin/
├── hooks/        # useServicos, useAgendamentos, useHorarios, useConfiguracao
├── services/     # Cliente do Supabase + chamadas por entidade
├── types/        # Interfaces de domínio
├── utils/        # Formatadores (BRL, datas, telefone, slots de horário)
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
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   Isso cria as tabelas `clientes`, `servicos`, `horarios`, `agendamentos` e
   `configuracoes`, ativa o Row Level Security (acesso aberto, sem auth) e
   insere os 6 serviços iniciais + horários padrão.
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

| Rota           | Descrição                                              |
| -------------- | ------------------------------------------------------ |
| `/`            | Landing page premium com CTA de agendamento            |
| `/servicos`    | Cards de serviços com preço e duração                  |
| `/agendamento` | Fluxo em 5 etapas: serviço → data → horário → dados → confirmação |
| `/sucesso`     | Confirmação do agendamento                             |

## Dashboard admin (`/admin`, sem proteção)

| Rota                      | Descrição                                        |
| ------------------------- | ------------------------------------------------ |
| `/admin`                  | Total de agendamentos, clientes do dia, horários marcados e faturamento previsto |
| `/admin/agenda`           | Agenda do dia com mudança de status (confirmado/concluído/cancelado) |
| `/admin/servicos`         | CRUD de serviços: adicionar, editar preço/duração, ativar/desativar |
| `/admin/configuracoes`    | Nome da barbearia, logo, horários por dia e dias disponíveis |

## Deploy na Netlify

1. Crie o repositório no GitHub (ex.: `barbearia-neto`) e faça o push:

```bash
git init && git add . && git commit -m "chore: projeto inicial Barbearia Neto"
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

## Próximos passos planejados

- WhatsApp automático (lembrete/confirmação)
- Pagamento online
- Múltiplos barbeiros
- Relatórios financeiros

A arquitetura já está preparada: hooks de notificação reutilizáveis, campos
opcionais de pagamento no schema de agendamentos e separação por período nos
dados.
