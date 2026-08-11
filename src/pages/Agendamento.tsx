import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  ChevronLeft,
  Clock,
  Hand,
  Loader2,
  User,
  UserRound,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { TimeSlotGrid } from "@/components/TimeSlotGrid";
import { LoadingState, ErrorState } from "@/components/Feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServicos } from "@/hooks/useServicos";
import { useConfiguracao } from "@/hooks/useConfiguracao";
import { useHorarios } from "@/hooks/useHorarios";
import { useDatasBloqueadas } from "@/hooks/useDatasBloqueadas";
import { useBarbeiros } from "@/hooks/useBarbeiros";
import { useAgendamentosPorData } from "@/hooks/useAgendamentos";
import { useIdentidadeCliente } from "@/hooks/useIdentidadeCliente";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { erroMensagem, isConvexConfigured } from "@/lib/convex";
import { obterTokenPush, registrarSW } from "@/lib/firebase";
import { formatBRL, formatMinutes } from "@/utils/format";
import { formatDateWeekday } from "@/utils/date";
import {
  gerarSlots,
  filtrarSlotsOcupados,
  filtrarSlotsPassados,
} from "@/utils/slots";
import { maskPhone, isValidPhone, onlyDigits } from "@/utils/phone";
import { linkConfirmacaoWhatsApp } from "@/utils/whatsapp";
import type { Agendamento } from "@/types";
import { cn } from "@/lib/utils";

const PASSOS_BASE = ["Serviço", "Data", "Horário", "Seus dados", "Confirmar"];
const PASSOS_BARBEIRO = ["Serviço", "Profissional", "Data", "Horário", "Seus dados", "Confirmar"];

