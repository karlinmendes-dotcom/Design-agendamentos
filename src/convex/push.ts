"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { createSign } from "node:crypto";

/**
 * Notificações push (Firebase Cloud Messaging) — o "pop" que chega no
 * navegador/celular da cliente quando o horário dela é cancelado.
 *
 * - Frontend: a cliente permite notificações e o token FCM do navegador dela é
 *   gravado aqui (tabela pushTokens), vinculado ao telefone.
 * - Backend: `enviarParaTelefones` busca os tokens dos telefones afetados e
 *   envia o alerta em lote pela API HTTP v1 do FCM, autenticando com a chave
 *   privada do SDK Admin (env FIREBASE_SERVICE_ACCOUNT — segredo, só servidor).
 */

const TITULO_AVISO = "⚠️ Alteração no seu Agendamento";
const CORPO_AVISO =
  "Olá! Houve um imprevisto na nossa agenda. Toque aqui para ver os detalhes e remarcar o seu horário de forma rápida.";

interface ServiceAccount {
  project_id?: string;
  client_email?: string;
  private_key?: string;
  token_uri?: string;
}

/** Resultado de um envio em lote (tipado para evitar inferência circular). */
interface ResultadoEnvio {
  enviados: number;
  falhas: number;
  telefones: string[];
  sem_configuracao: boolean;
  data: string | null;
}

interface ResultadoCancelamento {
  data: string;
  cancelados: number;
  telefones: string[];
  push: ResultadoEnvio;
}

/** Lê a chave privada do Firebase (JSON do SDK Admin) das variáveis do servidor. */
function lerServiceAccount(): ServiceAccount | null {
  const bruto = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as ServiceAccount;
  } catch {
    return null;
  }
}

function base64url(texto: string): string {
  return Buffer.from(texto).toString("base64url");
}

/** Troca o JWT assinado por um access_token do OAuth2 (escopo FCM). */
async function obterAccessToken(sa: ServiceAccount): Promise<string> {
  if (!sa.client_email || !sa.private_key || !sa.token_uri) {
    throw new Error(
      "Service account incompleto (faltam client_email/private_key/token_uri).",
    );
  }
  const agora = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: sa.token_uri,
      iat: agora,
      exp: agora + 3600,
    }),
  );
  const assinaturaInput = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(assinaturaInput);
  signer.end();
  const assinatura = signer.sign(sa.private_key, "base64url");
  const jwt = `${assinaturaInput}.${assinatura}`;

  const resposta = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = (await resposta.json()) as { access_token?: string };
  if (!resposta.ok || !json.access_token) {
    throw new Error(`Falha ao obter token do Firebase (${resposta.status}).`);
  }
  return json.access_token;
}

/**
 * Envia o aviso de cancelamento para todos os tokens vinculados aos telefones
 * informados. Se o FIREBASE_SERVICE_ACCOUNT ainda não estiver configurado,
 * retorna sem_configuracao: true (o cancelamento já aconteceu — só o aviso
 * fica pendente).
 */
export const enviarParaTelefones = action({
  args: {
    telefones: v.array(v.string()),
    data: v.optional(v.string()),
  },
  handler: async (ctx, { telefones, data }): Promise<ResultadoEnvio> => {
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
      };
    }

    const sa = lerServiceAccount();
    if (!sa || !sa.project_id) {
      return {
        enviados: 0,
        falhas: 0,
        telefones: limpos,
        sem_configuracao: true,
        data: data ?? null,
      };
    }

    // Junta todos os tokens dos telefones afetados (um cliente pode ter vários)
    const docs = await ctx.runQuery(api.pushTokens.listarPorTelefones, {
      telefones: limpos,
    });
    const tokens = new Set(docs.map((d) => d.token));
    if (tokens.size === 0) {
      return {
        enviados: 0,
        falhas: 0,
        telefones: limpos,
        sem_configuracao: false,
        data: data ?? null,
      };
    }

    const accessToken = await obterAccessToken(sa);
    const url = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;

    let enviados = 0;
    let falhas = 0;
    const fila = [...tokens];
    // Lote de 10 por vez para não estourar o FCM nem o runtime
    for (let i = 0; i < fila.length; i += 10) {
      const lote = fila.slice(i, i + 10);
      const resultados = await Promise.all(
        lote.map(async (token) => {
          const resposta = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              message: {
                token,
                notification: { title: TITULO_AVISO, body: CORPO_AVISO },
                data: {
                  tipo: "cancelamento",
                  url: "/reagendar",
                  ...(data ? { dia: data } : {}),
                },
              },
            }),
          });
          if (resposta.ok) return true;
          if (resposta.status === 404 || resposta.status === 410) {
            // Token inválido/revogado → limpa da base para não reenviar
            await ctx.runMutation(api.pushTokens.remover, { token });
          }
          return false;
        }),
      );
      enviados += resultados.filter(Boolean).length;
      falhas += resultados.filter((r) => !r).length;
    }

    return {
      enviados,
      falhas,
      telefones: limpos,
      sem_configuracao: false,
      data: data ?? null,
    };
  },
});

/** Cancela um dia inteiro (mutation) + notifica os afetados (FCM). */
export const cancelarDiaCompleto = action({
  args: { data: v.string() },
  handler: async (ctx, { data }): Promise<ResultadoCancelamento> => {
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
