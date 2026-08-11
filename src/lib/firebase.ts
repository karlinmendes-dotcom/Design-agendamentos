import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
  type MessagePayload,
} from "firebase/messaging";

/**
 * Firebase Cloud Messaging (web) — o "pop" de notificação que avisa a cliente
 * quando o horário dela é cancelado.
 *
 * A config abaixo é PÚBLICA por design (fica no navegador); sobrescreva via
 * VITE_FIREBASE_* quando quiser. A chave SECRETA (FIREBASE_SERVICE_ACCOUNT)
 * vive apenas no servidor do Convex (ver src/convex/push.ts).
 */
const CONFIG_PADRAO = {
  apiKey: "AIzaSyBoGKjUODcSC7DpeSMNW_ZWRp7uLKSzuuc",
  authDomain: "poupaps-cancelar.firebaseapp.com",
  projectId: "poupaps-cancelar",
  storageBucket: "poupaps-cancelar.firebasestorage.app",
  messagingSenderId: "66548106345",
  appId: "1:66548106345:web:008a42ef4cd41e5acecef8",
};

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? CONFIG_PADRAO.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? CONFIG_PADRAO.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? CONFIG_PADRAO.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? CONFIG_PADRAO.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ??
    CONFIG_PADRAO.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? CONFIG_PADRAO.appId,
};

/**
 * Chave pública do par de chaves Web Push (Firebase → Configurações do
 * projeto → Cloud Messaging → Certificados Web Push). Necessária para gerar o
 * token FCM. Pública por design — sobrescreva via VITE_FIREBASE_VAPID_KEY se
 * precisar (projeto poupaps-cancelar).
 */
const VAPID_KEY_PADRAO =
  "BPILKFOKhBqgOYngruXDKhuATn2hdQ08XqgAdV4kN9wFPlyhGd1F11kt9Gz5VyD6Vr0DzWG9o31NDYYI7gXVGp8";

export const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ?? VAPID_KEY_PADRAO;

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let suportado: boolean | null = null;

/** O navegador suporta FCM web? (https, service worker, etc.) */
export async function firebaseDisponivel(): Promise<boolean> {
  if (suportado !== null) return suportado;
  try {
    suportado = await isSupported();
  } catch {
    suportado = false;
  }
  return suportado;
}

async function obterMessaging(): Promise<Messaging | null> {
  if (messaging) return messaging;
  if (!(await firebaseDisponivel())) return null;
  app = app ?? initializeApp(FIREBASE_CONFIG);
  messaging = getMessaging(app);
  return messaging;
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

/** Pede o token FCM do navegador (requer permissão + VAPID configurado). */
export async function obterTokenPush(): Promise<string | null> {
  if (!VAPID_KEY) return null;
  const m = await obterMessaging();
  if (!m) return null;
  try {
    return (await getToken(m, { vapidKey: VAPID_KEY })) ?? null;
  } catch {
    return null;
  }
}

/** Escuta mensagens enquanto o app está aberto (mostra o aviso no app). */
export async function observarMensagens(
  handler: (payload: MessagePayload) => void,
): Promise<() => void> {
  const m = await obterMessaging();
  if (!m) return () => {};
  return onMessage(m, handler);
}
