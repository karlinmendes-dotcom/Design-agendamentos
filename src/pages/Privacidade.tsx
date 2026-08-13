import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BellOff, MessageCircle, ShieldCheck } from "lucide-react";
import { LegalPage } from "@/components/LegalPage";
import { Button } from "@/components/ui/button";
import { useIdentidadeCliente } from "@/hooks/useIdentidadeCliente";
import { useBarbearia } from "@/hooks/useBarbearia";
import { useToast } from "@/contexts/ToastContext";
import { maskPhone } from "@/utils/phone";
import { cancelarInscricaoPush } from "@/lib/firebase";

/** Número do estúdio no formato internacional do wa.me (55 + dígitos). */
function numeroWhatsApp(telefone: string | null | undefined): string {
  const digitos = (telefone ?? "(27) 99614-0639").replace(/\D/g, "");
  return digitos.length >= 11 ? `55${digitos.slice(-11)}` : `55${digitos}`;
}

/**
 * Política de Privacidade — rota aberta /privacidade (sem pedir conta).
 * Documento em conformidade com a LGPD e com as exigências do Google para
 * sites que usam Web Push Notifications.
 *
 * Inclui a seção prática de "Exclusão dos seus dados": parar as notificações
 * deste aparelho (remove os tokens FCM do telefone no Convex) e solicitar a
 * exclusão total pelo WhatsApp da dona do estúdio — sem criar serviço novo.
 */
