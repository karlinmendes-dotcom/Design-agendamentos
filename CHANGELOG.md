# 📝 CHANGELOG — Histórico da Base

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Semântica: versões `1.x` = base original (Barbearia Neto); cópias futuras
ganham seu próprio histórico a partir daqui.

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
