# 💅 Nail Design Studio — Plataforma de Agendamento para Estúdios de Unhas

Aplicativo completo de agendamento para o **Nail Design Studio**, com área do
cliente (sem login) e dashboard administrativo em `/admin`. Arquitetura **SaaS
multi-negócio**: o estúdio é o primeiro tenant cadastrado, mas a estrutura está
pronta para várias unidades e profissionais.

> ## 📚 Base reutilizável — leia estes documentos
>
> Este repositório é a **BASE ORIGINAL** (transformada de barbearia para nail
> design): ele serve de molde para criar outros apps de agendamento (unhas,
> pets, clínica, restaurante...) por **cópia independente** no GitHub — nunca
> modificando esta base.
>
> - **`PROJECT_RULES.md`** — regras oficiais da base (o que pode/não pode)
> - **`ARCHITECTURE.md`** — arquitetura, banco, fluxos e deploy
> - **`CUSTOMIZATION.md`** — guia para adaptar uma cópia a qualquer segmento
> - **`CHANGELOG.md`** — histórico de versões

## Stack

- **React 19 + TypeScript + Vite** — SPA rápida e tipada
- **Tailwind CSS 4** — tema claro premium (creme + verde oliva + dourado, tokens em `src/index.css`)
- **Shadcn UI** — componentes acessíveis e elegantes
- **Convex** — banco de dados reativo (queries/mutations em `src/convex/`)
- **Vercel** — deploy contínuo (SPA com rewrite)

## Estrutura

```
src/
├── components/   # Componentes reutilizáveis (ServiceCard, BottomNav, VideoCover...)
│   └── ui/       # Componentes base shadcn/ui
├── convex/       # Backend: schema + queries/mutations + seed (src/convex/)
├── pages/        # Páginas do cliente + admin/
├── layouts/      # AdminLayout (menu lateral profissional)
├── hooks/        # useServicos, useAgendamentos, useHorarios, useConfiguracao, useBarbeiros
├── contexts/     # ToastContext (notificações)
├── lib/          # Cliente Convex + utilitários (convex.ts)
├── types/        # Interfaces de domínio + tipos SaaS
├── utils/        # Formatadores, slots, biblioteca de mídia (media.ts)
└── data/         # Dados de demonstração (quando o Convex não está conectado)
```

## Como rodar

```bash
bun install        # instalar dependências
bun run dev        # ambiente de desenvolvimento
bun run typecheck  # checagem de tipos (tsc)
```

## Configurando o Convex

1. Crie um projeto em [convex.dev](https://convex.dev) (ou use o deployment
   existente).
2. O schema e as funções vivem em `src/convex/` (`convex.json` aponta o CLI
   para lá). Para publicar:

```bash
CONVEX_DEPLOY_KEY=dev:<sua-chave> bun convex dev --once
CONVEX_DEPLOY_KEY=dev:<sua-chave> bun convex run seed:inicial   # dados iniciais
```

3. Configure a URL pública do deployment no `.env`:

```bash
# .env
VITE_CONVEX_URL=https://seu-deployment.convex.cloud
```

> Sem `VITE_CONVEX_URL`, o app roda em **modo demonstração** com dados de
> exemplo e exibe um aviso amarelo no painel admin.

> As migrations SQL em `supabase/migrations/` são do banco antigo (Supabase)
> — mantidas apenas como histórico da base. O banco ativo é o Convex.

## Área do cliente (sem login)

Navegação por **bottom navigation** fixa (mobile-first), com splash screen
animada na abertura.

| Rota           | Descrição                                              |
| -------------- | ------------------------------------------------------ |
| `/`            | Hero com foto da marca + seções do estúdio (pilares, conheça o studio) |
| `/servicos`    | Cards com vídeo em loop, preço e duração               |
| `/agendamento` | Fluxo em etapas: serviço → profissional (se houver) → data → horário → dados → confirmação |
| `/promocoes`   | Combos e ofertas do estúdio                            |
| `/contato`     | Endereço, WhatsApp, Instagram e localização            |
| `/sucesso`     | Confirmação do agendamento                             |

