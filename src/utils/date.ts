export const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(days: number, from?: Date): string {
  const base = from ? new Date(from) : new Date();
  base.setDate(base.getDate() + days);
  return toISODate(base);
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateLong(iso: string): string {
  const date = parseISO(iso);
  return `${DIAS_SEMANA[date.getDay()]}, ${date.getDate()} de ${
    MESES[date.getMonth()]
  }`;
}

export function formatDateShort(iso: string): string {
  const date = parseISO(iso);
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

export function formatDateWeekday(iso: string): string {
  const date = parseISO(iso);
  return `${DIAS_SEMANA_CURTO[date.getDay()]}, ${String(
    date.getDate(),
  ).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isFutureOrToday(iso: string): boolean {
  return iso >= todayISO();
}

export function getWeekDates(from: Date, days = 14): string[] {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDaysISO(i, from));
  }
  return dates;
}
