# 📜 PROJECT_RULES — Regras da Base Reutilizável

> **Este repositório é o app do Nail Design Studio** (repo `Design-agendamentos`,
> produção em https://design-agendamentos.vercel.app, banco Convex
> `hardy-aardvark-221`). Ele também serve de **molde** para criar novos apps de
> agendamento (unhas, pets, clínica, restaurante etc.) por **cópia independente**
> no GitHub — **nunca** modificando este app em produção.

---

## 1. Regra de ouro — este app é o Nail Design Studio

- Este projeto **é** o aplicativo do Studio Natália Braga (nail design) — não é
  a base da barbearia. Qualquer edição aqui altera o site
  `design-agendamentos.vercel.app` da cliente.
- Novos negócios nascem **sempre** de uma cópia independente (`Fork` do repo
  `karlinmendes-dotcom/Design-agendamentos` ou repositório novo + cópia do
  código). Depois da cópia, o `CUSTOMIZATION.md` guia a adaptação **na cópia**.
- Este app **deve continuar funcionando exatamente como está**: sem remoção de
  funcionalidades, sem reescrita desnecessária, sem quebras.

## 2. Regras de trabalho

1. **Não quebre o que funciona.** Mudanças pequenas e cirúrgicas; reutilize
   sempre os componentes/hooks/funções Convex existentes antes de criar novos.
2. **Não invente dados.** Conteúdo real do estúdio: nome, WhatsApp (27)
   99614-0639, Instagram `@nataliabraga_nail`, endereço em Colatina/ES. Seeds e
   demos usam a marca do estúdio.
3. **Não altere banco/integrações sem necessidade.** O schema vive em
   `src/convex/schema.ts`; funções em `src/convex/*.ts`. Para publicar:
   `CONVEX_DEPLOY_KEY='dev:hardy-aardvark-221|...' bun convex dev --once`.
4. **Secrets fora do código e do GitHub.** Única configuração externa:
   `VITE_CONVEX_URL` via `.env` (ignorado pelo git). Nunca commitar `.env*`.
   Não colar chaves em comentários nem no código. Chaves reais ficam nos
   painéis (Vercel, Convex, Supabase, Firebase) e nas notas do dono (fora
   do repositório).
5. **Valide antes de entregar:** `bun run typecheck` (e `bun run build`) com
   **zero erros**. Nada de "deve compilar" — compila ou não entrega.
6. **Mudança de schema/funções Convex** = publicar com `convex dev --once` e
   conferir os tipos gerados (`src/convex/_generated/`). Não editar o
   `_generated` à mão.

## 3. Convenções do código

| Tema | Convenção |
|---|---|
| Linguagem | TypeScript estrito (`strict: true`), React 19, Vite |
| Estilo | Tailwind CSS 4 com tokens em `src/index.css` (`@theme`) |
| Componentes | shadcn/ui em `src/components/ui/`; demais em `src/components/` |
| Hooks | `useXxx` em `src/hooks/`, consumindo queries/mutations do Convex |
| Dados | Backend em `src/convex/*` (queries/mutations); hooks reativos com fallback `src/data/demo.ts` |
| Alias | `@/` → `src/` |
| Idioma | Nomes de domínio e UI em português (`Servico`, `Agendamento`) |
| Tenant | Tabelas internas preservam nomes legados (`barbearias`, `barbeiros`, `barbearia_id`) — nomenclatura de schema, não de UI |

## 4. Fluxo para criar uma nova cópia (resumo)

1. GitHub → **Fork** de `karlinmendes-dotcom/Design-agendamentos` (nome novo,
   ex.: `agendamento-pets`) → opcional: transferir o fork para a conta pessoal.
2. Abrir o repo da cópia em um **workspace Freebuff novo** (totalmente separado).
3. Seguir **`CUSTOMIZATION.md`** para adaptar identidade, conteúdo e banco.
4. Criar **projeto Convex próprio** na cópia (nunca reutilizar
   `hardy-aardvark-221`) e deploy na Vercel com as env vars do banco da cópia.

> Detalhes completos de arquitetura: `ARCHITECTURE.md` ·
> Mapa curto do projeto: `PROJECT_MAP.md` ·
> Guia de adaptação: `CUSTOMIZATION.md` · Histórico: `CHANGELOG.md`
