"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import webpush from "web-push";

/**
 * Notificações Web Push (protocolo padrão do navegador, VAPID) — o "pop" que
 * chega no navegador/celular da cliente (confirmação, cancelamento, avisos),
 * MESMO com o app fechado (quem exibe é o service worker).
 *
 * - Frontend: a cliente autoriza e o navegador devolve uma INSCRIÇÃO push
 *   (PushSubscription como JSON), gravada na tabela `pushTokens` (campo
 *   token) vinculada ao telefone — a validação/limpeza de inscrições
 *   inválidas fica em `pushTokens.ts`.
 * - Backend: `enviarParaTelefones` busca as inscrições dos telefones afetados
 *   e entrega o aviso via protocolo Web Push (biblioteca web-push),
 *   assinando com a chave PRIVADA VAPID — que existe SOMENTE na variável de
 *   ambiente `VAPID_PRIVATE_KEY` do Convex (nunca no repositório).
 *   A chave pública fica no frontend (src/lib/firebase.ts).
 *
 * Sem Firebase: não depende de projeto, conta de serviço nem permissões do
 * Google Cloud — a chave VAPID é gerada e controlada pelo próprio estúdio.
 */

const TITULO_AVISO = "⚠️ Alteração no seu Agendamento";
const CORPO_AVISO =
  "Olá! Houve um imprevisto na nossa agenda. Toque aqui para ver os detalhes e remarcar o seu horário.";

/** Chave pública VAPID do estúdio (pública por design — fica no navegador). */
const VAPID_PUBLIC_KEY =
  "BNAT1khI4o27ov6hnkRRmMWnRffnkDc7Dq80pU4MKaHxqOZqRJHnx7zWtcaOYbBEJKvpCMaUonDKub8RSKJ2BjQ";

/**
 * Contato identificado no JWT VAPID (exigência do protocolo). Usamos o próprio
 * endereço do site (https://...) — o protocolo aceita, e assim não inventamos
 * um e-mail que não existe.
 */
const VAPID_SUBJECT = "https://design-agendamentos.vercel.app";

/** Resultado de um envio em lote (tipado para evitar inferência circular). */
interface ResultadoEnvio {
  enviados: number;
  falhas: number;
  telefones: string[];
  sem_configuracao: boolean;
  data: string | null;
  /** Detalhe dos erros (ex.: assinatura inválida, 404/410) — diagnóstico. */
  erros: string[];
}

/**
 * Configura o VAPID no web-push. A chave privada é lida SOMENTE do runtime do
 * Convex (Environment Variables → VAPID_PRIVATE_KEY). Sem ela, o envio não
 * acontece e o chamador recebe `sem_configuracao: true` — nada de chave
 * embutida no código-fonte.
 */
function configurarVapid(): boolean {
  const privada = process.env.VAPID_PRIVATE_KEY;
  if (!privada) return false;
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, privada);
    return true;
  } catch {
    return false;
  }
}

/**
 * Entrega o aviso para todos os telefones informados (Web Push).
 *
 * Regras:
 * - O envio NUNCA derruba a operação chamadora (cancelamento, etc.): falhas
 *   são registradas em `erros` e o cancelamento já aconteceu no banco.
 * - Inscrições que o push service devolve como inválidas (404/410) são
 *   removidas automaticamente da base (`pushTokens.remover`) — o aparelho
 *   que revogou a permissão para de receber sem travar o lote.
 */
