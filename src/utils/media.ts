import { videoParaServico } from "@/utils/videos";
import type { VideoSource } from "@/utils/videos";

/**
 * Biblioteca de mídia — camada de resolução de vídeos/imagens.
 *
 * Ordem de prioridade:
 * 1. `servico.video_url` — vídeo configurado pelo admin (banco de dados)
 * 2. Biblioteca `midias` (Supabase) por chave — trocável sem código
 * 3. Fallback local (`utils/videos.ts`) por nome do serviço
 *
 * Assim, o administrador pode trocar vídeos/imagens sem tocar no código.
 */
export interface MediaSource {
  src: string;
  poster: string;
}

/** Mapa estático chave → vídeo usado como fallback da biblioteca local. */
const MIDIA_LOCAL: Record<string, VideoSource> = {
  hero: videoParaServico("manicure"),
  "servico-manicure": videoParaServico("manicure"),
  "servico-pedicure": videoParaServico("pedicure"),
  "servico-gel": videoParaServico("esmaltacao em gel"),
  logo: {
    src: videoParaServico("manicure").src,
    poster: videoParaServico("manicure").poster,
  },
};

/** Resolve o vídeo de um serviço usando a biblioteca de mídia. */
export function mediaParaServico(
  servico: {
    nome: string;
    video_url?: string | null;
    poster_url?: string | null;
  } | null | undefined,
): MediaSource {
  const fallback = videoParaServico(servico?.nome ?? "manicure");

  // 1. Vídeo/foto configurados diretamente no serviço (admin)
  if (servico?.video_url || servico?.poster_url) {
    return {
      src: servico?.video_url ?? fallback.src,
      poster: servico?.poster_url ?? fallback.poster,
    };
  }

  return fallback;
}

/** Resolve um item da biblioteca (hero, banner, logo) pela chave. */
export function mediaPorChave(chave: string): MediaSource {
  return MIDIA_LOCAL[chave] ?? videoParaServico("manicure");
}
