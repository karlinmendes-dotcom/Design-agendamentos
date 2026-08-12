import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import {
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  obterCredenciaisAdmin,
  salvarCredenciaisAdmin,
} from "@/hooks/useAdminAuth";
import { formatDateShort } from "@/utils/date";

interface Membro {
  id: Id<"admins">;
  usuario: string;
  senha: string;
  nome: string | null;
  ativo: boolean;
  criado_em: string;
}

const SEM_PERMISSAO = "Sem permissão para gerenciar a equipe.";

function erroBonito(msg: string): string {
  if (msg.includes("Sem permissão")) return SEM_PERMISSAO;
  if (msg.includes("já existe")) return "Já existe um administrador com esse usuário.";
  if (msg.includes("pelo menos 4")) return "A senha precisa ter pelo menos 4 caracteres.";
  if (msg.includes("usuário válido")) return "Informe um usuário válido.";
  return msg;
}

export function Equipe() {
  const listar = useMutation(api.admin.listar);
  const criar = useMutation(api.admin.criar);
  const atualizar = useMutation(api.admin.atualizar);
  const remover = useMutation(api.admin.remover);
  const verificarSenha = useMutation(api.admin.verificarSenha);

  const [creds, setCreds] = useState(obterCredenciaisAdmin);
  const [desbloqueio, setDesbloqueio] = useState({ usuario: "", senha: "" });
  const [erroDesbloqueio, setErroDesbloqueio] = useState<string | null>(null);

  const [membros, setMembros] = useState<Membro[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Membro | null>(null);
  const [form, setForm] = useState({ nome: "", usuario: "", senha: "" });
  const [formAtivo, setFormAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!creds) return;
    setCarregando(true);
    setErro(null);
    try {
      const lista = await listar({
        adminUsuario: creds.usuario,
        adminSenha: creds.senha,
      });
      setMembros(lista);
    } catch (e) {
      setErro(erroBonito(e instanceof Error ? e.message : String(e)));
    } finally {
      setCarregando(false);
    }
  }, [creds, listar]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const handleDesbloquear = async (e: FormEvent) => {
    e.preventDefault();
    setErroDesbloqueio(null);
    try {
      const ok = await verificarSenha({
        usuario: desbloqueio.usuario,
        senha: desbloqueio.senha,
      });
      if (ok) {
        salvarCredenciaisAdmin(desbloqueio.usuario, desbloqueio.senha);
        setCreds({ usuario: desbloqueio.usuario, senha: desbloqueio.senha });
      } else {
        setErroDesbloqueio("Usuário ou senha incorretos.");
      }
    } catch {
      setErroDesbloqueio("Não foi possível verificar agora. Tente de novo.");
    }
  };

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: "", usuario: "", senha: "" });
    setFormAtivo(true);
    setErroForm(null);
    setDialogAberto(true);
  };

  const abrirEdicao = (m: Membro) => {
    setEditando(m);
    setForm({ nome: m.nome ?? "", usuario: m.usuario, senha: m.senha });
    setFormAtivo(m.ativo);
    setErroForm(null);
    setDialogAberto(true);
  };

  const handleSalvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!creds || salvando) return;
    setSalvando(true);
    setErroForm(null);
    try {
      if (editando) {
        await atualizar({
          adminUsuario: creds.usuario,
          adminSenha: creds.senha,
          id: editando.id,
          usuario: form.usuario,
          senha: form.senha,
          nome: form.nome,
          ativo: formAtivo,
        });
      } else {
        await criar({
          adminUsuario: creds.usuario,
          adminSenha: creds.senha,
          usuario: form.usuario,
          senha: form.senha,
          nome: form.nome,
        });
      }
      setDialogAberto(false);
      void carregar();
    } catch (err) {
      setErroForm(erroBonito(err instanceof Error ? err.message : String(err)));
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (m: Membro, ativo: boolean) => {
    if (!creds) return;
    setErro(null);
    try {
      await atualizar({
        adminUsuario: creds.usuario,
        adminSenha: creds.senha,
        id: m.id,
        usuario: m.usuario,
        senha: m.senha,
        nome: m.nome ?? "",
        ativo,
      });
      void carregar();
    } catch (err) {
      setErro(erroBonito(err instanceof Error ? err.message : String(err)));
    }
  };

  const excluir = async (m: Membro) => {
    if (!creds) return;
    if (
      !window.confirm(
        `Remover ${m.nome ?? m.usuario} da equipe? Ela perde o acesso ao painel na hora.`,
      )
    ) {
      return;
    }
    setErro(null);
    try {
      await remover({
        adminUsuario: creds.usuario,
        adminSenha: creds.senha,
        id: m.id,
      });
      void carregar();
    } catch (err) {
      setErro(erroBonito(err instanceof Error ? err.message : String(err)));
    }
  };

  // -------- Sem credenciais salvas: pede o acesso para liberar a tela --------
  if (!creds) {
    return (
      <div className="mx-auto max-w-md">
        <div className="mb-5">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-gold uppercase">
            <ShieldCheck className="size-4" /> Equipe
          </p>
          <h1 className="font-display mt-2 text-2xl font-bold text-foreground">
            Gerenciar quem entra no painel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Digite seu usuário e senha para liberar o gerenciamento.
          </p>
        </div>
        <form
          onSubmit={(e) => void handleDesbloquear(e)}
          className="rounded-2xl border border-border/70 bg-card p-5"
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="du">Usuário</Label>
              <Input
                id="du"
                value={desbloqueio.usuario}
                onChange={(e) =>
                  setDesbloqueio((v) => ({ ...v, usuario: e.target.value }))
                }
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ds">Senha</Label>
              <Input
                id="ds"
                type="password"
                value={desbloqueio.senha}
                onChange={(e) =>
                  setDesbloqueio((v) => ({ ...v, senha: e.target.value }))
                }
                placeholder="••••••"
                autoComplete="current-password"
              />
            </div>
            {erroDesbloqueio && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600">
                {erroDesbloqueio}
              </p>
            )}
            <Button
              type="submit"
              disabled={!desbloqueio.usuario || !desbloqueio.senha}
              className="w-full"
            >
              Liberar gerenciamento
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-gold uppercase">
            <Users className="size-4" /> Equipe
          </p>
          <h1 className="font-display mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Quem entra no painel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione, edite ou remova administradores — tudo libera na hora,
            sem mexer em código.
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="size-4" />
          Adicionar membro
        </Button>
      </div>

      {erro && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {erro}
        </p>
      )}

      {carregando && membros === null ? (
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card p-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Carregando equipe...
        </div>
      ) : membros && membros.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Senha</TableHead>
                <TableHead>Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membros.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-gradient font-display text-xs font-bold text-cream">
                        {(m.nome ?? m.usuario).charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-card-foreground">
                          {m.nome ?? "—"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          desde {formatDateShort(m.criado_em.slice(0, 10))}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{m.usuario}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
                      <KeyRound className="size-3.5" />
                      {m.senha}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={m.ativo}
                        onCheckedChange={(v) => void alternarAtivo(m, v)}
                        aria-label={`Acesso de ${m.usuario}`}
                      />
                      {m.ativo ? (
                        <Badge>Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Desativado</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirEdicao(m)}
                        aria-label={`Editar ${m.usuario}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void excluir(m)}
                        aria-label={`Remover ${m.usuario}`}
                        className="text-red-600 hover:bg-red-500/10 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum administrador cadastrado ainda — clique em{" "}
          <span className="font-semibold">Adicionar membro</span> para começar.
        </div>
      )}

      {/* Diálogo de adicionar/editar */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar membro da equipe" : "Adicionar membro"}
            </DialogTitle>
            <DialogDescription>
              {editando
                ? "Ajuste os dados e o acesso dela ao painel."
                : "Ela já pode entrar no painel assim que você salvar."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleSalvar(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fnome">Nome</Label>
              <Input
                id="fnome"
                value={form.nome}
                onChange={(e) => setForm((v) => ({ ...v, nome: e.target.value }))}
                placeholder="Ex.: Ana Paula"
                maxLength={60}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fusuario">Usuário</Label>
                <Input
                  id="fusuario"
                  value={form.usuario}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, usuario: e.target.value }))
                  }
                  placeholder="ex.: ana"
                  maxLength={30}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fsenha">Senha</Label>
                <Input
                  id="fsenha"
                  value={form.senha}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, senha: e.target.value }))
                  }
                  placeholder="mínimo 4 caracteres"
                  maxLength={60}
                />
              </div>
            </div>
            {editando && (
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    Pode entrar no painel
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Desligue para bloquear o acesso sem apagar o cadastro.
                  </p>
                </div>
                <Switch
                  checked={formAtivo}
                  onCheckedChange={setFormAtivo}
                  aria-label="Pode entrar no painel"
                />
              </div>
            )}
            {erroForm && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600">
                {erroForm}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAberto(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={salvando || !form.usuario || !form.senha}
              >
                {salvando ? "Salvando..." : editando ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
