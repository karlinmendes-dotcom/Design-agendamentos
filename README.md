# 💅 Studio Natália Braga — Plataforma de Agendamento

Aplicativo completo de agendamento para o estúdio de nail design **Studio
Natália Braga** (Colatina/ES): área da cliente sem login + dashboard
administrativo em `/admin`.

**Produção:** https://design-agendamentos.vercel.app
**Banco (Convex):** deployment `hardy-aardvark-221` (`https://hardy-aardvark-221.convex.cloud`)

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript (strict) + Vite 8 |
| Estilo | Tailwind CSS 4 (`@theme` em `src/index.css`) + shadcn/ui (`src/components/ui/`) |
| Roteamento | react-router-dom 7 (SPA, `src/App.tsx`) |
| Banco/backend | **Convex** (queries/mutations/actions em `src/convex/`) |
| IA | **Gemini** (assistente da dona) + **Groq/llama** (Nati, atendente das clientes) |
| Notificações | **Web Push + VAPID** (protocolo padrão, sem Firebase) |
| Hospedagem | **Vercel** (`vercel.json`, build → `dist/`) |
| Gerenciador | Bun |

## Rotas

**Área da cliente** (layout com BottomNav; `GateCliente` pede identificação):

| Rota | Página |
|---|---|
| `/` | Home |
| `/servicos` | Serviços |
| `/agendamento` | Novo agendamento |
| `/promocoes` | Promoções / combos |
| `/contato` | Contato |
| `/sucesso` | Confirmação (banner de ativar avisos) |
| `/reagendar` | Aberta pela notificação de cancelamento |
| `/privacidade`, `/termos`, `/regras` | Páginas legais (fora do layout) |

**Painel** (`/admin/entrar` = login; `/admin` protegido por `ExigirAdmin`):

| Rota | Página |
|---|---|
| `/admin` | Visão geral (agenda da frente + busca de cliente) |
| `/admin/agenda` | Agenda por dia |
| `/admin/servicos` | Serviços |
| `/admin/combos` | Combos |
| `/admin/equipe` | Profissionais |
| `/admin/analises` | Análises / faturamento |
| `/admin/configuracoes` | Configurações do estúdio |

## Arquitetura (resumo)

- **Dados:** página → `src/hooks/` (`useQuery`) → funções Convex → banco.
  O Convex é a fonte oficial de dados — não há modo demonstração.
- **Agendamento:** serviço → profissional → data (dias disponíveis ∩
  expediente ∩ datas bloqueadas) → horário (anti-sobreposição validada no
  servidor) → confirmação com WhatsApp.
- **Regra de cancelamento:** desmarcar em cima da hora / falta gera pendência
  de 50% na cliente; a remarcação fica bloqueada até a pendência ser quitada
  no painel (botão "Pendência quitada" ou status "Concluído").
- **Visão geral do painel:** a aba "Hoje" mostra só quem ainda vai ser
  atendida; os concluídos saem da lista ativa e ficam em "Concluídos hoje"
  (nada é apagado — histórico, análises e a regra de pendência continuam
  usando os registros).

## Estrutura do código

```
src/
├── App.tsx            # rotas + GateCliente / ClientLayout / ExigirAdmin
├── main.tsx           # bootstrap + ConvexProvider
├── index.css          # tokens Tailwind 4 (@theme) — não remover diretivas
├── components/
│   ├── AtendenteCliente.tsx   # Nati (chat flutuante das clientes)
│   ├── EntrarCliente.tsx      # criação de conta + consentimento LGPD + avisos
│   ├── PushListener.tsx       # re-sincroniza inscrição push no app
│   ├── ReagendarModal.tsx     # modal de reagendar
│   ├── admin/AssistenteAdmin.tsx / DetalhesAgendamento.tsx
│   └── ui/                    # shadcn/ui (button, card, dialog, ...)
├── contexts/ToastContext.tsx
├── hooks/              # use* (Convex) + useAdminAuth + useIdentidadeCliente
├── layouts/AdminLayout.tsx    # topbar + menu (dropdown fixo no mobile)
├── lib/convex.ts · push.ts · utils.ts
├── pages/              # páginas da cliente
├── pages/admin/        # Dashboard, Agenda, Analises, Servicos, Combos, Equipe, Configuracoes, AdminLogin
├── types/index.ts
├── utils/              # date, format, media, phone, slots, social, videos, whatsapp
└── convex/             # backend (ver mapa abaixo)
public/
├── push-sw.js          # service worker de notificação (NÃO renomear)
├── manifest.webmanifest
└── favicon.svg
```

