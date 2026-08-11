import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v, ConvexError } from "convex/values";

/**
 * Assistente do dashboard (só admin): responde perguntas APENAS com os dados
 * deste projeto (clientes, serviços e agendamentos do deployment atual).
 * A chave da API fica no servidor (process.env.GEMINI_API_KEY) — nunca no
 * navegador. Fluxo: front → action → query de contexto (dados) → Gemini.
 */

/** Modelo padrão da API (Interactions API) — pode ser trocado via env GEMINI_MODEL. */
const MODELO_PADRAO = "gemini-3.1-flash-lite";

/** Endpoint da Interactions API (geral: https://ai.google.dev/api/interactions-api). */
const URL_INTERACTIONS =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

/**
 * Única ferramenta da assistente: cancelar um dia inteiro de agenda.
 * Formato da Interactions API (type: "function" + JSON Schema dos args).
 */
const FERRAMENTAS = [
  {
    type: "function",
    name: "cancelar_dia",
    description:
      "Cancela TODOS os agendamentos de um dia inteiro (ex.: a dona pediu para desmarcar todos os horários de uma data). Use APENAS quando a dona pedir explicitamente para cancelar/desmarcar um dia inteiro. O dia deve ser futuro.",
    parameters: {
      type: "object",
      properties: {
        data: {
          type: "string",
          description:
            "Data do dia a cancelar no formato AAAA-MM-DD (ex.: 2026-08-17).",
        },
      },
      required: ["data"],
    },
  },
];

/** Cota mensal de perguntas da assistente — ajuste aqui o limite. */
const LIMITE_MENSAL = 1000;

