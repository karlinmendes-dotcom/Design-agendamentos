# 🔑 CHAVES — Central de Acesso (mapa de onde vive cada chave)

> Compilado em **09/08/2026** a partir de todo o histórico de conversas e dos
> painéis.
>
> ⚠️ **Nota de segurança (leia 1 vez):** os **valores reais** das chaves foram
> **removidos deste arquivo** — o GitHub bloqueia push que contenha segredos
> (proteção anti-vazamento). Este documento é o **mapa** de onde cada chave
> vive: painel Vercel, painel Convex, painel Supabase, API Keys do Freebuff e
> `.env.local` (fora do git). Sempre que precisar de um valor, busque no painel
> correspondente (ou nas API Keys do Freebuff).

---

## 0. 💅 Nail Design Studio — **BANCO ATUAL** (Convex) ✅ EM USO

> Este app (repositório `Design-agendamentos`) usa **Convex com deployment
> próprio e separado** de todos os outros projetos. ⚠️ **Nunca usar o
> `original-quail-840`** — ele é do projeto do sushi (foi usado por engano no
> passado).

| Item | Onde encontrar o valor |
|---|---|
| **`VITE_CONVEX_URL`** (pública, para o app) | `https://hardy-aardvark-221.convex.cloud` (pública — pode ficar aqui) |
| Deployment | `hardy-aardvark-221` |
| Projeto (dashboard) | **Design agendamentos** (slug `design-agendamento`, team `karlinmendes`) |
| Dashboard | https://dashboard.convex.dev/t/karlinmendes/design-agendamento/hardy-aardvark-221 |
| **Deploy Key** (dev — para publicar funções/seed) | ⛔ **Valor removido do git** — o JWT real fica em **Convex → Project Settings → Deploy Keys** (chave atualizada 2026-08-11; formato `dev:hardy-aardvark-221|...`) |
| **`GEMINI_API_KEY`** (env do Convex — assistente do dashboard) | **Convex → Project Settings → Environment Variables** (ou `bun convex env set GEMINI_API_KEY <valor>`). Modelo: `GEMINI_MODEL` (padrão `gemini-3.1-flash-lite`) |
| **`FIREBASE_SERVICE_ACCOUNT`** (env do Convex — envio de notificação push FCM) | ✅ Configurada 2026-08-11 (validada: o FCM respondeu e rejeitou token fake — auth OK). JSON do SDK Admin do projeto Firebase `poupaps-cancelar`. Em **Convex → Project Settings → Environment Variables** |
| **`VITE_FIREBASE_*`** (públicas — web config do Firebase `poupaps-cancelar`) | Embutidas como fallback no código (`src/lib/firebase.ts`): apiKey, authDomain `poupaps-cancelar.firebaseapp.com`, projectId `poupaps-cancelar`, messagingSenderId, appId — config **pública** (fica no navegador) |
| **`VITE_FIREBASE_VAPID_KEY`** (chave pública Web Push — necessária para o navegador gerar o token FCM) | Firebase → Configurações do projeto → **Cloud Messaging** → **Certificados Web Push** → copiar a chave. Colar na Vercel (projeto `design-agendamentos`, prod/preview/dev) e/ou `.env.local`. (Também embutida como fallback no código) |

**Como publicar funções / rodar a seed:**

```bash
CONVEX_DEPLOY_KEY='dev:hardy-aardvark-221|...' bun convex dev --once
CONVEX_DEPLOY_KEY='dev:hardy-aardvark-221|...' bun convex run seed:inicial
```

**Onde está salva:** `.env.local` (workspace, fora do git) · painel Convex →
Project Settings → Deploy Keys · env var `VITE_CONVEX_URL` na Vercel (projeto
`design-agendamentos`, prod/preview/dev).

> As migrations em `supabase/migrations/` e a Seção 1 abaixo são do **banco
> antigo (Supabase)** — mantidas como histórico da base; o app não as usa mais.
> O `convex.json` deste repo aponta para o projeto `design-agendamento` —
> nunca trocar para outro projeto.

---

