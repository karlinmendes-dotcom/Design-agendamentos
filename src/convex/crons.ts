import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

/**
 * Agendamentos automáticos do estúdio (cron do Convex).
 *
 * LEMBRETE DO DIA — todo dia às 08:00 no fuso do estúdio
 * (America/Sao_Paulo, UTC-3 → 11:00 UTC): avisa por Web Push as clientes
 * com horário CONFIRMADO para HOJE. Zero custo extra — usa as inscrições
 * push já cadastradas e o motor de envio existente (push.enviarParaTelefones).
 */
const crons = cronJobs();

crons.cron(
  "lembrete-agendamentos-do-dia",
  "0 11 * * *",
  api.push.enviarLembretesDoDia,
  {},
);

export default crons;
