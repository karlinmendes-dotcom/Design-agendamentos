import { ConvexReactClient } from "convex/react";
import { ConvexError } from "convex/values";

const url = import.meta.env.VITE_CONVEX_URL;

/**
 * Client único do app. `VITE_CONVEX_URL` é obrigatória (Vercel prod/preview);
 * o placeholder apenas evita crash no bootstrap caso a variável falte.
 */
export const convexClient = new ConvexReactClient(
  url ?? "https://nao-configurado.convex.cloud",
);

/** Extrai a mensagem amigável de um erro (inclusive ConvexError). */
export function erroMensagem(err: unknown, fallback: string): string {
  if (err instanceof ConvexError) {
    const data = err.data;
    if (typeof data === "string" && data.length > 0) return data;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}
