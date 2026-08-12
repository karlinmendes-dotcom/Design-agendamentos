import { useEffect, useRef, useState } from "react";
import { useAction, useQuery } from "convex/react";
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
  "Quantos agendamentos tenho hoje?",
  "Qual foi a melhor cliente do mês?",
  "Qual serviço mais vende?",
  "Quanto faturo nesta semana?",
];

/** Extrai a mensagem amigável de um erro de ação (ConvexError inclui data). */
function mensagemDeErro(err: unknown): string {
  const dados = (err as { data?: unknown } | null)?.data;
  if (typeof dados === "string" && dados.length > 0) return dados;
  return err instanceof Error && err.message
    ? err.message
    : "Não consegui responder agora. Tente novamente.";
}

export function AssistenteAdmin() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const perguntar = useAction(api.gemini.perguntar);
  const uso = useQuery(api.gemini.uso);
  const fimRef = useRef<HTMLDivElement>(null);

  const restantes = uso ? Math.max(0, uso.limite - uso.usados) : null;
  const pctRestante =
    uso && uso.limite > 0 ? Math.round((restantes! / uso.limite) * 100) : 100;

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, pensando, aberto]);

  const enviar = async (pergunta?: string) => {
    const p = (pergunta ?? texto).trim();
    if (!p || pensando) return;
    setTexto("");
    // Histórico (sem a pergunta atual) — necessário para o protocolo de
    // confirmação: a dona pede → a assistente pergunta → a dona responde
    // "Sim" → a assistente executa de fato na próxima mensagem.
    const historico: { papel: "usuario" | "assistente"; texto: string }[] =
      mensagens.slice(-12).map((m) => ({ papel: m.papel, texto: m.texto }));
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
      {/* Botão flutuante — só no admin */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={aberto ? "Fechar assistente" : "Abrir assistente"}
        className={cn(
          "fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full border border-gold-light/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105",
          aberto
            ? "bg-charcoal text-cream"
            : "bg-gold-gradient text-gold-light animate-glow-pulse",
        )}
      >
        {aberto ? <X className="size-6" /> : <Sparkles className="size-6" />}
      </button>

      {/* Painel de chat */}
      {aberto && (
        <div className="fixed right-5 bottom-24 z-50 flex h-[30rem] w-[22.5rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]">
          {/* Cabeçalho */}
          <div className="bg-gold-gradient flex items-center gap-3 px-4 py-3.5">
            <span className="flex size-9 items-center justify-center rounded-full border border-gold-light/40 bg-black/25">
              <Bot className="size-5 text-gold-light" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-cream">
                Assistente da Natália
              </p>
              <p className="truncate text-[11px] text-cream/70">
                Responde só com os dados do estúdio
              </p>
            </div>
          </div>

          {/* Barrinha de cota mensal da assistente */}
          {uso && (
            <div className="border-b border-border/60 bg-card/70 px-4 py-2.5">
              <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Sparkles className="size-3 shrink-0 text-gold" />
                  <span className="truncate">Assistente pessoal · este mês</span>
                </span>
                <span className="shrink-0 font-semibold text-charcoal">
                  {restantes} de {uso.limite} restantes
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    pctRestante <= 20 ? "bg-destructive" : "bg-gold-gradient",
                  )}
                  style={{ width: `${pctRestante}%` }}
                />
              </div>
              {restantes === 0 && (
                <p className="mt-1 text-[10px] text-destructive">
                  Cota do mês esgotada — renova no próximo mês. 💛
                </p>
              )}
            </div>
          )}

          {/* Mensagens */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-background/50 p-4">
            {mensagens.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  Olá! 👋 Pergunte sobre a agenda, os clientes, os serviços ou
                  os valores — eu respondo usando apenas os dados do seu
                  estúdio.
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
                  Consultando os dados do estúdio...
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
              placeholder="Ex.: quem está agendado amanhã?"
              className="h-10 flex-1"
              maxLength={300}
              aria-label="Pergunta para a assistente"
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
