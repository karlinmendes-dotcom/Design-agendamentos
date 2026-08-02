import {
  Baby,
  Brush,
  Droplets,
  Footprints,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const normalize = (nome: string) =>
  nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function serviceIcon(nome: string): LucideIcon {
  const n = normalize(nome);
  if (n.includes("pezinho")) return Footprints;
  if (n.includes("infantil") || n.includes("crianca")) return Baby;
  if (n.includes("pigment")) return Droplets;
  if (n.includes("barba")) return Brush;
  if (n.includes("corte") || n.includes("cabelo")) return Scissors;
  return Sparkles;
}