## 1. 🗄️ Supabase — Projeto **"Barbearia neto"** (banco DO SITE DA BARBEARIA) 📦 HISTÓRICO

| Item | Onde encontrar o valor |
|---|---|
| Nome do projeto | Barbearia neto |
| Project ID / ref | `czyfsdbmxdyvmqrdvaiw` |
| Região | `ca-central-1` (Canadá Central) |
| **`VITE_SUPABASE_URL`** (pública) | `https://czyfsdbmxdyvmqrdvaiw.supabase.co` |
| **`VITE_SUPABASE_ANON_KEY`** (pública, para o app) | Painel Supabase → projeto → **API Keys** → chave `anon` (pública — vai no front) |
| **`service_role`** (ADMIN — bypassa RLS; não colocar no front) | ⛔ **Valor removido do git** — fica em **Supabase → API Keys** → chave legada `service_role` |
| JWT — chave atual (ECC P-256) | Key ID `16a2176f-fb2c-4b04-a5de-f2d843e195f2` (painel Supabase → **JWT Keys**) |
| JWT — chave anterior (HS256) | Key ID `2f1dde92-99b9-4821-aace-4cb1d1e1db86` |

> 🔄 **Rotação da `service_role`:** só é possível pelo painel (a API do Supabase
> não cria chaves legadas) — ver **Seção 9**. O projeto também possui chaves do
> novo modelo (não usadas pelo app): `publishable` (id `fc7b214b-4fdb-40df-97d8-aa2fbb11b9f4`)
> e `secret` (id `d0e6f4d7-4395-4906-bb7b-ec73db76e2be`).

**Onde está salva:** painel Supabase → projeto → **API Keys** (anon e
service_role) e **JWT Keys** · `.env.local` do workspace da barbearia ·
env vars da Vercel (projeto `barbearia-neto`) · API Keys do Freebuff.

---

## 2. 🗄️ Supabase — Projeto **ANTIGO / chatbot** (`rwnansfmtsvjueuxtnyx`) ⛔ NÃO USAR

| Item | Onde encontrar o valor |
|---|---|
| URL | `https://rwnansfmtsvjueuxtnyx.supabase.co` |
| `anon` | Painel Supabase → projeto antigo → **API Keys** → chave `anon` |

> ⚠️ **Este é o banco que causou o erro `Could not find the table
> 'public.servicos'`** no site antigo — ele NÃO tem as tabelas da barbearia.
> Não usar em nenhuma configuração nova.

---

## 3. ▲ Vercel — Token da conta `karlinmendes-dotcom` ✅ EM USO

| Item | Onde encontrar o valor |
|---|---|
| **Token (account)** | ⛔ **Valor removido do git (proteção do GitHub)** — fica em **Vercel → Account Settings → Tokens** (token atualizado 2026-08-11, id `IIOlRYZwnTyV6efjQighsFrCLMnYXQxjBPtUcaFbQPToxe33`) |
| Conta | `karlinmendes-dotcom` |

### Projetos da conta

| Projeto | ID | Site (domínio) | Env vars configuradas |
|---|---|---|---|
| **barbearia-neto** (🪒 Barbearia) | `prj_fBaZ1Yak8BqrG5F2kfXlKIN94nm3` | `https://barbearia-neto.vercel.app` | `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` (production + preview + development) |
| **hitiko-sushi** (🍣 Sushi — ex. `sushi-menu-app`) | `prj_Ci1hrfuEoHm15pTNJ3koMq5lTF29` | `https://sushi-menu-app-five.vercel.app` | `CONVEX_SITE_URL` (o `VITE_CONVEX_URL` foi gravado no build publicado) |
| **design-agendamentos** (💅 Nail Design) | `prj_X4bNLFWwfEz7eTQVemdMSIaUbvZL` | `https://design-agendamentos.vercel.app` | `VITE_CONVEX_URL` → `https://hardy-aardvark-221.convex.cloud` (production + preview + development) |

> ⚠️ **Sushi usa o Convex `original-quail-840`** (além do `ideal-lobster-748`
> antigo). As funções dele foram sobrescritas por engano em 2026-08 e precisam
> ser re-publicadas a partir do workspace do sushi (repo `sushi-menu-app`):
> `CONVEX_DEPLOY_KEY='dev:original-quail-840|...' bun convex dev --once`.

