import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Flame,
  MapPin,
  Quote,
  Scissors,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { VideoCover } from "@/components/VideoCover";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useServicos } from "@/hooks/useServicos";
import { useConfiguracao } from "@/hooks/useConfiguracao";
import { VIDEO_HERO } from "@/utils/videos";

const MARQUEE = [
  "Corte na régua",
  "Barba com toalha quente",
  "Navalha",
  "Pigmentação",
  "Estilo premium",
  "Atendimento de primeira",
];

const DESTAQUES = [
  { nome: "Corte + Barba", descricao: "O combo mais pedido da semana.", badge: "🔥 Popular" },
  { nome: "Corte Masculino", descricao: "Clássico com finalização premium.", badge: "⭐ Clássico" },
  { nome: "Barba Completa", descricao: "Toalha quente + navalha + óleo.", badge: "✨ Diferencial" },
];

const AVALIACOES = [
  {
    nome: "Rafael Souza",
    texto:
      "Melhor corte da região. Ambiente sofisticado e atendimento impecável. Saí renovado!",
    nota: 5,
  },
  {
    nome: "Marcos Lima",
    texto:
      "Agendei pelo site em segundos e fui atendido na hora. A barba com toalha quente é outro nível.",
    nota: 5,
  },
  {
    nome: "Pedro Henrique",
    texto:
      "Precisão na navalha e atendimento pontual. Virei cliente fiel, recomendo demais.",
    nota: 5,
  },
];

