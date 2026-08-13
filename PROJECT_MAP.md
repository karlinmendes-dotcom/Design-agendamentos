# 🗺️ PROJECT_MAP — Mapa do Projeto (consulte antes de alterar)

> **Regra permanente:** antes de qualquer alteração, confirme os caminhos reais
> neste mapa (e com `ls`/`glob`). **Nunca presuma que um arquivo existe.**

**App:** Studio Natália Braga — Nail Design · agendamento online (SPA)
**Stack:** React 19 + TS strict + Vite 8 · Tailwind 4 (`@theme` em `src/index.css`) · shadcn/ui · react-router 7 · **Convex** (backend/banco) · Vercel · Bun
**Produção:** https://design-agendamentos.vercel.app · Convex `hardy-aardvark-221` (`convex.json` → projeto `design-agendamento`)

---

## 1. Raiz (configs)

| Arquivo | Papel |
|---|---|
| `package.json` | Scripts: `dev`, `build`, `typecheck` (`tsc -b --noEmit`), `preview` |
| `tsconfig*.json` | Alias `@/*` → `src/*` (app) · `vite.config.ts` (node) |
| `vite.config.ts` | Plugins React+Tailwind, alias `@`, host `0.0.0.0`, porta `$PORT` |
| `index.html` | Título, fonts (Playfair/Great Vibes/Cormorant/Inter), `theme-color #2F4A3E`, favicon |
| `convex.json` | Aponta o CLI para `src/convex` (projeto `design-agendamento`) |
| `vercel.json` | `bun install` + `bun run build` → `dist/`, rewrite SPA |
| `netlify.toml` · `supabase/` | ⚠️ **LEGADO** (hospedagem/banco antigos) — manter só como histórico |
| `PROJECT_RULES.md` · `ARCHITECTURE.md` · `CUSTOMIZATION.md` · `README.md` | Regras/arquitetura/guia de cópias |

## 2. Frontend — `src/`

| Caminho | Conteúdo |
|---|---|
| `main.tsx` | Bootstrap: `ConvexProvider` + `App` |
| `App.tsx` | Rotas + `SplashScreen` + `ToastProvider` + `ScrollToTop` (rola ao trocar de menu) |
| `lib/convex.ts` | Client Convex, `isConvexConfigured`, `erroMensagem` |
| `lib/firebase.ts` | Firebase FCM (web): config pública, VAPID, SW, token, onMessage |
| `lib/utils.ts` | `cn()` (clsx + tailwind-merge) |
| `types/index.ts` | Tipos de domínio + `BARBEARIA_NETO_ID` (tenant fixo) |
| `data/demo.ts` | Dados de demonstração (fallback sem Convex) |
| `hooks/` | `useServicos`, `useHorarios`, `useConfiguracao`, `useDatasBloqueadas`, `useAgendamentos`, `useBarbearia`, `useBarbeiros`, `useClientes` (queries reativas + fallback demo) · `useIdentidadeCliente` (nome+WhatsApp da cliente no aparelho) · `useAdminAuth` (sessão do painel) |
| `contexts/ToastContext.tsx` | Notificações |
| `layouts/AdminLayout.tsx` | Sidebar + topbar do painel `/admin` |
| `components/` | Cliente: `Logo`, `Footer`, `SplashScreen`, `ServiceCard`, `VideoCover`, `VideoCarousel`, `TimeSlotGrid`, `BottomNav`, `Feedback`, `Charts`, `StatCard`, `StatusBadge`, `EmptyState`, `Reveal`, `PushListener` (escuta push com app aberto), `ReagendarModal` (aviso de cancelamento + CTA reagendar), `LegalPage` (layout das páginas legais), **`AtendenteCliente`** (Nati — chat flutuante de orientação das clientes, lado esquerdo, ver §5), **`EntrarCliente`** (porta de entrada: nome+WhatsApp+checkbox de consentimento LGPD com links /termos e /privacidade + banner de notificações antes do pop-up nativo) — contato WhatsApp só no rodapé/Contato (o botão flutuante foi removido) |
| `components/ui/` | shadcn/ui: button, card, dialog, input, label, select, switch, table, textarea, badge, skeleton |
| `pages/` | Cliente: `Home`, `Servicos`, `Agendamento`, `Promocoes`, `Contato`, `Sucesso`, `Reagendar` (rota aberta ao tocar na notificação) · Legais: `Privacidade` (`/privacidade`), `Termos` (`/termos`), `Regras` (`/regras` — regras de atendimento que a Nati orienta) — abertas, sem pedir conta (LGPD/Google) |
| `pages/admin/` | `Dashboard`, `Agenda`, `ServicosAdmin`, `CombosAdmin`, `Equipe`, `Configuracoes`, **`AdminLogin`** (login do painel) |
| `utils/` | `slots` (motor de horários), `whatsapp` (confirmação), `date`, `format`, `phone`, `media` (resolução de mídia), `videos` (fallback Mixkit), `serviceIcon` |

