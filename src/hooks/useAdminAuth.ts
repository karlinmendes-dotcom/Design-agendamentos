import { useCallback, useState } from "react";

const CHAVE = "nb_admin_autenticado";

/**
 * Sessão do painel administrativo (/admin). A senha é conferida no
 * backend (Convex); aqui só guardamos o "cadeado aberto" no aparelho.
 */
export function useAdminAuth() {
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CHAVE) === "1";
    } catch {
      return false;
    }
  });

  const entrar = useCallback(() => {
    localStorage.setItem(CHAVE, "1");
    setAutenticado(true);
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE);
    setAutenticado(false);
  }, []);

  return { autenticado, entrar, sair };
}
