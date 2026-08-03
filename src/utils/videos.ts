/**
 * Vídeos curtos de barbearia (Wikimedia Commons — hotlink estável).
 * Usados no hero e nos cards de serviços com reprodução automática,
 * sem áudio e em loop. Cada vídeo tem um poster de fallback.
 */

export interface VideoSource {
  src: string;
  poster: string;
}

const POSTER_CORTE =
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=70";
const POSTER_BARBA =
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=70";
const POSTER_BARBEARIA =
  "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1600&q=70";
const POSTER_BARBEIRO =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=70";

/** Vídeo principal do hero (close do barbeiro trabalhando — leve, 360p). */
export const VIDEO_HERO: VideoSource = {
  src: "https://assets.mixkit.co/videos/43242/43242-360.mp4",
  poster: POSTER_BARBEARIA,
};

/** Mapa nome → vídeo para os cards de serviço. */
export const VIDEO_POR_SERVICO: Record<string, VideoSource> = {
  "corte masculino": {
    src: "https://assets.mixkit.co/videos/43221/43221-360.mp4",
    poster: POSTER_CORTE,
  },
  "corte + barba": {
    src: "https://assets.mixkit.co/videos/43222/43222-360.mp4",
    poster: POSTER_BARBA,
  },
  "barba completa": {
    src: "https://assets.mixkit.co/videos/40130/40130-360.mp4",
    poster: POSTER_BARBA,
  },
  pigmentação: {
    src: "https://assets.mixkit.co/videos/40120/40120-360.mp4",
    poster: POSTER_BARBEIRO,
  },
  "corte infantil": {
    src: "https://assets.mixkit.co/videos/43233/43233-360.mp4",
    poster: POSTER_BARBEIRO,
  },
  pezinho: {
    src: "https://assets.mixkit.co/videos/40127/40127-360.mp4",
    poster: POSTER_CORTE,
  },
};

const normalize = (nome: string) =>
  nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Retorna o vídeo mais adequado para um nome de serviço. */
export function videoParaServico(nome: string): VideoSource {
  const n = normalize(nome);
  const chave = Object.keys(VIDEO_POR_SERVICO).find((k) =>
    n.includes(k.replace(/\+/g, " ")),
  );
  return (
    VIDEO_POR_SERVICO[chave ?? "corte masculino"] ?? VIDEO_POR_SERVICO["corte masculino"]
  );
}
