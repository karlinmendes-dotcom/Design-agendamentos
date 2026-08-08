import type { Agendamento } from "@/types";
import { formatBRL } from "@/utils/format";
import { formatDateWeekday } from "@/utils/date";

/**
 * Monta a mensagem de confirmação do agendamento com todos os dados
 * escolhidos pelo cliente (serviço, valor, barbeiro, data, horário).
 */
export function montarConfirmacaoWhatsApp(agendamento: Agendamento): string {
  const linhas: (string | null)[] = [
    "✅ *Agendamento confirmado*",
    "",
    `🪒 Serviço: ${agendamento.servico?.nome ?? "—"}`,
    agendamento.servico?.preco != null
      ? `💰 Valor: ${formatBRL(agendamento.servico.preco)}`
      : null,
    agendamento.barbeiro?.nome
      ? `✂️ Barbeiro: ${agendamento.barbeiro.nome}`
      : null,
    `📅 Data: ${formatDateWeekday(agendamento.data)}`,
    `⏰ Horário: ${agendamento.horario}`,
    "",
    "Sua cadeira está garantida. Te esperamos! 🪒",
  ];
  return linhas.filter(Boolean).join("\n");
}

/**
 * Link que abre o WhatsApp do próprio cliente com a confirmação pronta
 * para enviar — sem integração, sem chaves (como o botão de contato).
 */
export function linkConfirmacaoWhatsApp(
  agendamento: Agendamento,
): string | null {
  const digitos = (agendamento.cliente?.telefone ?? "").replace(/\D/g, "");
  if (digitos.length < 10) return null;
  // Formato internacional do Brasil: 55 + DDD + número (slice remove um 55 duplicado)
  const numero = `55${digitos.slice(-11)}`;
  const mensagem = montarConfirmacaoWhatsApp(agendamento);
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