**Onde está salva:** painel Vercel → **Account Settings → Tokens** · API Keys
do Freebuff.

> 🔄 **Rotação pendente (só pelo painel — a API recusou com 403):** ver **Seção 9**.
> O token atual no painel aparece como **"liberado para freebuff asseso total"**
> (id `IIOlRYZwnTyV6efjQighsFrCLMnYXQxjBPtUcaFbQPToxe33`).

> O projeto do sushi teve a **proteção de login (Vercel Authentication / SSO)
> desativada** — os dois sites abrem para qualquer visitante.

---

## 4. ⚡ Convex — Banco do site do SUSHI ✅ EM USO

| Item | Onde encontrar o valor |
|---|---|
| **`VITE_CONVEX_URL`** (pública) | `https://ideal-lobster-748.convex.cloud` |
| **`CONVEX_SITE_URL`** | `https://sushi-menu-app-five.vercel.app` |
| Credencial (deploy) | ⛔ **Valor removido do git** — a **Deploy Key completa** (formato `prod:...` ou `dev:...`) fica no painel `convex.dev` → projeto `ideal-lobster-748` → **Project Settings → Deploy Keys** |

> Necessária só para quem for editar as funções do Convex.

**Onde está salva:** env vars da Vercel (projeto do sushi) · bundle publicado
(pública) · histórico do chat.

---

## 5. 🐙 GitHub — Conta `karlinmendes-dotcom`

| Item | Valor |
|---|---|
| Conta / email | `karlinmendes-dotcom` (karlinmendes@gmail.com) |
| Repo da barbearia | `neto-agendamentos` (privado) — este workspace |
| Repo do sushi | `sushi-menu-app` (privado, branch `main`) |
| Outros repos | `A-Relationship`, `Ai` |

> **Sem tokens guardados.** O acesso de escrita do Freebuff é feito pelo
> **GitHub App do Freebuff** (credencial curta e automática por repositório —
> nada a configurar, nada a revogar manualmente). Cada página do Freebuff só
> enxerga o repositório conectado a ela.

---

## 6. 🌐 Netlify — Site legado (aposentar)

| Item | Valor |
|---|---|
| Site antigo (quebrado/antigo bundle) | `https://barbearia-neto.netlify.app` |
| Status | **Sem créditos** — não é mais usado (hospedagem migrou para a Vercel) |

> O token da Netlify aqui é só de leitura. Para remover o site antigo: painel
> Netlify → site **barbearia-neto** → **Settings → Danger Zone → Delete site**.

---

## 7. 📍 Onde cada coisa está (mapa rápido)

| Onde | O que tem |
|---|---|
| **`.env.local`** (local, ignorado pelo git) | `VITE_CONVEX_URL` do deployment `hardy-aardvark-221` (nail design) — atualizado pelo `vercel link` |
| **Convex → convex.dev** | Deploy Keys: `hardy-aardvark-221` (nail design) · `original-quail-840` (sushi ⚠️) · `ideal-lobster-748` (sushi antigo) |
| **Vercel → projeto barbearia-neto** | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (prod/preview/dev) |
| **Vercel → projeto hitiko-sushi** | `CONVEX_SITE_URL` (e `VITE_CONVEX_URL` usado no build) |
| **Vercel → projeto design-agendamentos** | `VITE_CONVEX_URL` → `https://hardy-aardvark-221.convex.cloud` (prod/preview/dev) |
| **Supabase → API Keys** | anon + service_role + JWT do projeto `czyfsdbmxdyvmqrdvaiw` |
| **Supabase → API Keys** (outro projeto) | anon do projeto antigo `rwnansfmtsvjueuxtnyx` (⛔) |
| **Vercel → Account Tokens** | Token da conta (deploys/configurações) |
| **GitHub** | Repos e acesso automático via GitHub App do Freebuff |

---

## 8. ✅ Regra de uso (resumo)

