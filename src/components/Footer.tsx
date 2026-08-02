import { Link } from "react-router-dom";
import { AtSign, Camera, Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useConfiguracao } from "@/hooks/useConfiguracao";

export function Footer() {
  const { nomeBarbearia, horarioFuncionamento } = useConfiguracao();

  return (
    <footer className="border-t border-border/70 bg-coal">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo nome={nomeBarbearia} />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Tradição e estilo em cada corte. Ambiente sofisticado, atendimento
            de primeira e horários que se encaixam na sua rotina.
          </p>
          <div className="flex gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold/50 hover:text-gold"
            >
              <Camera className="size-4" />
            </a>
            <a
              href="#"
              aria-label="E-mail"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold/50 hover:text-gold"
            >
              <AtSign className="size-4" />
            </a>
            <a
              href="#"
              aria-label="WhatsApp"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold/50 hover:text-gold"
            >
              <MessageCircle className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display mb-4 text-sm font-bold tracking-widest text-gold uppercase">
            Navegação
          </h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
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
              <Link to="/admin" className="transition-colors hover:text-gold-light">
                Área do barbeiro
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-gold uppercase">
            <Clock className="size-4" /> Horários
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {horarioFuncionamento}
            <br />
            <span className="text-foreground/70">Agendamentos até 15 dias.</span>
          </p>
        </div>

        <div>
          <h3 className="font-display mb-4 text-sm font-bold tracking-widest text-gold uppercase">
            Contato
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 text-gold/70" />
              (00) 00000-0000
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-gold/70" />
              Rua Exemplo, 123 — Centro
            </li>
          </ul>
        </div>
      </div>

      <div className="hairline" />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} {nomeBarbearia}. Todos os direitos
          reservados.
        </p>
        <p>Feito com precisão de navalha 🪒</p>
      </div>
    </footer>
  );
}
