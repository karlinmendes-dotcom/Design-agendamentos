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
  no painel (botão "Pendência quitada" ou status "Concluído").
- **Visão geral do painel:** a aba "Hoje" mostra só quem ainda vai ser
  atendida; os concluídos saem da lista ativa e ficam em "Concluídos hoje"
  (nada é apagado — histórico, análises e a regra de pendência continuam
  usando os registros).

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
  (A chave pública VAPID já está embutida no código — `src/lib/push.ts` — e
  não depende de env var.)
- **Convex (Environment Variables do deployment — nunca no repositório):**
  - `GEMINI_API_KEY` (+ `GEMINI_MODEL` opcional) — assistente da dona;
  - `GROQ_API_KEY` (+ `GROQ_MODEL` opcional) — Nati, atendente das clientes;
  - `VAPID_PRIVATE_KEY` — chave privada Web Push (sem ela o aviso de
    cancelamento não é enviado; a pública fica no frontend).

> ⚠️ A `VAPID_PRIVATE_KEY` é o par da pública embutida no código. Se um dia
> for trocada, trocar **as duas juntas** (Convex + `src/lib/push.ts`).

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
  detecta isso e mostra o passo a passo (Compartilhar ⬆️ → Adicionar à Tela de
  Início → abrir pelo ícone → aceitar avisos).
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

## Regras de ouro

- Nunca colocar secrets no código (chaves ficam nos painéis da Vercel/Convex).
- Não quebrar fluxos que funcionam: mudanças pequenas e cirúrgicas,
  reutilizando componentes/hooks/funções Convex existentes.
- Validação antes de entregar: `bun run typecheck` (e `bun run build`) com
  zero erros.
