import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL, formatMinutes } from "@/utils/format";
import type { Servico } from "@/types";
import { VideoCover } from "@/components/VideoCover";
import { mediaParaServico } from "@/utils/media";

interface ServiceCardProps {
  servico: Servico;
}

export function ServiceCard({ servico }: ServiceCardProps) {
  // Vídeo da biblioteca de mídia (admin pode trocar via video_url no banco)
  const video = mediaParaServico(servico);

  return (
    <Card className="red-ring-hover group relative h-full overflow-hidden border-border/80 bg-[#0c0c0c]">
      {/* Vídeo de capa */}
      <div className="relative aspect-video overflow-hidden border-b border-border/60">
        <VideoCover
          src={video.src}
          poster={video.poster}
          alt={servico.nome}
          className="absolute inset-0 size-full transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-black/70 px-2.5 py-1 text-[10px] font-bold tracking-wide text-red-300 uppercase backdrop-blur">
          <Clock className="size-3" />
          {formatMinutes(servico.duracao_minutos)}
        </span>
        <p className="absolute bottom-3 left-4 font-display text-lg font-bold text-white">
          {servico.nome}
        </p>
      </div>

      <CardContent className="flex flex-col gap-3 pt-4">
        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
          {servico.descricao ?? "Atendimento com os melhores profissionais."}
        </p>

        <div className="mt-auto flex items-center justify-between pt-1">
          <p className="font-display text-2xl font-extrabold text-gradient-red">
            {formatBRL(servico.preco)}
          </p>
          <Link
            to={`/agendamento?servico=${servico.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-500/40 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-300 transition-all duration-300 hover:bg-red-gradient hover:text-white active:scale-95"
          >
            Agendar
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