1. **Nail Design Studio** usa **Convex `hardy-aardvark-221`** (projeto "Design
   agendamentos") — banco separado; **nunca** usar o `original-quail-840` (sushi).
2. **Barbearia** usa **Supabase `czyfsdbmxdyvmqrdvaiw`** — nunca apontar para o
   projeto antigo `rwnansfmtsvjueuxtnyx`.
3. **Sushi** usa **Convex `ideal-lobster-748`** — não misturar com o Supabase.
4. Toda cópia nova de site deve criar **banco próprio** e trocar as env vars.
5. Chaves com poder de escrita (`service_role`, deploy keys, token Vercel) →
   usar só em backend/configuração, **nunca** em código de frontend.
6. **Nunca colar valores de chave neste arquivo nem em nenhum arquivo do
   repositório** — o GitHub bloqueia o push (proteção anti-vazamento). Valores
   vivem nos painéis e nas API Keys do Freebuff.

---

## 9. 🔄 Rotação de chaves — status (09/08/2026)

| Chave | Status | Como trocar |
|---|---|---|
| **Token Vercel** | ⏳ **Pendente — só pelo painel** (API recusou: `403`) | Vercel → **Account Settings → Tokens → Create Token** (nome novo) → copiar o valor → voltar na lista e **Delete** no token antigo ("liberado para freebuff asseso total") → atualizar onde é usado (API Keys do Freebuff) |
| **`service_role`** (legacy) | ⏳ **Pendente — só pelo painel** (API não cria chaves legadas) | Supabase → **API Keys** → chaves legadas → **Reset** ao lado de `service_role` → copiar a nova → substituir onde é usado (API Keys do Freebuff) |
| **`secret`** (modelo novo) | ⏳ Mantida (o valor só é revelado 1x, no painel) | Se quiser trocar: API Keys → revogar `secret` (id `d0e6f4d7-...`) e criar outra |
| **`anon` / `VITE_SUPABASE_ANON_KEY`** | ✅ Mantida — é a que o site usa | ⚠️ Se trocar, atualizar **Vercel + `.env.local` + redeploy** (o site para de funcionar até isso) |

> **O que foi verificado na prática:** a API do Supabase criou uma chave nova,
> mas a entrega **mascarada** (`sb_secret_···` — o valor completo nunca é
> revelado de novo). A chave de teste foi **removida** e o projeto voltou ao
> estado original (4 chaves: anon, service_role, publishable, secret).
> Nenhuma chave em uso foi alterada — o site segue funcionando normalmente.

---

## 10. 🔐 Acessos do app (login e senha)

> Atualizado em **11/08/2026** — a porta de entrada do cliente virou
> **CRIAÇÃO DE CONTA** (nome + WhatsApp; qualquer conta criada é validada
> automaticamente como cliente via `clientes.findOrCreate`) e o painel
> administrativo tem cadeado. **Trocar a senha do painel = editar
> `src/convex/admin.ts`** (constante `SENHA_PADRAO`) e publicar as funções
> (`CONVEX_DEPLOY_KEY='dev:hardy-aardvark-221|...' bun convex dev --once`).

| Acesso | Usuário | Senha / dados |
|---|---|---|
| **Painel admin** (`/admin`) | `admin` | Senha: `123456` |
| **Cliente de teste** (para o teste de push) | Nome: `Ana Paula Teste` | WhatsApp: `(11) 98888-7766` |

**Como funciona:**

- **Cliente — criar conta:** ao abrir o site, a pessoa cria a conta com nome
  + WhatsApp (qualquer nome/número com 8+ dígitos é aceito — sem aprovação
  manual). A conta é registrada/validada no cadastro do estúdio
  (`clientes.findOrCreate`) e fica salva no aparelho dela. No mesmo toque, o
  navegador pede "Permitir notificações" e o token FCM é salvo no banco
  vinculado ao telefone.
- **Admin:** `/admin` agora pede usuário e senha (conferidos no backend
  Convex — a senha não fica no código do site). Depois de entrar, o painel
  fica liberado no aparelho; o botão **Sair** fica no menu lateral.
- A senha do painel é a mesma para o app todo (por enquanto) — quem tem a
  senha abre o painel de qualquer aparelho.
