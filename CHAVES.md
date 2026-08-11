# 🔑 CHAVES — Central de Acesso (documento aberto)

> Compilado em **09/08/2026** a partir de todo o histórico de conversas e dos
> painéis. Documento **aberto** por decisão do dono (`karlinmendes-dotcom`) —
> os dois projetos são de **apresentação/demonstração**.
>
> ⚠️ **Nota de segurança (leia 1 vez):** este documento contém credenciais
> **reais**. O repositório é **privado**, mas se ele for tornado público um dia,
> **revogue todas as chaves abaixo antes** (Supabase → API Keys; Vercel →
> Tokens; Convex → Deploy Keys). Recomendação: trocar a `service_role` e o token
> da Vercel periodicamente, pois são as de maior poder.

---

## 0. 💅 Nail Design Studio — **BANCO ATUAL** (Convex) ✅ EM USO

> Este app (repositório `Design-agendamentos`) usa **Convex com deployment
> próprio e separado** de todos os outros projetos. ⚠️ **Nunca usar o
> `original-quail-840`** — ele é do projeto do sushi (foi usado por engano no
> passado).

| Item | Valor |
|---|---|
| **`VITE_CONVEX_URL`** (pública, para o app) | `https://hardy-aardvark-221.convex.cloud` |
| Deployment | `hardy-aardvark-221` |
| Projeto (dashboard) | **Design agendamentos** (slug `design-agendamento`, team `karlinmendes`) |
| Dashboard | https://dashboard.convex.dev/t/karlinmendes/design-agendamento/hardy-aardvark-221 |
| **Deploy Key** (dev — para publicar funções/seed) | `dev:hardy-aardvark-221|eyJ2MiI6Ijc0MTU3ZDNjY2IzMDRlZjk5NjU2YmM2YWU0MTQ1YjQ2In0=` ⚠️ **ATUALIZADA 2026-08-11** (chave anterior rotacionada — as conexões voltaram com esta) |
| **`GEMINI_API_KEY`** (env do Convex — assistente do dashboard) | Configurada em **Convex → Project Settings → Environment Variables** (ou `bun convex env set GEMINI_API_KEY <valor>`). Modelo: `GEMINI_MODEL` (padrão `gemini-3.1-flash-lite`) |
| **`FIREBASE_SERVICE_ACCOUNT`** (env do Convex — envio de notificação push FCM) | ✅ Configurada 2026-08-11 (validada: o FCM respondeu e rejeitou token fake — auth OK). JSON do SDK Admin do projeto Firebase `poupaps-cancelar`. Em Convex → Project Settings → Environment Variables |
| **`VITE_FIREBASE_*`** (públicas — web config do Firebase `poupaps-cancelar`) | Embutidas como fallback no código (`src/lib/firebase.ts`): apiKey `AIzaSyBoGKjUODcSC7DpeSMNW_ZWRp7uLKSzuuc` · authDomain `poupaps-cancelar.firebaseapp.com` · projectId `poupaps-cancelar` · messagingSenderId `66548106345` · appId `1:66548106345:web:008a42ef4cd41e5acecef8` |
| **`VITE_FIREBASE_VAPID_KEY`** (chave pública Web Push — necessária para o navegador gerar o token FCM) | ⏳ **PENDENTE** — Firebase → Configurações do projeto → **Cloud Messaging** → **Certificados Web Push** → copiar a chave. Colar na Vercel (projeto `design-agendamentos`, prod/preview/dev) e/ou `.env.local` |

**Como publicar funções / rodar a seed:**

```bash
CONVEX_DEPLOY_KEY='dev:hardy-aardvark-221|...' bun convex dev --once
CONVEX_DEPLOY_KEY='dev:hardy-aardvark-221|...' bun convex run seed:inicial
```

**Onde está salva:** `.env.local` (workspace) · painel Convex → Project
Settings → Deploy Keys · env var `VITE_CONVEX_URL` na Vercel (projeto
`design-agendamentos`, prod/preview/dev).

> As migrations em `supabase/migrations/` e a Seção 1 abaixo são do **banco
> antigo (Supabase)** — mantidas como histórico da base; o app não as usa mais.
> O `convex.json` deste repo aponta para o projeto `design-agendamento` —
> nunca trocar para outro projeto.

---

## 1. 🗄️ Supabase — Projeto **"Barbearia neto"** (banco DO SITE DA BARBEARIA) 📦 HISTÓRICO

| Item | Valor |
|---|---|
| Nome do projeto | Barbearia neto |
| Project ID / ref | `czyfsdbmxdyvmqrdvaiw` |
| Região | `ca-central-1` (Canadá Central) |
| **`VITE_SUPABASE_URL`** | `https://czyfsdbmxdyvmqrdvaiw.supabase.co` |
| **`VITE_SUPABASE_ANON_KEY`** (pública, para o app) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eWZzZGJteGR5dm1xcmR2YWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MDE4MTEsImV4cCI6MjEwMTI3NzgxMX0.jCDlKEzZqZOKBCdP6AXmY2s-eTqPjAu-VysxwSidy0U` |
| **`service_role`** (ADMIN — bypassa RLS; não colocar no front) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eWZzZGJteGR5dm1xcmR2YWl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTcwMTgxMSwiZXhwIjoyMTAxMjc3ODExfQ.7A9uQASHoTYK2uMU6ZnEpsyEwJh9tpe1o-LkUq2q9-M` |
| JWT — chave atual (ECC P-256) | Key ID `16a2176f-fb2c-4b04-a5de-f2d843e195f2` |
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

