/**
 * Notificações Web Push — protocolo padrão do navegador (VAPID), SEM Firebase.
 *
 * O pop chega via Push API + service worker (public/firebase-messaging-sw.js),
 * que funciona em todos os navegadores modernos (Chrome, Edge, Firefox,
 * Samsung Internet e Safari — no iPhone exige "Adicionar à tela de início").
 *
 * A chave pública VAPID é pública por design (fica no navegador). A PRIVADA
 * (VAPID_PRIVATE_KEY) vive SÓ no servidor do Convex (src/convex/push.ts).
 */
const VAPID_KEY_PADRAO =
  "BNAT1khI4o27ov6hnkRRmMWnRffnkDc7Dq80pU4MKaHxqOZqRJHnx7zWtcaOYbBEJKvpCMaUonDKub8RSKJ2BjQ";

export const VAPID_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ?? VAPID_KEY_PADRAO;

/** Converte a chave pública VAPID (base64url) para Uint8Array (exigência da API). */
function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const comPadding = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const bin = atob(comPadding);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

let suportado: boolean | null = null;

/** O navegador suporta Web Push? (HTTPS + service worker + Push API) */
export async function firebaseDisponivel(): Promise<boolean> {
  if (suportado !== null) return suportado;
  // ⚠️ Web Push só funciona em HTTPS (ou localhost). Sem HTTPS falha em
  // silêncio — avisamos no console (produção Vercel já serve por HTTPS).
  if (typeof window !== "undefined" && !window.isSecureContext) {
    console.warn(
      "[push] Ambiente SEM HTTPS detectado — as notificações web não funcionarão. " +
        "Acesse o site por https:// em produção.",
    );
  }
  suportado =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;
  return suportado;
}

/** Registra o service worker que recebe o pop mesmo com o app fechado. */
export async function registrarSW(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  try {
    await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    return true;
  } catch {
    return false;
  }
}

/**
 * Cria (ou reutiliza) a inscrição push do navegador e devolve a assinatura
 * como JSON — que é gravada no banco (pushTokens.token) e usada pelo servidor
 * para entregar o aviso. Requer permissão de notificação concedida.
 */
export async function obterTokenPush(): Promise<string | null> {
  if (!VAPID_KEY) return null;
  if (!(await firebaseDisponivel())) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
    });
    return JSON.stringify(sub.toJSON());
  } catch {
    return null;
  }
}

/**
 * Remove a inscrição push deste aparelho (unsubscribe real do navegador).
 * Usado pelo botão "Parar notificações" da Política de Privacidade — após
 * remover do Convex, o navegador deixa de receber/envios de verdade.
 */
export async function cancelarInscricaoPush(): Promise<void> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
  } catch {
    // best-effort: se falhar, a remoção no banco (feita pela página) já
    // impede novos envios — o fluxo não quebra.
  }
}

/**
 * App aberto: a notificação é exibida pelo próprio service worker (o pop do
 * navegador aparece mesmo com a página em foco) — mantemos a assinatura por
 * compatibilidade com o PushListener, que não precisa mais de listener.
 */
export async function observarMensagens(
  _handler: (payload: { data?: Record<string, string> }) => void,
): Promise<() => void> {
  return () => {};
}
