# 💅 Studio Natália Braga — Plataforma de Agendamento

Aplicativo completo de agendamento para o estúdio de nail design **Studio
Natália Braga** (Colatina/ES): área da cliente sem login + dashboard
administrativo em `/admin`.

**Produção:** https://design-agendamentos.vercel.app

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript (strict) + Vite 8 |
| Estilo | Tailwind CSS 4 (`@theme` em `src/index.css`) + shadcn/ui |
| Roteamento | react-router-dom 7 (SPA) |
| Banco/backend | **Convex** (queries/mutations/actions em `src/convex/`) |
| IA | **Gemini** (assistente da dona) + **Groq/llama** (Nati, atendente das clientes) |
| Notificações | **Web Push + VAPID** (protocolo padrão, sem Firebase) |
| Hospedagem | **Vercel** (`vercel.json`, build → `dist/`) |
| Gerenciador | Bun |

## Arquitetura (resumo)

- **Dados:** página → `src/hooks/` (`useQuery`) → funções Convex → banco.
  O Convex é a fonte oficial de dados — não há modo demonstração.
- **Área do cliente:** `/`, `/servicos`, `/agendamento`, `/promocoes`,
  `/contato`, `/sucesso`, `/reagendar` (aberta pela notificação de
  cancelamento), `/privacidade`, `/termos`, `/regras`.
- **Painel `/admin*`:** login com usuário/senha (tabela `admins` no Convex);
  páginas de visão geral, agenda, serviços, combos, equipe e configurações.
- **Agendamento:** serviço → profissional → data (dias disponíveis ∩
  expediente ∩ datas bloqueadas) → horário (anti-sobreposição validada no
  servidor) → confirmação com WhatsApp.
- **Regra de cancelamento:** desmarcar em cima da hora / falta gera pendência
  de 50% na cliente; a remarcação fica bloqueada até a pendência ser quitada
  no painel.

## Como rodar

```bash
bun install
bun run dev          # ambiente de desenvolvimento
bun run typecheck    # tsc -b --noEmit (0 erros antes de entregar)
bun run build        # build → dist/ (deploy na Vercel)
```

## Variáveis necessárias

- **Vercel (frontend):** `VITE_CONVEX_URL` → URL pública do deployment Convex.
  (Opcional: `VITE_VAPID_PUBLIC_KEY` para sobrescrever a chave pública VAPID
  padrão embutida no app.)
- **Convex (Environment Variables do deployment — nunca no repositório):**
  - `GEMINI_API_KEY` (+ `GEMINI_MODEL` opcional) — assistente da dona;
  - `GROQ_API_KEY` (+ `GROQ_MODEL` opcional) — Nati, atendente das clientes;
  - `VAPID_PRIVATE_KEY` — chave privada Web Push (sem ela o aviso de
    cancelamento não é enviado; a pública fica no frontend).

## Convex

- Schema e funções em `src/convex/` (`convex.json` aponta o CLI para lá).
- Para publicar: `CONVEX_DEPLOY_KEY='dev:<deployment>|...' bun convex dev --once`
  e `bun convex run seed:inicial` para os dados da marca.
- `src/convex/_generated/` é gerado pelo CLI — nunca editar à mão.

## Gemini

- `src/convex/gemini.ts` — action `perguntar` com function calling (CRUD do
  painel) + queries `contexto`/`uso`. A chave fica SÓ no Convex.
- `src/convex/atendente.ts` — Nati (clientes): só orienta com texto, sem
  ferramentas; o prompt é fechado e verbatim da dona.

## Web Push

- Frontend: `src/lib/push.ts` (chave pública VAPID + inscrição push) e
  `public/push-sw.js` (service worker — recebe o pop com o app fechado e abre
  `/reagendar` ao tocar).
- Backend: `src/convex/push.ts` (envio via `web-push`, `VAPID_PRIVATE_KEY` só
  no Convex; remove inscrições 404/410) + `src/convex/pushTokens.ts`
  (PushSubscription por telefone).
- Fluxo: a cliente autoriza → o navegador devolve a inscrição → é salva
  vinculada ao telefone → a dona cancela no painel → o aviso chega mesmo com o
  app fechado.

## Deploy na Vercel

- Projeto `design-agendamentos` conectado ao GitHub, deploy automático por
  push na branch `main`.
- `vercel.json`: `bun install` + `bun run build` → `dist`, com rewrite SPA.
- ⚠️ Banco e hospedagem são **separados** de outros projetos — nunca apontar
  este app para outro deployment Convex.

## Regras de ouro

- Nunca colocar secrets no código (chaves ficam nos painéis da Vercel/Convex).
- Não quebrar fluxos que funcionam: mudanças pequenas e cirúrgicas,
  reutilizando componentes/hooks/funções Convex existentes.
- Validação antes de entregar: `bun run typecheck` (e `bun run build`) com
  zero erros.
