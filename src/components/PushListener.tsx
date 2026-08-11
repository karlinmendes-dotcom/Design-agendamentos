import { useEffect, useState } from "react";
import { observarMensagens, registrarSW } from "@/lib/firebase";
import { ReagendarModal } from "@/components/ReagendarModal";

/**
 * Montado na área do cliente: registra o service worker do Firebase e escuta
 * mensagens enquanto o app está ABERTO. Quando chega um aviso de
 * cancelamento, mostra o modal de reagendamento na hora (sem depender do pop
 * do navegador, que não aparece com a página em foco).
 */
export function PushListener() {
  const [aviso, setAviso] = useState<{ dia?: string } | null>(null);

  useEffect(() => {
    let cancelar: (() => void) | undefined;
    let ativo = true;

    void (async () => {
      const swOk = await registrarSW();
      if (!swOk || !ativo) return;
      const unsub = await observarMensagens((payload) => {
        const dados = (payload.data ?? {}) as Record<string, string>;
        if (dados.tipo === "cancelamento") {
          setAviso({ dia: dados.dia });
        }
      });
      if (!ativo) {
        unsub();
        return;
      }
      cancelar = unsub;
    })();

    return () => {
      ativo = false;
      cancelar?.();
    };
  }, []);

  return (
    <ReagendarModal
      aberto={aviso !== null}
      onFechar={() => setAviso(null)}
      dia={aviso?.dia}
    />
  );
}
