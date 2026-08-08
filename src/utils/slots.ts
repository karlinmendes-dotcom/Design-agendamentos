import { addDaysISO, todayISO } from "@/utils/date";

export function toMinutes(time: string): number {
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

/** Um agendamento ocupado (início + duração em minutos). */
export interface Ocupado {
  horario: string;
  duracao_minutos: number;
}

function rangesOcupados(ocupados: Ocupado[]) {
  return ocupados.map((o) => {
    const start = toMinutes(o.horario);
    return { start, end: start + Math.max(o.duracao_minutos, 1) };
  });
}

/**
 * Filtra slots que começam dentro de um intervalo já ocupado — ou seja,
 * respeita a duração do serviço agendado (ex.: 14h com 40min bloqueia 14h30).
 */
export function filtrarSlotsOcupados(
  slots: string[],
  ocupados: Ocupado[],
): string[] {
  const ranges = rangesOcupados(ocupados);
  return slots.filter((slot) => {
    const t = toMinutes(slot);
    return !ranges.some((r) => t >= r.start && t < r.end);
  });
}

/**
 * Conjunto de slots a exibir como bloqueados (começam dentro de um intervalo
 * já ocupado). Mantém a grade visível para o cliente entender o motivo.
 */
export function slotsBloqueados(slots: string[], ocupados: Ocupado[]): Set<string> {
  const ranges = rangesOcupados(ocupados);
  const bloqueados = new Set<string>();
  for (const slot of slots) {
    const t = toMinutes(slot);
    if (ranges.some((r) => t >= r.start && t < r.end)) bloqueados.add(slot);
  }
  return bloqueados;
}

/**
 * Remove horários que já passaram — aplicado apenas no dia de hoje,
 * permitindo o agendamento para o mesmo dia.
 */
export function filtrarSlotsPassados(slots: string[], data: string): string[] {
  if (data !== todayISO()) return slots;
  const agora = new Date();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  return slots.filter((s) => toMinutes(s) > minutosAgora);
}

/** True quando um horário + duração sobrepõe algum agendamento ocupado. */
export function isSlotOcupado(
  horario: string,
  duracaoMinutos: number,
  ocupados: Ocupado[],
): boolean {
  const start = toMinutes(horario);
  const end = start + Math.max(duracaoMinutos, 1);
  return rangesOcupados(ocupados).some((r) => start < r.end && end > r.start);
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
