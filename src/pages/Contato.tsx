import { Link } from "react-router-dom";
import {
  AtSign,
  CalendarCheck,
  Camera,
  Clock,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useConfiguracao } from "@/hooks/useConfiguracao";
import { useBarbearia } from "@/hooks/useBarbearia";

function normalizarTelefone(telefone: string | null | undefined): string {
  const digitos = (telefone ?? "(00) 00000-0000").replace(/\D/g, "");
  if (digitos.length === 0) return "5500000000000";
  return digitos.length >= 11 ? `55${digitos.slice(-11)}` : `55${digitos}`;
}

const MENSAGEM = encodeURIComponent(
  "Olá! Vim pelo aplicativo da Barbearia Neto e gostaria de mais informações.",
);

export function Contato() {
  const { nomeBarbearia, horarioFuncionamento } = useConfiguracao();
  const { barbearia } = useBarbearia();

  const telefoneExibicao = barbearia?.telefone ?? "(00) 00000-0000";
  const whats = `https://wa.me/${normalizarTelefone(barbearia?.telefone)}?text=${MENSAGEM}`;

  const instagram = barbearia?.instagram?.trim();
  const instagramHref = instagram
    ? `https://instagram.com/${instagram.replace(/^@/, "")}`
    : "#";

  return (
    <div className="min-h-screen bg-black">
      {/* Cabeçalho */}
      <section className="border-b border-border/60 bg-gradient-to-b from-[#120303] to-black pt-14 pb-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="animate-slide-up max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-red-500 uppercase">
              Fale com a gente
            </p>
            <h1 className="font-display mt-3 text-4xl font-extrabold text-white sm:text-5xl">
              Contato &amp; <span className="text-gradient-red">localização</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Dúvidas, horários ou agendamentos especiais? Fale direto com a{" "}
              {nomeBarbearia}.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        {/* Cards compactos: WhatsApp · Instagram · Localização & Horário */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Reveal>
            <a
              href={whats}
              target="_blank"
              rel="noopener noreferrer"
              className="red-ring-hover flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10">
                <MessageCircle className="size-4 text-red-500" />
              </div>
              <p className="font-display text-[11px] font-bold tracking-widest text-red-500 uppercase">
                WhatsApp
              </p>
              <p className="text-sm font-medium text-white">{telefoneExibicao}</p>
              <p className="text-xs text-muted-foreground">
                Resposta rápida — toque para chamar.
              </p>
            </a>
          </Reveal>

          <Reveal delay={80}>
            <a
              href={instagramHref}
              target={instagram ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="red-ring-hover flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10">
                <Camera className="size-4 text-red-500" />
              </div>
              <p className="font-display text-[11px] font-bold tracking-widest text-red-500 uppercase">
                Instagram
              </p>
              <p className="text-sm font-medium text-white">
                {instagram ? `@${instagram.replace(/^@/, "")}` : "barbearianeto"}
              </p>
              <p className="text-xs text-muted-foreground">
                Bastidores, novidades e cortes do dia.
              </p>
            </a>
          </Reveal>

          <Reveal delay={160}>
            <div className="red-ring-hover flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10">
                <MapPin className="size-4 text-red-500" />
              </div>
              <p className="font-display text-[11px] font-bold tracking-widest text-red-500 uppercase">
                Localização &amp; horário
              </p>
              <p className="text-sm font-medium text-white">
                {barbearia?.endereco ?? "Rua Exemplo, 123 — Centro"}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5 shrink-0" />
                {horarioFuncionamento ?? "Terça a Sábado — 09h às 19h"}
              </p>
            </div>
          </Reveal>
        </div>

        {/* CTA WhatsApp */}
        <Reveal className="mt-8">
          <div className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-r from-[#180505] to-black p-6 sm:p-8">
            <div className="pointer-events-none absolute -top-20 right-0 h-48 w-72 rounded-full bg-red-500/12 blur-3xl" />
            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
                  <MessageCircle className="size-5 text-red-500" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-white">
                    Prefere conversar?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Chame no WhatsApp e fale com nossa equipe agora mesmo.
                  </p>
                </div>
              </div>
              <Button asChild variant="gold">
                <a href={whats} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  Chamar no WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Redes sociais */}
        <Reveal className="mt-8">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-7 text-center">
            <Sparkles className="size-5 text-red-500" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Siga a {nomeBarbearia}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Bastidores, novidades e cortes do dia.
              </p>
            </div>
            <div className="flex gap-3">
              {[
                { icon: Camera, label: "Instagram", href: instagramHref },
                {
                  icon: AtSign,
                  label: "E-mail",
                  href: "mailto:contato@barbearianeto.com.br",
                },
                { icon: MessageCircle, label: "WhatsApp", href: whats },
              ].map((rede) => (
                <a
                  key={rede.label}
                  href={rede.href}
                  aria-label={rede.label}
                  target={rede.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-red-500/60 hover:text-red-400"
                >
                  <rede.icon className="size-4" />
                </a>
              ))}
            </div>
            <div className="mt-1">
              <Button asChild variant="outline">
                <Link to="/agendamento">
                  <CalendarCheck className="size-4" />
                  Agendar um horário
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
