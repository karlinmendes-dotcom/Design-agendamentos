import { useRef, useState } from "react";
import { Clapperboard, ImageIcon, Images, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { erroMensagem } from "@/lib/convex";
import { useToast } from "@/contexts/ToastContext";

type Midia = {
  id: Id<"midias">;
  tipo: string;
  chave: string;
  url: string;
  storage_id: string | null;
};

/**
 * Biblioteca de mídia do painel — a dona sobe fotos e vídeos do celular
 * direto para o Convex (file storage). Depois o agente encaixa cada mídia
 * no lugar certo do site (capa de serviço, fundo da home, promoções...).
 */
export function MidiasAdmin() {
  const midias = useQuery(api.midias.list);
  const gerarUrl = useMutation(api.storage.gerarUrlUpload);
  const salvarArquivo = useMutation(api.midias.salvarArquivo);
  const removerMidia = useMutation(api.midias.remover);
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState<string | null>(null);
  const [removendoId, setRemovendoId] = useState<Id<"midias"> | null>(null);
  const { toast } = useToast();

  const enviarArquivos = async (arquivos: FileList | null) => {
    if (!arquivos || arquivos.length === 0) return;
    const lista = Array.from(arquivos);
    setEnviando(true);

    for (let i = 0; i < lista.length; i++) {
      const arquivo = lista[i];
      setProgresso(`Enviando ${i + 1} de ${lista.length}: ${arquivo.name}...`);
      try {
        const uploadUrl = await gerarUrl();
        const resposta = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": arquivo.type || "application/octet-stream",
          },
          body: arquivo,
        });
        if (!resposta.ok) {
          throw new Error(`Falha no envio (HTTP ${resposta.status}).`);
        }
        const corpo = await resposta.text();
        let storageId = "";
        try {
          const dados = JSON.parse(corpo);
          storageId = dados?.storageId ?? dados?.id ?? "";
        } catch {
          storageId = corpo.trim();
        }
        if (!storageId) throw new Error("O Convex não devolveu o ID do arquivo.");

        const tipo = arquivo.type.startsWith("video/") ? "video" : "imagem";
        await salvarArquivo({ storageId, tipo, nome: arquivo.name });
      } catch (err) {
        toast(
          "error",
          `Erro em "${arquivo.name}": ${erroMensagem(err, "não foi possível enviar.")}`,
        );
      }
    }

    setProgresso(null);
    setEnviando(false);
    if (inputRef.current) inputRef.current.value = "";
    toast("success", "Mídias enviadas para o Convex! 💛");
  };

  const excluir = async (m: Midia) => {
    setRemovendoId(m.id);
    try {
      await removerMidia({ id: m.id });
      toast("success", `"${m.chave}" removida.`);
    } catch (err) {
      toast("error", erroMensagem(err, "Erro ao remover a mídia."));
    } finally {
      setRemovendoId(null);
    }
  };

  const itens = midias ?? [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho + envio */}
      <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-gold-light/10 text-gold-light">
              <Images className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold">Mídias</h1>
              <p className="text-xs text-muted-foreground">
                Fotos e vídeos guardados no Convex — depois encaixamos cada um
                no lugar certo do site.
              </p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => enviarArquivos(e.target.files)}
          />
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            className="gap-2"
          >
            {enviando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {enviando ? "Enviando..." : "Escolher fotos e vídeos"}
          </Button>
        </div>

        {progresso && (
          <p className="mt-3 flex items-center gap-2 text-xs font-medium text-gold-light">
            <Loader2 className="size-3.5 animate-spin" />
            {progresso}
          </p>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Você pode selecionar várias de uma vez. Fotos e vídeos vão direto pro
          banco (Convex) — nada pesa aqui no chat.
        </p>
      </div>

      {/* Galeria */}
      {itens.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 bg-card/50 px-6 py-12 text-center">
          <Images className="size-8 text-muted-foreground/60" />
          <p className="text-sm font-semibold">Nenhuma mídia ainda</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Toque em "Escolher fotos e vídeos" e selecione os arquivos do
            celular. Eles aparecem aqui embaixo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {itens.map((m) => (
            <div
              key={m.id}
              className="group overflow-hidden rounded-xl border border-border/60 bg-card"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                {m.tipo === "video" ? (
                  <video
                    src={m.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={m.url}
                    alt={m.chave}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
                <Badge
                  className="absolute top-2 left-2 gap-1 border-0 bg-black/60 text-cream backdrop-blur"
                >
                  {m.tipo === "video" ? (
                    <Clapperboard className="size-3" />
                  ) : (
                    <ImageIcon className="size-3" />
                  )}
                  {m.tipo === "video" ? "vídeo" : "foto"}
                </Badge>
                <button
                  type="button"
                  onClick={() => excluir(m)}
                  disabled={removendoId === m.id}
                  aria-label={`Remover ${m.chave}`}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-md bg-black/60 text-cream opacity-0 backdrop-blur transition-opacity hover:bg-red-600/80 disabled:opacity-40 group-hover:opacity-100 max-sm:opacity-100"
                >
                  {removendoId === m.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </button>
              </div>
              <p className="truncate px-2.5 py-2 text-xs font-medium text-muted-foreground">
                {m.chave}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
