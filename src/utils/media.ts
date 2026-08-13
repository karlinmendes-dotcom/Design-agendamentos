import { videoParaServico } from "@/utils/videos";

/**
 * Biblioteca de mídia — camada de resolução de vídeos/imagens.
 *
 * Ordem de prioridade:
 * 1. `servico.video_url` / `poster_url` — mídia configurada pelo admin (banco)
 * 2. Fallback local (`utils/videos.ts`) por nome do serviço
 *
 * Assim, o administrador pode trocar vídeos/imagens sem tocar no código.
 * (A tabela `midias` do Convex guarda mídias com URL pública — usada quando
 * o admin sobe fotos/vídeos por link, ex.: capas de serviços.)
 */
export interface MediaSource {
  src: string;
  poster: string;
}

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