| Item | Valor |
|---|---|
| URL | `https://rwnansfmtsvjueuxtnyx.supabase.co` |
| `anon` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bmFuc2ZtdHN2anVldXh0bnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MTg4NDYsImV4cCI6MjEwMTE5NDg0Nn0.GWRObW_lY6hsIMabz1Z8pAPom7i3eMCtC6Kt-tu8eZA` |

> ⚠️ **Este é o banco que causou o erro `Could not find the table
> 'public.servicos'`** no site antigo — ele NÃO tem as tabelas da barbearia.
> Não usar em nenhuma configuração nova.

---

## 3. ▲ Vercel — Token da conta `karlinmendes-dotcom` ✅ EM USO

| Item | Valor |
|---|---|
| **Token (account)** | ⛔ **Removido do git (proteção do GitHub contra vazamento de segredo)** — o valor real fica em Vercel → Account Settings → Tokens (token atualizado 2026-08-11, id `IIOlRYZwnTyV6efjQighsFrCLMnYXQxjBPtUcaFbQPToxe33`) |
| Conta | `karlinmendes-dotcom` |

### Projetos da conta

| Projeto | ID | Site (domínio) | Env vars configuradas |
|---|---|---|---|
| **barbearia-neto** (🪒 Barbearia) | `prj_fBaZ1Yak8BqrG5F2kfXlKIN94nm3` | `https://barbearia-neto.vercel.app` | `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` (production + preview + development) |
| **hitiko-sushi** (🍣 Sushi — ex. `sushi-menu-app`) | `prj_Ci1hrfuEoHm15pTNJ3koMq5lTF29` | `https://sushi-menu-app-five.vercel.app` | `CONVEX_SITE_URL` (o `VITE_CONVEX_URL` foi gravado no build publicado) |

> ⚠️ **Sushi usa o Convex `original-quail-840`** (além do `ideal-lobster-748`
> antigo). As funções dele foram sobrescritas por engano em 2026-08 e precisam
> ser re-publicadas a partir do workspace do sushi (repo `sushi-menu-app`):
> `CONVEX_DEPLOY_KEY='dev:original-quail-840|...' bun convex dev --once`.
| **design-agendamentos** (💅 Nail Design) | `prj_X4bNLFWwfEz7eTQVemdMSIaUbvZL` | `https://design-agendamentos.vercel.app` | `VITE_CONVEX_URL` → `https://hardy-aardvark-221.convex.cloud` (production + preview + development) |

**Onde está salva:** painel Vercel → **Account Settings → Tokens** · colado no
histórico do chat Freebuff (usado para deploys e configurações via API).

> 🔄 **Rotação pendente (só pelo painel — a API recusou com 403):** ver **Seção 9**.
> O token atual no painel aparece como **"liberado para freebuff asseso total"**
> (id `IIOlRYZwnTyV6efjQighsFrCLMnYXQxjBPtUcaFbQPToxe33`).

> O projeto do sushi teve a **proteção de login (Vercel Authentication / SSO)
> desativada** — os dois sites abrem para qualquer visitante.

---

## 4. ⚡ Convex — Banco do site do SUSHI ✅ EM USO

| Item | Valor |
|---|---|
| **`VITE_CONVEX_URL`** | `https://ideal-lobster-748.convex.cloud` |
| **`CONVEX_SITE_URL`** | `https://sushi-menu-app-five.vercel.app` |
| Credencial (trecho do painel — **INCOMPLETA**) | `eyJ2MiI6IjE0NTA0NzBiYzhkMTQ5NTU5YjhlMGE1YjFlMzczNzBmIn0=` |

> ⚠️ O trecho acima é a **parte central** de uma chave de deploy, não a chave
> inteira. A **Deploy Key completa** (formato `prod:...` ou `dev:...`) fica no
> painel `convex.dev` → projeto `ideal-lobster-748` → **Project Settings →
> Deploy Keys**. Necessária só para quem for editar as funções do Convex.

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

---

## 9. 🔄 Rotação de chaves — status (09/08/2026)

| Chave | Status | Como trocar |
|---|---|---|
| **Token Vercel** | ⏳ **Pendente — só pelo painel** (API recusou: `403`) | Vercel → **Account Settings → Tokens → Create Token** (nome novo) → copiar o valor → voltar na lista e **Delete** no token antigo ("liberado para freebuff asseso total") → atualizar a Seção 3 |
| **`service_role`** (legacy) | ⏳ **Pendente — só pelo painel** (API não cria chaves legadas) | Supabase → **API Keys** → chaves legadas → **Reset** ao lado de `service_role` → copiar a nova → substituir na Seção 1 |
| **`secret`** (modelo novo) | ⏳ Mantida (o valor só é revelado 1x, no painel) | Se quiser trocar: API Keys → revogar `secret` (id `d0e6f4d7-...`) e criar outra |
| **`anon` / `VITE_SUPABASE_ANON_KEY`** | ✅ Mantida — é a que o site usa | ⚠️ Se trocar, atualizar **Vercel + `.env.local` + redeploy** (o site para de funcionar até isso) |

> **O que foi verificado na prática:** a API do Supabase criou uma chave nova,
> mas a entrega **mascarada** (`sb_secret_···` — o valor completo nunca é
> revelado de novo). A chave de teste foi **removida** e o projeto voltou ao
> estado original (4 chaves: anon, service_role, publishable, secret).
> Nenhuma chave em uso foi alterada — o site segue funcionando normalmente.