export const enviarParaTelefones = action({
  args: {
    telefones: v.array(v.string()),
    data: v.optional(v.string()),
    // Texto e destino customizáveis (ex.: confirmação de agendamento).
    // Sem eles, o aviso padrão de cancelamento é usado.
    titulo: v.optional(v.string()),
    mensagem: v.optional(v.string()),
    tipo: v.optional(v.string()),
    url: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { telefones, data, titulo, mensagem, tipo, url },
  ): Promise<ResultadoEnvio> => {
    const limpos = [
      ...new Set(telefones.map((t) => t.replace(/\D/g, "")).filter(Boolean)),
    ];
    if (limpos.length === 0) {
      return {
        enviados: 0,
        falhas: 0,
        telefones: [],
        sem_configuracao: false,
        data: data ?? null,
        erros: [],
      };
    }

    if (!configurarVapid()) {
      return {
        enviados: 0,
        falhas: 0,
        telefones: limpos,
        sem_configuracao: true,
        data: data ?? null,
        erros: [
          "VAPID_PRIVATE_KEY ausente no Convex (Environment Variables) — o aviso não foi enviado.",
        ],
      };
    }

    // Junta todas as inscrições push dos telefones afetados (uma cliente
    // pode ter vários navegadores/aparelhos). O campo token guarda a
    // PushSubscription completa como JSON.
    const docs = await ctx.runQuery(api.pushTokens.listarPorTelefones, {
      telefones: limpos,
    });
    const inscricoes = docs.map((d) => d.token).filter(Boolean);
    if (inscricoes.length === 0) {
      return {
        enviados: 0,
        falhas: 0,
        telefones: limpos,
        sem_configuracao: false,
        data: data ?? null,
        erros: ["Nenhuma inscrição push cadastrada para este telefone."],
      };
    }

    const payload = JSON.stringify({
      titulo: titulo ?? TITULO_AVISO,
      mensagem: mensagem ?? CORPO_AVISO,
      url: url ?? "/reagendar",
      tipo: tipo ?? "cancelamento",
      ...(data ? { dia: data } : {}),
    });

    let enviados = 0;
    let falhas = 0;
    const erros: string[] = [];

    for (const bruto of inscricoes) {
      let inscricao: webpush.PushSubscription;
      try {
        inscricao = JSON.parse(bruto) as webpush.PushSubscription;
      } catch {
        continue; // registro corrompido — ignora sem derrubar o lote
      }
      try {
        await webpush.sendNotification(inscricao, payload);
        enviados++;
      } catch (err) {
        const e = err as { statusCode?: number; body?: unknown; message?: string };
        const status = e.statusCode ?? 0;
        erros.push(
          `HTTP ${status}: ${String(e.body ?? e.message ?? "").slice(0, 220)}`,
        );
        if (status === 404 || status === 410) {
          // Inscrição inválida/revogada → limpa da base para não reenviar
          await ctx.runMutation(api.pushTokens.remover, { token: bruto }).catch(
            () => {},
          );
        }
        falhas++;
      }
    }

    return {
      enviados,
      falhas,
      telefones: limpos,
      sem_configuracao: false,
      data: data ?? null,
      erros,
    };
  },
});

/**
 * CANCELAMENTO INDIVIDUAL (pela dona, no painel) + aviso por Web Push.
 *
 * A operação principal é o cancelamento no banco — que gera a pendência de
 * 50% (regra do estúdio para desmarcar em cima da hora / falta). A
 * notificação é uma operação POSTERIOR: se o push falhar, o agendamento
 * continua corretamente cancelado (o erro do push vai em `push.erros`).
 */
/** Resultado do cancelamento individual: cancelamento no banco + push. */
interface ResultadoCancelamento {
  cancelado: boolean;
  telefone: string;
  push: ResultadoEnvio | { erro: string };
}

export const cancelarIndividual = action({
  args: {
    id: v.id("agendamentos"),
    data: v.string(),
    telefone: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { id, data, telefone },
  ): Promise<ResultadoCancelamento> => {
    // 1. Cancela no banco — operação PRINCIPAL (não depende do push)
    await ctx.runMutation(api.agendamentos.atualizarStatus, {
      id,
      status: "cancelado",
    });

    // 2. Resolve o telefone da cliente (o painel passa, mas confirmamos no
    //    banco para o envio nunca depender de argumento do navegador)
    let telefoneCliente = telefone?.replace(/\D/g, "") ?? "";
    if (!telefoneCliente) {
      const todos = await ctx.runQuery(api.agendamentos.list);
      const doc = todos.find((a) => String(a.id) === String(id));
      telefoneCliente = doc?.cliente?.telefone?.replace(/\D/g, "") ?? "";
    }

    // 3. Notifica a cliente — operação POSTERIOR; falha não derruba o cancelamento
    let push: ResultadoEnvio | { erro: string };
    try {
      push = await ctx.runAction(api.push.enviarParaTelefones, {
        telefones: telefoneCliente ? [telefoneCliente] : [],
        data,
        url: "/reagendar",
      });
    } catch (err) {
      push = { erro: String(err) };
    }

    return { cancelado: true, telefone: telefoneCliente, push };
  },
});

/** Cancela um dia inteiro (mutation) + notifica os afetados (Web Push). */
export const cancelarDiaCompleto = action({
  args: { data: v.string() },
  handler: async (ctx, { data }): Promise<{
    data: string;
    cancelados: number;
    telefones: string[];
    push: ResultadoEnvio;
  }> => {
    const cancelado = await ctx.runMutation(api.agendamentos.cancelarDia, {
      data,
    });
    const push = await ctx.runAction(api.push.enviarParaTelefones, {
      telefones: cancelado.telefones,
      data,
    });
    return { ...cancelado, push };
  },
});
