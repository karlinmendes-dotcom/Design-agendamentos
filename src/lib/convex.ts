import { ConvexReactClient } from "convex/react";
import { ConvexError } from "convex/values";

const url = import.meta.env.VITE_CONVEX_URL;

/** Verdadeiro quando o Convex foi configurado no .env. */
export const isConvexConfigured = Boolean(url);

/**
 * Client único do app. Sem VITE_CONVEX_URL usamos um placeholder apenas para
 * montar o provider com segurança — os hooks caem no modo demonstração.
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
