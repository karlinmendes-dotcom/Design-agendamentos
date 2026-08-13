import { useEffect, useState } from "react";
import { CalendarOff, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfiguracao } from "@/hooks/useConfiguracao";
import { useHorarios } from "@/hooks/useHorarios";
import { useBarbearia } from "@/hooks/useBarbearia";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { erroMensagem, isConvexConfigured } from "@/lib/convex";
import { useToast } from "@/contexts/ToastContext";
import { DIAS_SEMANA, formatDateShort, todayISO } from "@/utils/date";

interface DiaForm {
  ativo: boolean;
  inicio: string;
  fim: string;
}

const DIA_PADRAO: DiaForm = { ativo: false, inicio: "08:00", fim: "18:00" };

export function Configuracoes() {
  const { configuracao, refresh: refreshConfig } = useConfiguracao();
  const { horarios, refresh: refreshHorarios } = useHorarios(false);
  const { barbearia, refresh: refreshBarbearia } = useBarbearia();
  const salvarConfiguracao = useMutation(api.configuracoes.salvar);
  const salvarBarbearia = useMutation(api.barbearias.salvar);
  const upsertHorario = useMutation(api.horarios.upsert);
  const adicionarDataBloqueada = useMutation(api.datasBloqueadas.adicionar);
  const removerDataBloqueada = useMutation(api.datasBloqueadas.remover);
  const datasBloqueadas = useQuery(api.datasBloqueadas.list);

  const [nome, setNome] = useState("Studio Natália Braga");
  const [logoUrl, setLogoUrl] = useState("");
  const [descricaoHorarios, setDescricaoHorarios] = useState("");
  const [telefone, setTelefone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dias, setDias] = useState<Record<number, DiaForm>>({});
  const [salvando, setSalvando] = useState(false);
  const [novaData, setNovaData] = useState("");
  const [novoMotivo, setNovoMotivo] = useState("");
  const { toast } = useToast();

  // Inicializa o formulário a partir dos dados carregados.
  // IMPORTANTE: sempre popula os 7 dias (os sem registro ficam desligados),
  // para que o save grave todos os dias de forma consistente.
  useEffect(() => {
    if (configuracao) {
      setNome(configuracao.nome_barbearia || "Studio Natália Braga");
      setLogoUrl(configuracao.logo_url ?? "");
      setDescricaoHorarios(configuracao.horario_funcionamento ?? "");
    }
    if (barbearia) {
      setTelefone(barbearia.telefone ?? "");
      setInstagram(barbearia.instagram ?? "");
      setInstagramUrl(barbearia.instagram_url ?? "");
      setEndereco(barbearia.endereco ?? "");
    }
    const next: Record<number, DiaForm> = {};
    for (let dia = 0; dia <= 6; dia++) {
      const h = horarios.find((x) => x.dia_semana === dia);
      next[dia] = h
        ? { ativo: h.ativo, inicio: h.hora_inicio, fim: h.hora_fim }
        : { ...DIA_PADRAO };
    }
    setDias(next);
  }, [configuracao, horarios, barbearia]);

  const toggleDia = (dia: number) => {
    setDias((prev) => {
      const atual = prev[dia] ?? { ...DIA_PADRAO };
      return { ...prev, [dia]: { ...atual, ativo: !atual.ativo } };
    });
  };

  const setDiaCampo = (dia: number, campo: "inicio" | "fim", valor: string) => {
    setDias((prev) => {
      const atual = prev[dia] ?? { ...DIA_PADRAO };
      return { ...prev, [dia]: { ...atual, [campo]: valor } };
    });
  };

  const adicionarFeriado = async () => {
    if (!novaData) {
      toast("error", "Escolha a data do feriado/folga.");
      return;
    }
    try {
      await adicionarDataBloqueada({
        data: novaData,
        motivo: novoMotivo.trim() || null,
      });
      setNovaData("");
      setNovoMotivo("");
      toast("success", "Dia bloqueado! Ninguém consegue agendar nele.");
    } catch (err) {
      toast("error", erroMensagem(err, "Erro ao bloquear a data."));
    }
  };

  const removerFeriado = async (data: string) => {
    try {
      await removerDataBloqueada({ data });
      toast("success", "Data liberada novamente.");
    } catch (err) {
      toast("error", erroMensagem(err, "Erro ao liberar a data."));
    }
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      // Fonte única: os switches dos 7 dias. O dias_disponiveis é derivado
      // deles e os horarios recebem exatamente o mesmo estado — nunca divergem.
      const diasAtivos: number[] = [];
      for (let dia = 0; dia <= 6; dia++) {
        const d = dias[dia] ?? { ...DIA_PADRAO };
        if (d.ativo) diasAtivos.push(dia);
      }

      await salvarConfiguracao({
        nome_barbearia: nome.trim() || "Studio Natália Braga",
        logo_url: logoUrl.trim() || null,
        horario_funcionamento: descricaoHorarios.trim() || null,
        dias_disponiveis: diasAtivos,
      });

      // Contato & localização (tabela barbearias)
      await salvarBarbearia({
        telefone: telefone.trim() || null,
        instagram: instagram.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        endereco: endereco.trim() || null,
      });

      // Grava TODOS os 7 dias (inclusive os desligados) — sem registro órfão
      for (let dia = 0; dia <= 6; dia++) {
        const d = dias[dia] ?? { ...DIA_PADRAO };
        await upsertHorario({
          dia_semana: dia,
          hora_inicio: d.inicio || "08:00",
          hora_fim: d.fim || "18:00",
          ativo: d.ativo,
        });
      }

      await Promise.all([refreshConfig(), refreshHorarios(), refreshBarbearia()]);
      toast("success", "Configurações salvas com sucesso!");
    } catch (err) {
      toast(
        "error",
        erroMensagem(err, "Erro ao salvar as configurações."),
      );
    } finally {
      setSalvando(false);
    }
  };

  if (!isConvexConfigured) {
    return (
      <div>
        <h1 className="font-display mb-2 text-2xl font-bold text-foreground sm:text-3xl">
          Configurações
        </h1>
        <div className="rounded-xl border border-yellow-600/40 bg-yellow-500/15 px-5 py-8 text-center text-sm text-yellow-700">
          Configure a URL do Convex em <code>.env</code> (
          <code>VITE_CONVEX_URL</code>) para editar nome, logo, horários e dias
          de funcionamento.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize a identidade e o funcionamento do estúdio. Os dias
          desligados aqui ficam imediatamente indisponíveis para agendamento.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="c-nome">Nome do estúdio</Label>
              <Input
                id="c-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Studio Natália Braga"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-logo">URL do logo</Label>
              <Input
                id="c-logo"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Cole o endereço de uma imagem hospedada (ex.: Supabase Storage,
                Imgur).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-desc">Descrição dos horários (exibida no rodapé)</Label>
              <Input
                id="c-desc"
                value={descricaoHorarios}
                onChange={(e) => setDescricaoHorarios(e.target.value)}
                placeholder="Segunda a quinta: 08h às 18h · Sexta-feira: 08h às 16h"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato &amp; localização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="c-telefone">Telefone / WhatsApp</Label>
              <Input
                id="c-telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 98888-8888"
                inputMode="tel"
              />
              <p className="text-xs text-muted-foreground">
                Usado no botão flutuante, na página de contato e no rodapé.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-instagram">Instagram (nome exibido)</Label>
              <Input
                id="c-instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@naildesignstudio (sem o @)"
              />
              <p className="text-xs text-muted-foreground">
                É o nome que aparece no rodapé e na página de contato.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-instagram-url">Link do Instagram (clique)</Label>
              <Input
                id="c-instagram-url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/sua_conta"
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Cole o link completo do seu perfil. É ele que abre quando a
                cliente toca no Instagram. Vazio = usa o nome acima.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-endereco">Endereço</Label>
              <Input
                id="c-endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua Exemplo, 123 — Centro"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dias de atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="mb-3 text-xs text-muted-foreground">
              Desligue o dia que o estúdio não trabalha. O agendamento oculta o
              dia na hora — e o servidor recusa marcação nele.
            </p>
            {DIAS_SEMANA.map((nomeDia, dia) => {
              const d = dias[dia] ?? { ...DIA_PADRAO };
              return (
                <div
                  key={dia}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={d.ativo}
                      onCheckedChange={() => toggleDia(dia)}
                      aria-label={`Ativar ${nomeDia}`}
                    />
                    <span className="text-sm font-medium text-card-foreground">{nomeDia}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 transition-opacity ${d.ativo ? "opacity-100" : "pointer-events-none opacity-40"}`}
                  >
                    <Input
                      type="time"
                      value={d.inicio}
                      onChange={(e) => setDiaCampo(dia, "inicio", e.target.value)}
                      className="w-28"
                      aria-label={`Início ${nomeDia}`}
                    />
                    <span className="text-muted-foreground">até</span>
                    <Input
                      type="time"
                      value={d.fim}
                      onChange={(e) => setDiaCampo(dia, "fim", e.target.value)}
                      className="w-28"
                      aria-label={`Fim ${nomeDia}`}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feriados &amp; dias bloqueados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Bloqueie datas pontuais (feriados, férias, dia sem atendimento).
              O dia some do agendamento e o servidor recusa marcação nele.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="c-data">Data</Label>
                <Input
                  id="c-data"
                  type="date"
                  min={todayISO()}
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  className="sm:w-44"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="c-motivo">Motivo (opcional)</Label>
                <Input
                  id="c-motivo"
                  value={novoMotivo}
                  onChange={(e) => setNovoMotivo(e.target.value)}
                  placeholder="Ex.: Feriado municipal, férias..."
                  maxLength={80}
                />
              </div>
              <Button variant="gold" onClick={() => void adicionarFeriado()}>
                <Plus className="size-4" />
                Bloquear dia
              </Button>
            </div>

            {datasBloqueadas === undefined ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Carregando...
              </p>
            ) : datasBloqueadas.length === 0 ? (
              <p className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                <CalendarOff className="size-4" />
                Nenhum dia bloqueado por enquanto.
              </p>
            ) : (
              <ul className="space-y-2">
                {datasBloqueadas.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-red-500/10">
                        <CalendarOff className="size-4 text-red-700" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {formatDateShort(d.data)}
                        </p>
                        {d.motivo && (
                          <p className="text-xs text-muted-foreground">{d.motivo}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void removerFeriado(d.data)}
                      aria-label={`Liberar ${formatDateShort(d.data)}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Button variant="gold" size="lg" onClick={() => void salvar()} disabled={salvando}>
          {salvando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Salvar configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