export function Agendamento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const servicoParam = searchParams.get("servico");
  const dataParam = searchParams.get("data");
  const dataParamValido =
    !!dataParam && /^\d{4}-\d{2}-\d{2}$/.test(dataParam);

  const { servicos, loading, error, refresh } = useServicos(true);
  const { diasDisponiveis, horarioFuncionamento, loading: loadingConfig } =
    useConfiguracao();
  const { horarios, loading: loadingHorarios } = useHorarios(true);
  const { bloqueadas: datasBloqueadas, loading: loadingBloqueadas } =
    useDatasBloqueadas();
  const { barbeiros } = useBarbeiros();
  const findOrCreateCliente = useMutation(api.clientes.findOrCreate);
  const criarAgendamento = useMutation(api.agendamentos.criar);
  const registrarTokenPush = useMutation(api.pushTokens.registrar);

  // A etapa de barbeiro aparece apenas quando há barbeiros ativos
  const temBarbeiros = barbeiros.length > 0;
  const passos = temBarbeiros ? PASSOS_BARBEIRO : PASSOS_BASE;
  const indiceData = temBarbeiros ? 2 : 1;
  const indiceHorario = temBarbeiros ? 3 : 2;
  const indiceDados = temBarbeiros ? 4 : 3;

  // Quem já entrou no app não precisa digitar os dados de novo
  const { identidade } = useIdentidadeCliente();

  const [etapa, setEtapa] = useState(0);
  const [servicoId, setServicoId] = useState<string | null>(servicoParam);
  const [barbeiroId, setBarbeiroId] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [horario, setHorario] = useState<string | null>(null);
  const [nome, setNome] = useState(identidade?.nome ?? "");
  const [telefone, setTelefone] = useState(
    identidade?.telefone ? maskPhone(identidade.telefone) : "",
  );
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const dadosAvancouRef = useRef(false);
  const avancouParamRef = useRef(false);

  const servico = useMemo(
    () => servicos.find((s) => s.id === servicoId) ?? null,
    [servicos, servicoId],
  );
  const barbeiro = useMemo(
    () => barbeiros.find((b) => b.id === barbeiroId) ?? null,
    [barbeiros, barbeiroId],
  );

  // ===== Avanço automático: escolheu → já abre a próxima fase =====
  const avancar = (deEtapa: number, aposMs = 280) => {
    window.setTimeout(() => {
      setEtapa((e) => (e === deEtapa ? Math.min(e + 1, passos.length - 1) : e));
    }, aposMs);
  };

  // Serviço vindo da URL (?servico=id) avança sozinho assim que carrega
  useEffect(() => {
    if (servicoParam && servico && etapa === 0 && !avancouParamRef.current) {
      avancouParamRef.current = true;
      avancar(0, 350);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servico, servicoParam, etapa]);

  // Últimos dados preenchidos → vai direto para a revisão final
  const dadosOk = nome.trim().length >= 2 && isValidPhone(telefone);
  useEffect(() => {
    if (etapa === indiceDados && dadosOk && !dadosAvancouRef.current) {
      dadosAvancouRef.current = true;
      avancar(indiceDados, 400);
    }
    if (etapa !== indiceDados) dadosAvancouRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa, dadosOk, indiceDados]);

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
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (
        diasDisponiveis.includes(diaSemana) &&
        temHorario &&
        !datasBloqueadas.has(iso)
      ) {
        dias.push({ iso, diaSemana });
      }
    }
    return dias;
  }, [diasDisponiveis, horarios, datasBloqueadas]);

  // ===== Remarcação com dia vindo da URL (?data=YYYY-MM-DD) =====
  const dataParamDisponivel = useMemo(() => {
    if (!dataParamValido) return false;
    return diasDisponiveisLista.some((d) => d.iso === dataParam);
  }, [dataParam, dataParamValido, diasDisponiveisLista]);

  // Aplica o dia da URL assim que a cliente chega na etapa de data: marca o
  // dia e avança sozinha para a escolha do horário.
  const dataParamAplicadoRef = useRef(false);
  useEffect(() => {
    if (
      !dataParamValido ||
      !dataParamDisponivel ||
      dataParamAplicadoRef.current
    )
      return;
    if (etapa !== indiceData) return;
    dataParamAplicadoRef.current = true;
    setData(dataParam);
    setHorario(null);
    avancar(indiceData, 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataParam, dataParamValido, dataParamDisponivel, etapa, indiceData]);

  // ===== Slots do dia selecionado =====
  const horarioDoDia = useMemo(() => {
    if (!data) return null;
    const dia = new Date(`${data}T12:00:00`).getDay();
    return horarios.find((h) => h.dia_semana === dia && h.ativo) ?? null;
  }, [data, horarios]);

  // Os ocupados consideram apenas o barbeiro selecionado (agenda individual)
  const { ocupados } = useAgendamentosPorData(data ?? "", barbeiroId);

  const slots = useMemo(() => {
    if (!horarioDoDia || !servico) return { grade: [], bloqueados: new Set<string>() };
    // Grade completa (30 em 30 min) para exibição — horários tomados aparecem bloqueados
    const grade = gerarSlots(
      horarioDoDia.hora_inicio,
      horarioDoDia.hora_fim,
      30,
    );
    // Candidatos respeitando a duração do serviço escolhido
    const candidatos = gerarSlots(
      horarioDoDia.hora_inicio,
      horarioDoDia.hora_fim,
      servico.duracao_minutos,
    );
    // Mesmo dia: remove horários que já passaram
    const disponiveis = filtrarSlotsPassados(
      filtrarSlotsOcupados(candidatos, ocupados),
      data ?? "",
    );
    const livres = new Set(disponiveis);
    const bloqueados = new Set<string>();
    for (const s of grade) {
      if (!livres.has(s)) bloqueados.add(s);
    }
    return { grade, bloqueados };
  }, [horarioDoDia, servico, ocupados, data]);

  // Se o horário selecionado virar bloqueado (ex.: troca de barbeiro), desmarca
  useEffect(() => {
    if (horario && slots.bloqueados.has(horario)) {
      setHorario(null);
    }
  }, [horario, slots.bloqueados]);

  const telefoneValido = isValidPhone(telefone);

  const confirmar = async () => {
    if (!servico || !data || !horario) return;
    setSalvando(true);
    setErroSalvar(null);

    // Pedido de notificação logo no clique (gesto do usuário): o navegador só
    // mostra o "pop" de aviso se a cliente PERMITIR. O token do navegador dela
    // é salvo depois, junto com o telefone, assim que o agendamento existir.
    let permissaoPush = false;
    try {
      if ("Notification" in window && Notification.permission !== "denied") {
        permissaoPush =
          Notification.permission === "granted" ||
          (await Notification.requestPermission()) === "granted";
      }
    } catch {
      permissaoPush = false;
    }

    // Monta o resumo completo e abre o WhatsApp do cliente NA HORA do clique,
    // com dia, horário, serviço, profissional e valor (mensagem pronta).
    const resumo: Agendamento = {
      id: "confirmando",
      cliente_id: "x",
      servico_id: servico.id,
      data,
      horario,
      status: "confirmado",
      created_at: new Date().toISOString(),
      barbearia_id: null,
      barbeiro_id: barbeiroId,
      cliente: { nome: nome.trim(), telefone },
      servico: {
        nome: servico.nome,
        preco: servico.preco,
        duracao_minutos: servico.duracao_minutos,
      },
      barbeiro: barbeiro ? { nome: barbeiro.nome } : null,
    };
    const linkWhats = linkConfirmacaoWhatsApp(resumo);
    if (linkWhats) window.open(linkWhats, "_blank", "noopener");

    try {
      if (isConvexConfigured) {
        const cliente = await findOrCreateCliente({
          nome: nome.trim(),
          telefone: onlyDigits(telefone),
        });
        const agendamento = await criarAgendamento({
          cliente_id: cliente.id,
          servico_id: servico.id as Id<"servicos">,
          data,
          horario,
          duracao_minutos: servico.duracao_minutos,
          barbeiro_id: barbeiroId as Id<"barbeiros"> | null,
        });
        // Salva o token do navegador vinculado ao telefone da cliente para
        // receber o aviso de cancelamento/remarcação (não bloqueia a
        // confirmação se falhar).
        let avisosAtivados = false;
        if (permissaoPush) {
          try {
            await registrarSW();
            const token = await obterTokenPush();
            if (token) {
              await registrarTokenPush({
                token,
                telefone: onlyDigits(telefone),
              });
              avisosAtivados = true;
            }
          } catch {
            // silencioso — a confirmação já aconteceu
          }
        }
        navigate("/sucesso", {
          state: { agendamento, demo: false, avisosAtivados },
        });
      } else {
        // Modo demonstração: confirmação local sem banco
        navigate("/sucesso", {
          state: {
            demo: true,
            agendamento: resumo,
          },
        });
      }
    } catch (err) {
      setErroSalvar(
        erroMensagem(
          err,
          "Não foi possível concluir o agendamento. Tente novamente.",
        ),
      );
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="mx-auto max-w-3xl px-4 pt-14 pb-20 sm:px-6">
        <div className="animate-slide-up mb-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-foreground uppercase">
            Novo agendamento
          </p>
          <h1 className="font-display mt-3 text-3xl font-black text-foreground sm:text-4xl">
            Reserve seu <span className="text-gradient-red">horário</span>
          </h1>
        </div>

        {/* Barra de progresso — preenche a cada etapa concluída */}
        <div className="animate-slide-up mb-8" style={{ animationDelay: "0.05s" }}>
          <div className="mb-2 flex items-center justify-between text-[11px]">
            <span className="font-bold tracking-widest text-foreground uppercase">
              Passo {etapa + 1} de {passos.length} · {passos[etapa]}
            </span>
            <span className="font-semibold text-muted-foreground">
              {Math.round((etapa / (passos.length - 1)) * 100)}%
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full border border-border bg-muted/70"
            role="progressbar"
            aria-valuenow={Math.round((etapa / (passos.length - 1)) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do agendamento"
          >
            <div
              className="h-full rounded-full bg-gold-gradient transition-all duration-500 ease-out"
              style={{ width: `${(etapa / (passos.length - 1)) * 100}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-1">
            {passos.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  i <= etapa ? "bg-gold-gradient" : "bg-border/70",
                )}
              />
            ))}
          </div>
        </div>

        <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.6)] sm:p-8" style={{ animationDelay: "0.1s" }}>
          {/* ETAPA 1 — Serviço */}
          {etapa === 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-card-foreground">
                Escolha o serviço
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Toque no serviço e a próxima etapa abre sozinha. ✨
              </p>
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
                      onClick={() => {
                        setServicoId(s.id);
                        avancar(0);
                      }}
                      className={cn(
                        "flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.98]",
                        servicoId === s.id
                          ? "border-green-700/70 bg-green-800/10 shadow-[0_0_0_1px_var(--color-ring)]"
                          : "border-border bg-muted/50 hover:border-gold/60",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-base font-bold text-card-foreground">
                          {s.nome}
                        </span>
                        <Hand className="size-4 text-blood" />
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {s.descricao}
                      </span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-semibold text-blood">
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

          {/* ETAPA 2 — Profissional (estrutura preparada, só aparece com equipe) */}
          {etapa === 1 && temBarbeiros && (
            <div>
              <h2 className="font-display text-xl font-bold text-card-foreground">
                Escolha a profissional
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Nossa equipe está pronta para te atender. Toque e siga. ✨
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {barbeiros.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      if (barbeiroId !== b.id) {
                        setBarbeiroId(b.id);
                        // Cada barbeiro tem sua agenda: redefine data e horário
                        setData(null);
                        setHorario(null);
                      }
                      avancar(1);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.98]",
                      barbeiroId === b.id
                        ? "border-green-700/70 bg-green-800/10 shadow-[0_0_0_1px_var(--color-ring)]"
                        : "border-border bg-muted/50 hover:border-gold/60",
                    )}
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-charcoal/15 bg-charcoal/8">
                      <UserRound className="size-5 text-charcoal" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold text-card-foreground">
                        {b.nome}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {b.especialidade ?? "Equipe do estúdio"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ETAPA 3 — Data */}
          {etapa === indiceData && (
            <div>
              <h2 className="font-display text-xl font-bold text-card-foreground">
                Escolha a data
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Atendemos de {(horarioFuncionamento ?? "Terça a Sábado — 09h às 19h").toLowerCase()}. Toque
                no dia e siga. ✨
              </p>
              {dataParamValido &&
                !dataParamDisponivel &&
                !loadingConfig &&
                !loadingHorarios &&
                !loadingBloqueadas && (
                  <p className="mt-3 flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-xs leading-relaxed text-foreground">
                    <span>💛</span>
                    <span>
                      O dia que você tentou remarcar não está mais disponível.
                      Escolha outro abaixo.
                    </span>
                  </p>
                )}
              {diasDisponiveisLista.length === 0 ? (
                <p className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma data disponível nos próximos dias — pode ser feriado
                  ou dia de folga. Tente novamente em outro dia. 💅
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
                        avancar(indiceData);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-xl border px-2 py-3 transition-all duration-200 active:scale-[0.97]",
                        data === d.iso
                          ? "border-green-700/70 bg-green-800/10 shadow-[0_0_0_1px_var(--color-ring)]"
                          : "border-border bg-muted/50 hover:border-gold/60",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[11px] font-medium uppercase",
                          data === d.iso ? "text-charcoal" : "text-muted-foreground",
                        )}
                      >
                        {formatDateWeekday(d.iso).split(",")[0]}
                      </span>
                      <span className="font-display text-lg font-bold text-card-foreground">
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

          {/* ETAPA 4 — Horário */}
          {etapa === indiceHorario && (
            <div>
              <h2 className="font-display text-xl font-bold text-card-foreground">
                Escolha o horário
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {data &&
                  `${formatDateWeekday(data)} · ${formatMinutes(servico?.duracao_minutos ?? 30)} de duração`}{" "}
                · toque e siga. ✨
              </p>
              <div className="mt-5">
                <TimeSlotGrid
                  slots={slots.grade}
                  occupied={slots.bloqueados}
                  selected={horario}
                  onSelect={(slot) => {
                    setHorario(slot);
                    avancar(indiceHorario);
                  }}
                />
              </div>
            </div>
          )}

          {/* ETAPA 5 — Dados */}
          {etapa === indiceDados && (
            <div>
              <h2 className="font-display text-xl font-bold text-card-foreground">
                Seus dados
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Precisamos apenas do essencial para confirmar seu horário.
              </p>
              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-card-foreground">Nome completo</Label>
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
                  <Label htmlFor="telefone" className="text-card-foreground">WhatsApp / Telefone</Label>
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
                  {dadosOk && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                      ✅ Perfeito! Abrindo a revisão final...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 6 — Confirmação */}
          {etapa === passos.length - 1 && servico && data && horario && (
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                  <CalendarCheck className="size-5 text-green-800" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-card-foreground">
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
                  <dd className="text-right font-semibold text-foreground">
                    {servico.nome}
                  </dd>
                </div>
                {barbeiro && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Profissional</dt>
                    <dd className="text-right font-semibold text-foreground">
                      {barbeiro.nome}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Data</dt>
                  <dd className="font-semibold text-foreground">
                    {formatDateWeekday(data)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Horário</dt>
                  <dd className="font-semibold text-foreground">{horario}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd className="text-right font-semibold text-foreground">
                    {nome.trim()} · {telefone}
                  </dd>
                </div>
                <div className="hairline my-1" />
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Valor</dt>
                  <dd className="font-display text-lg font-bold text-gradient-red">
                    {formatBRL(servico.preco)}
                  </dd>
                </div>
              </dl>

              {erroSalvar && (
                <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {erroSalvar}
                </p>
              )}

              {!isConvexConfigured && (
                <p className="mt-4 rounded-lg border border-yellow-600/30 bg-yellow-500/15 px-4 py-3 text-xs text-yellow-500">
                  Modo demonstração: a confirmação será exibida, mas o
                  agendamento só será salvo no banco após conectar o Convex.
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
                    Confirmar e enviar no WhatsApp
                  </>
                )}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Ao confirmar, o WhatsApp abre com seu resumo completo (dia,
                horário, serviço e valor) pronto para enviar. 💅
              </p>
            </div>
          )}

          {/* Navegação — só voltar (avançar é automático) */}
          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-5">
            <Button
              variant="ghost"
              onClick={() => setEtapa((e) => Math.max(0, e - 1))}
              disabled={etapa === 0}
            >
              <ChevronLeft className="size-4" />
              Voltar
            </Button>
            {etapa < passos.length - 1 ? (
              <p className="text-xs font-medium text-muted-foreground">
                ✨ Escolha acima para continuar
              </p>
            ) : (
              <Button variant="ghost" asChild>
                <Link to="/servicos">Alterar serviço</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" />
          <Link to="/" className="transition-colors hover:text-charcoal">
            Voltar para o início
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
