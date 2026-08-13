import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Power, Tags, Trash2 } from "lucide-react";
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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { erroMensagem } from "@/lib/convex";
import { useToast } from "@/contexts/ToastContext";
import { formatBRL, formatMinutes } from "@/utils/format";
import type { Servico } from "@/types";

interface ComboForm {
  nome: string;
  descricao: string;
  preco: string;
  duracao_minutos: string;
  video_url: string;
  poster_url: string;
  itens_combo: string[];
}

const FORM_VAZIO: ComboForm = {
  nome: "",
  descricao: "",
  preco: "",
  duracao_minutos: "",
  video_url: "",
  poster_url: "",
  itens_combo: [],
};

export function CombosAdmin() {
  const { servicos: combos, loading, refresh } = useServicos(
    false,
    "combo",
  );
  const { servicos: cardapio } = useServicos(false, "servico");
  const criarServico = useMutation(api.servicos.criar);
  const atualizarServico = useMutation(api.servicos.atualizar);
  const setServicoAtivo = useMutation(api.servicos.setAtivo);
  const excluirServico = useMutation(api.servicos.excluir);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);
  const [form, setForm] = useState<ComboForm>(FORM_VAZIO);
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

  const abrirEdicao = (c: Servico) => {
    setEditando(c);
    setForm({
      nome: c.nome,
      descricao: c.descricao ?? "",
      preco: String(c.preco).replace(".", ","),
      duracao_minutos: String(c.duracao_minutos),
      video_url: c.video_url ?? "",
      poster_url: c.poster_url ?? "",
      itens_combo: [...c.itens_combo],
    });
    setDialogAberto(true);
  };

  const alternarItem = (nome: string) => {
    setForm((prev) => ({
      ...prev,
      itens_combo: prev.itens_combo.includes(nome)
        ? prev.itens_combo.filter((i) => i !== nome)
        : [...prev.itens_combo, nome],
    }));
  };

  const salvar = async () => {
    if (!form.nome.trim() || !form.preco || !form.duracao_minutos) {
      setErro("Preencha nome, preço e duração.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const dados = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        preco: Number(form.preco.replace(",", ".")),
        duracao_minutos: Number(form.duracao_minutos),
        video_url: form.video_url.trim() || null,
        poster_url: form.poster_url.trim() || null,
        is_combo: true,
        itens_combo: form.itens_combo,
      };
      if (editando) {
        await atualizarServico({ id: editando.id as Id<"servicos">, ...dados });
        toast("success", "Combo atualizado com sucesso.");
      } else {
        await criarServico(dados);
        toast("success", "Combo criado com sucesso.");
      }
      setDialogAberto(false);
      await refresh();
    } catch (err) {
      setErro(erroMensagem(err, "Erro ao salvar o combo."));
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (c: Servico) => {
    try {
      await setServicoAtivo({ id: c.id as Id<"servicos">, ativo: !c.ativo });
      toast("success", `Combo ${c.ativo ? "desativado" : "ativado"}.`);
      await refresh();
    } catch (err) {
      toast("error", erroMensagem(err, "Erro ao atualizar o combo."));
    }
  };

  const confirmarExclusao = async (c: Servico) => {
    if (excluindoId !== c.id) {
      setExcluindoId(c.id);
      return;
    }
    try {
      await excluirServico({ id: c.id as Id<"servicos"> });
      setExcluindoId(null);
      toast("success", "Combo excluído.");
      await refresh();
    } catch (err) {
      setExcluindoId(null);
      toast(
        "error",
        erroMensagem(
          err,
          "Não foi possível excluir. Pode haver agendamentos vinculados.",
        ),
      );
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Combos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Combine serviços em pacotes com preço único. Os combos aparecem na
            página Promoções e podem ser agendados como um serviço normal.
          </p>
        </div>
        <Button variant="gold" onClick={abrirNovo} >
          <Plus className="size-4" />
          Novo combo
        </Button>
      </div>


      <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : combos.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Tags}
              title="Nenhum combo cadastrado"
              description="Crie pacotes com mais de um serviço para atrair clientes com um preço especial."
              action={
                <Button variant="gold" size="sm" onClick={abrirNovo}>
                  <Plus className="size-4" />
                  Criar combo
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Combo</TableHead>
                <TableHead>Inclui</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combos.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium text-card-foreground">{c.nome}</p>
                    <p className="max-w-64 truncate text-xs text-muted-foreground">
                      {c.descricao ?? ""}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-56 text-xs text-muted-foreground">
                      {c.itens_combo.length > 0
                        ? c.itens_combo.join(" + ")
                        : "—"}
                    </p>
                  </TableCell>
                  <TableCell>{formatMinutes(c.duracao_minutos)}</TableCell>
                  <TableCell className="text-right font-display text-base font-bold text-gradient-red">
                    {formatBRL(c.preco)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.ativo ? "success" : "secondary"}>
                      {c.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => abrirEdicao(c)}
                        aria-label={`Editar ${c.nome}`}
                        
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void alternarAtivo(c)}
                        aria-label={c.ativo ? "Desativar" : "Ativar"}
                        
                        className={c.ativo ? "text-blood" : "text-muted-foreground"}
                      >
                        <Power className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void confirmarExclusao(c)}
                        aria-label={`Excluir ${c.nome}`}
                        
                        className={
                          excluindoId === c.id
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }
                      >
                        {excluindoId === c.id ? (
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
            <DialogTitle>{editando ? "Editar combo" : "Novo combo"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Ajuste as informações do combo."
                : "Monte um pacote de serviços com preço único."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cb-nome">Nome do combo</Label>
              <Input
                id="cb-nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex.: Combo Manicure + Pedicure"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cb-desc">Descrição</Label>
              <Textarea
                id="cb-desc"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="O que a cliente ganha com esse combo?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Serviços inclusos</Label>
              {cardapio.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                  Cadastre os serviços primeiro (aba Serviços) para montar os
                  combos.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cardapio.map((s) => {
                    const ativo = form.itens_combo.includes(s.nome);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => alternarItem(s.nome)}
                        aria-pressed={ativo}
                        className={
                          ativo
                            ? "inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-3 py-1.5 text-xs font-semibold text-cream shadow-sm"
                            : "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-gold/60 hover:text-foreground"
                        }
                      >
                        {ativo ? "✓ " : "+ "}
                        {s.nome}
                      </button>
                    );
                  })}
                </div>
              )}
              {form.itens_combo.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Inclui: {form.itens_combo.join(" + ")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cb-preco">Preço do combo (R$)</Label>
                <Input
                  id="cb-preco"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  placeholder="80,00"
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cb-duracao">Duração (minutos)</Label>
                <Input
                  id="cb-duracao"
                  value={form.duracao_minutos}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      duracao_minutos: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="100"
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cb-video">Vídeo (URL opcional)</Label>
              <Input
                id="cb-video"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                placeholder="https://... (usado no card do combo)"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cb-foto">Foto de capa (URL opcional)</Label>
              <Input
                id="cb-foto"
                value={form.poster_url}
                onChange={(e) => setForm({ ...form, poster_url: e.target.value })}
                placeholder="https://... (capa do card)"
                className="font-mono text-xs"
              />
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
