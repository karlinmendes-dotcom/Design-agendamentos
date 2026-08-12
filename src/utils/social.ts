/**
 * Normaliza o Instagram para um link clicável.
 *
 * Aceita os dois formatos que a dona pode preencher:
 * - link completo: "https://www.instagram.com/nataliabraga_nail"
 * - apelido: "@nataliabraga_nail" ou "nataliabraga_nail"
 *
 * Retorna null quando não há nada utilizável (o chamador decide o fallback).
 */
export function linkInstagram(valor?: string | null): string | null {
  if (!valor) return null;
  const v = valor.trim();
  if (!v) return null;

  // Já é um link completo — usa como está (limpa só espaços/trailing slash)
  if (/^https?:\/\//i.test(v)) return v.replace(/\/+$/, "");

  // Apelido: remove @, espaços e barras → monta o perfil oficial
  const handle = v.replace(/^@+/, "").replace(/[\s/]+/g, "").trim();
  if (!handle) return null;
  return `https://instagram.com/${handle}`;
}
