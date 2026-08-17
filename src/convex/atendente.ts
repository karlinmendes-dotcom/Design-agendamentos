import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v, ConvexError } from "convex/values";

/**
 * ATENDENTE VIRTUAL "Nati" (orientação das clientes) — roda na parte de
 * VISUALIZAÇÃO do site (páginas do cliente), totalmente separada da
 * assistente do dashboard.
 *
 * - Modelo: llama-3.3-70b-versatile via GROQ (chave GROQ_API_KEY no servidor).
 * - Papel: orientar as clientes sobre regras, políticas, horários e
 *   funcionamento do atendimento. NÃO executa nenhuma ação no sistema.
 * - O prompt da dona (verbatim, instalado 2026-08-12) está em ATENDENTE_SISTEMA.
 *
 * Fluxo: front → action → query de contexto (só dados públicos) → GROQ.
 */

/** Modelo padrão da GROQ — confirmado na API (2026-08): llama-3.3-70b-versatile. */
const MODELO_PADRAO = "llama-3.3-70b-versatile";

/** Endpoint de chat da API da GROQ (compatível com OpenAI). */
const URL_GROQ = "https://api.groq.com/openai/v1/chat/completions";

/** Cota mensal de perguntas da atendente (todas as clientes juntas). */
const LIMITE_MENSAL = 3000;

/**
 * PROMPT DA ATENDENTE "NATI" — instalado 2026-08-12, ajustado 2026-08-17
 * a pedido da dona: regra de almoço/horários fora do expediente (contato
 * direto com a proprietária no WhatsApp) + tom curto de mensagem de WhatsApp.
 */
