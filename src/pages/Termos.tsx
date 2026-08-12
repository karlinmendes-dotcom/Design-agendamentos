import { ScrollText } from "lucide-react";
import { LegalPage } from "@/components/LegalPage";

/**
 * Termos de Uso — rota aberta /termos (sem pedir conta). Define as regras
 * de uso da ferramenta de agendamento, responsabilidades da cliente e do
 * estúdio, e limites do serviço.
 */
export function Termos() {
  return (
    <LegalPage
      icone={ScrollText}
      selo="Termos de Uso"
      titulo="Como funciona o agendamento"
      atualizacao="12 de agosto de 2026"
      introducao="Ao usar esta ferramenta, você concorda com as regras abaixo. São simples e valem para os dois lados: combinamos horário, você aparece, e avisamos com antecedência se algo mudar."
      secoes={[
        {
          titulo: "Definição",
          corpo: (
            <p>
              Esta aplicação é uma <strong>ferramenta web</strong> para
              facilitar e automatizar o agendamento de serviços do Studio
              Natália Braga — Nail Design. Ela permite escolher o serviço,
              o dia e o horário, e receber confirmações e avisos sobre o seu
              atendimento.
            </p>
          ),
        },
        {
          titulo: "Criação de Conta",
          corpo: (
            <p>
              Ao criar sua conta com nome e WhatsApp, você declara que as
              informações fornecidas são <strong>verdadeiras</strong> e de
              sua responsabilidade. A conta é pessoal e usada para
              identificar seus agendamentos no estúdio.
            </p>
          ),
        },
        {
          titulo: "Responsabilidades da Cliente",
          corpo: (
            <>
              <p>Ao agendar, você se compromete a:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>fornecer dados verdadeiros e atualizados;</li>
                <li>
                  comparecer no horário agendado (ou avisar com
                  antecedência se precisar desmarcar);
                </li>
                <li>
                  respeitar uma tolerância de até{" "}
                  <strong>10 minutos de atraso</strong> — após esse tempo, o
                  horário poderá ser liberado para outra cliente.
                </li>
              </ul>
            </>
          ),
        },
        {
          titulo: "Regras do Estúdio",
          corpo: (
            <>
              <p>Para garantir a agenda de todas as clientes:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  o horário reservado pode ser{" "}
                  <strong>cancelado automaticamente</strong> em caso de
                  atraso superior a 10 minutos sem aviso;
                </li>
                <li>
                  em imprevistos técnicos ou pessoais, o estúdio pode
                  precisar cancelar ou reagendar um horário — e avisa você
                  com antecedência, quando possível, pelo WhatsApp e pelas
                  notificações do site.
                </li>
              </ul>
              <p>
                Em qualquer cancelamento pelo estúdio, sua vaga fica
                garantida: você pode remarcar para outra data disponível sem
                custos adicionais, direto pelo site.
              </p>
            </>
          ),
        },
        {
          titulo: "Limitação de Responsabilidade",
          corpo: (
            <p>
              O serviço é fornecido <strong>"como está"</strong>, dependendo
              da conexão de internet do usuário e do funcionamento dos
              serviços de hospedagem. Não nos responsabilizamos por
              indisponibilidades temporárias do site, falhas de conexão ou
              perda de agendamentos causada por problemas fora do nosso
              controle.
            </p>
          ),
        },
        {
          titulo: "Alterações destes Termos",
          corpo: (
            <p>
              Podemos atualizar estes termos para refletir mudanças no
              serviço. A versão mais recente estará sempre disponível nesta
              página, com a data de atualização indicada no topo. O uso
              continuado do site após alterações significa concordância com
              a versão vigente.
            </p>
          ),
        },
      ]}
    />
  );
}
