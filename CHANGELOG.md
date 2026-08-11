# 📝 CHANGELOG — Histórico da Base

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Semântica: versões `1.x` = base original (Barbearia Neto); cópias futuras
ganham seu próprio histórico a partir daqui.

---

## [2.1.0] — Banco Convex + hospedagem própria · 2026-08

**Alterado (infraestrutura do Nail Design Studio):**

- **Banco:** Supabase → **Convex** com deployment próprio e separado
  (`hardy-aardvark-221` → `https://hardy-aardvark-221.convex.cloud`, projeto
  "Design agendamentos"). Schema, queries/mutations (incluindo o motor
  anti-conflito) e seed em `src/convex/`; hooks reescritos com queries
  reativas (`useQuery`/`useMutation`).
- **Hospedagem:** projeto Vercel **`design-agendamentos`** →
  `https://design-agendamentos.vercel.app` (conectado ao GitHub, branch
  `main`), com `VITE_CONVEX_URL` → `hardy-aardvark-221` configurada
  (production + preview + development). `vercel.json` define `bun install` +
  `bun run build` → `dist`.
- Camada `src/services/` (Supabase) removida; `@supabase/supabase-js`
  desinstalado; `ConvexProvider` no bootstrap.

---

## [2.0.0] — Transformação Nail Design · 2026-08

**Alterado (aplicação completa re-identificada para nail design):**

- **Identidade:** Barbearia Neto → **Nail Design Studio**; tema visual
  black + red → **black + rose/rose gold** (paleta `red-*` remapeada para
  tons de rosa no `src/index.css`, fonte display **Playfair Display**);
  favicon, título e meta descrição atualizados.
- **Cardápio:** corte/barba → **Manicure, Pedicure, Esmaltação em Gel,
  Alongamento em Gel, Nail Art e Spa dos Pés** (dados demo, seeds da
  migration `0004` e vídeos Mixkit de nail design).
- **Conteúdo:** hero, destaques, avaliações, promoções/combos, contato,
  rodapé, WhatsApp, splash screen e painel admin — toda a experiência
  recriada para o segmento (profissionais, não barbeiros).
- **Banco:** migration `0004_transformacao_nail_design.sql` atualiza
  identidade do tenant, desativa serviços antigos, insere o novo cardápio
  e troca a biblioteca de mídia — sem tocar nas migrations aplicadas.

---

## [1.1.0] — Base reutilizável (documentação) · 2026-08

**Adicionado (documentação da base — nenhuma funcionalidade alterada):**

- `PROJECT_RULES.md` — regras oficiais: a base nunca é transformada; novos
  negócios nascem de cópias independentes no GitHub; secrets fora do código.
- `ARCHITECTURE.md` — stack, estrutura de pastas, modelo de dados, motor de
  agendamento, resolução de mídia, env vars e deploy.
- `CUSTOMIZATION.md` — guia passo a passo para adaptar uma cópia a qualquer
  segmento (ex.: Nail Design, Venda de carros, Clínica, Sushi), com checklist.
- `README.md` — seção apontando para a documentação da base.

---

## [1.0.2] — Ajustes de produção · 2026-08

- Hospedagem migrada para **Vercel** (`https://barbearia-neto.vercel.app`);
  `vercel.json` com rewrite SPA. Netlify permanece como configuração legada.
- `.vercel` adicionado ao `.gitignore` (config local da CLI).

## [1.0.1] — Confirmação no WhatsApp · 2026-08

- `src/utils/whatsapp.ts` + `src/pages/Sucesso.tsx`: ao confirmar o
  agendamento, o site abre o WhatsApp do cliente com a mensagem de confirmação
  pronta (serviço, valor, profissional, data, horário) — sem integração/chaves.
- Correção: código do país `55` garantido no link `wa.me`.

## [1.0.0] — Plataforma inicial da Barbearia Neto

- SPA React 19 + Vite + Tailwind 4 + shadcn/ui + Supabase.
- Área do cliente: Home (hero em vídeo), Serviços, Agendamento em etapas,
  Promoções, Contato, Sucesso; bottom navigation + splash screen.
- Painel admin: Dashboard (indicadores e gráficos), Agenda (status/dia),
  Serviços (CRUD com vídeo), Configurações (nome, logo, horários, contato).
- **Integridade** (migration `0003`): duração gravada no agendamento, trigger
  anti-conflito por barbeiro/dia, colunas `poster_url` e `instagram`.
- Arquitetura SaaS em preparação (migration `0002`): `barbearias`, `barbeiros`,
  `midias` e colunas `barbearia_id` em todas as tabelas.
- Schema inicial (migration `0001`): `clientes`, `servicos`, `horarios`,
  `agendamentos`, `configuracoes` com RLS aberto e seeds.
