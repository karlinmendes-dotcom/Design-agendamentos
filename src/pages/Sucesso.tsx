import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarCheck, CheckCircle2, Home, MessageCircle, PlusCircle } from "lucide-react";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { formatBRL, formatMinutes } from "@/utils/format";
import { formatDateWeekday } from "@/utils/date";
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

  if (!agendamento) return null;

  const telefoneWhats =
    agendamento.cliente?.telefone?.replace(/\D/g, "") ?? "";

  return (
    <div className="bg-texture min-h-screen bg-charcoal">
      <Header />

      <section className="mx-auto max-w-xl px-4 pt-32 pb-20 sm:px-6">
        <div className="animate-scale-in overflow-hidden rounded-2xl border border-gold/30 bg-card shadow-[0_20px_60px_-20px_rgba(201,162,39,0.25)]">
          <div className="bg-gold-gradient px-6 py-8 text-center text-charcoal">
            <CheckCircle2 className="mx-auto size-12" />
            <h1 className="font-display mt-3 text-3xl font-black">
              Agendamento confirmado!
            </h1>
            <p className="mt-1 text-sm font-medium text-charcoal/80">
              Sua cadeira está garantida. Te esperamos!
            </p>
          </div>

          <div className="space-y-4 px-6 py-8">
            <div className="rounded-xl border border-border bg-background p-5">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Serviço</dt>
                  <dd className="text-right font-semibold text-cream">
                    {agendamento.servico?.nome ?? "Serviço"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Duração</dt>
                  <dd className="font-semibold text-cream">
                    {formatMinutes(agendamento.servico?.duracao_minutos ?? 30)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Data</dt>
                  <dd className="font-semibold text-cream">
                    {formatDateWeekday(agendamento.data)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Horário</dt>
                  <dd className="font-semibold text-cream">{agendamento.horario}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd className="text-right font-semibold text-cream">
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
                  <dd className="font-display text-xl font-bold text-gradient-gold">
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
              {telefoneWhats && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  onClick={(e) => e.preventDefault()}
                >
                  <a href="#" aria-disabled="true">
                    <MessageCircle className="size-4" />
                    Lembrete por WhatsApp (em breve)
                  </a>
                </Button>
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
          <CalendarCheck className="size-4 text-gold" />
          Dúvidas? Fale conosco no WhatsApp (00) 00000-0000
        </p>
      </section>

      <Footer />
    </div>
  );
}
