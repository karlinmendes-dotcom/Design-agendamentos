# 🎨 CUSTOMIZATION — Adaptando uma cópia para um novo negócio

> **Leia após criar a cópia** (ver `PROJECT_RULES.md` §4). Este guia transforma a
> cópia deste app (Nail Design Studio) em outro negócio — ex.: `"Pet shop"`,
> `"Venda de carros"`, `"Agendamento de clínica"`, `"Restaurante de sushi"` —
> **preservando todo o motor reutilizável** (agendamento, integridade, admin,
> WhatsApp).

---

## 1. Mapa mental: o que é estrutura vs. identidade

| 🧱 ESTRUTURA — não mexer (reutilizável) | 🎭 IDENTIDADE — trocar na cópia |
|---|---|
| `src/convex/*` (backend: schema + queries/mutations) | `src/utils/videos.ts` (vídeos/pôsteres do segmento) |
| `src/hooks/*` (estado e dados reativos) | `src/utils/serviceIcon.tsx` (palavras-chave dos serviços) |
| `src/utils/slots.ts`, `date.ts`, `format.ts`, `phone.ts` | `src/utils/whatsapp.ts` (mensagens e emojis) |
| `src/pages/Agendamento.tsx` + `Sucesso.tsx` (fluxo) | `src/components/Logo.tsx` (logo real + monograma) |
| `src/pages/admin/*` (dashboard, agenda, CRUD, config) | `src/components/WhatsAppFloat.tsx` (texto do botão) |
| `src/components/ui/*` + `Card`, `StatCard`, `Charts`... | `src/components/Footer.tsx` (frase de assinatura da marca) |
| `src/types/index.ts` (tipos) — exceto a constante abaixo | `src/index.css` (`@theme`: cores da marca) |
| `src/index.css` (sistema de tokens/utilitários — só recolorir) | `index.html` (title, description, favicon) |
| `src/convex/schema.ts` (schema) — seeds são conteúdo | `package.json` (name/description) |
| Integridade anti-conflito (`agendamentos.criar`), datas bloqueadas, confirmação WhatsApp | `src/data/demo.ts` + `src/convex/seed.ts` (serviços, horários, config, profissionais, midias) |

## 2. Caminho rápido — sem tocar em código (pelo painel admin)

1. **Configurações** (`/admin/configuracoes`): nome do negócio, logo, horários
   por dia, dias disponíveis.
2. **Contato** (na mesma tela ou tabela `barbearias`): telefone/WhatsApp,
   Instagram, endereço.
3. **Serviços** (`/admin/servicos`): nome, descrição, preço, duração, vídeo,
   ativar/desativar.
4. **Barbeiros → Profissionais**: cadastrar a equipe do novo negócio.

> Com isso o site já roda com a cara nova para a maioria dos segmentos
> (serviço genérico + preço + duração + vídeo). O restante é polimento visual.

## 3. Identidade no código (checklist por arquivo)

| # | Arquivo | O que trocar |
|---|---|---|
| 1 | `index.html` | `<title>`, `meta description`, (favicon) |
| 2 | `package.json` | `name`, `description` |
| 3 | `src/utils/videos.ts` | `VIDEO_HERO` + `VIDEO_POR_SERVICO` (vídeos e pôsteres do segmento) |
| 4 | `src/utils/media.ts` | Chaves do fallback local (hero, servico-manicure...) |
| 5 | `src/utils/serviceIcon.tsx` | Palavras-chave → ícones dos novos serviços |
| 6 | `src/utils/whatsapp.ts` | Mensagem de confirmação + emojis (ex.: 💅, 🐾, 🚗) |
| 7 | `src/components/Logo.tsx` | Ícone (`Scissors` → outro) e tagline ("Barber Shop" → ex.: "Nail Studio") |
| 8 | `src/components/WhatsAppFloat.tsx` | `MENSAGEM` ("Vim pelo aplicativo...") |
| 9 | `src/components/Footer.tsx` | Frase final (assinatura do novo negócio) |
| 10 | `src/index.css` | Bloco `@theme`: cores `--color-crimson/blood/gold...` + `--primary/--ring` (nova paleta da marca) |
| 11 | `src/data/demo.ts` | Serviços, horários e config demo (fallback sem banco) |
| 12 | `public/favicon.svg` | Novo favicon da marca |

## 4. Dados no banco (novo projeto Convex da cópia)

1. Criar projeto Convex **novo** em convex.dev (a cópia tem banco próprio —
   nunca dividir com o deployment `hardy-aardvark-221` deste app).
2. Publicar as funções da cópia com a **Deploy Key do banco da cópia**:
   ```bash
   CONVEX_DEPLOY_KEY='dev:<deployment-da-copia>|...' bun convex dev --once
   CONVEX_DEPLOY_KEY='dev:<deployment-da-copia>|...' bun convex run seed:inicial
   ```
3. **Editar o seed** (`src/convex/seed.ts`) na cópia antes de publicar — ou
   ajustar depois pelo painel admin: identidade, contato, serviços (nomes,
   preços, durações), horários, profissionais, mídias.
4. Colocar `VITE_CONVEX_URL` da **cópia** no `.env` do workspace e nas env vars
   da Vercel da cópia.

## 5. Exemplos rápidos de mapeamento de termos

| Conceito da base | 💅 Nail Design | 🐾 Pet Shop | 🏥 Clínica | 🍣 Sushi |
|---|---|---|---|---|
| `servicos` | Manicure, Pedicure, Gel... | Banho, Tosa, Consulta | Consulta, Exame, Retorno | Entrada, Prato, Combo |
| `barbeiros` → profissionais | Nail designer | Tosa-dor/Vet | Médico/Enfermeiro | Chef/Garçom |
| `barbearias` (tenant) | Estúdio de unhas | Pet shop | Clínica | Restaurante |
| Vídeos (`videos.ts`) | Mixkit de mãos/nail | Mixkit de pets | Mixkit de saúde | Mixkit de sushi/chef |

> Os **nomes de tipos e tabelas** (`Servico`, `Barbeiro`, `barbearia_id`) podem
> permanecer no código — são nomenclatura interna. Troque apenas os **rótulos
> visíveis** (UI e banco) para o vocabulário do segmento.

## 6. Multi-tenant (avançado — para quando precisar)

Hoje o tenant é fixo pela constante `BARBEARIA_NETO_ID` em `src/types/index.ts`
(usada na camada de dados Convex). Para rodar **vários negócios no mesmo banco**, o próximo
passo é resolver o tenant por **slug/domínio** (ler `barbearias` pela URL) em vez
da constante. A estrutura de dados já suporta (todas as tabelas têm
`barbearia_id`); a mudança é só na camada de resolução. **Não faça na base** —
faça na cópia que precisar disso.

## 7. Checklist final antes de publicar a cópia

- [ ] Projeto Convex novo criado com funções publicadas e seed do segmento
- [ ] `.env` com `VITE_CONVEX_URL` do banco da cópia (nunca o da base)
- [ ] Painel admin preenchido (nome, contato, horários, serviços, profissionais)
- [ ] `index.html`, `package.json`, `Logo`, `WhatsAppFloat`, `whatsapp.ts`,
      `Footer` sem referências à Barbearia Neto
- [ ] Vídeos/pôsteres do segmento em `videos.ts` + `midias`
- [ ] Paleta da marca em `src/index.css` (se a cor for diferente)
- [ ] `bun run typecheck` e `bun run build` com **0 erros**
- [ ] Deploy na Vercel com env vars da cópia; rotas testadas (`/`, `/servicos`,
      `/agendamento`, `/admin`)
