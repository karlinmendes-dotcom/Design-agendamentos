# 🎨 CUSTOMIZATION — Adaptando uma cópia para um novo negócio

> **Leia após criar a cópia** (ver `PROJECT_RULES.md` §4). Este guia transforma a
> cópia da Barbearia Neto em outro negócio — ex.: `"Nail Design"`, `"Venda de
> carros"`, `"Agendamento de clínica"`, `"Restaurante de sushi"` — **preservando
> todo o motor reutilizável** (agendamento, integridade, admin, WhatsApp).

---

## 1. Mapa mental: o que é estrutura vs. identidade

| 🧱 ESTRUTURA — não mexer (reutilizável) | 🎭 IDENTIDADE — trocar na cópia |
|---|---|
| `src/services/*` (toda a camada de dados) | `src/utils/videos.ts` (vídeos/pôsteres do segmento) |
| `src/hooks/*` (estado e dados) | `src/utils/serviceIcon.tsx` (palavras-chave dos serviços) |
| `src/utils/slots.ts`, `date.ts`, `format.ts`, `phone.ts` | `src/utils/whatsapp.ts` (mensagens e emojis) |
| `src/pages/Agendamento.tsx` + `Sucesso.tsx` (fluxo) | `src/components/Logo.tsx` (ícone + tagline) |
| `src/pages/admin/*` (dashboard, agenda, CRUD, config) | `src/components/WhatsAppFloat.tsx` (texto do botão) |
| `src/components/ui/*` + `Card`, `StatCard`, `Charts`... | `src/components/Footer.tsx` (assinatura "precisão de navalha") |
| `src/types/index.ts` (tipos) — exceto a constante abaixo | `src/index.css` (`@theme`: cores da marca) |
| `src/index.css` (sistema de tokens/utilitários — só recolorir) | `index.html` (title, description, favicon) |
| `supabase/migrations/` (schema) — seeds são conteúdo | `package.json` (name/description) |
| Integridade anti-conflito, RLS, confirmação WhatsApp | `src/data/demo.ts` + seeds SQL (serviços, horários, config, barbeiros, midias) |

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
| 4 | `src/utils/media.ts` | Chaves do fallback local (hero, servico-corte, servico-barba...) |
| 5 | `src/utils/serviceIcon.tsx` | Palavras-chave → ícones dos novos serviços |
| 6 | `src/utils/whatsapp.ts` | Mensagem de confirmação + emojis (ex.: 💅, 🐾, 🚗) |
| 7 | `src/components/Logo.tsx` | Ícone (`Scissors` → outro) e tagline ("Barber Shop" → ex.: "Nail Studio") |
| 8 | `src/components/WhatsAppFloat.tsx` | `MENSAGEM` ("Vim pelo aplicativo da Barbearia Neto...") |
| 9 | `src/components/Footer.tsx` | Frase final ("Feito com precisão de navalha 🪒") |
| 10 | `src/index.css` | Bloco `@theme`: cores `--color-crimson/blood/gold...` + `--primary/--ring` (nova paleta da marca) |
| 11 | `src/data/demo.ts` | Serviços, horários e config demo (fallback sem banco) |
| 12 | `public/favicon.svg` | Novo favicon da marca |

## 4. Dados no banco (novo projeto Supabase da cópia)

1. Criar projeto Supabase **novo** (a cópia tem banco próprio — nunca dividir com
   a base, que já usa o projeto "Barbearia neto").
2. Aplicar as migrations na ordem: `0001_init.sql` → `0002_saas_platform.sql` →
   `0003_integridade_agendamento.sql`.
3. **Editar os seeds** na cópia antes de aplicar (ou ajustar depois pelo painel):
   - `0001`: serviços do novo negócio (nomes, preços, durações), horários,
     configuração.
   - `0002`: linha da `barbearias` (nome/slug/descrição/telefone), `barbeiros`
     (profissionais), `midias` (vídeos/banners).
4. Colocar `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` da **cópia** no `.env`
   do workspace e nas env vars da Vercel da cópia.

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
(usada em `services/`). Para rodar **vários negócios no mesmo banco**, o próximo
passo é resolver o tenant por **slug/domínio** (ler `barbearias` pela URL) em vez
da constante. A estrutura de dados já suporta (todas as tabelas têm
`barbearia_id`); a mudança é só na camada de resolução. **Não faça na base** —
faça na cópia que precisar disso.

## 7. Checklist final antes de publicar a cópia

- [ ] Banco novo aplicado (migrations 0001→0003) com seeds do segmento
- [ ] `.env` com as chaves do banco da cópia (nunca as da base)
- [ ] Painel admin preenchido (nome, contato, horários, serviços, profissionais)
- [ ] `index.html`, `package.json`, `Logo`, `WhatsAppFloat`, `whatsapp.ts`,
      `Footer` sem referências à Barbearia Neto
- [ ] Vídeos/pôsteres do segmento em `videos.ts` + `midias`
- [ ] Paleta da marca em `src/index.css` (se a cor for diferente)
- [ ] `bun run typecheck` e `bun run build` com **0 erros**
- [ ] Deploy na Vercel com env vars da cópia; rotas testadas (`/`, `/servicos`,
      `/agendamento`, `/admin`)
