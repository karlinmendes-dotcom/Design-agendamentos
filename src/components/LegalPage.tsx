import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, FileText } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

interface SecaoLegal {
  titulo: string;
  corpo: ReactNode;
}

interface LegalPageProps {
  icone: typeof FileText;
  selo: string;
  titulo: string;
  atualizacao: string;
  introducao: string;
  secoes: SecaoLegal[];
}

/**
 * Layout compartilhado das páginas legais (Política de Privacidade e Termos
 * de Uso) — visual limpo, legível e responsivo, na identidade do estúdio.
 * As rotas são abertas (sem pedir conta) para a cliente ler antes de aceitar.
 */
export function LegalPage({
  icone: Icone,
  selo,
  titulo,
  atualizacao,
  introducao,
  secoes,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[#f8f3ee]">
      {/* Cabeçalho do estúdio */}
      <header className="border-b border-gold/20 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
          <Logo nome="Studio Natália Braga" compact />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20">
        {/* Cabeçalho do documento */}
        <div className="pt-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10">
            <Icone className="size-6 text-gold" />
          </div>
          <p className="mt-5 text-xs font-semibold tracking-[0.3em] text-gold uppercase">
            {selo}
          </p>
          <h1 className="font-display mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">
            {titulo}
          </h1>
          <p className="mt-3 text-xs text-muted-foreground">
            Última atualização: {atualizacao}
          </p>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-foreground/70 italic">
            {introducao}
          </p>
        </div>

        {/* Seções */}
        <div className="mt-12 space-y-8">
          {secoes.map((secao, i) => (
            <section
              key={secao.titulo}
              className="rounded-2xl border border-gold/20 bg-white/70 p-6 shadow-[0_16px_50px_-30px_rgba(64,53,1,0.3)] backdrop-blur sm:p-8"
            >
              <h2 className="flex items-center gap-3 font-display text-lg font-bold text-foreground">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-800 text-xs font-bold text-cream">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {secao.titulo}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {secao.corpo}
              </div>
            </section>
          ))}
        </div>

        {/* Fim do documento */}
        <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl bg-gold-gradient p-8 text-center">
          <p className="font-serif max-w-md text-lg leading-relaxed text-cream italic">
            Estamos à disposição para qualquer dúvida sobre como cuidamos dos
            seus dados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/contato"
              className="flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-bold text-green-900 transition-colors hover:bg-white"
            >
              Falar com o estúdio
              <ChevronRight className="size-3.5" />
            </Link>
            <Link
              to="/agendamento"
              className="flex items-center gap-1.5 rounded-full border border-cream/40 px-4 py-2 text-xs font-bold text-cream transition-colors hover:bg-cream/10"
            >
              Agendar horário
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
