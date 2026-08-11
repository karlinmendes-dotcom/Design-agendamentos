import { useNavigate } from "react-router-dom";
import { CalendarHeart } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OpcoesRemarcar } from "@/components/OpcoesRemarcar";
import { formatDateLong } from "@/utils/date";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  /** Data do dia cancelado (opcional — exibida na mensagem). */
  dia?: string;
}

/**
 * Modal padrão de cancelamento: avisa a cliente que houve um imprevisto no
 * estabelecimento e oferece reagendar com um toque (CTA → /agendamento).
 * Usado pelo PushListener (app aberto) e pela página /reagendar (notificação).
 */
export function ReagendarModal({ aberto, onFechar, dia }: Props) {
  const navigate = useNavigate();

  return (
    <Dialog
      open={aberto}
      onOpenChange={(open) => {
        if (!open) onFechar();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
            <CalendarHeart className="size-7 text-green-800" />
          </span>
          <DialogTitle className="text-2xl">Sentimos muito! 💛</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Houve um imprevisto técnico/pessoal no estabelecimento e seu
            horário precisou ser reagendado.
            {dia ? (
              <>
                {" "}
                Referente ao dia <strong>{formatDateLong(dia)}</strong>.
              </>
            ) : null}{" "}
            Mas não se preocupe: sua vaga está garantida! Clique no botão
            abaixo para escolher uma nova data disponível sem custos
            adicionais.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <OpcoesRemarcar quantidade={4} aoEscolher={onFechar} />
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={() => {
              onFechar();
              navigate("/agendamento");
            }}
          >
            <CalendarHeart className="size-5" />
            Escolher nova data
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" className="w-full">
              Agora não
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
