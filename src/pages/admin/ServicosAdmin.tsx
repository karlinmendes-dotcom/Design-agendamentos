import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Power, Scissors, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useServicos } from "@/hooks/useServicos";
import {
  atualizarServico,
  criarServico,
  excluirServico,
  setServicoAtivo,
} from "@/services/servicos";
import { useToast } from "@/contexts/ToastContext";
import { formatBRL, formatMinutes } from "@/utils/format";
import { isSupabaseConfigured } from "@/services/supabase";
import type { Servico, ServicoFormData } from "@/types";

const FORM_VAZIO: ServicoFormData = {
  nome: "",
  descricao: "",
  preco: "",
  duracao_minutos: "",
  video_url: "",
  poster_url: "",
};

export function ServicosAdmin() {
  const { servicos, loading, refresh, usandoDemo } = useServicos(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);
  const [form, setForm] = useState<ServicoFormData>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!dialogAberto) {
      setEditando(null);
      setForm(FORM_VAZIO);
      setErro(null);
    }
  }, [dialogAberto]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(FORM_VAZIO);
    setDialogAberto(true);
  };

  const abrirEdicao = (s: Servico) => {
    setEditando(s);
    setForm({
      nome: s.nome,
      descricao: s.descricao ?? "",
      preco: String(s.preco).replace(".", ","),
      duracao_minutos: String(s.duracao_minutos),
      video_url: s.video_url ?? "",
      poster_url: s.poster_url ?? "",
    });
    setDialogAberto(true);
  };

  const salvar = async () => {
    if (!form.nome.trim() || !form.preco || !form.duracao_minutos) {
      setErro("Preencha nome, preço e duração.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      if (editando) {
        await atualizarServico(editando.id, {
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || null,
          preco: Number(form.preco.replace(",", ".")),
          duracao_minutos: Number(form.duracao_minutos),
          video_url: form.video_url.trim() || null,
          poster_url: form.poster_url.trim() || null,
        });
        toast("success", "Serviço atualizado com sucesso.");
      } else {
        await criarServico(form);
        toast("success", "Serviço criado com sucesso.");
      }
      setDialogAberto(false);
      await refresh(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar o serviço.");
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (s: Servico) => {
    try {
      await setServicoAtivo(s.id, !s.ativo);
      toast("success", `Serviço ${s.ativo ? "desativado" : "ativado"}.`);
      await refresh(true);
    } catch (err) {
      toast(
        "error",
        err instanceof Error ? err.message : "Erro ao atualizar serviço.",
      );
    }
  };

  const confirmarExclusao = async (s: Servico) => {
    if (excluindoId !== s.id) {
      setExcluindoId(s.id);
      return;
    }
    try {
      await excluirServico(s.id);
      setExcluindoId(null);
      toast("success", "Serviço excluído.");
      await refresh(true);
    } catch (err) {
      setExcluindoId(null);
      toast(
        "error",
        err instanceof Error
          ? err.message
          : "Não foi possível excluir. Pode haver agendamentos vinculados.",
      );
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Serviços
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione, edite valores e durações, e ative ou desative serviços.
          </p>
        </div>
        <Button variant="gold" onClick={abrirNovo} disabled={!isSupabaseConfigured}>
          <Plus className="size-4" />
          Novo serviço
        </Button>
      </div>

      {usandoDemo && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
          Mostrando serviços de demonstração. Conecte o Supabase para editar os
          serviços reais.
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : servicos.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Scissors}
              title="Nenhum serviço cadastrado"
              description="Crie o primeiro serviço para começar a receber agendamentos."
              action={
                <Button variant="gold" size="sm" onClick={abrirNovo}>
                  <Plus className="size-4" />
                  Criar serviço
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicos.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium text-cream">{s.nome}</p>
                    <p className="max-w-64 truncate text-xs text-muted-foreground">
                      {s.descricao ?? ""}
                    </p>
                    {s.video_url && (
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-red-400/80">
                        <span className="size-1.5 rounded-full bg-red-500" />
                        vídeo personalizado
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{formatMinutes(s.duracao_minutos)}</TableCell>
                  <TableCell className="text-right font-display text-base font-bold text-gold-light">
                    {formatBRL(s.preco)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.ativo ? "success" : "secondary"}>
                      {s.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => abrirEdicao(s)}
                        aria-label={`Editar ${s.nome}`}
                        disabled={!isSupabaseConfigured}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void alternarAtivo(s)}
                        aria-label={s.ativo ? "Desativar" : "Ativar"}
                        disabled={!isSupabaseConfigured}
                        className={s.ativo ? "text-gold" : "text-muted-foreground"}
                      >
                        <Power className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void confirmarExclusao(s)}
                        aria-label={`Excluir ${s.nome}`}
                        disabled={!isSupabaseConfigured}
                        className={
                          excluindoId === s.id ? "text-destructive" : "text-muted-foreground"
                        }
                      >
                        {excluindoId === s.id ? (
                          <span className="text-[10px] font-bold">OK?</span>
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar serviço" : "Novo serviço"}
            </DialogTitle>
            <DialogDescription>
              {editando
                ? "Ajuste as informações do serviço."
                : "Cadastre um novo serviço para seus clientes."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="s-nome">Nome do serviço</Label>
              <Input
                id="s-nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex.: Corte Masculino"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-desc">Descrição</Label>
              <Textarea
                id="s-desc"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="O que está incluso no serviço?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-video">Vídeo (URL opcional)</Label>
              <Input
                id="s-video"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                placeholder="https://... (usado no card do serviço)"
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para usar o vídeo padrão da biblioteca de mídia.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-foto">Foto de capa (URL opcional)</Label>
              <Input
                id="s-foto"
                value={form.poster_url}
                onChange={(e) => setForm({ ...form, poster_url: e.target.value })}
                placeholder="https://... (capa do card enquanto o vídeo carrega)"
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-preco">Preço (R$)</Label>
                <Input
                  id="s-preco"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  placeholder="45,00"
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-duracao">Duração (minutos)</Label>
                <Input
                  id="s-duracao"
                  value={form.duracao_minutos}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      duracao_minutos: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="40"
                  inputMode="numeric"
                />
              </div>
            </div>
            {erro && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {erro}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button variant="gold" onClick={() => void salvar()} disabled={salvando}>
              {salvando ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
