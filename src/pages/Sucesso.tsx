import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarCheck, CheckCircle2, Home, MessageCircle, PlusCircle } from "lucide-react";
import { useEffect } from "react";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { formatBRL, formatMinutes } from "@/utils/format";
import { formatDateWeekday } from "@/utils/date";
import {
  linkConfirmacaoWhatsApp,
  montarConfirmacaoWhatsApp,
} from "@/utils/whatsapp";
import type { Agendamento } from "@/types";

interface SucessoState {
  agendamento?: Agendamento;
  demo?: boolean;
}

export function Sucesso() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as SucessoState;
  const agendamento = state.agendamento;

  useEffect(() => {
    if (!agendamento) {
      navigate("/", { replace: true });
    }
  }, [agendamento, navigate]);

  // Ao confirmar, abre o WhatsApp do cliente com a confirmação pronta
  // (se o navegador bloquear, o botão na tela resolve com um toque)
  useEffect(() => {
    if (!agendamento) return;
    const link = linkConfirmacaoWhatsApp(agendamento);
    if (link) {
      const janela = window.open(link, "_blank");
      if (!janela) {
        // pop-up bloqueado — o botão abaixo continua disponível
      }
    }
  }, [agendamento]);

  if (!agendamento) return null;

  const linkWhats = linkConfirmacaoWhatsApp(agendamento);

  return (
    <div className="min-h-screen bg-black">
      <section className="mx-auto max-w-xl px-4 pt-16 pb-20 sm:px-6">
        <div className="animate-scale-in overflow-hidden rounded-2xl border border-red-500/30 bg-card shadow-[0_20px_60px_-20px_rgba(225,6,0,0.3)]">
          <div className="bg-red-gradient px-6 py-8 text-center text-white">
            <CheckCircle2 className="mx-auto size-12" />
            <h1 className="font-display mt-3 text-3xl font-black">
              Agendamento confirmado!
            </h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Sua cadeira está garantida. Te esperamos!
            </p>
          </div>

          <div className="space-y-4 px-6 py-8">
            <div className="rounded-xl border border-border bg-background p-5">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Serviço</dt>
                  <dd className="text-right font-semibold text-white">
                    {agendamento.servico?.nome ?? "Serviço"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Duração</dt>
                  <dd className="font-semibold text-white">
                    {formatMinutes(agendamento.servico?.duracao_minutos ?? 30)}
                  </dd>
                </div>
                {agendamento.barbeiro?.nome && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Barbeiro</dt>
                    <dd className="font-semibold text-white">
                      {agendamento.barbeiro.nome}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Data</dt>
                  <dd className="font-semibold text-white">
                    {formatDateWeekday(agendamento.data)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Horário</dt>
                  <dd className="font-semibold text-white">{agendamento.horario}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd className="text-right font-semibold text-white">
                    {agendamento.cliente?.nome}
                    <br />
                    <span className="text-xs font-normal text-muted-foreground">
                      {agendamento.cliente?.telefone}
                    </span>
                  </dd>
                </div>
                <div className="hairline my-1" />
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Valor</dt>
                  <dd className="font-display text-xl font-bold text-gradient-red">
                    {formatBRL(agendamento.servico?.preco ?? 0)}
                  </dd>
                </div>
              </dl>
            </div>

            {state.demo && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
                ⚠️ Modo demonstração — conecte o Supabase para que os
                agendamentos sejam salvos no banco de dados.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {linkWhats && (
                <>
                  <Button
                    asChild
                    variant="gold"
                    size="lg"
                    className="w-full"
                  >
                    <a
                      href={linkWhats}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-5" />
                      Receber confirmação no WhatsApp
                    </a>
                  </Button>
                  <p className="rounded-xl border border-border bg-background px-4 py-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                    {montarConfirmacaoWhatsApp(agendamento)}
                  </p>
                </>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline">
                  <Link to="/servicos">
                    <PlusCircle className="size-4" />
                    Novo serviço
                  </Link>
                </Button>
                <Button asChild variant="gold">
                  <Link to="/">
                    <Home className="size-4" />
                    Página inicial
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <CalendarCheck className="size-4 text-red-500" />
          Dúvidas? Fale conosco no WhatsApp (00) 00000-0000
        </p>
      </section>

      <Footer />
    </div>
  );
}
