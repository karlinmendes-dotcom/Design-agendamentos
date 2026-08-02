import { useMemo } from "react";
import type { Agendamento } from "@/types";
import { DIAS_SEMANA_CURTO } from "@/utils/date";

interface BarItem {
  label: string;
  value: number;
}

/** Gráfico de barras horizontais — pronto para alimentar qualquer lib futura. */
export function BarChart({
  items,
  maxLabelWidth = "w-8",
}: {
  items: BarItem[];
  maxLabelWidth?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className={`${maxLabelWidth} shrink-0 text-right text-xs text-muted-foreground`}>
            {item.label}
          </span>
          <div className="h-5 flex-1 overflow-hidden rounded-md bg-muted/40">
            <div
              className="bg-gold-gradient flex h-full items-center rounded-md transition-all duration-700"
              style={{ width: `${Math.max((item.value / max) * 100, item.value > 0 ? 6 : 0)}%` }}
            >
              {item.value > 0 && (
                <span className="ml-2 text-[11px] font-bold text-charcoal">
                  {item.value}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

/** Gráfico de rosca (donut) via SVG — sem biblioteca externa. */
export function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);

  const circles = useMemo(() => {
    const r = 42;
    const c = 2 * Math.PI * r;
    let acc = 0;
    const circ = segments.map((seg) => {
      const frac = total > 0 ? seg.value / total : 0;
      const dash = frac * c;
      const el = {
        ...seg,
        dash,
        offset: acc * c,
      };
      acc += frac;
      return el;
    });
    return circ;
  }, [segments, total]);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle cx="60" cy="60" r="42" fill="none" stroke="var(--color-muted)" strokeWidth="14" />
          {total > 0 &&
            circles.map((seg) => (
              <circle
                key={seg.label}
                cx="60"
                cy="60"
                r="42"
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${seg.dash} ${2 * Math.PI * 42}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="round"
              />
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-black text-cream">{total}</span>
          <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
            total
          </span>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              {seg.label}
            </span>
            <span className="font-semibold text-cream">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Agrupamento de agendamentos por dia da semana (seg a dom). */
export function useAgendamentosPorDiaSemana(agendamentos: Agendamento[]) {
  return useMemo(() => {
    const contagem = new Array(7).fill(0) as number[];
    for (const a of agendamentos) {
      if (a.status === "cancelado") continue;
      const dia = new Date(`${a.data}T12:00:00`).getDay();
      contagem[dia] += 1;
    }
    // Segunda a Domingo
    const ordem = [1, 2, 3, 4, 5, 6, 0];
    return ordem.map((d) => ({
      label: DIAS_SEMANA_CURTO[d],
      value: contagem[d],
    }));
  }, [agendamentos]);
}