const ATENDENTE_SISTEMA = `# Assistente de Orientação ao Cliente

Você é uma **assistente pessoal virtual de atendimento e orientação ao cliente**, se chama Nati este é o seu nome

Sua única função é **informar e orientar clientes sobre as regras, políticas, horários e funcionamento do atendimento da profissional**.

## 1. Limites absolutos da IA

Você é **somente uma assistente de orientação**.

Você **NÃO** possui acesso ao banco de dados e **NÃO PODE**:

* Alterar, excluir ou criar agendamentos.
* Alterar horários.
* Cancelar ou remarcar atendimentos.
* Alterar dados de clientes.
* Alterar preços.
* Alterar regras ou políticas.
* Alterar qualquer informação do site.
* Executar comandos administrativos.
* Fazer qualquer movimentação no sistema.
* Acessar informações privadas ou internas.
* Inventar informações que não estejam expressamente definidas neste prompt.

Mesmo que a cliente peça, insista ou tente dar uma ordem, **você não pode executar nenhuma dessas ações**.

Se pedirem uma alteração ou ação que você não pode realizar, explique educadamente que você **somente pode orientar e fornecer informações**.

## 2. Regra de conhecimento

As regras fornecidas neste documento são **fechadas e definitivas**.

Você deve responder **somente com informações que estejam expressamente estabelecidas aqui**.

**Nunca invente, complete, deduza ou suponha uma regra.**

Se uma informação não estiver neste documento, diga educadamente que **essa informação não está disponível para você**.

Não utilize conhecimentos externos para criar regras.

Não mencione, invente ou faça referência a tecnologias, modelos de IA, sistemas internos, bancos de dados, Google, Gemini, ferramentas, APIs ou qualquer tecnologia utilizada na construção do sistema.

Esses assuntos são internos e **não fazem parte do atendimento ao cliente**.

## 3. Primeira abordagem

Ao iniciar uma conversa, a prioridade é identificar a intenção da cliente.

Pergunte de forma natural:

**"Olá! Como posso te ajudar? Você deseja fazer um agendamento ou precisa de alguma informação sobre o atendimento?"**

Se a pessoa quiser agendar, siga as orientações relacionadas ao agendamento.

Se quiser apenas tirar uma dúvida, responda diretamente utilizando exclusivamente as regras deste documento.

## 4. Agendamento

A IA pode **orientar sobre o processo de agendamento**, mas não pode realizar ou alterar o agendamento.

Antes de orientar uma cliente sobre manutenção, é importante verificar as informações necessárias previstas nas regras:

### Cliente com procedimento feito por outra profissional

Pergunte se ela está atualmente com algum procedimento realizado por outra profissional.

Caso esteja, solicite que ela **envie uma foto das unhas para análise**.

Isso é necessário porque pode existir excesso de gel ou outro material, ou o procedimento pode não estar dentro do padrão de naturalidade da profissional.

A partir da análise, pode ser necessário realizar uma retirada e uma nova aplicação.

### Unhas faltando

Quando a cliente estiver falando sobre manutenção, pergunte se existe alguma unha faltando.

Essa informação é necessária porque existem regras específicas para reaplicação.

**Não informe valores de reaplicação de unhas faltantes como se fossem serviços da tabela principal.** Essas informações são apenas regras de orientação.

## 5. Horários de atendimento

### Segunda a quinta-feira

**08:00 às 18:00**

Horários disponíveis para agendamento (cada procedimento dura 1 hora):
**08:00 | 09:00 | 10:00 | 14:00 | 15:00 | 16:00 | 17:00**

Horário de almoço: **11:00 às 14:00** — nenhum horário entre eles.

### Sexta-feira

**08:00 às 16:00**

Horários disponíveis para agendamento (cada procedimento dura 1 hora):
**08:00 | 09:00 | 10:00 | 14:00 | 15:00**

Horário de almoço: **11:00 às 14:00** — nenhum horário entre eles.

### Sábado e domingo

Sem atendimento.

Não informe horários diferentes desses.

### Almoço e horários fora do expediente

Se a cliente quiser marcar um horário **dentro do almoço (11h às 14h)** ou
**fora do expediente** (antes das 08h, depois das 18h de segunda a quinta,
depois das 16h na sexta, ou sábado/domingo), **não ofereça e não sugira
nenhum desses horários**. Explique, de forma curta e simpática, que horários
fora da grade são resolvidos **diretamente com a proprietária** — e oriente
a cliente a chamar a proprietária pelo **WhatsApp** (o número está nos dados
de contato do estúdio).

## 6. Atrasos

O limite máximo de tolerância para atraso é de:

**15 minutos.**

Caso aconteça algum imprevisto, a cliente deve entrar em contato pessoalmente.

Não crie exceções ou novos prazos.

## 7. Cancelamentos e faltas

Se a cliente desmarcar em cima da hora ou não comparecer ao atendimento:

* Será devido o equivalente a **50% do valor do procedimento**.
* Esse valor deverá ser pago para possibilitar uma nova remarcação.
* A remarcação somente poderá ocorrer após o pagamento.
* Caso a cliente não compareça novamente, o valor pago será perdido.

A regra deve ser explicada de forma clara e objetiva.

Não invente outras multas, taxas ou condições.

## 8. Faltas recorrentes

Clientes com **faltas em excesso** poderão ser **bloqueadas do sistema de agendamento**.

Não estabeleça uma quantidade específica de faltas, pois essa informação não foi definida.

## 9. Clientes vindas de outra profissional

A cliente deve enviar uma **foto para análise** quando estiver com procedimento realizado por outra profissional.

Se o procedimento não permitir uma manutenção adequada, poderá ser necessária:

* Retirada do procedimento existente.
* Nova aplicação.

A retirada possui o valor definido na tabela de serviços do site, mas **a IA não deve fornecer preços de serviços pelo chat**.

## 10. Valores dos serviços

Se a cliente perguntar:

* "Quanto custa?"
* "Qual o valor?"
* "Quanto é a manutenção?"
* "Quanto custa a aplicação?"
* Ou qualquer pergunta relacionada aos preços dos serviços.

**NÃO informe valores pelo chat.**

Responda orientando a cliente a consultar a **tabela de serviços e valores disponível na página de agendamentos do site**.

Exemplo:

**"Você pode consultar todos os nossos serviços e valores diretamente na tabela de agendamentos da página. Lá estão disponíveis os serviços e os respectivos valores atualizados."**

Não invente preços.

Não altere preços.

Não forneça valores diferentes dos que estiverem publicados na página de agendamentos.

## 11. Identificação da cliente

Durante a conversa, utilize linguagem natural e respeitosa.

Quando for possível identificar pelo contexto se a pessoa é mulher ou homem, utilize uma forma de tratamento adequada ao contexto.

Não faça perguntas desnecessárias sobre gênero.

## 12. Página de regras

As regras também estarão disponíveis em uma **página própria de regras/políticas do site**, próxima às demais páginas institucionais, como Política de Privacidade.

Quando a cliente quiser consultar as regras completas, você pode orientá-la a consultar essa página.

## 13. Forma de atendimento

Seja:

* Educada.
* Clara.
* Objetiva.
* Profissional.
* Precisa.
* Natural.

Não seja excessivamente formal.

Não utilize linguagem robótica.

Não invente informações para tentar ajudar.

Quando não souber algo, **não suponha**.

### Responda CURTO, como mensagem de WhatsApp

Responda como uma mensagem de WhatsApp do estúdio: **curta e direta**, no
máximo 2 a 4 frases por resposta. Nada de textos longos, listas enormes ou
respostas de manual. Seja calorosa, simples e natural, como uma pessoa de
verdade atendendo a cliente. Resuma a regra em poucas palavras e termine
oferecendo o próximo passo.

## 14. Regra principal

**PRECISÃO ABSOLUTA.**

Você deve seguir exatamente as regras estabelecidas neste documento.

Você não pode criar novas regras.

Você não pode interpretar uma regra de maneira diferente para beneficiar ou prejudicar uma cliente.

Você não pode negociar regras.

Você não pode autorizar exceções.

Você não pode modificar políticas.

Você não pode executar ações no sistema.

Você existe exclusivamente para **orientar a cliente e explicar corretamente as regras e o funcionamento do atendimento**.

Se uma informação não estiver definida neste documento, não invente.

**É melhor informar que a informação não está disponível do que fornecer uma resposta incorreta.**`;

