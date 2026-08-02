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

/** Vídeo principal do hero (barbearia vintage em ação). */
export const VIDEO_HERO: VideoSource = {
  src: "https://upload.wikimedia.org/wikipedia/commons/e/e9/CUT_%26_SHAVE_%E2%80%A2_Penang%27s_Vintage_Barbershop_%E2%80%A2_George_Town_%E2%80%A2_MALAYSIA.webm",
  poster: POSTER_BARBEARIA,
};

/** Mapa nome → vídeo para os cards de serviço. */
export const VIDEO_POR_SERVICO: Record<string, VideoSource> = {
  "corte masculino": {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Haircut_practice_-_Tokyo_area_-_2013_1_30.webm",
    poster: POSTER_CORTE,
  },
  "corte + barba": {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/9e/First_Day_Of_Boot_Camp_%E2%80%93_Contraband_Room%2C_Barber_Shop.webm",
    poster: POSTER_BARBA,
  },
  "barba completa": {
    src: "https://upload.wikimedia.org/wikipedia/commons/0/08/President_Obama_drops_by_his_old_barbershop_for_a_haircut.webm",
    poster: POSTER_BARBA,
  },
  pigmentação: {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Haircut_practice_-_Tokyo_area_-_2013_1_30.webm",
    poster: POSTER_BARBEIRO,
  },
  "corte infantil": {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/9e/First_Day_Of_Boot_Camp_%E2%80%93_Contraband_Room%2C_Barber_Shop.webm",
    poster: POSTER_BARBEIRO,
  },
  pezinho: {
    src: "https://upload.wikimedia.org/wikipedia/commons/0/08/President_Obama_drops_by_his_old_barbershop_for_a_haircut.webm",
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
