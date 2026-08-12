import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BellRing,
  CheckCircle2,
  Lock,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskPhone, onlyDigits } from "@/utils/phone";
import { obterTokenPush, registrarSW } from "@/lib/firebase";
import { Link } from "react-router-dom";

interface EntrarClienteProps {
  onEntrar: (identidade: { nome: string; telefone: string }) => void;
}

type StatusAviso = "idle" | "ativando" | "ok" | "sem-permissao";

/**
 * Porta de entrada do app = CRIAÇÃO DE CONTA da cliente: nome + WhatsApp.
 * Qualquer conta criada é validada automaticamente como cliente do estúdio
 * (registrada no Convex via clientes.findOrCreate) — sem aprovação manual.
 *
 * LGPD + Google: a cliente precisa marcar o checkbox de consentimento (com
 * links para /termos e /privacidade) antes de prosseguir; e as notificações
 * são explicadas num banner elegante ANTES do pop-up nativo do navegador
 * (que só é chamado quando ela toca em "Aceitar" — regra de segurança dos
 * navegadores: requestPermission precisa estar dentro de um gesto do usuário).
 */
export function EntrarCliente({ onEntrar }: EntrarClienteProps) {
  const registrarTokenPush = useMutation(api.pushTokens.registrar);
  const criarConta = useMutation(api.clientes.findOrCreate);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [concordo, setConcordo] = useState(false);
  const [erroConsentimento, setErroConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [statusAviso, setStatusAviso] = useState<StatusAviso>("idle");
  const [bannerAvisos, setBannerAvisos] = useState(false);

  // Qualquer telefone com ao menos 8 números cria a conta — sem barreiras
  const dadosOk =
    nome.trim().length >= 2 && onlyDigits(telefone).length >= 8 && concordo;

  /** Pergunta ao navegador e, se autorizado, registra o token FCM. */
  async function ativarAvisos(telefoneLimpo: string) {
    let permitiu = false;
    if ("Notification" in window) {
      try {
        permitiu = (await Notification.requestPermission()) === "granted";
      } catch {
        permitiu = false;
      }
    }
    if (permitiu) {
      try {
        await registrarSW();
        const token = await obterTokenPush();
        if (token) {
          await registrarTokenPush({ token, telefone: telefoneLimpo });
          setStatusAviso("ok");
        } else {
          setStatusAviso("sem-permissao");
        }
      } catch {
        setStatusAviso("sem-permissao");
      }
    } else {
      setStatusAviso("sem-permissao");
    }
  }

  /** Cria/valida a conta e entra no app (passo comum aos dois caminhos). */
  async function finalizarConta(telefoneLimpo: string) {
    try {
      await criarConta({ nome: nome.trim(), telefone: telefoneLimpo });
    } catch {
      // Se o banco falhar, a pessoa ainda entra — o cadastro é refeito no
      // momento do agendamento.
    }
    onEntrar({ nome: nome.trim(), telefone: telefoneLimpo });
  }

  const handleCriarConta = async (e: FormEvent) => {
    e.preventDefault();
    if (!concordo) {
      setErroConsentimento(true);
      return;
    }
    setErroConsentimento(false);
    if (!dadosOk || enviando) return;
    setEnviando(true);
    setStatusAviso("ativando");

    const telefoneLimpo = onlyDigits(telefone);

    // Já decidiu antes? (granted/denied) — vai direto, sem banner.
    const jaDecidiu =
      "Notification" in window && Notification.permission !== "default";

    if (jaDecidiu) {
      await ativarAvisos(telefoneLimpo);
      await finalizarConta(telefoneLimpo);
    } else {
      // Mostra o banner explicativo ANTES do pop-up nativo (melhor prática
      // Google) — o pedido nativo só acontece no toque em "Aceitar".
      setEnviando(false);
      setBannerAvisos(true);
    }
  };

  const aceitarAvisos = async () => {
    setBannerAvisos(false);
    setEnviando(true);
    setStatusAviso("ativando");
    await ativarAvisos(onlyDigits(telefone));
    await finalizarConta(onlyDigits(telefone));
  };

  const recusarAvisos = async () => {
    setBannerAvisos(false);
    setEnviando(true);
    setStatusAviso("ativando");
    setStatusAviso("sem-permissao");
    await finalizarConta(onlyDigits(telefone));
  };

  return (
    <div className="fixed inset-0 z-[95] overflow-y-auto bg-[#f8f3ee]">
      {/* Brilho dourado de fundo */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/15 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 size-64 rounded-full bg-green-800/10 blur-[100px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo nome="Studio Natália Braga" />
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-gold uppercase">
            <Sparkles className="size-3.5" />
            Bem-vinda
            <Sparkles className="size-3.5" />
          </div>
          <h1 className="font-display mt-3 text-3xl font-extrabold text-foreground">
            Crie sua conta
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Seu nome e WhatsApp criam sua conta de cliente no estúdio — e
            você já recebe confirmação e avisos por aqui.
          </p>
        </div>

        <form
          onSubmit={(e) => void handleCriarConta(e)}
          className="rounded-3xl border border-gold/25 bg-white/70 p-6 shadow-[0_24px_70px_-30px_rgba(64,53,1,0.35)] backdrop-blur"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-card-foreground">
                Seu nome
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como você gosta de ser chamada"
                autoComplete="name"
                maxLength={60}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefone" className="text-card-foreground">
                WhatsApp / Telefone
              </Label>
              <Input
                id="telefone"
                inputMode="tel"
                value={telefone}
                onChange={(e) => setTelefone(maskPhone(e.target.value))}
                placeholder="(11) 98888-7777"
                autoComplete="tel"
                maxLength={16}
              />
              {telefone && onlyDigits(telefone).length < 8 && (
                <p className="text-xs text-red-600">
                  Informe seu número com DDD (mínimo 8 números).
                </p>
              )}
            </div>

            {/* Consentimento LGPD — obrigatório antes de continuar */}
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-gold/20 bg-white/60 p-3 transition-colors hover:border-gold/40">
              <input
                type="checkbox"
                checked={concordo}
                onChange={(e) => {
                  setConcordo(e.target.checked);
                  if (e.target.checked) setErroConsentimento(false);
                }}
                className="mt-0.5 size-4 shrink-0 accent-[#2F4A3E]"
              />
              <span className="text-[11px] leading-relaxed text-muted-foreground">
                Ao continuar, declaro que li e concordo com os{" "}
                <Link
                  to="/termos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-800 underline underline-offset-2 hover:text-gold"
                >
                  Termos de Uso
                </Link>{" "}
                e com a{" "}
                <Link
                  to="/privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-800 underline underline-offset-2 hover:text-gold"
                >
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>
            {erroConsentimento && (
              <p className="text-xs text-red-600">
                Para continuar, marque a caixinha aceitando os Termos e a
                Política de Privacidade.
              </p>
            )}

            <Button
              type="submit"
              disabled={!dadosOk || enviando}
              className="w-full py-6 text-base"
            >
              {enviando ? (
                "Criando sua conta..."
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Criar minha conta
                </>
              )}
            </Button>
          </div>

          {/* Status dos avisos */}
          {statusAviso === "ativando" && (
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <BellRing className="size-3.5 animate-pulse text-gold" />
              Criando sua conta e ativando os avisos...
            </p>
          )}
          {statusAviso === "ok" && (
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-medium text-green-700">
              <CheckCircle2 className="size-3.5" />
              Conta criada e avisos ativados! 💛
            </p>
          )}
          {statusAviso === "sem-permissao" && (
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <BellRing className="size-3.5 text-gold" />
              Sem problema — pode continuar. Você pode ativar os avisos na
              confirmação do agendamento.
            </p>
          )}

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-muted-foreground/80">
            <Lock className="size-3 shrink-0" />
            Sua conta fica salva no cadastro do estúdio e no seu aparelho.
            Seus dados nunca são vendidos.
          </p>
        </form>
      </div>

      {/* Banner elegante de notificações — antes do pop-up nativo do navegador */}
      {bannerAvisos && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-gold/25 bg-[#fbf7f0] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.6)]">
            <div className="bg-gold-gradient px-6 pb-6 pt-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-cream/15 backdrop-blur">
                <BellRing className="size-7 text-cream" />
              </div>
              <h2 className="font-display mt-4 text-xl font-extrabold text-cream">
                Deseja receber avisos?
              </h2>
            </div>
            <div className="px-6 pb-7 pt-5 text-center">
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                Confirmação, cancelamento e promoções direto na tela do seu
                celular — mesmo com o site fechado. É opcional e você pode
                desativar quando quiser.
              </p>
              <div className="mt-6 space-y-2.5">
                <Button
                  className="w-full py-5 text-sm"
                  onClick={() => void aceitarAvisos()}
                >
                  <BellRing className="size-4" />
                  Sim, quero receber os avisos
                </Button>
                <Button
                  variant="ghost"
                  className="w-full py-4 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => void recusarAvisos()}
                >
                  Agora não
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
