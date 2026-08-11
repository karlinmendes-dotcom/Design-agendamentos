import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BellRing, CheckCircle2, Lock, Sparkles, UserPlus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskPhone, onlyDigits } from "@/utils/phone";
import { obterTokenPush, registrarSW } from "@/lib/firebase";

interface EntrarClienteProps {
  onEntrar: (identidade: { nome: string; telefone: string }) => void;
}

type StatusAviso = "idle" | "ativando" | "ok" | "sem-permissao";

/**
 * Porta de entrada do app = CRIAÇÃO DE CONTA da cliente: nome + WhatsApp.
 * Qualquer conta criada é validada automaticamente como cliente do estúdio
 * (registrada no Convex via clientes.findOrCreate) — sem aprovação manual.
 * No mesmo toque, o navegador pede a permissão de notificação (regra de
 * segurança: só funciona dentro de um toque do usuário) para a cliente
 * receber confirmação e avisos de cancelamento.
 */
export function EntrarCliente({ onEntrar }: EntrarClienteProps) {
  const registrarTokenPush = useMutation(api.pushTokens.registrar);
  const criarConta = useMutation(api.clientes.findOrCreate);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [statusAviso, setStatusAviso] = useState<StatusAviso>("idle");

  // Qualquer telefone com ao menos 8 números cria a conta — sem barreiras
  const dadosOk = nome.trim().length >= 2 && onlyDigits(telefone).length >= 8;

  const handleCriarConta = async (e: FormEvent) => {
    e.preventDefault();
    if (!dadosOk || enviando) return;
    setEnviando(true);
    setStatusAviso("ativando");

    // 1) Permissão de notificação — primeiro passo do gesto do usuário
    let permitiu = false;
    if ("Notification" in window) {
      try {
        permitiu = (await Notification.requestPermission()) === "granted";
      } catch {
        permitiu = false;
      }
    }

    // 2) Se permitiu, registra o token FCM vinculado ao telefone dela
    if (permitiu) {
      try {
        await registrarSW();
        const token = await obterTokenPush();
        if (token) {
          await registrarTokenPush({
            token,
            telefone: onlyDigits(telefone),
          });
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

    // 3) Cria/valida a conta no cadastro do estúdio (qualquer conta é aceita)
    try {
      await criarConta({
        nome: nome.trim(),
        telefone: onlyDigits(telefone),
      });
    } catch {
      // Se o banco falhar, a pessoa ainda entra — o cadastro é refeito no
      // momento do agendamento.
    }

    // 4) Entra no app
    onEntrar({ nome: nome.trim(), telefone: onlyDigits(telefone) });
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
          </p>
        </form>
      </div>
    </div>
  );
}