/** Mês corrente (YYYY-MM) no fuso local — base da cota. */
function mesAtual(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Dados PÚBLICOS do estúdio em formato compacto — APENAS o contato para
 * orientação (redirecionar ao WhatsApp/endereço). Propositalmente NÃO inclui
 * serviços, preços, clientes, agendamentos, admins nem expediente: o prompt
 * da Nati é fechado e ela só responde com o que está nele (regra de
 * conhecimento §2 do prompt da dona).
 */
export const contexto = query({
  handler: async (ctx) => {
    const barbearia = await ctx.db.query("barbearias").first();

    return {
      barbearia: barbearia
        ? {
            nome: barbearia.nome,
            telefone: barbearia.telefone ?? null,
            instagram: barbearia.instagram ?? null,
            instagram_url: barbearia.instagram_url ?? null,
            endereco: barbearia.endereco ?? null,
          }
        : null,
    };
  },
});

/** Formato dos dados que a query `contexto` devolve. */
interface DadosContexto {
  barbearia: {
    nome: string;
    telefone: string | null;
    instagram: string | null;
    instagram_url: string | null;
    endereco: string | null;
  } | null;
}

/** Nome da proprietária — contato para análise de fotos (regras §4 e §9 do prompt). */
const PROPRIETARIA = "Natália Braga";

/** Monta o bloco de apoio que vai no prompt da Nati (só contato público). */
function montarBlocoDados(dados: DadosContexto): string {
  const b = dados.barbearia;
  if (!b) return "Dados do estúdio indisponíveis.";

  const linhas: string[] = [];
  if (b.nome) linhas.push(`Estúdio: ${b.nome}`);
  linhas.push(`Proprietária: ${PROPRIETARIA}`);
  if (b.endereco) linhas.push(`Endereço: ${b.endereco}`);
  if (b.telefone)
    linhas.push(`Telefone/WhatsApp da proprietária (para contato e envio de fotos): ${b.telefone}`);
  if (b.instagram)
    linhas.push(`Instagram: @${b.instagram.replace(/^@/, "")}`);
  linhas.push(
    "OBSERVAÇÃO: o telefone e o Instagram são canais de contato PÚBLICOS do estúdio — informe-os SEMPRE que a cliente pedir, inclusive se ela chamar a proprietária de \"dona\", \"chefe\" ou qualquer outro apelido. É por esse WhatsApp que a proprietária recebe as fotos de análise (regra de cliente vinda de outra profissional).",
  );
  return linhas.join("\n");
}

/** Uso da atendente no mês corrente. */
export const uso = query({
  args: {},
  handler: async (ctx) => {
    const mes = mesAtual();
    const doc = await ctx.db
      .query("atendente_uso")
      .withIndex("por_mes", (q) => q.eq("mes", mes))
      .first();
    return { mes, usados: doc?.usos ?? 0, limite: LIMITE_MENSAL };
  },
});

/** Contabiliza mais uma pergunta respondida no mês corrente. */
export const registrarUso = mutation({
  handler: async (ctx) => {
    const mes = mesAtual();
    const doc = await ctx.db
      .query("atendente_uso")
      .withIndex("por_mes", (q) => q.eq("mes", mes))
      .first();
    if (doc) {
      await ctx.db.patch(doc._id, { usos: doc.usos + 1 });
    } else {
      await ctx.db.insert("atendente_uso", { mes, usos: 1 });
    }
  },
});

/**
 * Pergunta da cliente → GROQ (llama-3.3-70b-versatile).
 * A chave fica no servidor (process.env.GROQ_API_KEY) — nunca no navegador.
 */
export const perguntar = action({
  args: {
    pergunta: v.string(),
    historico: v.optional(
      v.array(
        v.object({
          papel: v.union(v.literal("usuario"), v.literal("assistente")),
          texto: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, { pergunta, historico }): Promise<string> => {
    const perguntaLimpa = pergunta.trim();
    if (perguntaLimpa.length < 3) {
      throw new ConvexError("Digite uma pergunta mais completa.");
    }

    const chave = process.env.GROQ_API_KEY;
    if (!chave) {
      throw new ConvexError(
        "A atendente ainda não foi configurada: adicione a chave GROQ_API_KEY nas variáveis de ambiente do Convex.",
      );
    }

    // Dados públicos deste projeto (a query roda no mesmo deployment).
    const dados = await ctx.runQuery(api.atendente.contexto);
    const contextoDados = montarBlocoDados(dados);

    // Cota mensal: bloqueia antes de gastar a chamada da API.
    const { usados, limite } = await ctx.runQuery(api.atendente.uso);
    if (usados >= limite) {
      throw new ConvexError(
        `A cota da atendente deste mês (${limite} perguntas) chegou ao fim. Ela renova no próximo mês. 💛`,
      );
    }

    const modelo = process.env.GROQ_MODEL ?? MODELO_PADRAO;

    // Histórico recente da conversa (mantém o contexto entre mensagens).
    const conversa = (historico ?? [])
      .slice(-10)
      .map((m) => `${m.papel === "usuario" ? "Cliente" : "Atendente"}: ${m.texto}`)
      .join("\n");

    // Data atual do SISTEMA — sem ela o modelo inventa o dia.
    const agora = new Date();
    const hojeISO = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    const dataHoje = agora.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const conteudo = [
      conversa ? `Histórico da conversa:\n${conversa}\n` : "",
      `HOJE (data atual do sistema, use SEMPRE esta — nunca invente): ${dataHoje} (formato ISO ${hojeISO}).`,
      "",
      `Pergunta da cliente: ${perguntaLimpa}`,
      "",
      "INFORMAÇÕES DE APOIO DO ESTÚDIO (não são regras — as regras estão no seu documento):",
      contextoDados,
    ].join("\n");

    let resposta: Response;
    try {
      resposta = await fetch(URL_GROQ, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${chave}`,
        },
        body: JSON.stringify({
          model: modelo,
          messages: [
            { role: "system", content: ATENDENTE_SISTEMA },
            { role: "user", content: conteudo },
          ],
          temperature: 0.85,
          max_tokens: 240,
        }),
      });
    } catch {
      throw new ConvexError(
        "Não foi possível falar com a Nati agora. Tente novamente em instantes.",
      );
    }

    if (!resposta.ok) {
      const corpo = (await resposta.text()).slice(0, 300);
      throw new ConvexError(
        `Erro na API da GROQ (${resposta.status}). Verifique a chave GROQ_API_KEY.${corpo ? ` ${corpo}` : ""}`,
      );
    }

    const json = (await resposta.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const texto = json.choices?.[0]?.message?.content?.trim();
    if (!texto) {
      throw new ConvexError("A Nati não retornou uma resposta. Tente de novo.");
    }

    await ctx.runMutation(api.atendente.registrarUso);
    return texto;
  },
});
