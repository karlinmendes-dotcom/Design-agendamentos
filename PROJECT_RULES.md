# 📜 PROJECT_RULES — Regras da Base Reutilizável

> **Este repositório é a BASE ORIGINAL.** Ele alimenta o site da **Barbearia Neto**
> (https://barbearia-neto.vercel.app) e serve de **molde** para criar novos apps
> de agendamento (unhas, pets, clínica, restaurante etc.) por **cópia independente**
> no GitHub — **nunca** modificando esta base.

---

## 1. Regra de ouro — a base nunca é transformada

- **Nunca** transforme este projeto em outro segmento (não vire "app de unhas"
  aqui, não renomeie a marca aqui).
- Novos negócios nascem **sempre** de uma cópia independente: `Fork` no GitHub
  (→ transferência para a conta pessoal) ou repositório novo + cópia do código.
  Depois da cópia, o `CUSTOMIZATION.md` guia a adaptação **na cópia**.
- Este app **deve continuar funcionando exatamente como está**: sem remoção de
  funcionalidades, sem reescrita desnecessária, sem quebras.

## 2. Regras de trabalho

1. **Não quebre o que funciona.** Mudanças pequenas e cirúrgicas; reutilize
   sempre os componentes/hooks/serviços existentes antes de criar novos.
2. **Não invente dados.** Seeds, conteúdos e exemplos são da Barbearia Neto;
   na cópia, o dono preenche os dados reais pelo painel admin ou no banco.
3. **Não altere banco/integrações sem necessidade.** O schema vive em
   `supabase/migrations/` e deve estar sempre aplicado e versionado.
4. **Secrets fora do código e do GitHub.** Única configuração externa:
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` via `.env` (ignorado pelo git).
   Nunca commitar `.env*`. Não colar chaves em comentários nem no código.
5. **Valide antes de entregar:** `bun run typecheck` (e `bun run build`) com
   **zero erros**. Nada de "deve compilar" — compila ou não entrega.
6. **Cada feature tem sua migration SQL** numerada (`0004_...sql`) se tocar o
   banco — nunca edite migrations já aplicadas em produção.

## 3. Convenções do código

| Tema | Convenção |
|---|---|
| Linguagem | TypeScript estrito (`strict: true`), React 19, Vite |
| Estilo | Tailwind CSS 4 com tokens em `src/index.css` (`@theme`) |
| Componentes | shadcn/ui em `src/components/ui/`; demais em `src/components/` |
| Hooks | `useXxx` em `src/hooks/`, sempre consumindo `src/services/` |
| Dados | Toda leitura/escrita passa por `src/services/*` (cliente Supabase único) |
| Alias | `@/` → `src/` |
| Idioma | Nomes de domínio e UI em português (`Servico`, `Agendamento`) |
| Tenant | `BARBEARIA_NETO_ID` em `src/types/index.ts` é o único switch de tenant |

## 4. Fluxo para criar uma nova cópia (resumo)

1. GitHub → **Fork** de `karlinmendes-dotcom/neto-agendamentos` (nome novo, ex.:
   `agendamento-unhas`) → opcional: transferir o fork para a conta pessoal.
2. Abrir o repo da cópia em um **workspace Freebuff novo** (totalmente separado).
3. Seguir **`CUSTOMIZATION.md`** para adaptar identidade, conteúdo e banco.
4. Deploy da cópia na Vercel com as env vars do **banco da cópia**.

> Detalhes completos de arquitetura: `ARCHITECTURE.md` ·
> Guia de adaptação: `CUSTOMIZATION.md` · Histórico: `CHANGELOG.md`
