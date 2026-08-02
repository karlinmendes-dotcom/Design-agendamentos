import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CalendarCheck,
  CalendarDays,
  Clock,
  Scissors,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { useServicos } from "@/hooks/useServicos";
import { useConfiguracao } from "@/hooks/useConfiguracao";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80";

const PASSOS = [
  {
    icon: Scissors,
    titulo: "Escolha o serviço",
    descricao: "Corte, barba, pigmentação ou combo completo. Você decide o visual.",
  },
  {
    icon: CalendarDays,
    titulo: "Escolha data e horário",
    descricao: "Veja os horários disponíveis em tempo real e escolha o que couber na sua agenda.",
  },
  {
    icon: CalendarCheck,
    titulo: "Confirme em segundos",
    descricao: "Informe seu nome e telefone. Pronto: sua cadeira está garantida.",
  },
];

const DIFERENCIAIS = [
  {
    icon: Award,
    titulo: "Cortes na régua",
    descricao: "Precisão milimétrica com máquina, tesoura e navalha.",
  },
  {
    icon: Clock,
    titulo: "Pontualidade",
    descricao: "Respeitamos o seu horário — você nunca espera em vão.",
  },
  {
    icon: Sparkles,
    titulo: "Ambiente sofisticado",
    descricao: "Espaço pensado para você relaxar e sair renovado.",
  },
  {
    icon: Users,
    titulo: "Profissionais experientes",
    descricao: "Time qualificado e sempre atualizado nas tendências.",
  },
];

export function Home() {
  const { servicos } = useServicos(true);
  const { nomeBarbearia, horarioFuncionamento } = useConfiguracao();
  const [ctaVisivel, setCtaVisivel] = useState(false);

  useEffect(() => {
    const onScroll = () => setCtaVisivel(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-texture min-h-screen bg-charcoal">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/60" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-28 pb-20 sm:px-6">
          <div className="max-w-2xl">
            <div className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-light uppercase">
              <Sparkles className="size-3.5" />
              Agendamento online
            </div>

            <h1
              className="animate-slide-up mt-6 font-display text-5xl leading-[1.05] font-black text-cream sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "0.1s" }}
            >
              {nomeBarbearia.split(" ")[0]}{" "}
              <span className="text-gradient-gold">
                {nomeBarbearia.split(" ").slice(1).join(" ") || "Neto"}
              </span>
            </h1>

            <p
              className="animate-slide-up mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
              style={{ animationDelay: "0.2s" }}
            >
              Estilo, precisão e tradição no mesmo lugar. Agende seu horário em
              segundos e venha viver a experiência de um corte impecável.
            </p>

            <div
              className="animate-slide-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "0.3s" }}
            >
              <Button asChild variant="gold" size="lg" className="animate-glow-pulse">
                <Link to="/agendamento">
                  <CalendarCheck className="size-5" />
                  Agendar horário
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/servicos">
                  Ver serviços
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div
              className="animate-slide-up mt-12 flex flex-wrap gap-x-10 gap-y-6"
              style={{ animationDelay: "0.4s" }}
            >
              {[
                { valor: "10+", rotulo: "Anos de tradição" },
                { valor: "5k+", rotulo: "Cortes realizados" },
                {
                  valor: "4.9",
                  rotulo: "Avaliação dos clientes",
                  estrela: true,
                },
              ].map((item) => (
                <div key={item.rotulo}>
                  <p className="flex items-center gap-1.5 font-display text-3xl font-bold text-gold-light">
                    {item.valor}
                    {item.estrela && <Star className="size-5 fill-gold text-gold" />}
                  </p>
                  <p className="mt-0.5 text-xs tracking-wide text-muted-foreground uppercase">
                    {item.rotulo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVIÇOS ===== */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
              Nossos serviços
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-cream sm:text-4xl">
              O cuidado que o seu <span className="text-gradient-gold">visual</span> merece
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/servicos">
              Ver todos os serviços
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.slice(0, 6).map((servico, i) => (
            <div
              key={servico.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <ServiceCard servico={servico} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="border-y border-border/60 bg-coal">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
              Simples assim
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-cream sm:text-4xl">
              Agende em <span className="text-gradient-gold">3 passos</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PASSOS.map((passo, i) => (
              <div
                key={passo.titulo}
                className="animate-slide-up gold-ring-hover relative rounded-xl border border-border/80 bg-card p-7"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <span className="absolute top-5 right-6 font-display text-5xl font-black text-gold/10">
                  0{i + 1}
                </span>
                <div className="flex size-12 items-center justify-center rounded-lg border border-gold/30 bg-gold/10">
                  <passo.icon className="size-5 text-gold" />
                </div>
                <h3 className="font-display mt-5 text-xl font-bold text-cream">
                  {passo.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {passo.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DIFERENCIAIS ===== */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
            Por que a {nomeBarbearia.split(" ")[0]}?
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold text-cream sm:text-4xl">
            Uma experiência <span className="text-gradient-gold">acima da média</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DIFERENCIAIS.map((d, i) => (
            <div
              key={d.titulo}
              className="animate-slide-up rounded-xl border border-border/80 bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold/40"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-bronze/40 bg-bronze/10">
                <d.icon className="size-5 text-[#e0a06e]" />
              </div>
              <h3 className="font-display mt-4 text-lg font-bold text-cream">
                {d.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {d.descricao}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="animate-slide-up relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-graphite via-coal to-charcoal p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
          <User className="mx-auto size-8 text-gold" />
          <h2 className="font-display mx-auto mt-5 max-w-2xl text-3xl font-bold text-cream sm:text-4xl">
            Pronto para elevar o seu visual?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Garanta sua cadeira hoje mesmo. {horarioFuncionamento} — escolha o
            melhor horário para você.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild variant="gold" size="lg">
              <Link to="/agendamento">
                <CalendarCheck className="size-5" />
                Agendar horário
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA fixo mobile (aparece ao rolar) */}
      {ctaVisivel && (
        <div className="animate-slide-up fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-charcoal/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
          <Button asChild variant="gold" size="lg" className="w-full">
            <Link to="/agendamento">
              <CalendarCheck className="size-5" />
              Agendar horário
            </Link>
          </Button>
        </div>
      )}
      <div className="h-20 md:hidden" aria-hidden />

      <Footer />
    </div>
  );
}
