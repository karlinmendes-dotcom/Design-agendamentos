import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Megaphone,
  Send,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { erroMensagem } from "@/lib/convex";
import { useToast } from "@/contexts/ToastContext";

/**
 * Comunicados em massa — a dona escreve uma mensagem e envia por Web Push
 * para TODAS as clientes que autorizaram os avisos no celular (ex.: Dia das
 * Mães, promoção, aviso de férias). Reutiliza o motor de envio existente
 * (push.enviarParaTelefones) — zero custo extra, sem serviço novo.
 */
export function ComunicadosAdmin() {
  const telefones = useQuery(api.pushTokens.listarTelefones);
  const enviarParaTelefones = useAction(api.push.enviarParaTelefones);

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{
    enviados: number;
    falhas: number;
    sem_configuracao: boolean;
  } | null>(null);
  const { toast } = useToast();

  const destinatarios = telefones ?? [];
  const mensagemValida = mensagem.trim().length >= 3;

  const enviar = async () => {
    if (!mensagemValida || destinatarios.length === 0) return;
    setEnviando(true);
    setResultado(null);
    try {
      const r = await enviarParaTelefones({
        telefones: destinatarios,
        titulo:
          titulo.trim() ||
          "💌 Aviso do Studio Natália Braga",
        mensagem: mensagem.trim(),
        url: "/",
      });
      setResultado({
        enviados: r.enviados,
        falhas: r.falhas,
        sem_configuracao: r.sem_configuracao,
      });
      setConfirmando(false);
      if (r.enviados > 0) {
        toast("success", `Comunicado enviado para ${r.enviados} aparelho(s)! 💛`);
      } else if (r.sem_configuracao) {
        toast("error", "Faltou a chave VAPID_PRIVATE_KEY no Convex — nada foi enviado.");
      } else {
        toast("error", "Nenhum aparelho recebeu o comunicado.");
      }
    } catch (err) {
      toast("error", erroMensagem(err, "Erro ao enviar o comunicado."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-gold-light/10 text-gold-light">
            <Megaphone className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold">Comunicados</h1>
            <p className="text-xs text-muted-foreground">
              Escreva uma mensagem e envie para todas as clientes de uma vez
              (ex.: Dia das Mães, promoção, férias).
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-xs text-muted-foreground">
          <Users className="size-4 shrink-0 text-gold-light" />
          {telefones === undefined ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" />
              Contando destinatárias...
            </span>
          ) : destinatarios.length === 0 ? (
            "Nenhuma cliente autorizou os avisos ainda — o comunicado não teria para quem ir."
          ) : (
            <>
              <strong className="text-foreground">{destinatarios.length}</strong>
              {destinatarios.length === 1
                ? " cliente cadastrada"
                : " clientes cadastradas"}{" "}
              vão receber (só quem autorizou os avisos no celular).
            </>
          )}
        </div>
      </div>

      {/* Redação */}
      <div className="space-y-4 rounded-xl border border-border/60 bg-card p-4 sm:p-5">
        <div className="space-y-1.5">
          <label htmlFor="titulo" className="text-sm font-semibold text-foreground">
            Título <span className="text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={60}
            placeholder="Ex.: Dia das Mães 💐"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            Aparece como o nome da notificação. Vazio usa "💌 Aviso do Studio
            Natália Braga".
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="mensagem" className="text-sm font-semibold text-foreground">
            Mensagem
          </label>
          <textarea
            id="mensagem"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={4}
            maxLength={300}
            placeholder="Ex.: 💐 Dia das Mães chegando! Garanta o seu horário com desconto especial. Toque para agendar."
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Chega pronta na tela do celular dela.</span>
            <span className={mensagem.length > 280 ? "font-semibold text-gold-light" : ""}>
              {mensagem.length}/300
            </span>
          </p>
        </div>

        {!confirmando ? (
          <Button
            type="button"
            onClick={() => setConfirmando(true)}
            disabled={!mensagemValida || destinatarios.length === 0 || enviando}
            className="gap-2"
          >
            <Send className="size-4" />
            Enviar para {destinatarios.length === 0 ? "..." : destinatarios.length}{" "}
            {destinatarios.length === 1 ? "cliente" : "clientes"}
          </Button>
        ) : (
          <div className="space-y-3 rounded-lg border border-gold/30 bg-gold-light/5 p-4">
            <p className="text-sm text-foreground">
              ⚠️ <strong>Confirmar envio</strong> — a mensagem vai{" "}
              <strong>agora</strong> para os celulares de{" "}
              <strong>{destinatarios.length}</strong>{" "}
              {destinatarios.length === 1 ? "cliente" : "clientes"} que
              autorizaram os avisos. Não dá para desfazer depois.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={enviar}
                disabled={enviando}
                className="gap-2"
              >
                {enviando ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Sim, enviar agora
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmando(false)}
                disabled={enviando}
                className="gap-2"
              >
                <XCircle className="size-4" />
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Resultado do envio */}
      {resultado && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            resultado.falhas === 0 && resultado.enviados > 0
              ? "border-green-600/30 bg-green-500/10"
              : "border-gold/30 bg-gold-light/10"
          }`}
        >
          {resultado.falhas === 0 && resultado.enviados > 0 ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
          ) : (
            <XCircle className="mt-0.5 size-5 shrink-0 text-gold-light" />
          )}
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              {resultado.enviados > 0
                ? `Comunicado entregue em ${resultado.enviados} aparelho(s)! 💛`
                : "Nenhum aparelho recebeu."}
            </p>
            <p className="text-xs text-muted-foreground">
              {resultado.sem_configuracao
                ? "A chave VAPID_PRIVATE_KEY está ausente no Convex — configure nas variáveis de ambiente."
                : resultado.falhas > 0
                  ? `${resultado.falhas} aparelho(s) falhou — provavelmente revogou a permissão ou saiu do ar.`
                  : "Quem autorizou os avisos recebeu na hora, mesmo com o site fechado."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
