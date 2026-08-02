import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoCoverProps {
  src: string;
  poster: string;
  alt?: string;
  className?: string;
  /** Preload mais agressivo para o hero (default: lazy para cards) */
  eager?: boolean;
}

/**
 * Vídeo de capa com reprodução automática, sem áudio e em loop.
 * - Lazy loading por padrão (carrega só quando entra na viewport).
 * - Fallback para o poster (imagem) se o vídeo não puder tocar.
 */
export function VideoCover({
  src,
  poster,
  alt,
  className,
  eager = false,
}: VideoCoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);

  // Lazy loading: só define a fonte quando o container está visível
  useEffect(() => {
    const el = containerRef.current;
    if (!el || eager) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setCarregando(false); // permite renderizar o vídeo
            obs.disconnect();
          }
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [eager]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tentarTocar = () => {
      v.play().catch(() => {
        // Autoplay bloqueado (ex.: dados restritos) — usa o poster
        setFalhou(true);
      });
    };
    v.addEventListener("loadeddata", tentarTocar);
    if (v.readyState >= 2) tentarTocar();
    return () => v.removeEventListener("loadeddata", tentarTocar);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden bg-coal", className)}
    >
      {/* Placeholder enquanto carrega */}
      {carregando && !falhou && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}

      {!falhou && (
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay={eager}
          preload={eager ? "auto" : "metadata"}
          onCanPlay={() => setCarregando(false)}
          onError={() => {
            setCarregando(false);
            setFalhou(true);
          }}
          aria-label={alt}
        />
      )}

      {/* Fallback: imagem do poster */}
      {falhou && (
        <img
          src={poster}
          alt={alt ?? ""}
          loading={eager ? "eager" : "lazy"}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  );
}
