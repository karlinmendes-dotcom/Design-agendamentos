import { useMemo } from "react";
import { CalendarHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConfiguracao } from "@/hooks/useConfiguracao";
import { useHorarios } from "@/hooks/useHorarios";
import { useDatasBloqueadas } from "@/hooks/useDatasBloqueadas";
import { DIAS_SEMANA_CURTO } from "@/utils/date";
import { cn } from "@/lib/utils";

interface OpcoesRemarcarProps {
  /** Quantos dias de atalho mostrar (padrão 4). */
  quantidade?: number;
  /** Chamado antes de navegar (ex.: fechar o modal). */
  aoEscolher?: () => void;
}

/**
 * Atalhos de remarcação do aviso de cancelamento: mostra os próximos dias
 * realmente disponíveis (expediente ativo + dia liberado + não bloqueado) e
 * leva a cliente direto para o agendamento com o dia já escolhido
 * (?data=YYYY-MM-DD).
 */
export function OpcoesRemarcar({
  quantidade = 4,
  aoEscolher,
}: OpcoesRemarcarProps) {
  const navigate = useNavigate();
  const { diasDisponiveis } = useConfiguracao();
  const { horarios } = useHorarios(true);
  const { bloqueadas } = useDatasBloqueadas();

  const dias = useMemo(() => {
    const lista: { iso: string; diaSemana: number }[] = [];
    const hoje = new Date();
    for (let i = 1; lista.length < quantidade && i < 30; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      const diaSemana = d.getDay();
      const temHorario = horarios.some(
        (h) => h.dia_semana === diaSemana && h.ativo,
      );
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(d.getDate()).padStart(2, "0")}`;
      if (
        diasDisponiveis.includes(diaSemana) &&
        temHorario &&
        !bloqueadas.has(iso)
      ) {
        lista.push({ iso, diaSemana });
      }
    }
    return lista;
  }, [diasDisponiveis, horarios, bloqueadas, quantidade]);

  if (dias.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
        <CalendarHeart className="size-3.5" />
        Remarcar para um próximo dia
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {dias.map((d) => (
          <button
            key={d.iso}
            type="button"
            onClick={() => {
              aoEscolher?.();
              navigate(`/agendamento?data=${d.iso}`);
            }}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/50 px-2 py-3 transition-all duration-200 hover:border-gold/70 hover:bg-gold/10 active:scale-[0.97]",
            )}
          >
            <span className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
              {DIAS_SEMANA_CURTO[d.diaSemana]}
            </span>
            <span className="font-display text-xl leading-none font-bold text-card-foreground">
              {d.iso.split("-")[2]}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {new Date(`${d.iso}T12:00:00`).toLocaleDateString("pt-BR", {
                month: "short",
              })}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
