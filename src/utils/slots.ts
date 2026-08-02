import { addDaysISO, todayISO } from "@/utils/date";

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Gera slots de horário entre hora_inicio e hora_fim respeitando a duração
 * do serviço. Por padrão, blocos de 30 minutos.
 */
export function gerarSlots(
  horaInicio: string,
  horaFim: string,
  duracaoMinutos: number,
  passoMinutos = 30,
): string[] {
  const start = toMinutes(horaInicio);
  const end = toMinutes(horaFim);
  const slots: string[] = [];
  const step = Math.max(passoMinutos, 15);

  for (let t = start; t + duracaoMinutos <= end; t += step) {
    slots.push(toTime(t));
  }
  return slots;
}

/**
 * Filtra slots já agendados em uma determinada data, considerando também
 * o tempo ocupado pelo serviço do agendamento (do horário até o fim do serviço).
 */
export function filtrarSlotsOcupados(
  slots: string[],
  ocupados: { horario: string; duracao_minutos: number }[],
): string[] {
  const ocupadoRanges = ocupados.map((o) => {
    const start = toMinutes(o.horario);
    return { start, end: start + o.duracao_minutos };
  });

  return slots.filter((slot) => {
    const t = toMinutes(slot);
    return !ocupadoRanges.some((r) => t >= r.start && t < r.end);
  });
}

/**
 * Data limite (15 dias à frente) e datas disponíveis a partir de hoje.
 */
export function dataLimiteAgendamento(): string {
  return addDaysISO(15);
}

export function dataMinimaAgendamento(): string {
  return todayISO();
}