## Mapa das funções Convex (`src/convex/`)

| Arquivo | Responsabilidade |
|---|---|
| `schema.ts` | Tabelas (clientes, servicos, barbeiros, horarios, agendamentos, pushTokens, midias, ...) |
| `agendamentos.ts` | Criar/listar/atualizarStatus/quitarPendencia/cancelarDia + **regra de pendência 50%** |
| `push.ts` | Actions de envio Web Push: `enviarParaTelefones`, `cancelarIndividual`, `cancelarDiaCompleto` |
| `pushTokens.ts` | Inscrições push por telefone (registrar, listarPorTelefones, remover, removerPorTelefone) |
| `gemini.ts` | Assistente da DONA (action `perguntar` + function calling de CRUD) |
| `atendente.ts` | Nati (clientes) — só texto, sem ferramentas |
| `clientes.ts` | findOrCreate, busca, histórico |
| `servicos.ts` · `barbeiros.ts` · `horarios.ts` · `barbearias.ts` · `configuracoes.ts` · `datasBloqueadas.ts` | Catálogo e regras |
| `midias.ts` · `storage.ts` | Fotos/vídeos da marca (fluxo: a dona sobe mídia com link e o agente usa) |
| `admin.ts` | Auth do painel (senha padrão hardcoded — trocar em produção real) |
| `seed.ts` | `bun convex run seed:inicial` (popula banco novo) |

## Estado atual (validado em produção)

- ✅ Notificações nativas de **confirmação** e **cancelamento** chegando no
  celular da cliente (Android), mesmo com o site fechado.
- ✅ Regra de pendência bloqueando a remarcação até a dona quitar.
- ✅ Painel: lista da frente limpa, agenda por Hoje/Semana/Mês, busca de
  cliente com histórico e análises.
- ✅ Chat Nati (clientes) com botão fechar; assistente Gemini (dona) no painel.
- ✅ PWA instalável + guia no site para iPhone (ver "PWA / iPhone").

## Como rodar

```bash
bun install
bun run dev          # ambiente de desenvolvimento
bun run typecheck    # tsc -b --noEmit (0 erros antes de entregar)
bun run build        # build → dist/ (deploy na Vercel)
```

## Variáveis necessárias (apenas os NOMES — valores ficam nos painéis)

- **Vercel (frontend):** `VITE_CONVEX_URL` → URL pública do deployment Convex.
  (A chave pública VAPID já está embutida no código — não depende de env var.)
- **Convex (Environment Variables do deployment — nunca no repositório):**
  - `GEMINI_API_KEY` (+ `GEMINI_MODEL` opcional) — assistente da dona;
  - `GROQ_API_KEY` (+ `GROQ_MODEL` opcional) — Nati, atendente das clientes;
  - `VAPID_PRIVATE_KEY` — chave privada Web Push (sem ela o aviso de
    cancelamento não é enviado; a pública fica no frontend).

> ⚠️ **Par VAPID:** a chave pública está embutida em **DOIS lugares**
> (`src/lib/push.ts` e `src/convex/push.ts`). Se a privada for trocada,
> trocar as duas públicas JUNTAS — senão o envio falha (403).

## Convex

- Para publicar: `CONVEX_DEPLOY_KEY='dev:<deployment>|...' bun convex dev --once`
  e `bun convex run seed:inicial` para os dados da marca.
- `src/convex/_generated/` é gerado pelo CLI — **nunca editar à mão**; se os
  tipos estiverem desatualizados, rodar `bun convex dev --once`.
- ⚠️ Se `convex dev --once` não autenticar, parar e avisar (não contornar com
  edição manual dos gerados).

## Web Push

- Frontend: `src/lib/push.ts` (chave pública VAPID + inscrição push +
  diagnóstico) e `public/push-sw.js` (service worker — recebe o pop com o app
  fechado e abre `/reagendar` ao tocar).
