import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatMinutes } from "@/utils/format";
import type { Servico } from "@/types";
import { serviceIcon } from "@/utils/serviceIcon";

interface ServiceCardProps {
  servico: Servico;
}

export function ServiceCard({ servico }: ServiceCardProps) {
  const Icon = serviceIcon(servico.nome);

  return (
    <Card className="gold-ring-hover group relative h-full overflow-hidden border-border/80">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gold/[0.07] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardContent className="flex h-full flex-col gap-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 transition-transform duration-300 group-hover:scale-110">
            <Icon className="size-5 text-gold" />
          </div>
          <Badge variant="gold" className="gap-1">
            <Clock className="size-3" />
            {formatMinutes(servico.duracao_minutos)}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display text-xl font-bold text-cream transition-colors group-hover:text-gold-light">
            {servico.nome}
          </h3>
          <p className="line-clamp-3 min-h-12 text-sm leading-relaxed text-muted-foreground">
            {servico.descricao ?? "Atendimento com os melhores profissionais."}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="font-display text-2xl font-bold text-gradient-gold">
            {formatBRL(servico.preco)}
          </p>
          <Link
            to={`/agendamento?servico=${servico.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold-light transition-all duration-300 hover:bg-gold hover:text-charcoal"
          >
            Agendar
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
