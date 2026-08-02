import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfiguracao } from "@/hooks/useConfiguracao";
import { useHorarios } from "@/hooks/useHorarios";
import { salvarConfiguracao } from "@/services/configuracoes";
import { upsertHorario } from "@/services/horarios";
import { useToast } from "@/contexts/ToastContext";
import { isSupabaseConfigured } from "@/services/supabase";
import { DIAS_SEMANA } from "@/utils/date";

interface DiaForm {
  ativo: boolean;
  inicio: string;
  fim: string;
}

export function Configuracoes() {
  const { configuracao, refresh: refreshConfig } = useConfiguracao();
  const { horarios, refresh: refreshHorarios } = useHorarios(false);

  const [nome, setNome] = useState("Barbearia Neto");
  const [logoUrl, setLogoUrl] = useState("");
  const [descricaoHorarios, setDescricaoHorarios] = useState("");
  const [dias, setDias] = useState<Record<number, DiaForm>>({});
  const [salvando, setSalvando] = useState(false);
  const { toast } = useToast();

  // Inicializa o formulário a partir dos dados carregados
  useEffect(() => {
    if (configuracao) {
      setNome(configuracao.nome_barbearia || "Barbearia Neto");
      setLogoUrl(configuracao.logo_url ?? "");
      setDescricaoHorarios(configuracao.horario_funcionamento ?? "");
    }
    if (horarios.length > 0) {
      const next: Record<number, DiaForm> = {};
      for (const h of horarios) {
        next[h.dia_semana] = {
          ativo: h.ativo,
          inicio: h.hora_inicio,
          fim: h.hora_fim,
        };
      }
      setDias(next);
    }
  }, [configuracao, horarios]);

  const toggleDia = (dia: number) => {
    setDias((prev) => {
      const atual = prev[dia] ?? { ativo: false, inicio: "09:00", fim: "19:00" };
      return { ...prev, [dia]: { ...atual, ativo: !atual.ativo } };
    });
  };

  const setDiaCampo = (dia: number, campo: "inicio" | "fim", valor: string) => {
    setDias((prev) => {
      const atual = prev[dia] ?? { ativo: false, inicio: "09:00", fim: "19:00" };
      return { ...prev, [dia]: { ...atual, [campo]: valor } };
    });
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const diasSelecionados = Object.entries(dias)
        .filter(([, d]) => d.ativo)
        .map(([k]) => Number(k));

      await salvarConfiguracao({
        nome_barbearia: nome.trim() || "Barbearia Neto",
        logo_url: logoUrl.trim() || null,
        horario_funcionamento: descricaoHorarios.trim() || null,
        dias_disponiveis: diasSelecionados,
      });

      for (const [diaStr, d] of Object.entries(dias)) {
        const dia = Number(diaStr);
        await upsertHorario({
          dia_semana: dia,
          hora_inicio: d.inicio || "09:00",
          hora_fim: d.fim || "19:00",
          ativo: d.ativo,
        });
      }

      await Promise.all([refreshConfig(), refreshHorarios()]);
      toast("success", "Configurações salvas com sucesso!");
    } catch (err) {
      toast(
        "error",
        err instanceof Error ? err.message : "Erro ao salvar as configurações.",
      );
    } finally {
      setSalvando(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div>
        <h1 className="font-display mb-2 text-2xl font-bold text-cream sm:text-3xl">
          Configurações
        </h1>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-8 text-center text-sm text-amber-300">
          Configure as chaves do Supabase em <code>.env</code> (
          <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>)
          para editar nome, logo, horários e dias de funcionamento.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize a identidade e o funcionamento da barbearia.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="c-nome">Nome da barbearia</Label>
              <Input
                id="c-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Barbearia Neto"
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
                placeholder="Terça a Sábado — 09h às 19h"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dias disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DIAS_SEMANA.map((nomeDia, dia) => {
              const d = dias[dia] ?? { ativo: false, inicio: "09:00", fim: "19:00" };
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
                    <span className="text-sm font-medium text-cream">{nomeDia}</span>
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
