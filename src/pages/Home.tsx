import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Flame,
  Gem,
  Hand,
  Heart,
  HeartHandshake,
  Leaf,
  MapPin,
  Quote,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { VideoCover } from "@/components/VideoCover";
import { VideoCarousel } from "@/components/VideoCarousel";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useServicos } from "@/hooks/useServicos";
import { useConfiguracao } from "@/hooks/useConfiguracao";
import { mediaParaServico } from "@/utils/media";
import { formatBRL, formatMinutes } from "@/utils/format";

/** Foto da Natália no topo — em todas as telas (celular e computador). */
const FOTO_HERO =
  "https://hardy-aardvark-221.convex.cloud/api/storage/06009537-84a4-467a-aed5-98967a864e2b";

const MARQUEE = [
  "Manicure impecável",
  "Pedicure relaxante",
  "Esmaltação em gel",
  "Nail art exclusiva",
  "Alongamento dos sonhos",
  "Atendimento de primeira",
];

const DESTAQUES = [
  { nome: "Manicure", descricao: "O clássico mais pedido da semana.", badge: "🔥 Popular" },
  { nome: "Esmaltação em Gel", descricao: "Brilho e durabilidade de até 3 semanas.", badge: "⭐ Queridinho" },
  { nome: "Alongamento em Gel", descricao: "Unhas longas, leves e resistentes.", badge: "✨ Diferencial" },
];

const PILARES = [
  { icon: Leaf, titulo: "Naturalidade", texto: "que encanta" },
  { icon: Gem, titulo: "Sofisticação", texto: "que fala" },
  { icon: Shield, titulo: "Resistência", texto: "que dura" },
  { icon: Sparkles, titulo: "Acabamento", texto: "impecável" },
  { icon: HeartHandshake, titulo: "Exclusividade", texto: "que conecta" },
  { icon: Heart, titulo: "Cuidado", texto: "que acolhe" },
];

const AVALIACOES = [
  {
    nome: "Ana Souza",
    texto:
      "Minhas unhas nunca ficaram tão bonitas. Ambiente sofisticado e atendimento impecável. Saí renovada!",
    nota: 5,
  },
  {
    nome: "Marina Lima",
    texto:
      "Agendei pelo site em segundos e fui atendida na hora. A esmaltação em gel dura semanas, é outro nível.",
    nota: 5,
  },
  {
    nome: "Juliana Castro",
    texto:
      "Precisão no cuidado das cutículas e atendimento pontual. Virei cliente fiel, recomendo demais.",
    nota: 5,
  },
];

