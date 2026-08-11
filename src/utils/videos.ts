/**
 * Vídeos curtos de nail design (Mixkit — hotlink estável, licença livre).
 * Usados no hero e nos cards de serviços com reprodução automática,
 * sem áudio e em loop. Cada vídeo tem um poster de fallback.
 */

export interface VideoSource {
  src: string;
  poster: string;
}

const POSTER_MANICURE =
  "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=70";
const POSTER_NAIL_ART =
  "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=70";
const POSTER_PEDICURE =
  "https://images.unsplash.com/photo-1599553478940-d7d2d66cf9af?auto=format&fit=crop&w=1200&q=70";
const POSTER_ESTUDIO =
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=70";
const POSTER_ESMALTES =
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=70";

/** Vídeo principal do hero (manicure em ação — leve, 360p). */
export const VIDEO_HERO: VideoSource = {
  src: "https://assets.mixkit.co/videos/15125/15125-360.mp4",
  poster: POSTER_ESTUDIO,
};

/** Mapa nome → vídeo para os cards de serviço. */
export const VIDEO_POR_SERVICO: Record<string, VideoSource> = {
  manicure: {
    src: "https://assets.mixkit.co/videos/15806/15806-360.mp4",
    poster: POSTER_MANICURE,
  },
  pedicure: {
    src: "https://assets.mixkit.co/videos/27906/27906-360.mp4",
    poster: POSTER_PEDICURE,
  },
  esmaltacao: {
    src: "https://assets.mixkit.co/videos/13084/13084-360.mp4",
    poster: POSTER_ESMALTES,
  },
  alongamento: {
    src: "https://assets.mixkit.co/videos/24817/24817-360.mp4",
    poster: POSTER_NAIL_ART,
  },
  "nail art": {
    src: "https://assets.mixkit.co/videos/36905/36905-360.mp4",
    poster: POSTER_NAIL_ART,
  },
  spa: {
    src: "https://assets.mixkit.co/videos/21970/21970-360.mp4",
    poster: POSTER_PEDICURE,
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
    VIDEO_POR_SERVICO[chave ?? "manicure"] ?? VIDEO_POR_SERVICO["manicure"]
  );
}
