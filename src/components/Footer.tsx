import { Link } from "react-router-dom";
import { AtSign, Camera, Clock, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useConfiguracao } from "@/hooks/useConfiguracao";
import { useBarbearia } from "@/hooks/useBarbearia";

export function Footer() {
  const { nomeBarbearia, horarioFuncionamento } = useConfiguracao();
  const { barbearia } = useBarbearia();

  const telefone = barbearia?.telefone ?? "(27) 99614-0639";
  const endereco =
    barbearia?.endereco ??
    "R. Expedicionário Abílio dos Santos, 0184, Sala 209, Centro, Colatina – ES, 29700-070";
  const instagram = barbearia?.instagram?.trim();
  const instagramHref = instagram
    ? `https://instagram.com/${instagram.replace(/^@/, "")}`
    : "#";

  const whats =
    telefone !== "(00) 00000-0000"
      ? `https://wa.me/55${telefone.replace(/\D/g, "")}`
      : "#";

  return (
    <footer className="border-t border-gold/20 bg-gold-gradient">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo nome={nomeBarbearia} />
          <p className="font-serif max-w-xs text-lg leading-relaxed text-cream/75 italic">
            Beleza, cuidado e técnica em cada detalhe — com atendimento
            próximo e personalizado, e horários que se encaixam na sua rotina.
          </p>
          <div className="flex gap-3">
            <a
              href={instagramHref}
              aria-label="Instagram"
              target={instagram ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex size-9 items-center justify-center rounded-full border border-gold-light/25 text-cream/60 transition-all hover:border-gold-light hover:text-gold-light"
            >
              <Camera className="size-4" />
            </a>
            <a
              href="mailto:contato@naildesignstudio.com.br"
              aria-label="E-mail"
              className="flex size-9 items-center justify-center rounded-full border border-gold-light/25 text-cream/60 transition-all hover:border-gold-light hover:text-gold-light"
            >
              <AtSign className="size-4" />
            </a>
            <a
              href={whats}
              aria-label="WhatsApp"
              target={whats.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex size-9 items-center justify-center rounded-full border border-gold-light/25 text-cream/60 transition-all hover:border-gold-light hover:text-gold-light"
            >
              <MessageCircle className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display mb-4 text-sm font-bold tracking-widest text-gold-light uppercase">
            Navegação
          </h3>
          <ul className="space-y-2.5 text-sm text-cream/65">
            <li>
              <Link to="/" className="transition-colors hover:text-gold-light">
                Início
              </Link>
            </li>
            <li>
              <Link to="/servicos" className="transition-colors hover:text-gold-light">
                Serviços
              </Link>
            </li>
            <li>
              <Link to="/agendamento" className="transition-colors hover:text-gold-light">
                Agendar horário
              </Link>
            </li>
            <li>
              <Link to="/promocoes" className="transition-colors hover:text-gold-light">
                Promoções
              </Link>
            </li>
            <li>
              <Link to="/contato" className="transition-colors hover:text-gold-light">
                Contato
              </Link>
            </li>
            <li>
              <Link to="/admin" className="transition-colors hover:text-gold-light">
                Área do estúdio
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-gold-light uppercase">
            <Clock className="size-4" /> Horários
          </h3>
          <p className="text-sm leading-relaxed text-cream/65">
            {horarioFuncionamento}
            <br />
            <span className="text-cream/80">Agendamentos até 15 dias.</span>
          </p>
        </div>

        <div>
          <h3 className="font-display mb-4 text-sm font-bold tracking-widest text-gold-light uppercase">
            Contato
          </h3>
          <ul className="space-y-3 text-sm text-cream/65">
            <li className="flex items-center gap-2.5">
              <MessageCircle className="size-4 text-gold-light/80" />
              {telefone}
            </li>
            {instagram && (
              <li className="flex items-center gap-2.5">
                <Camera className="size-4 text-gold-light/80" />
                @{instagram.replace(/^@/, "")}
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-gold-light/80" />
              {endereco}
            </li>
          </ul>
        </div>
      </div>

      <div className="hairline" />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-cream/55 sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} {nomeBarbearia}. Todos os direitos
          reservados.
        </p>
        <p>Feito com carinho e precisão 💅</p>
      </div>
    </footer>
  );
}