**Rotas:** `/` · `/servicos` · `/agendamento` · `/promocoes` · `/contato` · `/sucesso` · `/reagendar` (aberta mesmo sem entrar) · `/privacidade` · `/termos` · `/regras` (abertas, sem conta) · `/admin/entrar` · `/admin` · `/admin/agenda` · `/admin/servicos` · `/admin/combos` · `/admin/equipe` · `/admin/configuracoes` — cliente cria conta com nome+WhatsApp (`EntrarCliente`, com consentimento LGPD); `/admin*` exige login (`AdminLogin` + mutation `admin.verificarSenha`; senha em `src/convex/admin.ts`, anotada nas notas do dono)

**Push FCM:** `public/firebase-messaging-sw.js` (service worker — recebe o pop até com o app fechado e abre `/reagendar` ao tocar)

## 3. Backend Convex — `src/convex/`

| Arquivo | Queries / Mutations |
|---|---|
| `schema.ts` | Tabelas: `barbearias`, `configuracoes`, `servicos`, `barbeiros`, `horarios`, `clientes`, `midias`, `datasBloqueadas`, `agendamentos`, `pushTokens`, `admins`, `gemini_uso`, `atendente_uso` |
| `agendamentos.ts` | `list`, `listPorData`, `listOcupados`, **`criar`** (valida dia ativo + data bloqueada + expediente + anti-sobreposição), `atualizarStatus`, **`cancelarDia`** (cancela o dia inteiro + retorna telefones dos afetados) |
| `pushTokens.ts` | `registrar`, `remover`, `listarPorTelefones` (tokens FCM por telefone) |
| `admin.ts` | **`verificarSenha`** (login do painel `/admin` — senha no backend, nunca no navegador) |
| `push.ts` | **"use node"** (runtime Node): `enviarParaTelefones` (envio FCM em lote com `FIREBASE_SERVICE_ACCOUNT`), `cancelarDiaCompleto` (cancela + notifica) |
| `barbearias.ts` | `getAtual`, `salvar` (nome/contato/Instagram/endereço) |
| `barbeiros.ts` | `listAtivos` (profissional do estúdio) |
| `clientes.ts` | `findOrCreate`, `buscar`, `historico` |
| `configuracoes.ts` | `get`, `salvar` (`dias_disponiveis`) |
| `horarios.ts` | `list`, `listAtivos`, `upsert` (expediente por dia) |
| `datasBloqueadas.ts` | `list`, `adicionar`, `remover` (feriados/folgas) |
| `servicos.ts` | `list`, `criar`, `atualizar`, `setAtivo`, `excluir` |
| `gemini.ts` | **Assistente da dona (painel)**: action `perguntar` (Gemini + function calling) · queries `contexto` (tudo) e `uso` · mutation `registrarUso` — ver §5 |
| `atendente.ts` | **Nati (clientes)**: action `perguntar` (GROQ/llama, sem tools) · query `contexto` (só dados públicos) e `uso` · mutation `registrarUso` — ver §5 |
| `midias.ts` | Biblioteca de conteúdo (vídeo/imagem/banner/logo) |
| `storage.ts` | Util de validação de arquivos do Convex Storage |
| `seed.ts` | `seed:inicial` (dados da marca) |
| `_generated/` | ⚠️ Gerado pelo CLI — **nunca editar à mão** |

## 4. Como as partes se conectam

