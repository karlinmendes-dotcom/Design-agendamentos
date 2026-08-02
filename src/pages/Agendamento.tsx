import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  Scissors,
  User,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TimeSlotGrid } from "@/components/TimeSlotGrid";
import { LoadingState, ErrorState } from "@/components/Feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServicos } from "@/hooks/useServicos";
import { useConfiguracao } from "@/hooks/useConfiguracao";
import { useHorarios } from "@/hooks/useHorarios";
import { useAgendamentosPorData } from "@/hooks/useAgendamentos";
import { isSupabaseConfigured } from "@/services/supabase";
import { findOrCreateCliente } from "@/services/clientes";
import { criarAgendamento } from "@/services/agendamentos";
import { formatBRL, formatMinutes } from "@/utils/format";
import { formatDateWeekday } from "@/utils/date";
import { gerarSlots, filtrarSlotsOcupados } from "@/utils/slots";
import { maskPhone, isValidPhone, onlyDigits } from "@/utils/phone";
import { cn } from "@/lib/utils";

const PASSOS = ["Serviço", "Data", "Horário", "Seus dados", "Confirmar"];

export function Agendamento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const servicoParam = searchParams.get("servico");

  const { servicos, loading, error, refresh } = useServicos(true);
  const { diasDisponiveis, horarioFuncionamento } = useConfiguracao();
  const { horarios } = useHorarios(true);

  const [etapa, setEtapa] = useState(0);
  const [servicoId, setServicoId] = useState<string | null>(servicoParam);
  const [data, setData] = useState<string | null>(null);
  const [horario, setHorario] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  const servico = useMemo(
    () => servicos.find((s) => s.id === servicoId) ?? null,
    [servicos, servicoId],
  );

  // ===== Próximos dias disponíveis =====
  const diasDisponiveisLista = useMemo(() => {
    const dias: { iso: string; diaSemana: number }[] = [];
    const hoje = new Date();
    for (let i = 0; i < 15; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      const diaSemana = d.getDay();
      const temHorario = horarios.some(
        (h) => h.dia_semana === diaSemana && h.ativo,
      );
      if (diasDisponiveis.includes(diaSemana) && temHorario) {
        dias.push({
          iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
          diaSemana,
        });
      }
    }
    return dias;
  }, [diasDisponiveis, horarios]);

  // ===== Slots do dia selecionado =====
  const horarioDoDia = useMemo(() => {
    if (!data) return null;
    const dia = new Date(`${data}T12:00:00`).getDay();
    return horarios.find((h) => h.dia_semana === dia && h.ativo) ?? null;
  }, [data, horarios]);

  const { ocupados } = useAgendamentosPorData(data ?? "");

  const slots = useMemo(() => {
    if (!horarioDoDia || !servico) return [];
    const todos = gerarSlots(
      horarioDoDia.hora_inicio,
      horarioDoDia.hora_fim,
      servico.duracao_minutos,
    );
    return filtrarSlotsOcupados(todos, ocupados);
  }, [horarioDoDia, servico, ocupados]);

  const occupiedSet = useMemo(
    () => new Set(ocupados.map((o) => o.horario)),
    [ocupados],
  );

  const telefoneValido = isValidPhone(telefone);
  const podeAvancar =
    (etapa === 0 && !!servicoId) ||
    (etapa === 1 && !!data) ||
    (etapa === 2 && !!horario) ||
    (etapa === 3 && nome.trim().length >= 2 && telefoneValido);

  const confirmar = async () => {
    if (!servico || !data || !horario) return;
    setSalvando(true);
    setErroSalvar(null);
    try {
      if (isSupabaseConfigured) {
        const cliente = await findOrCreateCliente(
          nome.trim(),
          onlyDigits(telefone),
        );
        const agendamento = await criarAgendamento({
          cliente_id: cliente.id,
          servico_id: servico.id,
          data,
          horario,
        });
        navigate("/sucesso", { state: { agendamento, demo: false } });
      } else {
        // Modo demonstração: confirmação local sem banco
        navigate("/sucesso", {
          state: {
            demo: true,
            agendamento: {
              id: "demo-gerado",
              cliente_id: "demo",
              servico_id: servico.id,
              data,
              horario,
              status: "confirmado",
              created_at: new Date().toISOString(),
              cliente: { nome: nome.trim(), telefone },
              servico: {
                nome: servico.nome,
                preco: servico.preco,
                duracao_minutos: servico.duracao_minutos,
              },
            },
          },
        });
      }
    } catch (err) {
      setErroSalvar(
        err instanceof Error
          ? err.message
          : "Não foi possível concluir o agendamento. Tente novamente.",
      );
      setSalvando(false);
    }
  };

  return (
    <div className="bg-texture min-h-screen bg-charcoal">
      <Header />

      <section className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6">
        <div className="animate-slide-up mb-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
            Novo agendamento
          </p>
          <h1 className="font-display mt-3 text-3xl font-black text-cream sm:text-4xl">
            Reserve sua <span className="text-gradient-gold">cadeira</span>
          </h1>
        </div>

        {/* Progresso */}
        <div className="animate-slide-up mb-8 flex items-center justify-between gap-1 sm:gap-2" style={{ animationDelay: "0.05s" }}>
          {PASSOS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300",
                  i < etapa && "border-gold bg-gold text-charcoal",
                  i === etapa && "border-gold bg-gold/15 text-gold-light",
                  i > etapa && "border-border bg-card text-muted-foreground",
                )}
              >
                {i < etapa ? <Check className="size-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] font-medium tracking-wide uppercase sm:block",
                  i <= etapa ? "text-gold-light" : "text-muted-foreground/70",
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="animate-slide-up rounded-2xl border border-border/80 bg-card p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] sm:p-8" style={{ animationDelay: "0.1s" }}>
          {/* ETAPA 1 — Serviço */}
          {etapa === 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-cream">
                Escolha o serviço
              </h2>
              {loading ? (
                <LoadingState label="Carregando serviços..." />
              ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {servicos.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServicoId(s.id)}
                      className={cn(
                        "flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-all duration-200",
                        servicoId === s.id
                          ? "border-gold bg-gold/10 shadow-[0_0_0_1px_var(--color-gold)]"
                          : "border-border bg-background hover:border-gold/40",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-base font-bold text-cream">
                          {s.nome}
                        </span>
                        <Scissors className="size-4 text-gold" />
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {s.descricao}
                      </span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-semibold text-gold-light">
                          {formatBRL(s.preco)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {formatMinutes(s.duracao_minutos)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ETAPA 2 — Data */}
          {etapa === 1 && (
            <div>
              <h2 className="font-display text-xl font-bold text-cream">
                Escolha a data
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Atendemos de {(horarioFuncionamento ?? "Terça a Sábado — 09h às 19h").toLowerCase()}. Horários nos
                próximos 15 dias.
              </p>
              {diasDisponiveisLista.length === 0 ? (
                <p className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma data disponível no momento. Tente novamente mais tarde.
                </p>
              ) : (
                <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {diasDisponiveisLista.map((d) => (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => {
                        setData(d.iso);
                        setHorario(null);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-xl border px-2 py-3 transition-all duration-200",
                        data === d.iso
                          ? "border-gold bg-gold/10 shadow-[0_0_0_1px_var(--color-gold)]"
                          : "border-border bg-background hover:border-gold/40",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[11px] font-medium uppercase",
                          data === d.iso ? "text-gold-light" : "text-muted-foreground",
                        )}
                      >
                        {formatDateWeekday(d.iso).split(",")[0]}
                      </span>
                      <span className="font-display text-lg font-bold text-cream">
                        {d.iso.split("-")[2]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(`${d.iso}T12:00:00`).toLocaleDateString("pt-BR", {
                          month: "short",
                        })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ETAPA 3 — Horário */}
          {etapa === 2 && (
            <div>
              <h2 className="font-display text-xl font-bold text-cream">
                Escolha o horário
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {data &&
                  `${formatDateWeekday(data)} · ${formatMinutes(servico?.duracao_minutos ?? 30)} de duração`}
              </p>
              <div className="mt-5">
                <TimeSlotGrid
                  slots={slots}
                  occupied={occupiedSet}
                  selected={horario}
                  onSelect={setHorario}
                />
              </div>
            </div>
          )}

          {/* ETAPA 4 — Dados */}
          {etapa === 3 && (
            <div>
              <h2 className="font-display text-xl font-bold text-cream">
                Seus dados
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Precisamos apenas do essencial para confirmar seu horário.
              </p>
              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Como podemos te chamar?"
                      className="pl-9"
                      maxLength={80}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">WhatsApp / Telefone</Label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                      📱
                    </span>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(maskPhone(e.target.value))}
                      placeholder="(11) 98888-8888"
                      className="pl-10"
                      inputMode="tel"
                      maxLength={15}
                    />
                  </div>
                  {telefone && !telefoneValido && (
                    <p className="text-xs text-destructive">
                      Informe um telefone válido com DDD.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 5 — Confirmação */}
          {etapa === 4 && servico && data && horario && (
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                  <CalendarCheck className="size-5 text-gold" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-cream">
                    Tudo certo?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Revise o resumo antes de confirmar.
                  </p>
                </div>
              </div>

              <dl className="mt-6 space-y-3 rounded-xl border border-border bg-background p-5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Serviço</dt>
                  <dd className="text-right font-semibold text-cream">
                    {servico.nome}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Data</dt>
                  <dd className="font-semibold text-cream">
                    {formatDateWeekday(data)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Horário</dt>
                  <dd className="font-semibold text-cream">{horario}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd className="text-right font-semibold text-cream">
                    {nome.trim()} · {telefone}
                  </dd>
                </div>
                <div className="hairline my-1" />
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Valor</dt>
                  <dd className="font-display text-lg font-bold text-gradient-gold">
                    {formatBRL(servico.preco)}
                  </dd>
                </div>
              </dl>

              {erroSalvar && (
                <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {erroSalvar}
                </p>
              )}

              {!isSupabaseConfigured && (
                <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
                  Modo demonstração: a confirmação será exibida, mas o
                  agendamento só será salvo no banco após conectar o Supabase.
                </p>
              )}

              <Button
                variant="gold"
                size="lg"
                className="mt-6 w-full"
                disabled={salvando}
                onClick={() => void confirmar()}
              >
                {salvando ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <CalendarCheck className="size-5" />
                    Confirmar agendamento
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Navegação */}
          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-5">
            <Button
              variant="ghost"
              onClick={() => setEtapa((e) => Math.max(0, e - 1))}
              disabled={etapa === 0}
            >
              <ChevronLeft className="size-4" />
              Voltar
            </Button>
            {etapa < 4 ? (
              <Button
                onClick={() => setEtapa((e) => e + 1)}
                disabled={!podeAvancar}
              >
                Continuar
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button variant="ghost" asChild>
                <Link to="/servicos">Alterar serviço</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" />
          <Link to="/" className="transition-colors hover:text-gold-light">
            Voltar para o início
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
