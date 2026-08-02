import { Link } from "react-router-dom";
import {
  AtSign,
  CalendarCheck,
  Camera,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
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
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Phone,
              titulo: "Telefone",
              valor: telefoneExibicao,
              href: `tel:${telefoneExibicao.replace(/\D/g, "")}`,
            },
            {
              icon: MessageCircle,
              titulo: "WhatsApp",
              valor: "Resposta rápida",
              href: whats,
            },
            {
              icon: Clock,
              titulo: "Funcionamento",
              valor: horarioFuncionamento ?? "Terça a Sábado — 09h às 19h",
            },
            {
              icon: MapPin,
              titulo: "Endereço",
              valor: barbearia?.endereco ?? "Rua Exemplo, 123 — Centro",
            },
          ].map((item, i) => {
            const Conteudo = (
              <div className="red-ring-hover flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10">
                  <item.icon className="size-5 text-red-500" />
                </div>
                <p className="font-display text-sm font-bold tracking-widest text-red-500 uppercase">
                  {item.titulo}
                </p>
                <p className="text-sm text-muted-foreground">{item.valor}</p>
              </div>
            );
            return (
              <Reveal key={item.titulo} delay={i * 80}>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    {Conteudo}
                  </a>
                ) : (
                  Conteudo
                )}
              </Reveal>
            );
          })}
        </div>

        {/* CTA WhatsApp */}
        <Reveal className="mt-10">
          <div className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-r from-[#180505] to-black p-8 sm:p-10">
            <div className="pointer-events-none absolute -top-20 right-0 h-48 w-72 rounded-full bg-red-500/12 blur-3xl" />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
                  <MessageCircle className="size-7 text-red-500" />
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-white">
                    Prefere conversar?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Chame no WhatsApp e fale com nossa equipe agora mesmo.
                  </p>
                </div>
              </div>
              <Button asChild variant="gold" size="lg">
                <a href={whats} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-5" />
                  Chamar no WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Redes sociais */}
        <Reveal className="mt-10">
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8 text-center">
            <Sparkles className="size-6 text-red-500" />
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                Siga a {nomeBarbearia}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Bastidores, novidades e cortes do dia.
              </p>
            </div>
            <div className="flex gap-4">
              {[
                { icon: Camera, label: "Instagram", href: "#" },
                { icon: AtSign, label: "E-mail", href: "mailto:contato@barbearianeto.com.br" },
                { icon: MessageCircle, label: "WhatsApp", href: whats },
              ].map((rede) => (
                <a
                  key={rede.label}
                  href={rede.href}
                  aria-label={rede.label}
                  target={rede.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex size-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-red-500/60 hover:text-red-400"
                >
                  <rede.icon className="size-5" />
                </a>
              ))}
            </div>
            <div className="mt-2">
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