/** Data por extenso (pt-BR) para a resposta de confirmação. */
function formatarDataBR(data: string): string {
  const [y, m, d] = data.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

/** Monta a resposta amigável após cancelar um dia inteiro. */
function montarRespostaCancelamento(resultado: {
  data: string;
  cancelados: number;
  push?: { enviados?: number; sem_configuracao?: boolean };
}): string {
  const dia = formatarDataBR(resultado.data);
  if (resultado.cancelados === 0) {
    return `Não havia agendamentos ativos para ${dia}. Nada foi cancelado. 💛`;
  }
  const base = `✅ ${dia} cancelado(a) — ${resultado.cancelados} atendimento(s) cancelado(s).`;
  if (resultado.push?.sem_configuracao) {
    return `${base}\n⚠️ Para avisar as clientes por notificação, falta configurar a chave do Firebase no Convex (FIREBASE_SERVICE_ACCOUNT).`;
  }
  return `${base}\n💌 ${resultado.push?.enviados ?? 0} cliente(s) avisado(s) por notificação.`;
}

/** Mês corrente (YYYY-MM) no fuso local — base da cota. */
function mesAtual(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Data de corte: hoje menos N meses (YYYY-MM-DD, fuso local). */
function mesesAtrasISO(meses: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

const INSTRUCAO_SISTEMA = `# GEMINI — ASSISTENTE INTERNA DE AGENDAMENTO

Você é a assistente interna da proprietária do sistema de agendamento do Studio Natália Braga — Nail Design.

Sua única função é CONSULTAR E APRESENTAR informações que já existem no banco de dados oficial do aplicativo, utilizando exclusivamente os dados disponibilizados pelo sistema/Convex.

## O QUE VOCÊ PODE CONSULTAR

Você pode responder somente perguntas relacionadas a:

* clientes;
* agendamentos;
* horários;
* datas;
* serviços cadastrados;
* disponibilidade registrada pelo sistema;
* informações existentes nos registros do aplicativo.

Exemplos:

"Que horas a Maria está agendada?"

→ Consulte o banco e informe exatamente o horário registrado.

"Quem está agendado amanhã?"

→ Consulte os agendamentos e apresente somente os registros encontrados.

"Qual serviço a Maria marcou?"

→ Consulte o registro correspondente e informe o serviço cadastrado.

## REGRA ABSOLUTA DE DADOS

NUNCA invente informações.
NUNCA complete informações por suposição.
NUNCA crie clientes, horários, serviços ou agendamentos.
NUNCA altere dados do banco — com UMA ÚNICA EXCEÇÃO: a ferramenta
cancelar_dia (veja a seção "CANCELAR UM DIA INTEIRO" abaixo).
NUNCA pesquise na internet.
NUNCA utilize conhecimento externo para responder.
NUNCA responda algo como se fosse verdadeiro quando não estiver registrado no banco.

Se a informação não existir ou não puder ser encontrada, responda claramente:

"Não encontrei essa informação nos dados cadastrados."

Se perguntarem pela "melhor cliente", "cliente do mês" ou algo parecido, considere a cliente com mais agendamentos no período informado — calcule a partir dos dados fornecidos.

## CANCELAR UM DIA INTEIRO (ÚNICA AÇÃO PERMITIDA)

Quando a dona pedir para desmarcar/cancelar TODOS os horários de um dia inteiro
(ex.: "desmarcar todos os horários da próxima segunda-feira", "cancela a
quinta-feira"), use a ferramenta cancelar_dia com a data correta (AAAA-MM-DD).

- É a ÚNICA alteração de dados permitida no sistema.
- Se ela pedir para cancelar UM horário, um cliente, um serviço ou qualquer
  outra alteração, recuse educadamente: "Só consigo cancelar um dia inteiro.
  Para casos pontuais, use a agenda do dashboard. 💛"
- Nunca cancele um dia que já passou.

## FONTE ÚNICA

A fonte de verdade é o banco de dados do aplicativo.
O código, permissões, queries e estrutura existentes devem ser respeitados rigorosamente.
Não tente criar uma nova fonte de dados, banco, API ou sistema paralelo.
Não altere a arquitetura existente.

## PERSONALIDADE

Responda de maneira feminina, simpática, elegante, acolhedora, profissional e objetiva — com o cuidado e a atenção do Studio Natália Braga, sem inventar informações pessoais, profissionais ou comerciais sobre a proprietária.

## FORMATO DAS RESPOSTAS — IMPORTANTE

- Responda CURTO: no máximo 3 frases, ou uma listinha bem enxuta.
- NUNCA use markdown, asteriscos, hashtags ou símbolos (#, *, -, **, ###).
- Use EMOJIS delicados (💅✨🌸💛) para dar charme — sem exagerar.
- Uma informação por linha, sem rodeios.

Exemplo: "💅 Maria está agendada para amanhã às 14h30 — Alongamento em Gel."

Se houver vários resultados, organize-os claramente.
Não faça explicações desnecessárias.

## LIMITES

Se a pergunta estiver fora de clientes, agendamentos, horários, serviços ou dados existentes no sistema, responda:

"Posso consultar apenas as informações cadastradas no sistema de agendamentos."

Seu objetivo é ser uma CONSULTA RÁPIDA E CONFIÁVEL dentro do dashboard.

CONSULTAR → VALIDAR → RESPONDER.

Nunca inventar → nunca pesquisar fora → nunca modificar dados (exceto pela ferramenta cancelar_dia).

OBEDEÇA SEMPRE ÀS REGRAS E PERMISSÕES IMPLEMENTADAS NO CÓDIGO.`;

/** Dados deste projeto em formato compacto — o único "mundo" do assistente. */
export const contexto = query({
  handler: async (ctx) => {
    const [clientes, servicos, agendamentos] = await Promise.all([
      ctx.db.query("clientes").collect(),
      ctx.db.query("servicos").collect(),
      ctx.db.query("agendamentos").collect(),
    ]);

    const corte = mesesAtrasISO(6);
    const recentes = agendamentos
      .filter((a) => a.data >= corte)
      .sort((a, b) => `${b.data}${b.horario}`.localeCompare(`${a.data}${a.horario}`))
      .slice(0, 400);

    const nomeCliente = new Map(
      clientes.map((c) => [c._id, `${c.nome} (tel ${c.telefone})`]),
    );
    const infoServico = new Map(
      servicos.map((s) => [
        s._id,
        `${s.nome} — R$ ${s.preco.toFixed(2).replace(".", ",")} (${s.duracao_minutos} min)`,
      ]),
    );

    return {
      clientes: clientes
        .map((c) => `${c.nome} (tel ${c.telefone})`)
        .slice(0, 200),
      servicos: servicos.map(
        (s) =>
          `${s.nome} — R$ ${s.preco.toFixed(2).replace(".", ",")} (${s.duracao_minutos} min)`,
      ),
      agendamentos: recentes.map(
        (a) =>
          `- ${a.data} às ${a.horario} | ${a.status} | cliente: ${
            nomeCliente.get(a.cliente_id) ?? "?"
          } | serviço: ${infoServico.get(a.servico_id) ?? "?"}`,
      ),
    };
  },
});

/** Uso da assistente no mês corrente — alimenta a barrinha do dashboard. */
export const uso = query({
  args: {},
  handler: async (ctx) => {
    const mes = mesAtual();
    const doc = await ctx.db
      .query("gemini_uso")
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
      .query("gemini_uso")
      .withIndex("por_mes", (q) => q.eq("mes", mes))
      .first();
    if (doc) {
      await ctx.db.patch(doc._id, { usos: doc.usos + 1 });
    } else {
      await ctx.db.insert("gemini_uso", { mes, usos: 1 });
    }
  },
});

/** Pergunta ao Gemini — chama a API com a chave do servidor. */
export const perguntar = action({
  args: { pergunta: v.string() },
  handler: async (ctx, { pergunta }): Promise<string> => {
    const perguntaLimpa = pergunta.trim();
    if (perguntaLimpa.length < 3) {
      throw new ConvexError("Digite uma pergunta mais completa.");
    }

    const chave = process.env.GEMINI_API_KEY;
    if (!chave) {
      throw new ConvexError(
        "Assistente ainda não configurado: adicione a chave GEMINI_API_KEY nas variáveis de ambiente do Convex.",
      );
    }

    // Busca os dados DESTE projeto (a query roda no mesmo deployment).
    const dados = await ctx.runQuery(api.gemini.contexto);

    const contexto = [
      "CLIENTES DO ESTÚDIO:",
      ...(dados.clientes.length ? dados.clientes : ["(nenhum cliente cadastrado)"]),
      "",
      "SERVIÇOS:",
      ...(dados.servicos.length ? dados.servicos : ["(nenhum serviço cadastrado)"]),
      "",
      "AGENDAMENTOS (últimos 6 meses):",
      ...(dados.agendamentos.length
        ? dados.agendamentos
        : ["(nenhum agendamento no período)"]),
    ].join("\n");

    // Cota mensal: bloqueia antes de gastar a chamada da API.
    const { usados, limite } = await ctx.runQuery(api.gemini.uso);
    if (usados >= limite) {
      throw new ConvexError(
        `A cota da assistente deste mês (${limite} perguntas) chegou ao fim. Ela renova no próximo mês. 💛`,
      );
    }

    const modelo = process.env.GEMINI_MODEL ?? MODELO_PADRAO;

    let resposta: Response;
    try {
      resposta = await fetch(URL_INTERACTIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": chave,
        },
        body: JSON.stringify({
          model: modelo,
          system_instruction: INSTRUCAO_SISTEMA,
          input: `Pergunta da dona do estúdio: ${perguntaLimpa}\n\nDados do estúdio (fonte única de verdade):\n${contexto}`,
          tools: FERRAMENTAS,
          generation_config: {
            max_output_tokens: 800,
            thinking_level: "minimal",
          },
        }),
      });
    } catch {
      throw new ConvexError(
        "Não foi possível falar com o Gemini agora. Tente novamente em instantes.",
      );
    }

    if (!resposta.ok) {
      const corpo = (await resposta.text()).slice(0, 300);
      throw new ConvexError(
        `Erro na API do Gemini (${resposta.status}). Verifique a chave GEMINI_API_KEY.${corpo ? ` ${corpo}` : ""}`,
      );
    }

    const json = (await resposta.json()) as {
      steps?: {
        type?: string;
        name?: string;
        arguments?: unknown;
        content?: { type?: string; text?: string }[];
      }[];
    };

    // 1) Function calling: a dona pediu para cancelar um dia inteiro
    const chamada = (json.steps ?? []).find((s) => s.type === "function_call");
    if (chamada?.name === "cancelar_dia") {
      const args = (chamada.arguments ?? {}) as { data?: string };
      const data = (args.data ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        throw new ConvexError(
          "Não consegui identificar o dia para cancelar. Me diga qual data (ex.: 'segunda-feira' ou '17/08').",
        );
      }
      const resultado = await ctx.runAction(api.push.cancelarDiaCompleto, {
        data,
      });
      await ctx.runMutation(api.gemini.registrarUso);
      return montarRespostaCancelamento(resultado);
    }

    // 2) Resposta normal de texto
    const texto = (json.steps ?? [])
      .filter((s) => s.type === "model_output")
      .flatMap((s) => s.content ?? [])
      .map((p) => p.text ?? "")
      .join("\n")
      .trim();
    if (!texto) {
      throw new ConvexError("O Gemini não retornou uma resposta. Tente de novo.");
    }

    await ctx.runMutation(api.gemini.registrarUso);
    return texto;
  },
});