export function Privacidade() {
  const { identidade } = useIdentidadeCliente();
  const { barbearia } = useBarbearia();
  const removerTokens = useMutation(api.pushTokens.removerPorTelefone);
  const { toast } = useToast();

  const [parandoAvisos, setParandoAvisos] = useState(false);
  const [avisosParados, setAvisosParados] = useState(false);

  /** Remove do banco os tokens de push do telefone salvo neste aparelho e
   *  cancela a inscrição push real do navegador (best-effort). */
  const pararAvisos = async () => {
    if (!identidade) return;
    setParandoAvisos(true);
    try {
      await removerTokens({ telefone: identidade.telefone });
      await cancelarInscricaoPush();
      setAvisosParados(true);
      toast("success", "Avisos desativados neste aparelho. 💛");
    } catch {
      toast(
        "error",
        "Não deu para desativar agora — tente de novo ou fale pelo WhatsApp.",
      );
    } finally {
      setParandoAvisos(false);
    }
  };

  const mensagemExclusao = encodeURIComponent(
    "Olá! Vim pela Política de Privacidade do Studio Natália Braga e quero solicitar a EXCLUSÃO TOTAL dos meus dados do sistema." +
      (identidade
        ? `\n\nMeu nome: ${identidade.nome}\nMeu WhatsApp: ${maskPhone(identidade.telefone)}`
        : "\n\nVou informar meu nome e telefone aqui na conversa."),
  );
  const whatsExclusao = `https://wa.me/${numeroWhatsApp(barbearia.telefone)}?text=${mensagemExclusao}`;

  return (
    <LegalPage
      icone={ShieldCheck}
      selo="Política de Privacidade"
      titulo="Seus dados, com transparência"
      atualizacao="12 de agosto de 2026"
      introducao="Aqui você entende o que coletamos, por que coletamos e como usamos suas informações. É simples: usamos só o necessário para cuidar da sua agenda — nada além disso."
      secoes={[
        {
          titulo: "Dados Coletados",
          corpo: (
            <>
              <p>
                Para criar sua conta e fazer seu agendamento, coletamos
                apenas:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Nome</strong> — informado por você no cadastro;
                </li>
                <li>
                  <strong>Número de telefone celular (WhatsApp)</strong> —
                  informado por você no cadastro;
                </li>
                <li>
                  <strong>Dados do agendamento</strong> — serviço escolhido,
                  data e horário, registrados quando você agenda.
                </li>
              </ul>
              <p>
                Não coletamos senhas, documentos, dados de pagamento ou
                qualquer outra informação pessoal.
              </p>
              <p>
                A base legal para o tratamento desses dados é o{" "}
                <strong>seu consentimento</strong> (art. 7º, I, da LGPD),
                dado de forma livre e informada no momento do cadastro — e
                você pode revogá-lo a qualquer momento.
              </p>
            </>
          ),
        },
        {
          titulo: "Finalidade",
          corpo: (
            <p>
              Seus dados são usados <strong>estritamente</strong> para:
              gerenciar os horários da agenda do estúdio, identificar você
              como cliente, registrar seus agendamentos e enviar
              confirmações ou avisos de cancelamento/reagendamento. Nada
              além disso.
            </p>
          ),
        },
        {
          titulo: "Notificações Web",
          corpo: (
            <>
              <p>
                O site utiliza o recurso de{" "}
                <strong>Web Push Notifications</strong> para enviar alertas
                sobre seus agendamentos (confirmações, cancelamentos e
                reagendamentos) e, quando houver, novidades e promoções do
                estúdio.
              </p>
              <p>
                Esse recurso é <strong>condicionado à sua autorização
                prévia e opcional</strong>: você decide, por um convite
                dentro do próprio site, se quer ou não receber. Se não
                autorizar, o estúdio continua funcionando normalmente — você
                só não recebe os avisos no aparelho.
              </p>
              <p>
                Você pode revogar essa permissão a qualquer momento pelas
                configurações de notificações do seu navegador ou celular —
                ou pela seção{" "}
                <strong>"Exclusão dos seus dados"</strong> abaixo.
              </p>
            </>
          ),
        },
        {
          titulo: "Compartilhamento",
          corpo: (
            <p>
              Seus dados <strong>nunca são compartilhados, vendidos ou
              cedidos a terceiros</strong>. As únicas ferramentas envolvidas
              no funcionamento do site (hospedagem, banco de dados e o
              serviço de notificações) processam seus dados apenas para
              operar o serviço, com acesso restrito e protegido.
            </p>
          ),
        },
        {
          titulo: "Armazenamento e Segurança",
          corpo: (
            <p>
              Seus dados ficam armazenados em bancos de dados protegidos,
              com acesso limitado ao estúdio e à operação técnica do
              sistema. Mantemos seus dados apenas pelo tempo necessário
              para a gestão da sua agenda e histórico de atendimento.
            </p>
          ),
        },
        {
          titulo: "Seus Direitos (LGPD)",
          corpo: (
            <>
              <p>
                Em qualquer momento, você pode solicitar:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>acesso aos seus dados;</li>
                <li>correção de informações desatualizadas;</li>
                <li>
                  <strong>exclusão total dos seus dados</strong> do sistema.
                </li>
              </ul>
              <p>
                Você também pode <strong>revogar o consentimento</strong> a
                qualquer momento, sem custo e sem prejuízo — por exemplo,
                parando de receber os avisos (veja a seção abaixo).
              </p>
              <p>
                Para exercer qualquer um desses direitos, basta falar com o
                estúdio pelo WhatsApp ou pela página de contato — atendemos
                o pedido em até 15 dias, sem custo. Após a exclusão, seus
                dados são removidos do cadastro e do histórico de
                agendamentos.
              </p>
            </>
          ),
        },
        {
          titulo: "Exclusão dos seus dados",
          corpo: (
            <div className="space-y-4">
              <p>
                Você pode <strong>revogar seu consentimento</strong> a
                qualquer momento: parar de receber os avisos ou pedir a{" "}
                <strong>exclusão total</strong> dos seus dados — sem custo.
              </p>

              {identidade ? (
                <div className="rounded-xl border border-gold/20 bg-white/60 p-4">
                  <p className="text-xs font-semibold text-foreground">
                    Conta neste aparelho: {identidade.nome} ·{" "}
                    {maskPhone(identidade.telefone)}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Quer parar de receber os avisos de agendamento neste
                    aparelho?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    disabled={parandoAvisos || avisosParados}
                    onClick={() => void pararAvisos()}
                  >
                    <BellOff className="size-4" />
                    {avisosParados
                      ? "Avisos desativados ✓"
                      : parandoAvisos
                        ? "Desativando..."
                        : "Parar notificações"}
                  </Button>
                  {avisosParados && (
                    <p className="mt-2 text-xs font-medium text-green-700">
                      Pronto! Você não receberá mais os avisos por aqui. 💛
                    </p>
                  )}
                </div>
              ) : (
                <p className="rounded-xl border border-gold/20 bg-white/60 p-4 text-xs leading-relaxed text-muted-foreground">
                  Para parar de receber os avisos neste aparelho, fale com a
                  dona do estúdio pelo WhatsApp abaixo e peça para desativar
                  — é rápido e sem custo.
                </p>
              )}

              <p>
                Para a <strong>exclusão total</strong> do seu cadastro, dos
                seus agendamentos e dos seus dados, fale direto com a dona
                do estúdio pelo WhatsApp abaixo, informando seu nome e o
                número usado no cadastro. O pedido é atendido em até 15
                dias, sem custo, conforme a LGPD.
              </p>

              <Button asChild variant="gold" className="mt-1">
                <a
                  href={whatsExclusao}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  Solicitar exclusão pelo WhatsApp
                </a>
              </Button>
            </div>
          ),
        },
        {
          titulo: "Alterações desta Política",
          corpo: (
            <p>
              Esta política pode ser atualizada para refletir mudanças no
              serviço ou na legislação. A versão mais recente estará sempre
              disponível nesta página, com a data de atualização indicada no
              topo.
            </p>
          ),
        },
      ]}
    />
  );
}
