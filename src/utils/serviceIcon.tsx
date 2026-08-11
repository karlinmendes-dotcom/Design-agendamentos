import {
  Footprints,
  Flower2,
  Gem,
  Hand,
  Paintbrush,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const normalize = (nome: string) =>
  nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function serviceIcon(nome: string): LucideIcon {
  const n = normalize(nome);
  if (n.includes("pedicure")) return Footprints;
  if (n.includes("spa") || n.includes("hidrat")) return Flower2;
  if (n.includes("alongamento") || n.includes("acrilico") || n.includes("fibra")) return Gem;
  if (n.includes("esmalt") || n.includes("gel")) return Paintbrush;
  if (n.includes("nail") || n.includes("art") || n.includes("francesinha")) return Palette;
  if (n.includes("manicure") || n.includes("unha")) return Hand;
  return Sparkles;
}
