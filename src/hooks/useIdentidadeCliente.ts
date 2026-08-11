import { useCallback, useState } from "react";

export interface IdentidadeCliente {
  nome: string;
  /** Telefone apenas com dígitos (ex.: 11988887766). */
  telefone: string;
}

const CHAVE = "nb_cliente_identidade";

function ler(): IdentidadeCliente | null {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (!raw) return null;
    const d = JSON.parse(raw) as IdentidadeCliente;
    if (
      typeof d?.nome === "string" &&
      typeof d?.telefone === "string" &&
      d.nome.trim().length >= 2 &&
      d.telefone.length > 0
    ) {
      return d;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Identidade da cliente no aparelho (nome + telefone) — a "porta de
 * entrada" do app. Fica no localStorage para a pessoa não digitar de novo
 * toda vez que abrir o site.
 */
export function useIdentidadeCliente() {
  const [identidade, setIdentidade] = useState<IdentidadeCliente | null>(() =>
    ler(),
  );

  const salvar = useCallback((nome: string, telefone: string) => {
    const d: IdentidadeCliente = { nome: nome.trim(), telefone };
    localStorage.setItem(CHAVE, JSON.stringify(d));
    setIdentidade(d);
  }, []);

  const limpar = useCallback(() => {
    localStorage.removeItem(CHAVE);
    setIdentidade(null);
  }, []);

  return { identidade, salvar, limpar };
}
