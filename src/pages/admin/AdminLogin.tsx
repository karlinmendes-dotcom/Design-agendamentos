import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useConvex } from "convex/react";
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck, UserRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/hooks/useAdminAuth";

/**
 * Login do painel administrativo. A senha é conferida no backend (Convex)
 * e, se estiver certa, o aparelho "destrava" o painel (localStorage).
 */
export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entrar } = useAdminAuth();
  // Chamada pelo caminho da função ("admin:verificarSenha") para o build
  // não depender dos tipos gerados — a função vive no backend do Convex.
  const convex = useConvex();
  const verificarSenha = convex.action as (
    name: string,
    args: { senha: string },
  ) => Promise<boolean>;

  const [usuario, setUsuario] = useState("admin");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const destino =
    (location.state as { from?: string } | null)?.from ?? "/admin";

  const handleEntrar = async (e: FormEvent) => {
    e.preventDefault();
    if (!senha || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      const ok: boolean = await verificarSenha("admin:verificarSenha", {
        senha,
      });
      if (ok) {
        entrar();
        navigate(destino, { replace: true });
      } else {
        setErro("Usuário ou senha incorretos.");
        setEnviando(false);
      }
    } catch {
      setErro("Não foi possível verificar agora. Tente de novo.");
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] overflow-y-auto bg-[#22382e]">
      {/* Brilhos do fundo escuro */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 size-72 rounded-full bg-gold/10 blur-[110px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="rounded-full bg-[#fbf3ea] p-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
            <Logo compact />
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-gold-light uppercase">
            <ShieldCheck className="size-3.5" />
            Área restrita
          </div>
          <h1 className="font-display mt-3 text-3xl font-extrabold text-cream">
            Painel do estúdio
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/60">
            Acesso exclusivo da proprietária — agenda, clientes e
            configurações.
          </p>
        </div>

        <form
          onSubmit={(e) => void handleEntrar(e)}
          className="rounded-3xl border border-gold/20 bg-coal/80 p-6 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.7)] backdrop-blur"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="usuario" className="text-cream/80">
                Usuário
              </Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gold-light/70" />
                <Input
                  id="usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="bg-white/5 pl-9 text-cream placeholder:text-cream/40"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha" className="text-cream/80">
                Senha
              </Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gold-light/70" />
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 pr-11 pl-9 text-cream placeholder:text-cream/40"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={mostrarSenha}
                  className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-gold-light/70 transition-colors hover:bg-white/10 hover:text-gold-light"
                >
                  {mostrarSenha ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {erro && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {erro}
              </p>
            )}

            <Button
              type="submit"
              disabled={!senha || enviando}
              className="w-full py-6 text-base"
            >
              {enviando ? "Verificando..." : "Entrar no painel"}
            </Button>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-cream/40">
            <Lock className="size-3 shrink-0" />
            Seus dados de acesso ficam anotados no seu bloco de notas.
          </p>
        </form>
      </div>
    </div>
  );
}
