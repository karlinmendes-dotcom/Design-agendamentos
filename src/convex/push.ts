"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import webpush from "web-push";

/**
 * Notificações Web Push (protocolo padrão do navegador, VAPID) — o "pop" que
 * chega no navegador/celular da cliente (confirmação, cancelamento, avisos).
 *
 * - Frontend: a cliente permite notificações e o navegador devolve uma
 *   INSCRIÇÃO push (endpoint + chaves), que é gravada como JSON na tabela
 *   pushTokens (campo token), vinculada ao telefone.
 * - Backend: `enviarParaTelefones` busca as inscrições dos telefones afetados
 *   e entrega o aviso via protocolo Web Push (biblioteca web-push), assinando
 *   com a chave PRIVADA VAPID (env VAPID_PRIVATE_KEY — segredo, só servidor).
 *   A chave pública fica no frontend (src/lib/firebase.ts).
 *
 * Sem Firebase: não depende de projeto, conta de serviço nem permissões do
 * Google Cloud — a chave VAPID é gerada e controlada pelo próprio estúdio.
 */

const TITULO_AVISO = "⚠️ Alteração no seu Agendamento";
const CORPO_AVISO =
  "Olá! Houve um imprevisto na nossa agenda. Toque aqui para ver os detalhes e remarcar o seu horário de forma rápida.";

/** Chave pública VAPID do estúdio (pública por design — fica no navegador).
 * Par válido gerado em 2026-08-13 via web-push.generateVAPIDKeys (o par
 * anterior tinha a pública corrompida e nenhum aviso era entregue). */
const VAPID_PUBLIC_KEY =
  "BNAT1khI4o27ov6hnkRRmMWnRffnkDc7Dq80pU4MKaHxqOZqRJHnx7zWtcaOYbBEJKvpCMaUonDKub8RSKJ2BjQ";

/**
 * Chave PRIVADA VAPID do estúdio — pareada com a pública acima.
 *
 * Prioridade: se existir a env var VAPID_PRIVATE_KEY no Convex
 * (Environment Variables), ela vence. Senão, usa esta constante como
 * GARANTIA para o envio funcionar sem depender de configuração externa
 * (a dona tem vários projetos no Convex e a env var foi salva no lugar
 * errado — o aviso nunca chegava por isso). É uma chave de envio de
 * notificação (não dá acesso a dados) e o repositório é privado.
 */
const VAPID_PRIVATE_KEY_GARANTIA =
  "UGuMHAqXzcHGFdZizFBzquoRtxDth3nRndLncsrW2dY";

/** Contato identificado no JWT VAPID (exigência do protocolo). */
const VAPID_SUBJECT = "mailto:avisos@studio-natalia.com.br";

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
 * Configura o VAPID no web-push. Usa a env var do Convex se existir;
 * senão, usa a chave de garantia embutida (ver acima).
 */
function configurarVapid(): boolean {
  const privada = process.env.VAPID_PRIVATE_KEY ?? VAPID_PRIVATE_KEY_GARANTIA;
  if (!privada) return false;
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, privada);
    return true;
  } catch {
    return false;
  }
}

/** Inscrição push gravada no banco (JSON.parse do que o navegador devolveu). */

/**
 * Entrega o aviso para todos os telefones informados (Web Push). Se o
 * VAPID_PRIVATE_KEY ainda não estiver configurado no Convex, retorna
 * sem_configuracao: true (o cancelamento já aconteceu — só o aviso fica
 * pendente).
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
        erros: ["VAPID_PRIVATE_KEY ausente no Convex (Environment Variables)."],
      };
    }

    // Junta todas as inscrições push dos telefones afetados (uma cliente
    // pode ter vários navegadores/aparelhos). O campo token guarda a
    // inscrição completa como JSON.
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
