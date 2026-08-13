import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  observarMensagens,
  registrarSW,
  obterTokenPush,
} from "@/lib/firebase";
import { useIdentidadeCliente } from "@/hooks/useIdentidadeCliente";
import { onlyDigits } from "@/utils/phone";
import { ReagendarModal } from "@/components/ReagendarModal";

/**
 * Montado na área do cliente: registra o service worker de Web Push e
 * RE-SINCRONIZA a inscrição push deste aparelho sempre que o app abre com uma
 * conta salva (nome + WhatsApp). Assim, após trocas de infraestrutura ou
 * atualizações, o aviso continua chegando sem a cliente precisar refazer o
 * cadastro.
 *
 * A notificação em si é exibida pelo próprio service worker (pop do
 * navegador, mesmo com o app aberto); o modal de reagendamento é preservado
 * para quando o app estiver em foco.
 */
export function PushListener() {
  const { identidade } = useIdentidadeCliente();
  const registrarTokenPush = useMutation(api.pushTokens.registrar);
  const [aviso, setAviso] = useState<{ dia?: string } | null>(null);

  useEffect(() => {
    let cancelar: (() => void) | undefined;
    let ativo = true;

    void (async () => {
      const swOk = await registrarSW();
      if (!swOk || !ativo) return;

      // Re-registra a inscrição push deste aparelho (Web Push padrão)
      if (identidade?.telefone) {
        try {
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const sub = await obterTokenPush();
            if (sub) {
              await registrarTokenPush({
                token: sub,
                telefone: onlyDigits(identidade.telefone),
              });
            }
          }
        } catch {
          // silencioso — a re-sincronização é tentada na próxima abertura
        }
      }

      if (!ativo) return;
      const unsub = await observarMensagens(() => {});
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
  }, [identidade?.telefone, registrarTokenPush]);

  return (
    <ReagendarModal
      aberto={aviso !== null}
      onFechar={() => setAviso(null)}
      dia={aviso?.dia}
    />
  );
}
