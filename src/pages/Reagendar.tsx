import { Link } from "react-router-dom";
import { CalendarHeart } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { OpcoesRemarcar } from "@/components/OpcoesRemarcar";

/**
 * Rota pública aberta ao tocar na notificação de cancelamento (quando o app
 * estava fechado e o service worker abriu o site). Mostra o aviso padrão +
 * CTA direto para o calendário de agendamento.
 */
export function Reagendar() {
  return (
    <div className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <div className="animate-scale-in w-full rounded-2xl border border-border bg-card p-8 shadow-[0_24px_70px_-32px_rgba(47,74,62,0.45)]">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
            <CalendarHeart className="size-8 text-green-800" />
          </span>
          <h1 className="font-display mt-5 text-2xl font-black text-foreground">
            Sentimos muito! 💛
          </h1>
          <p className="font-script mt-1 text-lg text-green-800">
            um imprevisto na nossa agenda
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Houve um imprevisto técnico/pessoal no estabelecimento e seu
            horário precisou ser reagendado. Mas não se preocupe: sua vaga
            está garantida! Clique no botão abaixo para escolher uma nova data
            disponível sem custos adicionais.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <Button asChild variant="gold" size="lg" className="w-full">
              <Link to="/agendamento">
                <CalendarHeart className="size-5" />
                Escolher nova data
              </Link>
            </Button>
            <OpcoesRemarcar quantidade={4} />
            <Button asChild variant="ghost">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
