import { useCallback, useState } from "react";

const CHAVE = "nb_admin_autenticado";
const CHAVE_CREDS = "nb_admin_creds";

export interface CredenciaisAdmin {
  usuario: string;
  senha: string;
}

/** Lê as credenciais do admin salvas no aparelho (usadas pela tela Equipe). */
export function obterCredenciaisAdmin(): CredenciaisAdmin | null {
  try {
    const raw = localStorage.getItem(CHAVE_CREDS);
    if (!raw) return null;
    const d = JSON.parse(raw) as CredenciaisAdmin;
    if (
      typeof d?.usuario === "string" &&
      typeof d?.senha === "string" &&
      d.usuario &&
      d.senha
    ) {
      return d;
    }
    return null;
  } catch {
    return null;
  }
}

export function salvarCredenciaisAdmin(usuario: string, senha: string) {
  localStorage.setItem(CHAVE_CREDS, JSON.stringify({ usuario, senha }));
}

export function limparCredenciaisAdmin() {
  localStorage.removeItem(CHAVE_CREDS);
}

/**
 * Sessão do painel administrativo (/admin). A senha é conferida no
 * backend (Convex); aqui guardamos o "cadeado aberto" e as credenciais
 * no aparelho (necessárias para gerenciar a equipe na tela Equipe).
 */
export function useAdminAuth() {
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CHAVE) === "1";
    } catch {
      return false;
    }
  });

  const entrar = useCallback((usuario: string, senha: string) => {
    localStorage.setItem(CHAVE, "1");
    salvarCredenciaisAdmin(usuario, senha);
    setAutenticado(true);
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE);
    limparCredenciaisAdmin();
    setAutenticado(false);
  }, []);

  return { autenticado, entrar, sair };
}
