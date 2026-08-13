import { ScrollText } from "lucide-react";
import { LegalPage } from "@/components/LegalPage";

/**
 * Regras do Estabelecimento — rota aberta /regras (sem pedir conta).
 * Documentação de orientação para a cliente: horários, atrasos,
 * cancelamentos, faltas, clientes vindas de outra profissional e
 * reaplicação de unhas faltando. Sem conteúdo técnico ou de IA — apenas
 * as regras do estúdio em linguagem clara.
 *
 * A regra de cancelamento em cima da hora / falta fica registrada aqui de
 * forma clara e específica, servindo de comprovação da política aceita pela
 * cliente, caso haja algum problema posteriormente.
 */
export function Regras() {
  return (
    <LegalPage
      icone={ScrollText}
      selo="Regras do Estabelecimento"
      titulo="Como funciona o nosso atendimento"
      atualizacao="13 de agosto de 2026"
      introducao="Regras simples e claras para que o seu horário seja sempre respeitado — e o da próxima cliente também. Leia com atenção: ao agendar, você concorda com elas. Qualquer dúvida, fale com a gente pelo WhatsApp ou pela página de contato."
      encerramento="Conte com a gente para cuidar de você com o mesmo carinho de sempre — e para manter a agenda organizada, o horário é sagrado para todo mundo."
      secoes={[
        {
          titulo: "Horários de atendimento",
          corpo: (
            <>
              <p>
                Segunda a quinta-feira: das <strong>08:00 às 18:00</strong>.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Horários disponíveis: 08:00 | 09:00 | 10:00 | 14:00 | 15:00 |
                  16:00 | 17:00
                </li>
                <li>Cada procedimento tem duração de 1 hora.</li>
              </ul>
              <p>
                Horário de almoço: das <strong>11:00 às 14:00</strong> — nenhum
                horário entre eles.
              </p>
              <p>Sexta-feira: das <strong>08:00 às 16:00</strong>.</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Horários disponíveis: 08:00 | 09:00 | 10:00 | 14:00 | 15:00
                </li>
              </ul>
              <p>Sábado e domingo: sem atendimento.</p>
              <p>Não há atendimento em outros horários.</p>
            </>
          ),
        },
        {
          titulo: "Cancelamento em cima da hora e faltas",
          corpo: (
            <>
              <p>
                Se você desmarcar em cima da hora ou não comparecer ao
                atendimento:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  será devido o equivalente a <strong>50% do valor</strong> do
                  procedimento;
                </li>
                <li>
                  esse valor fica registrado como{" "}
                  <strong>pendência</strong> para permitir uma nova remarcação;
                </li>
                <li>
                  a remarcação só poderá ser feita{" "}
                  <strong>depois do pagamento</strong> dos 50%;
                </li>
                <li>
                  se você <strong>faltar novamente</strong>, o valor pago será
                  perdido.
                </li>
              </ul>
              <p>
                Essa regra fica registrada de maneira clara e específica — e
                vale como comprovação da política aceita por você ao agendar,
                caso haja qualquer problema posteriormente.
              </p>
            </>
          ),
        },
        {
          titulo: "Faltas em excesso",
          corpo: (
            <p>
              Clientes que apresentarem <strong>faltas recorrentes ou
              excessivas</strong> poderão ser{" "}
              <strong>bloqueadas do sistema de agendamento</strong>.
            </p>
          ),
        },
        {
          titulo: "Atrasos",
          corpo: (
            <>
              <p>
                O tempo máximo de tolerância para atraso é de{" "}
                <strong>15 minutos</strong>.
              </p>
              <p>
                Caso aconteça algum imprevisto, você deve{" "}
                <strong>entrar em contato pessoalmente</strong> com o estúdio.
                Não há exceções ou novos prazos.
              </p>
            </>
          ),
        },
        {
          titulo: "Cliente que vem de outra profissional",
          corpo: (
            <>
              <p>
                Se você está com algum procedimento feito por outra
                profissional, <strong>avise no momento do agendamento</strong>:
                será necessário <strong>enviar uma foto das unhas para
                análise</strong> antes de confirmar determinados procedimentos.
              </p>
              <p>Isso é necessário porque:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  pode existir <strong>excesso de gel ou material</strong> nas
                  unhas;
                </li>
                <li>
                  o procedimento anterior pode não estar dentro do{" "}
                  <strong>padrão de naturalidade</strong> utilizado pela
                  profissional;
                </li>
                <li>
                  dependendo das condições, pode não ser possível fazer a{" "}
                  <strong>manutenção diretamente</strong>;
                </li>
                <li>
                  pode ser necessário fazer uma{" "}
                  <strong>retirada completa</strong> antes de um novo
                  procedimento.
                </li>
              </ul>
              <p>
                A retirada custa <strong>R$ 50,00</strong>. Depois da retirada,
                é cobrada uma <strong>nova aplicação</strong>, de acordo com o
                procedimento escolhido.
              </p>
              <p>
                Essa análise acontece <strong>antes do agendamento</strong>,
                para evitar que você chegue ao atendimento e o serviço não
                possa ser realizado como você imaginava.
              </p>
            </>
          ),
        },
        {
          titulo: "Unhas faltando — regras de reaplicação",
          corpo: (
            <>
              <p>
                Na manutenção, informe se existe{" "}
                <strong>alguma unha faltando</strong> — principalmente quando o
                procedimento foi feito pela própria profissional.
              </p>
              <p>
                <strong>Faltando até 3 unhas:</strong> é cobrado{" "}
                <strong>R$ 5,00 por unha</strong> para a reaplicação. Por
                exemplo:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>1 unha → R$ 5,00</li>
                <li>2 unhas → R$ 10,00</li>
                <li>3 unhas → R$ 15,00</li>
              </ul>
              <p>
                <strong>Faltando mais de 3 unhas:</strong> não é considerada
                apenas uma pequena reaplicação. Nesse caso, a profissional
                remove o procedimento e faz uma{" "}
                <strong>nova aplicação completa</strong> — sem cobrar a taxa de
                retirada, porque o material/procedimento anterior havia sido
                feito pela própria profissional.
              </p>
            </>
          ),
        },
        {
          titulo: "Agendamento e valores",
          corpo: (
            <p>
              O agendamento é feito pela <strong>página de agendamento do
              site</strong>: escolha o serviço, o dia e o horário disponível.
              Os <strong>serviços e valores</strong> estão publicados na
              tabela de agendamentos da página — consulte sempre a tabela
              atualizada para valores.
            </p>
          ),
        },
      ]}
    />
  );
}
