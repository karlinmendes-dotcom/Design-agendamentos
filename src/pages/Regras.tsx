import { ClipboardList } from "lucide-react";
import { LegalPage } from "@/components/LegalPage";

/**
 * Regras de Atendimento — rota aberta /regras (sem pedir conta). Mesma regra
 * que a Nati (atendente virtual) usa: horários, atrasos, cancelamentos,
 * faltas e orientações para quem vem de outra profissional.
 */
export function Regras() {
  return (
    <LegalPage
      icone={ClipboardList}
      selo="Regras de Atendimento"
      titulo="Como funciona o atendimento"
      atualizacao="12 de agosto de 2026"
      introducao="Regras simples e claras para que o seu horário seja sempre respeitado — e o da próxima cliente também. Qualquer dúvida, é só perguntar para a Nati no chat do site."
      secoes={[
        {
          titulo: "Horários de atendimento",
          corpo: (
            <>
              <p>Segunda a quinta-feira: das 08:00 às 18:00.</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Horários disponíveis: 08:00 | 09:00 | 10:00 | 14:00 | 15:00 |
                  16:00 | 17:00
                </li>
                <li>Cada procedimento tem duração de 1 hora.</li>
              </ul>
              <p>
                Horário de almoço: das 11:00 às 14:00 — nenhum horário entre
                eles.
              </p>
              <p>Sexta-feira: das 08:00 às 16:00.</p>
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
          titulo: "Atrasos",
          corpo: (
            <p>
              O limite máximo de tolerância para atraso é de{" "}
              <strong>15 minutos</strong>. Caso aconteça algum imprevisto, a
              cliente deve <strong>entrar em contato pessoalmente</strong> com
              o estúdio. Não há exceções ou novos prazos.
            </p>
          ),
        },
        {
          titulo: "Cancelamentos e faltas",
          corpo: (
            <>
              <p>
                Se a cliente desmarcar em cima da hora ou não comparecer ao
                atendimento:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  será devido o equivalente a <strong>50% do valor</strong> do
                  procedimento;
                </li>
                <li>
                  esse valor deverá ser pago para possibilitar uma nova
                  remarcação;
                </li>
                <li>a remarcação somente poderá ocorrer após o pagamento;</li>
                <li>
                  caso a cliente não compareça novamente, o valor pago será
                  perdido.
                </li>
              </ul>
              <p>Não há outras multas, taxas ou condições.</p>
            </>
          ),
        },
        {
          titulo: "Faltas recorrentes",
          corpo: (
            <p>
              Clientes com <strong>faltas em excesso</strong> poderão ser{" "}
              <strong>bloqueadas do sistema de agendamento</strong>.
            </p>
          ),
        },
        {
          titulo: "Clientes vindas de outra profissional",
          corpo: (
            <>
              <p>
                Se a cliente estiver com procedimento realizado por outra
                profissional, é necessário <strong>enviar uma foto das
                unhas para análise</strong>. Isso é importante porque pode
                existir excesso de gel ou outro material, ou o procedimento
                pode não estar dentro do padrão de naturalidade do estúdio.
              </p>
              <p>
                A partir da análise, pode ser necessário realizar uma{" "}
                <strong>retirada</strong> do procedimento existente e uma{" "}
                <strong>nova aplicação</strong>.
              </p>
            </>
          ),
        },
        {
          titulo: "Manutenção e unhas faltando",
          corpo: (
            <p>
              Ao agendar uma manutenção, informe se existe{" "}
              <strong>alguma unha faltando</strong> — existem regras
              específicas para reaplicação. Os valores de reaplicação de
              unhas faltantes não são serviços da tabela principal e são
              informados individualmente pelo estúdio.
            </p>
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