- **Dados:** página → `hooks/` (`useQuery`) → `src/convex/*` (queries/mutations) → Convex. Sem `VITE_CONVEX_URL` os hooks usam `src/data/demo.ts`.
- **Agendamento** (`pages/Agendamento.tsx`): serviço → profissional → data (filtra `dias_disponiveis` ∩ `horarios.ativo` ∩ `datasBloqueadas`) → horário (`utils/slots.ts` + `agendamentos.listOcupados`) → dados → confirmação (abre WhatsApp do cliente via `utils/whatsapp.ts` e grava com `agendamentos.criar`).
- **Dashboard manda de verdade:** `admin/Configuracoes.tsx` grava os 7 dias atomicamente (switches → `configuracoes.salvar` + `horarios.upsert`) e feriados via `datasBloqueadas`; o servidor (`agendamentos.criar`) recusa dia desativado/feriado/fora do expediente.
- **Identidade visual:** tokens da marca em `src/index.css` (`@theme` + `:root`) — creme `#F8F3EE` de fundo, verde `#2F4A3E` primário, dourado `#C9A86A` em detalhes; fontes Playfair (títulos) / Great Vibes (cursiva) / Cormorant (serif apoio).

## 5. As duas IAs — GEMINI (painel) e NATI (atendente)

| | 🤖 **Gemini — Assistente da dona** | 💅 **Nati — Atendente das clientes** |
|---|---|---|
| Área | Só `/admin*` (dashboard, protegido por login) | Só páginas do cliente (`ClientLayout`) |
| Backend | `src/convex/gemini.ts` — action `gemini:perguntar` | `src/convex/atendente.ts` — action `atendente:perguntar` |
| Widget | `src/components/admin/AssistenteAdmin.tsx` (montado no `AdminLayout`, lado direito) | `src/components/AtendenteCliente.tsx` (montado no `ClientLayout` do `App.tsx`, lado esquerdo) |
| Modelo / API | Gemini — env do Convex `GEMINI_API_KEY` (+ `GEMINI_MODEL` opcional) | llama-3.3-70b-versatile (GROQ) — envs do Convex `GROQ_API_KEY` + `GROQ_MODEL` |
| O que enxerga | Tudo: clientes, agendamentos, admins, expediente + **cardápio ATIVO** com preços (query `gemini.contexto` — só `ativo=true`; histórico usa o mapa completo) | Só nome/telefone/Instagram/endereço (query `atendente.contexto`) — **sem serviços, sem preços, sem clientes, sem agenda** |
| Execução | CRUD total via function calling (tools) + protocolo "sinal verde" 🚀 para ações críticas | **Nenhuma** — só orienta com o prompt |
| Cota mensal | Tabela `gemini_uso` (limite 1000/mês) | Tabela `atendente_uso` (limite 3000/mês) — **independentes** |
| Prompt | `INSTRUCAO_SISTEMA` em `gemini.ts` (verbatim da dona + apêndice técnico) | `ATENDENTE_SISTEMA` em `atendente.ts` (verbatim da dona — **sem** apêndice técnico) |

**Regras de ouro (não quebrar):**
- A Nati **nunca** recebe serviços, preços, clientes, agendamentos ou admins no contexto. Se um dia precisar de mais dados, perguntar à dona antes.
- A Nati **não tem ferramentas (tools)** — ela não executa nada no banco; orienta a cliente a usar a página de agendamento do site.
- O prompt da Nati é **fechado e verbatim da dona** — não adicionar seções nem apêndice técnico (ela não pode saber de tecnologias internas, Google, Gemini, bancos etc.).
- A Nati aponta as clientes para a página `/regras` (seção 12 do prompt) — manter a página sempre coerente com o prompt.
- Chaves `GEMINI_API_KEY` e `GROQ_API_KEY` ficam SÓ no Convex (Environment Variables do deployment), **nunca** no repositório.

## 6. Próximas fases — PLANEJADAS (não implementar ainda)

Decisões registradas para não se perder contexto (pedido da dona, 2026-08):

