import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BellRing,
  CalendarCheck,
  CheckCircle2,
  Home,
  Loader2,
  MessageCircle,
  PlusCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { onlyDigits } from "@/utils/phone";
import {
  pushDisponivel,
  obterTokenPush,
  obterTokenPushComDiagnostico,
  registrarSW,
  VAPID_KEY,
  isIOS,
  estaInstalado,
} from "@/lib/push";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useBarbearia } from "@/hooks/useBarbearia";
import { formatBRL, formatMinutes } from "@/utils/format";
import { formatDateWeekday } from "@/utils/date";
import {
  linkConfirmacaoWhatsApp,
  montarConfirmacaoWhatsApp,
} from "@/utils/whatsapp";
import type { Agendamento } from "@/types";

interface SucessoState {
  agendamento?: Agendamento;
  demo?: boolean;
  /** Já pedimos e a cliente permitiu as notificações no momento da confirmação. */
  avisosAtivados?: boolean;
}

export function Sucesso() {
  const location = useLocation();
  const navigate = useNavigate();
  const { barbearia } = useBarbearia();
  const state = (location.state ?? {}) as SucessoState;
  const agendamento = state.agendamento;

  useEffect(() => {
    if (!agendamento) {
      navigate("/", { replace: true });
    }
  }, [agendamento, navigate]);

  if (!agendamento) return null;

  const linkWhats = linkConfirmacaoWhatsApp(agendamento);

  // ===== Avisos por notificação (FCM): oferece logo após a confirmação =====
  const registrarToken = useMutation(api.pushTokens.registrar);
  const [avisoStatus, setAvisoStatus] = useState<
    "idle" | "ativando" | "ok" | "erro"
  >(state.avisosAtivados ? "ok" : "idle");
  const [notifDisponivel, setNotifDisponivel] = useState(false);
  const [erroAviso, setErroAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!agendamento) return;
    let ativo = true;
    void (async () => {
      const ok = await pushDisponivel();
      const temPermissao =
        "Notification" in window && Notification.permission === "granted";
      if (!ativo) return;
      setNotifDisponivel(ok && "Notification" in window && VAPID_KEY.length > 0);
      // Já autorizou antes? Registra o token silenciosamente
      if (ok && temPermissao && VAPID_KEY) {
        await registrarSW();
        const token = await obterTokenPush();
        if (ativo && token && agendamento.cliente?.telefone) {
          await registrarToken({
            token,
            telefone: onlyDigits(agendamento.cliente.telefone),
          }).catch(() => {});
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, [agendamento, registrarToken]);

  const ativarAvisos = async () => {
    setAvisoStatus("ativando");
    setErroAviso(null);
    try {
      // iPhone no Safari (sem estar na Tela de Início): a Apple bloqueia —
      // mostramos o guia de instalação em vez de um erro genérico.
      if (isIOS && !estaInstalado()) {
        setErroAviso("ios-instalar");
        setAvisoStatus("erro");
        return;
      }
      // 1. Permissão nativa (dentro do gesto do clique) — pulada se já
      //    concedida; se já negada, não adianta pedir de novo.
      let permissao: NotificationPermission =
        "Notification" in window ? Notification.permission : "denied";
      if (permissao === "default") {
        permissao = await Notification.requestPermission();
      }
      if (permissao !== "granted") {
        setErroAviso(
          permissao === "denied" ? "bloqueado" : "negado-pelo-usuario",
        );
        setAvisoStatus("erro");
        return;
      }
      // 2. Registra o service worker e cria a inscrição push (com diagnóstico)
      await registrarSW();
      const { token, erro } = await obterTokenPushComDiagnostico();
      if (!token || !agendamento.cliente?.telefone) {
        setErroAviso(erro ?? "Telefone do agendamento não encontrado.");
        setAvisoStatus("erro");
        return;
      }
      // 3. Salva a inscrição no Convex, vinculada ao telefone da cliente
      await registrarToken({
        token,
        telefone: onlyDigits(agendamento.cliente.telefone),
      });
      setAvisoStatus("ok");
    } catch (err) {
      setErroAviso(err instanceof Error ? err.message : String(err));
      setAvisoStatus("erro");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="mx-auto max-w-xl px-4 pt-16 pb-20 sm:px-6">
        <div className="animate-scale-in overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_70px_-32px_rgba(47,74,62,0.45)]">
          <div className="bg-gold-gradient px-6 py-8 text-center text-cream">
            <CheckCircle2 className="mx-auto size-12 text-gold-light" />
            <h1 className="font-display mt-3 text-3xl font-black">
              Agendamento confirmado!
            </h1>
            <p className="font-script mt-1 text-xl text-gold-light">
              seu horário está garantido
            </p>
            <p className="mt-1 text-sm font-medium text-cream/80">
              Te esperamos com muito carinho.
            </p>
          </div>

          <div className="space-y-4 px-6 py-8">
            <div className="rounded-xl border border-border bg-background p-5">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Serviço</dt>
                  <dd className="text-right font-semibold text-foreground">
                    {agendamento.servico?.nome ?? "Serviço"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Duração</dt>
                  <dd className="font-semibold text-foreground">
                    {formatMinutes(agendamento.servico?.duracao_minutos ?? 30)}
                  </dd>
                </div>
                {agendamento.barbeiro?.nome && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Profissional</dt>
                    <dd className="font-semibold text-foreground">
                      {agendamento.barbeiro.nome}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Data</dt>
                  <dd className="font-semibold text-foreground">
                    {formatDateWeekday(agendamento.data)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Horário</dt>
                  <dd className="font-semibold text-foreground">{agendamento.horario}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd className="text-right font-semibold text-foreground">
                    {agendamento.cliente?.nome}
                    <br />
                    <span className="text-xs font-normal text-muted-foreground">
                      {agendamento.cliente?.telefone}
                    </span>
                  </dd>
                </div>
                <div className="hairline my-1" />
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Valor</dt>
                  <dd className="font-display text-xl font-bold text-gradient-red">
                    {formatBRL(agendamento.servico?.preco ?? 0)}
                  </dd>
                </div>
              </dl>
            </div>

            {notifDisponivel && avisoStatus !== "ok" &&
              (isIOS && !estaInstalado() ? (
                // iPhone sem o app instalado: ensina a adicionar à Tela de
                // Início — sem isso a Apple bloqueia o Web Push.
                <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BellRing className="size-4 shrink-0 text-green-800" />
                    Receba avisos do estúdio 💌
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    No iPhone, para receber os avisos de cancelamento e
                    confirmação, adicione o app à Tela de Início:
                  </p>
                  <ol className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                    <li>
                      <span className="font-bold text-card-foreground">1.</span>{" "}
                      Toque no ícone de <strong>Compartilhar</strong> (⬆️) na
                      barra do Safari
                    </li>
                    <li>
                      <span className="font-bold text-card-foreground">2.</span>{" "}
                      Escolha <strong>"Adicionar à Tela de Início"</strong>
                    </li>
                    <li>
                      <span className="font-bold text-card-foreground">3.</span>{" "}
                      Abra o app pelo ícone novo na tela inicial
                    </li>
                    <li>
                      <span className="font-bold text-card-foreground">4.</span>{" "}
                      Volte aqui e toque em <strong>"Ativar"</strong>
                    </li>
                  </ol>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full"
                    disabled={avisoStatus === "ativando"}
                    onClick={() => void ativarAvisos()}
                  >
                    {avisoStatus === "ativando" && (
                      <Loader2 className="size-3.5 animate-spin" />
                    )}
                    Já adicionei — tentar ativar
                  </Button>
                  {avisoStatus === "erro" && erroAviso === "ios-instalar" && (
                    <p className="mt-2 text-xs leading-relaxed text-destructive">
                      Ainda não está na Tela de Início. Siga o passo a passo
                      acima (Compartilhar → Adicionar à Tela de Início) e abra o
                      app pelo ícone novo.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4">
                  <BellRing className="mt-0.5 size-5 shrink-0 text-green-800" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      Receba avisos do estúdio 💌
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Se o seu horário precisar ser remarcado, avisamos você
                      por aqui. Sem spam, prometido.
                    </p>
                    {avisoStatus === "erro" && (
                      <p className="mt-1 text-xs leading-relaxed text-destructive">
                        {erroAviso === "ios-instalar" ? (
                          "No iPhone, adicione o app à Tela de Início (Compartilhar → Adicionar à Tela de Início) e tente de novo."
                        ) : erroAviso === "bloqueado" ? (
                          <>
                            As notificações estão{" "}
                            <strong>bloqueadas</strong> para este site — ou a
                            aba é anônima/privada, que não permite notificações.
                            Abra no navegador normal e libere pelo cadeado 🔒 da
                            barra de endereço → Notificações → Permitir. Depois
                            volte aqui e toque em "Ativar".
                          </>
                        ) : erroAviso === "negado-pelo-usuario" ? (
                          "Você recusou a permissão do navegador. Sem problema — pode continuar; se mudar de ideia, volte aqui e toque em \"Ativar\"."
                        ) : (
                          <>
                            Não foi possível ativar:{" "}
                            <span className="break-words">{erroAviso}</span>.
                            Toque em "Ativar" novamente ou fale com o estúdio.
                          </>
                        )}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    disabled={avisoStatus === "ativando"}
                    onClick={() => void ativarAvisos()}
                  >
                    {avisoStatus === "ativando" && (
                      <Loader2 className="size-3.5 animate-spin" />
                    )}
                    {avisoStatus === "ativando" ? "Ativando..." : "Ativar"}
                  </Button>
                </div>
              ))}
            {avisoStatus === "ok" && (
              <p className="flex items-center gap-2 rounded-xl border border-green-700/30 bg-green-800/10 px-4 py-3 text-xs font-medium text-green-700">
                <BellRing className="size-4 shrink-0" />
                ✅ Avisos ativados! Se algo mudar no seu horário, avisamos por
                aqui.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {linkWhats && (
                <>
                  <Button
                    asChild
                    variant="gold"
                    size="lg"
                    className="w-full"
                  >
                    <a
                      href={linkWhats}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-5" />
                      Receber confirmação no WhatsApp
                    </a>
                  </Button>
                  <p className="rounded-xl border border-border bg-background px-4 py-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                    {montarConfirmacaoWhatsApp(agendamento)}
                  </p>
                </>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline">
                  <Link to="/servicos">
                    <PlusCircle className="size-4" />
                    Novo serviço
                  </Link>
                </Button>
                <Button asChild variant="gold">
                  <Link to="/">
                    <Home className="size-4" />
                    Página inicial
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <CalendarCheck className="size-4 text-green-800" />
          Dúvidas? Fale conosco no WhatsApp{" "}
          {barbearia?.telefone ?? "(27) 99614-0639"}
        </p>
      </section>

      <Footer />
    </div>
  );
}
