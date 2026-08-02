import { MessageCircle } from "lucide-react";
import { useBarbearia } from "@/hooks/useBarbearia";

/** Número de WhatsApp em formato internacional (somente dígitos). */
function normalizarTelefone(telefone: string | null | undefined): string {
  const digitos = (telefone ?? "(00) 00000-0000").replace(/\D/g, "");
  // Remove o 0 inicial e garante DDI 55
  if (digitos.length === 0) return "5500000000000";
  return digitos.length >= 11 ? `55${digitos.slice(-11)}` : `55${digitos}`;
}

const MENSAGEM = encodeURIComponent(
  "Olá! Vim pelo aplicativo da Barbearia Neto e gostaria de mais informações.",
);

/**
 * Botão flutuante de WhatsApp — fixo no canto inferior direito,
 * respeitando a barra de navegação inferior do app.
 */
export function WhatsAppFloat() {
  const { barbearia } = useBarbearia();
  const telefone = normalizarTelefone(barbearia?.telefone);
  const nome = barbearia?.nome ?? "Barbearia Neto";

  return (
    <a
      href={`https://wa.me/${telefone}?text=${MENSAGEM}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a barbearia no WhatsApp"
      className="group fixed right-4 bottom-24 z-40 flex items-center gap-2 rounded-full border border-red-500/40 bg-[#1b1b1b]/90 p-3 shadow-[0_10px_36px_-8px_rgba(225,6,0,0.55)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-red-500/70 hover:bg-[#1b1b1b] active:scale-95 md:bottom-6"
    >
      {/* Tooltip (desktop) */}
      <span className="pointer-events-none hidden max-w-0 items-center overflow-hidden text-xs font-semibold whitespace-nowrap text-white opacity-0 transition-all duration-300 group-hover:max-w-44 group-hover:opacity-100 md:flex">
        {nome} — tire suas dúvidas
      </span>
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff1a12] to-[#a3001d] text-white shadow-[0_0_24px_-4px_rgba(225,6,0,0.8)]">
        <MessageCircle className="size-5" />
        {/* Indicador de disponibilidade */}
        <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-[#1b1b1b] bg-emerald-400" />
      </span>
    </a>
  );
}