export function Home() {
  const { servicos } = useServicos(true);
  const { nomeBarbearia, horarioFuncionamento } = useConfiguracao();

  const procurados = servicos.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO — foto da Natália em todas as telas ===== */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden sm:items-center">
        <img
          src={FOTO_HERO}
          alt="Studio Natália Braga — Nail Design"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="video-shade absolute inset-0" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" aria-hidden />

        <div className="relative mx-auto w-full max-w-6xl px-5 pt-28 pb-16 sm:px-6">
          <div className="max-w-2xl">
            <div className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-gold-light/40 bg-black/45 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-light uppercase backdrop-blur">
              <Sparkles className="size-3.5" />
              {nomeBarbearia} · Agendamento online
            </div>

            <h1
              className="animate-slide-up mt-6 font-display text-[2.6rem] leading-[1.04] font-extrabold text-white sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "0.1s" }}
            >
              {nomeBarbearia.split(" ").slice(0, 2).join(" ")}{" "}
              <span className="text-gradient-light">
                {nomeBarbearia.split(" ").slice(2).join(" ") || "Nail"}
              </span>
            </h1>

            <p
              className="animate-slide-up font-script mt-2 text-2xl text-gold-light sm:text-3xl"
              style={{ animationDelay: "0.15s" }}
            >
              beleza que começa pelas mãos
            </p>

            <p
              className="animate-slide-up font-serif mt-5 max-w-xl text-xl leading-relaxed text-white/80 italic"
              style={{ animationDelay: "0.2s" }}
            >
              Mais do que realizar um procedimento, um momento de cuidado e
              autoestima — com atendimento próximo e personalizado, pensado
              para valorizar o seu estilo e a sua personalidade.
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
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
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
                { valor: "10+", rotulo: "Anos de experiência" },
                { valor: "8k+", rotulo: "Atendimentos realizados" },
                { valor: "4.9", rotulo: "Avaliação média", estrela: true },
              ].map((item) => (
                <div key={item.rotulo}>
                  <p className="flex items-center gap-1.5 font-display text-3xl font-extrabold text-white">
                    {item.valor}
                    {item.estrela && <Star className="size-5 fill-gold-light text-gold-light" />}
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

      {/* ===== Faixa marquee — animada no desktop; estática (quebra em linhas) no celular ===== */}
      <div className="overflow-hidden border-y border-gold/25 bg-gold-gradient py-4">
        <div className="animate-marquee hidden w-max items-center gap-10 md:flex">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-3 whitespace-nowrap text-xs font-semibold tracking-[0.25em] text-gold-light uppercase"
            >
              <Sparkles className="size-3.5 text-gold-light" />
              {item}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 md:hidden">
          {MARQUEE.map((item) => (
            <span
              key={item}
              className="flex items-center gap-2 whitespace-nowrap text-[10px] font-semibold tracking-[0.18em] text-gold-light uppercase"
            >
              <Sparkles className="size-3 shrink-0 text-gold-light" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ===== Destaques da Semana — carrossel de vídeos ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-charcoal uppercase">
              <Flame className="size-4 text-blood" /> Destaques da semana
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">
              O que está <span className="text-gradient-red">em alta</span>
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/servicos">
              Ver todos
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>

        <VideoCarousel
          itens={procurados.map((s, i) => {
            const video = mediaParaServico(s);
            const destaque = DESTAQUES[i];
            return {
              id: s.id,
              titulo: s.nome,
              descricao: destaque?.descricao ?? s.descricao ?? "",
              badge: destaque?.badge,
              preco: formatBRL(s.preco),
              duracao: formatMinutes(s.duracao_minutos),
              src: video.src,
              poster: video.poster,
              to: `/agendamento?servico=${s.id}`,
            };
          })}
        />
      </section>

      {/* ===== Serviços mais procurados ===== */}
      <section className="border-y border-border/70 bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-charcoal uppercase">
              Nossos serviços
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-charcoal sm:text-4xl">
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

      {/* ===== Conheça o Studio ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <VideoCover
                src="https://assets.mixkit.co/videos/36905/36905-360.mp4"
                poster="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=70"
                className="aspect-[4/3] w-full"
                alt="Ambiente do estúdio de nail design"
              />
              <div className="absolute right-4 bottom-4 left-4 flex items-center gap-3 rounded-xl border border-gold/25 bg-black/70 px-4 py-3 backdrop-blur">
                <MapPin className="size-4 shrink-0 text-gold-light" />
                <p className="text-xs text-white/85">
                  Ambiente acolhedor, cadeiras confortáveis e produtos premium.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="text-xs font-semibold tracking-[0.3em] text-charcoal uppercase">
              Conheça o {nomeBarbearia}
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">
              Mais que unhas, <span className="text-gradient-red">uma experiência</span>
            </h2>
            <p className="font-serif mt-5 text-lg leading-relaxed text-muted-foreground">
              A Natália é profissional de Nail Design e está à frente do
              Studio, no Centro de Colatina — Espírito Santo. O trabalho é
              voltado para a beleza, o cuidado e a valorização das unhas, em
              um ambiente profissional pensado para proporcionar uma
              experiência especial a cada cliente.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                { icon: Hand, titulo: "Manicure e pedicure de precisão", texto: "Cuidado minucioso com cutículas, formato e esmaltação." },
                { icon: Clock, titulo: "Pontualidade", texto: "Respeitamos seu horário — você nunca espera em vão." },
                { icon: Users, titulo: "Profissionais experientes", texto: "Equipe qualificada e atualizada nas tendências." },
              ].map((item) => (
                <li key={item.titulo} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10">
                    <item.icon className="size-5 text-green-800" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.titulo}</p>
                    <p className="text-sm text-muted-foreground">{item.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button asChild variant="gold" className="mt-8">
              <Link to="/agendamento">
                <CalendarCheck className="size-4" />
                Reservar meu horário
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ===== Os pilares do Studio ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <p className="font-script text-2xl text-blood sm:text-3xl">
            visando naturalidade
          </p>
          <h2 className="font-display mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
            O poder de uma{" "}
            <span className="text-gradient-red">unha de alto padrão</span>
          </h2>
          <p className="font-serif mt-4 text-lg italic text-muted-foreground">
            Cada detalhe é pensado para realçar quem você é — com a delicadeza
            que o seu estilo merece.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {PILARES.map((pilar, i) => (
            <Reveal key={pilar.titulo} delay={i * 80}>
              <div className="gold-ring-hover flex h-full flex-col items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-7 text-center">
                <div className="flex size-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                  <pilar.icon className="size-5 text-green-800" />
                </div>
                <p className="font-display text-base font-bold text-foreground">
                  {pilar.titulo}
                </p>
                <p className="font-script text-lg leading-none text-blood">
                  {pilar.texto}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Avaliações de clientes ===== */}
      <section className="border-y border-border/70 bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-charcoal uppercase">
              Avaliações
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-charcoal sm:text-4xl">
              Quem passou por aqui, <span className="text-gradient-red">recomenda</span>
            </h2>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {AVALIACOES.map((av, i) => (
              <Reveal key={av.nome} delay={i * 100}>
                <figure className="red-ring-hover relative h-full rounded-2xl border border-border bg-card p-7">
                  <Quote className="absolute top-6 right-6 size-8 text-gold/30" />
                  <div className="flex gap-1">
                    {Array.from({ length: av.nota }).map((_, s) => (
                      <Star key={s} className="size-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-card-foreground/85">
                    "{av.texto}"
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-gold-gradient font-display text-sm font-bold text-cream">
                      {av.nome.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-charcoal">{av.nome}</span>
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
          <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gold-gradient p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-gold-light/15 blur-3xl" />
            <Sparkles className="mx-auto size-8 text-gold-light" />
            <h2 className="font-display mx-auto mt-5 max-w-2xl text-3xl font-extrabold text-cream sm:text-4xl">
              Pronta para unhas impecáveis?
            </h2>
            <p className="font-script mx-auto mt-2 text-2xl text-gold-light">
              seu horário espera por você
            </p>
            <p className="mx-auto mt-4 max-w-xl text-cream/70">
              Garanta seu horário hoje mesmo. {horarioFuncionamento} — escolha o
              melhor momento para você.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild variant="outline" size="lg" className="border-gold-light/50 bg-cream/95 text-green-900 hover:bg-cream hover:text-green-900">
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