## Dashboard admin (`/admin`, sem proteção)

| Rota                      | Descrição                                        |
| ------------------------- | ------------------------------------------------ |
| `/admin`                  | Indicadores, agenda diária/semanal/mensal, serviços mais vendidos, gráficos |
| `/admin/agenda`           | Agenda por dia com busca, filtros, paginação e mudança de status |
| `/admin/servicos`         | CRUD de serviços: preço, duração, vídeo (URL) e ativar/desativar |
| `/admin/configuracoes`    | Nome do estúdio, logo, horários por dia e dias disponíveis |

## Arquitetura SaaS (preparação)

- **Multi-negócio**: tabela `barbearias` como tenant; todos os registros têm
  `barbearia_id`. A constante `BARBEARIA_NETO_ID` define o tenant atual.
- **Múltiplos profissionais**: tabela `barbeiros`; o fluxo de agendamento mostra
  a etapa de escolha da profissional assim que houver profissionais ativos.
- **Biblioteca de conteúdo**: tabela `midias` (vídeos, imagens, banners, logo)
  + `video_url` por serviço. O admin troca mídias **sem alterar código**.

> Os nomes das tabelas (`barbearias`, `barbeiros`...) preservam o schema
> original da base por compatibilidade — o conteúdo é 100% nail design.

## Biblioteca de vídeos

Vídeos curtos e leves (360p) de manicure/nail design do **Mixkit** (licença
livre para uso comercial), com reprodução automática, sem áudio e em loop.
Trocáveis **sem código**: painel admin → Serviços → campo de vídeo, ou tabela
`midias`.

| Uso | URL | Peso aprox. |
| --- | --- | --- |
| Hero (manicure) | `https://assets.mixkit.co/videos/15125/15125-360.mp4` | ~500 KB |
| Manicure | `https://assets.mixkit.co/videos/15806/15806-360.mp4` | ~500 KB |
| Pedicure | `https://assets.mixkit.co/videos/27906/27906-360.mp4` | ~600 KB |
| Esmaltação em Gel | `https://assets.mixkit.co/videos/13084/13084-360.mp4` | ~600 KB |
| Alongamento | `https://assets.mixkit.co/videos/24817/24817-360.mp4` | ~700 KB |
| Nail Art | `https://assets.mixkit.co/videos/36905/36905-360.mp4` | ~700 KB |
| Spa dos Pés | `https://assets.mixkit.co/videos/21970/21970-360.mp4` | ~600 KB |
| Seção "Conheça o estúdio" | `https://assets.mixkit.co/videos/36905/36905-360.mp4` | ~700 KB |

Trocou a URL? O app usa a prioridade: `video_url` do serviço → biblioteca
`midias` → fallback local (`src/utils/videos.ts`).

## Futuras funcionalidades (estrutura preparada)

WhatsApp automático, pagamentos online (PIX/cartão/Apple Pay/Google Pay),
programa de fidelidade, cupons, múltiplas unidades, relatórios financeiros,
PWA, notificações push e integração com redes sociais.

## Deploy na Vercel

- **Produção atual:** `https://design-agendamentos.vercel.app` (projeto
  `design-agendamentos` — conectado ao GitHub `karlinmendes-dotcom/Design-agendamentos`,
  branch `main`; deploy automático por push).
- Config no `vercel.json`: `bun install` + `bun run build` → `dist`, com
  rewrite SPA (todas as rotas para `index.html`).
- Env var obrigatória: `VITE_CONVEX_URL` → `https://hardy-aardvark-221.convex.cloud`
  (configurada em production + preview + development).
- ⚠️ Banco e hospedagem são **separados** dos outros projetos (barbearia e
  sushi) — não reutilizar deployment Convex de outro projeto.