- Backend: `src/convex/push.ts` (envio via `web-push`, `VAPID_PRIVATE_KEY` só
  no Convex; remove inscrições 404/410) + `src/convex/pushTokens.ts`
  (PushSubscription por telefone, vários aparelhos por cliente).
- Fluxo: a cliente autoriza → o navegador devolve a inscrição → é salva
  vinculada ao telefone → a dona cancela/confirma no painel → o aviso chega
  mesmo com o app fechado.
- A ativação tem diagnóstico na tela: se estiver bloqueada ou em aba anônima,
  o site explica o motivo exato (cadeado 🔒, abrir no navegador normal).

## PWA / iPhone

- Manifest em `public/manifest.webmanifest` + metas em `index.html` — o site
  é instalável ("Adicionar à Tela de Início").
- **iPhone:** a Apple só libera Web Push para apps adicionados à Tela de
  Início (vale para qualquer navegador no iOS — todos usam WebKit). O site
  detecta isso (`estaInstalado()` em `src/lib/push.ts`) e mostra o passo a
  passo (Compartilhar ⬆️ → Adicionar à Tela de Início → abrir pelo ícone →
  aceitar avisos).
- **Android:** funciona direto no navegador, sem instalar nada.

## Deploy na Vercel

- Projeto `design-agendamentos` conectado ao GitHub, deploy automático por
  push na branch `main`.
- `vercel.json`: `bun install` + `bun run build` → `dist`, com rewrite SPA.
- ⚠️ Banco e hospedagem são **separados** de outros projetos — nunca apontar
  este app para outro deployment Convex.

## Como publicar tudo (checklist)

1. `bun run typecheck` — zero erros antes de subir;
2. `CONVEX_DEPLOY_KEY='dev:<deployment>|...' bun convex dev --once` — backend
   no ar (se mexeu em `src/convex/`);
3. Commit + push na `main` — o Vercel rebuilda sozinho (~3 min);
4. Conferir no celular em **aba normal** (não anônima) com cache limpo.

## Armadilhas & regras de manutenção

- **Nunca** editar `src/convex/_generated/` à mão; regenerar com
  `bun convex dev --once`.
- `convex dev` **sempre com `--once`** (ambiente não interativo — sem o flag
  pode travar/expirar).
- **Não** iniciar/parar servidores de dev/preview (o Freebuff gerencia o
  preview; `bun run dev`/`vite` são para uso local fora do Freebuff).
- **Não** modificar `vite.config.ts` (HMR desabilitado é obrigatório).
- Editar arquivos **só com as ferramentas de arquivo** (write/str_replace/
  apply_patch) — nunca `sed`/`echo`/redirecionamento no terminal.
- Validar sempre com `bun tsc -b --noEmit` (a plataforma também roda no fim
  do turno; se acusar erro real, corrigir antes de terminar).
- Notificações: teste em **aba normal, nunca anônima**; permissão negada =
  liberar pelo cadeado 🔒 (ou, no iPhone, Adicionar à Tela de Início).
- Chave pública VAPID duplicada em `src/lib/push.ts` e `src/convex/push.ts` —
  manter os dois iguais.
- **Não reintroduzir Firebase/Supabase** — a arquitetura é Convex + Web Push.
- Nenhuma chave/senha no código nem no README (valores ficam nos painéis).

## Teste manual rápido (smoke test)

1. Cliente agenda → recebe confirmação no WhatsApp + notificação
   "🎉 Agendamento confirmado!";
2. Dona cancela o agendamento → a cliente recebe "⚠️ Alteração no seu
   Agendamento" **com o app fechado**;
3. Após o cancelamento, a cliente fica com pendência de 50% e **não consegue
   remarcar**; ao quitar no painel, volta a marcar;
4. Dona marca "Concluído" → a cliente sai da lista da frente e aparece em
   "Concluídos hoje" (e o valor continua no Analytics);
5. iPhone: Adicionar à Tela de Início → aceitar avisos → recebe igual.

## Regras de ouro

- Nunca colocar secrets no código (chaves ficam nos painéis da Vercel/Convex).
- Não quebrar fluxos que funcionam: mudanças pequenas e cirúrgicas,
  reutilizando componentes/hooks/funções Convex existentes.
- Validação antes de entregar: `bun run typecheck` (e `bun run build`) com
  zero erros.
