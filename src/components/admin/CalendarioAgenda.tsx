import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatDateShort, formatDateWeekday } from "@/utils/date";
import type { Agendamento, StatusAgendamento } from "@/types";

/** Horas exibidas como colunas (08h às 18h — expediente do estúdio). */
const HORAS = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"];

/** Almoço (11h às 14h) — colunas 11, 12 e 13 ficam sombreadas. */
const ALMOCO = new Set(["11", "12", "13"]);

interface CalendarioAgendaProps {
  /** 7 datas da semana (YYYY-MM-DD), uma por linha. */
  dias: string[];
  /** Agendamentos já filtrados (semana + busca + status). */
  agendamentos: Agendamento[];
  onSelecionar: (agendamento: Agendamento) => void;
}

function corStatus(status: StatusAgendamento): string {
  switch (status) {
    case "confirmado":
      return "bg-green-600 text-white";
    case "concluido":
      return "bg-gold text-green-950";
    case "cancelado":
      return "bg-muted text-muted-foreground line-through";
  }
}

/** Prioridade de exibição quando há mais de um registro no mesmo horário. */
function representante(lista: Agendamento[]): { ag: Agendamento; extras: number } {
  const ordem: Record<StatusAgendamento, number> = {
    confirmado: 0,
    concluido: 1,
    cancelado: 2,
  };
  const ordenados = [...lista].sort(
    (a, b) => ordem[a.status] - ordem[b.status],
  );
  return { ag: ordenados[0], extras: ordenados.length - 1 };
}

/**
 * Calendário semanal da agenda: dias na lateral (linhas) e horários em cima
 * (colunas). Cada agendamento "pinta" o quadradinho do dia/horário, com a
 * duração ocupando a largura certa. Toque no quadradinho abre os detalhes
 * (o mesmo modal da lista).
 */
export function CalendarioAgenda({
  dias,
  agendamentos,
  onSelecionar,
}: CalendarioAgendaProps) {
  const colunas = `128px repeat(${HORAS.length}, minmax(64px, 1fr))`;

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
      <div className="min-w-[860px]">
        {/* Cabeçalho: canto vazio + horas */}
        <div
          className="grid border-b border-border/80"
          style={{ gridTemplateColumns: colunas }}
        >
          <div className="sticky left-0 z-10 border-r border-border/60 bg-card px-3 py-2" />
          {HORAS.map((h, i) => (
            <div
              key={h}
              className={cn(
                "border-r border-border/40 px-1 py-2 text-center text-xs font-bold text-muted-foreground tabular-nums",
                ALMOCO.has(h) && "bg-gold/[0.07]",
              )}
              style={{ gridColumn: i + 2 }}
            >
              {h}h
            </div>
          ))}
        </div>

        {/* Linhas: um dia por linha */}
        {dias.map((dia) => {
          const doDia = agendamentos.filter((a) => a.data === dia);
          const porHora = new Map<string, Agendamento[]>();
          for (const a of doDia) {
            const arr = porHora.get(a.horario) ?? [];
            arr.push(a);
            porHora.set(a.horario, arr);
          }

          const celulas: ReactNode[] = [];
          let i = 0;
          while (i < HORAS.length) {
            const hora = HORAS[i];
            const lista = porHora.get(`${hora}:00`);
            const noAlmoco = ALMOCO.has(hora);

            if (!lista) {
              celulas.push(
                <div
                  key={`${dia}-${hora}`}
                  className={cn(
                    "h-16 border-r border-b border-border/50",
                    noAlmoco && "bg-gold/[0.06]",
                  )}
                  style={{ gridColumn: i + 2 }}
                />,
              );
              i++;
              continue;
            }

            const { ag, extras } = representante(lista);
            const span = Math.max(
              1,
              Math.min(
                HORAS.length - i,
                Math.ceil((ag.duracao_minutos ?? 60) / 60),
              ),
            );
            celulas.push(
              <button
                key={`${dia}-${hora}`}
                type="button"
                onClick={() => onSelecionar(ag)}
                title={`${ag.cliente?.nome ?? "Cliente"} · ${ag.horario} · ${ag.servico?.nome ?? ""}`}
                className={cn(
                  "z-[1] m-1 cursor-pointer rounded-md px-1.5 py-1 text-left text-[11px] leading-tight shadow-sm transition-transform hover:z-[2] hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  corStatus(ag.status),
                )}
                style={{ gridColumn: `${i + 2} / span ${span}` }}
              >
                <p className="truncate font-semibold">
                  {ag.cliente?.nome ?? "Cliente"}
                </p>
                <p className="truncate opacity-85">
                  {ag.horario}
                  {ag.servico?.nome ? ` · ${ag.servico.nome}` : ""}
                  {extras > 0 ? ` +${extras}` : ""}
                </p>
              </button>,
            );
            i += span;
          }

          return (
            <div
              key={dia}
              className="grid"
              style={{ gridTemplateColumns: colunas }}
            >
              <div
                className={cn(
                  "sticky left-0 z-10 border-r border-b border-border/60 bg-card px-3 py-2",
                )}
              >
                <p
                  className={cn(
                    "text-xs font-bold",
                    dia === dias[5] || dia === dias[6]
                      ? "text-muted-foreground/60"
                      : "text-foreground",
                  )}
                >
                  {formatDateWeekday(dia)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDateShort(dia)}
                </p>
              </div>
              {celulas}
            </div>
          );
        })}
      </div>
    </div>
  );
}