- **CANCELAMENTO EM MASSA VIA IA + PUSH (FCM) — ✅ IMPLEMENTADO (2026-08-11)**.
  Escopo aprovado pela dona (2026-08): a dona cancela um dia inteiro por texto/voz para a Gemini; o
  backend cancela os agendamentos do dia e notifica os clientes via **Firebase
  Cloud Messaging (FCM) Web Push — 100% gratuito** (sem WhatsApp). Fluxo:
  1. Dona: "Preciso desmarcar todos os horários da próxima segunda-feira" →
  2. Gemini (Function Calling) identifica a data e chama a action
     `agendamentos.cancelarDia` no Convex →
  3. A action marca **Cancelado** todos os agendamentos daquele dia, coleta os
     tokens FCM dos clientes afetados e envia em lote via HTTP seguro ao FCM →
  4. O navegador/celular da cliente recebe o pop mesmo com o app fechado.
  - **Ao tocar na notificação**: abre tela específica com **modal informativo**
    ("Houve um imprevisto técnico/pessoal no estabelecimento...") + **botão CTA
    de reagendamento** levando ao calendário (rota `reagendar` /
    `agendamento?remarcar=`).
  - **Textos padrão**: push → título "⚠️ Alteração no seu Agendamento", msg
    "Olá! Houve um imprevisto na nossa agenda. Toque aqui para ver os detalhes
    e remarcar o seu horário de forma rápida." · modal → "Sentimos muito! Houve
    um imprevisto técnico/pessoal no estabelecimento e seu horário precisou ser
    reagendado. Mas não se preocupe: sua vaga está garantida! Clique no botão
    abaixo para escolher uma nova data disponível sem custos adicionais."
  - **Frontend (Vercel)**: chaves públicas `VITE_FIREBASE_*` (web config do
    projeto `poupaps-cancelar`: apiKey
    `AIzaSyBoGKjUODcSC7DpeSMNW_ZWRp7uLKSzuuc`, authDomain
    `poupaps-cancelar.firebaseapp.com`, projectId `poupaps-cancelar`,
    messagingSenderId `66548106345`, appId
    `1:66548106345:web:008a42ef4cd41e5acecef8`); `public/firebase-messaging-sw.js`
    (service worker); pedir permissão de notificação no fluxo pós-agenda e
    salvar o token FCM da cliente (tabela `pushTokens` nova — o app não tem
    tabela "usuários"; salvar a cada abertura do app e no agendamento).
  - **Convex**: chave **secreta** `FIREBASE_SERVICE_ACCOUNT` (JSON do SDK
    Admin) em Environment Variables do Convex — **aguardando a dona gerar e
    colar**; action `push.cancelamento` (envio em lote) + action
    `agendamentos.cancelarDia` (chamável pela Gemini via Function Calling na
    Interactions API).
  - **Status real**: tabela `pushTokens` criada; `gemini:perguntar` com
    Function Calling (ferramenta `cancelar_dia`) testada AO VIVO (respondeu
    "não havia agendamentos ativos..."); envio FCM validado contra o Firebase
    real (token fake rejeitado → falhas: 1 = auth/endpoint OK); deploy Vercel
    no ar com `/reagendar` e `/firebase-messaging-sw.js` 200.
  - ⚠️ **Pendências de configuração (usuária)**: (1) **`VITE_FIREBASE_VAPID_KEY`**
    (chave pública Web Push) — sem ela o navegador não gera token FCM;
    pegar em Firebase → Configurações do projeto → Cloud Messaging →
    Certificados Web Push e colar na Vercel/`.env.local`; (2) **teste em
    aparelho real** (permitir notificação, agendar, cancelar no dashboard e
    conferir o pop); (3) iOS exige "Adicionar à tela inicial". Nota:
    `FIREBASE_SERVICE_ACCOUNT` já está configurado no Convex (validado).
- **Login na área do cliente**: ⚠️ **adiado de propósito** — o app é aberto
  (sem autenticação, Convex público) e o login bloquearia a visualização do
  produto atrás de uma tela de autenticação. Só implementar APÓS a aprovação
  total do produto; então usar **Convex Auth** (padrão do template), rota de
  consulta de agendamento com login leve por telefone/senha.
- **Busca de cliente (já entregue)**: busca por nome ou telefone com histórico
  completo do banco (`clientes.buscar` + `clientes.historico`, com filtro de
  período 3/6/12 meses) — pronta no Dashboard.

## 7. Publicação / deploy

```bash
bun convex dev --once        # publicar funções (regenera _generated) — requer CONVEX_DEPLOY_KEY
bun convex run seed:inicial  # seed
bun run typecheck            # tsc -b --noEmit (zero erros antes de entregar)
bun run build                # build → dist/ (deploy na Vercel faz bun install + build)
```

- Env: `VITE_CONVEX_URL` → `https://hardy-aardvark-221.convex.cloud` (`.env` ignorado pelo git; configurada na Vercel prod/preview/dev).
- Envs das IAs ficam **no Convex** (não na Vercel): `GEMINI_API_KEY`, `GROQ_API_KEY`, `GROQ_MODEL`, `FIREBASE_SERVICE_ACCOUNT` — ver §5.
- ⚠️ Banco/hospedagem **separados** dos outros projetos (barbearia e sushi) — nunca apontar este app para outro deployment.
