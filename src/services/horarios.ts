import { requerSupabase } from "@/services/supabase";
import type { Horario } from "@/types";

export async function listHorarios(): Promise<Horario[]> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("horarios")
    .select("*")
    .order("dia_semana");
  if (error) throw new Error(error.message);
  return (data ?? []) as Horario[];
}

export async function listHorariosAtivos(): Promise<Horario[]> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("horarios")
    .select("*")
    .eq("ativo", true)
    .order("dia_semana");
  if (error) throw new Error(error.message);
  return (data ?? []) as Horario[];
}

export interface HorarioInput {
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
}

export async function upsertHorario(input: HorarioInput): Promise<Horario> {
  const db = requerSupabase();
  const { data, error } = await db
    .from("horarios")
    .upsert(input, { onConflict: "dia_semana" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Horario;
}

export async function setHorarioAtivo(
  diaSemana: number,
  ativo: boolean,
): Promise<void> {
  const db = requerSupabase();
  const { error } = await db
    .from("horarios")
    .update({ ativo })
    .eq("dia_semana", diaSemana);
  if (error) throw new Error(error.message);
}
