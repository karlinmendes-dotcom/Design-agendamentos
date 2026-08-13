import { useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Mensagem {
  papel: "usuario" | "assistente";
  texto: string;
  erro?: boolean;
}

const SUGESTOES = [
  "Quais são os horários de atendimento?",
  "Como funciona se eu precisar desmarcar?",
  "Estou com procedimento de outra profissional, e agora?",
  "Como faço para agendar um horário?",
  "Onde estão as regras completas?",
];

/** Extrai a mensagem amigável de um erro de ação (ConvexError inclui data). */
function mensagemDeErro(err: unknown): string {
  const dados = (err as { data?: unknown } | null)?.data;
  if (typeof dados === "string" && dados.length > 0) return dados;
  return err instanceof Error && err.message
    ? err.message
    : "Não consegui responder agora. Tente novamente.";
}

/**
 * Atendente virtual "Nati" — chat de orientação para as CLIENTES (parte de
 * visualização do site, fora do dashboard). Só orienta sobre regras,
 * políticas, horários e funcionamento do atendimento; não executa nenhuma
 * alteração no sistema.
 */
export function AtendenteCliente() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const perguntar = useAction(api.atendente.perguntar);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, pensando, aberto]);

  const enviar = async (pergunta?: string) => {
    const p = (pergunta ?? texto).trim();
    if (!p || pensando) return;
    setTexto("");
    const historico: { papel: "usuario" | "assistente"; texto: string }[] =
      mensagens.slice(-10).map((m) => ({ papel: m.papel, texto: m.texto }));
    setMensagens((m) => [...m, { papel: "usuario", texto: p }]);
    setPensando(true);
    try {
      const resposta = await perguntar({ pergunta: p, historico });
      setMensagens((m) => [...m, { papel: "assistente", texto: resposta }]);
    } catch (err) {
      setMensagens((m) => [
        ...m,
        { papel: "assistente", texto: mensagemDeErro(err), erro: true },
      ]);
    } finally {
      setPensando(false);
    }
  };

  return (
    <>
      {/* Botão flutuante — lado esquerdo (o WhatsApp fica à direita) */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={aberto ? "Fechar atendente" : "Abrir atendente"}
        className={cn(
          "fixed right-4 bottom-24 z-40 flex size-14 items-center justify-center rounded-full border border-gold-light/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 md:bottom-6",
          aberto
            ? "bg-charcoal text-cream"
            : "bg-gold-gradient text-gold-light animate-glow-pulse",
        )}
      >
        {aberto ? <X className="size-6" /> : <Sparkles className="size-6" />}
      </button>

      {/* Painel de chat */}
      {aberto && (
        <div className="fixed right-4 bottom-24 z-50 flex h-[30rem] w-[22.5rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] md:bottom-6">
          {/* Cabeçalho */}
          <div className="bg-gold-gradient flex items-center gap-3 px-4 py-3.5">
            <span className="flex size-9 items-center justify-center rounded-full border border-gold-light/40 bg-black/25">
              <Bot className="size-5 text-gold-light" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-cream">
                Nati — Atendente virtual
              </p>
              <p className="truncate text-[11px] text-cream/70">
                Orienta sobre horários e regras de atendimento 💅
              </p>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-background/50 p-4">
            {mensagens.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  Olá! Eu sou a Nati 💅 Sou a atendente virtual do estúdio —
                  posso te orientar sobre horários, regras de agendamento e
                  funcionamento do atendimento. Como posso ajudar? ✨
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGESTOES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void enviar(s)}
                      className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-charcoal transition-colors hover:bg-gold/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mensagens.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.papel === "usuario" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    m.papel === "usuario"
                      ? "bg-gold-gradient text-cream"
                      : m.erro
                        ? "border border-destructive/40 bg-destructive/10 text-destructive"
                        : "border border-border/70 bg-muted/40 text-card-foreground",
                  )}
                >
                  {m.texto}
                </div>
              </div>
            ))}

            {pensando && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Consultando as informações do estúdio...
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </div>

          {/* Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void enviar();
            }}
            className="flex items-center gap-2 border-t border-border/70 bg-card p-3"
          >
            <Input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ex.: quais são os horários de hoje?"
              className="h-10 flex-1"
              maxLength={300}
              aria-label="Pergunta para a Nati"
            />
            <Button
              type="submit"
              size="icon"
              className="size-10 shrink-0"
              disabled={pensando || texto.trim().length < 3}
              aria-label="Enviar pergunta"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