export function Home() {
  const { servicos } = useServicos(true);
  const { nomeBarbearia, horarioFuncionamento } = useConfiguracao();

  const procurados = servicos.slice(0, 6);

  return (
    <div className="min-h-screen bg-black">
      {/* ===== HERO — vídeo em tela cheia ===== */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden sm:items-center">
        <VideoCover
          src={VIDEO_HERO.src}
          poster={VIDEO_HERO.poster}
          eager
          className="absolute inset-0 size-full"
          alt="Barbearia em ação"
        />
        <div className="video-shade absolute inset-0" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" aria-hidden />

        <div className="relative mx-auto w-full max-w-6xl px-5 pt-28 pb-16 sm:px-6">
          <div className="max-w-2xl">
            <div className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-red-300 uppercase backdrop-blur">
              <Sparkles className="size-3.5" />
              Agendamento online · sem fila
            </div>

            <h1
              className="animate-slide-up mt-6 font-display text-[2.6rem] leading-[1.04] font-extrabold text-white uppercase sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "0.1s" }}
            >
              {nomeBarbearia.split(" ")[0]}{" "}
              <span className="text-gradient-red">
                {nomeBarbearia.split(" ").slice(1).join(" ") || "Neto"}
              </span>
            </h1>

            <p
              className="animate-slide-up mt-5 max-w-xl text-lg leading-relaxed text-white/75"
              style={{ animationDelay: "0.2s" }}
            >
              Estilo, precisão e tradição no mesmo lugar. Escolha o serviço,
              reserve sua cadeira em segundos e viva a experiência de um corte
              impecável.
            </p>

            <div
              className="animate-slide-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "0.3s" }}
            >
              <Button asChild variant="gold" size="lg" className="animate-glow-pulse">
                <Link to="/agendamento">
                  <CalendarCheck className="size-5" />
                  Agendar agora
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/25 text-white hover:bg-white/10 hover:text-white">
                <Link to="/servicos">
                  Ver serviços
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div
              className="animate-slide-up mt-10 flex flex-wrap gap-x-10 gap-y-5"
              style={{ animationDelay: "0.4s" }}
            >
              {[
                { valor: "10+", rotulo: "Anos de tradição" },
                { valor: "5k+", rotulo: "Cortes realizados" },
                { valor: "4.9", rotulo: "Avaliação média", estrela: true },
              ].map((item) => (
                <div key={item.rotulo}>
                  <p className="flex items-center gap-1.5 font-display text-3xl font-extrabold text-white">
                    {item.valor}
                    {item.estrela && <Star className="size-5 fill-red-500 text-red-500" />}
                  </p>
                  <p className="mt-0.5 text-xs tracking-wide text-white/60 uppercase">
                    {item.rotulo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Faixa marquee ===== */}
      <div className="overflow-hidden border-y border-red-950/60 bg-gradient-to-r from-black via-[#160404] to-black py-4">
        <div className="animate-marquee flex w-max items-center gap-10">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-3 whitespace-nowrap text-xs font-semibold tracking-[0.25em] text-red-300/80 uppercase"
            >
              <Scissors className="size-3.5 text-red-500" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ===== Destaques da Semana ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-red-500 uppercase">
              <Flame className="size-4" /> Destaques da semana
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              O que está <span className="text-gradient-red">bombando</span>
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/servicos">
              Ver todos
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {DESTAQUES.map((d, i) => (
            <Reveal key={d.nome} delay={i * 90}>
              <Link
                to="/agendamento"
                className="red-ring-hover group relative block overflow-hidden rounded-2xl border border-border bg-card p-6"
              >
                <span className="absolute top-4 right-4 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-bold tracking-wide text-red-300 uppercase">
                  {d.badge}
                </span>
                <div className="flex size-11 items-center justify-center rounded-lg bg-red-500/10 transition-transform duration-300 group-hover:scale-110">
                  <Zap className="size-5 text-red-500" />
                </div>
                <h3 className="font-display mt-4 text-lg font-bold text-white">
                  {d.nome}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{d.descricao}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
                  Reservar agora <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Serviços mais procurados ===== */}
      <section className="border-y border-border/60 bg-[#080808]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-red-500 uppercase">
              Nossos serviços
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Serviços mais <span className="text-gradient-red">procurados</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Cada serviço com vídeo, descrição, preço e duração — escolha o seu
              e garanta o horário.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {procurados.map((servico, i) => (
              <Reveal key={servico.id} delay={(i % 3) * 90}>
                <ServiceCard servico={servico} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Conheça a Barbearia Neto ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <VideoCover
                src="https://assets.mixkit.co/videos/43223/43223-360.mp4"
                poster="https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1400&q=70"
                className="aspect-[4/3] w-full"
                alt="Ambiente da barbearia"
              />
              <div className="absolute right-4 bottom-4 left-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur">
                <MapPin className="size-4 shrink-0 text-red-500" />
                <p className="text-xs text-white/85">
                  Ambiente sofisticado, cadeiras premium e produtos de primeira linha.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="text-xs font-semibold tracking-[0.3em] text-red-500 uppercase">
              Conheça a {nomeBarbearia.split(" ")[0]}
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Mais que um corte, <span className="text-gradient-red">uma experiência</span>
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Tradição e estilo em cada detalhe. Nosso time une técnica apurada,
              pontualidade e um ambiente pensado para você relaxar e sair
              renovado.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                { icon: Scissors, titulo: "Cortes na régua", texto: "Precisão milimétrica com máquina, tesoura e navalha." },
                { icon: Clock, titulo: "Pontualidade", texto: "Respeitamos seu horário — você nunca espera em vão." },
                { icon: Users, titulo: "Profissionais experientes", texto: "Time qualificado e atualizado nas tendências." },
              ].map((item) => (
                <li key={item.titulo} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10">
                    <item.icon className="size-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.titulo}</p>
                    <p className="text-sm text-muted-foreground">{item.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button asChild variant="gold" className="mt-8">
              <Link to="/agendamento">
                <CalendarCheck className="size-4" />
                Reservar minha cadeira
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ===== Avaliações de clientes ===== */}
      <section className="border-y border-border/60 bg-[#080808]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-red-500 uppercase">
              Avaliações
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Quem sentou na cadeira, <span className="text-gradient-red">recomenda</span>
            </h2>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {AVALIACOES.map((av, i) => (
              <Reveal key={av.nome} delay={i * 100}>
                <figure className="red-ring-hover relative h-full rounded-2xl border border-border bg-card p-7">
                  <Quote className="absolute top-6 right-6 size-8 text-red-500/15" />
                  <div className="flex gap-1">
                    {Array.from({ length: av.nota }).map((_, s) => (
                      <Star key={s} className="size-4 fill-red-500 text-red-500" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-foreground/85">
                    "{av.texto}"
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-red-500/15 font-display text-sm font-bold text-red-400">
                      {av.nome.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-white">{av.nome}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-[#1a0505] via-black to-black p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-red-500/15 blur-3xl" />
            <Sparkles className="mx-auto size-8 text-red-500" />
            <h2 className="font-display mx-auto mt-5 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
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
                  Agendar agora
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
