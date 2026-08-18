import { action, mutation, query, type ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { v, ConvexError } from "convex/values";

/**
 * Assistente do dashboard (só admin): responde perguntas APENAS com os dados
 * deste projeto (clientes, serviços e agendamentos do deployment atual) e
 * executa o CRUD que a dona pedir, sempre respeitando o protocolo de
 * confirmação do prompt (ações críticas pedem o "sinal verde" antes).
 * A chave da API fica no servidor (process.env.GEMINI_API_KEY) — nunca no
 * navegador. Fluxo: front → action → query de contexto (dados) → Gemini.
 */

/** Modelo padrão da API (Interactions API) — pode ser trocado via env GEMINI_MODEL. */
const MODELO_PADRAO = "gemini-3.1-flash-lite";

/** Endpoint da Interactions API (geral: https://ai.google.dev/api/interactions-api). */
const URL_INTERACTIONS =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

/**
 * Ferramentas (function calling) que a assistente pode executar de verdade no
 * banco Convex — cada uma chama a mutation/action correspondente deste
 * projeto. Nada é feito "por fora": tudo passa pelas mesmas validações do
 * dashboard (anti-conflito, expediente, último admin ativo etc.).
 */
const FERRAMENTAS = [
  {
    type: "function",
    name: "criar_servico",
    description:
      "Cria um novo serviço ou combo no cardápio (ex.: 'Cabelo + Maquiagem por R$ 200'). Use APENAS após a dona confirmar explicitamente (protocolo de sinal verde).",
    parameters: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Nome do serviço/combo." },
        descricao: { type: "string", description: "Descrição opcional." },
        preco: { type: "number", description: "Preço em reais (ex.: 200)." },
        duracao_minutos: {
          type: "number",
          description: "Duração em minutos (ex.: 90).",
        },
        is_combo: {
          type: "boolean",
          description: "true se for um combo (vários serviços juntos).",
        },
        itens_combo: {
          type: "array",
          items: { type: "string" },
          description: "Nomes dos itens inclusos (só para combos).",
        },
      },
      required: ["nome", "preco", "duracao_minutos"],
    },
  },
  {
    type: "function",
    name: "alterar_servico",
    description:
      "Altera um serviço/combo existente pelo NOME (ex.: trocar o preço da manicure para 45, renomear, mudar duração, ativar/desativar). Use APENAS após a dona confirmar explicitamente (protocolo de sinal verde).",
    parameters: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Nome atual do serviço/combo." },
        novo_nome: { type: "string", description: "Novo nome (se for renomear)." },
        descricao: { type: "string", description: "Nova descrição (opcional)." },
        preco: { type: "number", description: "Novo preço em reais." },
        duracao_minutos: { type: "number", description: "Nova duração em minutos." },
        ativo: {
          type: "boolean",
          description: "false para esconder do site, true para mostrar.",
        },
        is_combo: { type: "boolean", description: "true se virar um combo." },
        itens_combo: {
          type: "array",
          items: { type: "string" },
          description: "Itens inclusos (só para combos).",
        },
      },
      required: ["nome"],
    },
  },
  {
    type: "function",
    name: "excluir_servico",
    description:
      "Exclui um serviço/combo do cardápio pelo NOME. Use APENAS após a dona confirmar explicitamente (protocolo de sinal verde).",
    parameters: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Nome do serviço/combo a excluir." },
      },
      required: ["nome"],
    },
  },
  {
    type: "function",
    name: "adicionar_admin",
    description:
      "Adiciona um novo administrador com acesso total ao dashboard (/admin). Use APENAS após a dona confirmar explicitamente (protocolo de sinal verde).",
    parameters: {
      type: "object",
      properties: {
        usuario: { type: "string", description: "Usuário de login (mín. 2 letras)." },
        senha: { type: "string", description: "Senha (mín. 4 caracteres)." },
        nome: { type: "string", description: "Nome de exibição (opcional)." },
      },
      required: ["usuario", "senha"],
    },
  },
  {
    type: "function",
    name: "remover_admin",
    description:
      "Remove um administrador do painel pelo usuário. Use APENAS após a dona confirmar explicitamente. Nunca remove o último admin ativo (protegido pelo sistema).",
    parameters: {
      type: "object",
      properties: {
        usuario: { type: "string", description: "Usuário do admin a remover." },
      },
      required: ["usuario"],
    },
  },
  {
    type: "function",
    name: "bloquear_dia",
    description:
      "Abre ou fecha um dia da semana para atendimento (ex.: 'não vou trabalhar terça-feira'). Use APENAS após a dona confirmar explicitamente (protocolo de sinal verde).",
    parameters: {
      type: "object",
      properties: {
        dia_semana: {
          type: "number",
          description: "0 = domingo, 1 = segunda, 2 = terça, 3 = quarta, 4 = quinta, 5 = sexta, 6 = sábado.",
        },
        ativo: {
          type: "boolean",
          description: "false = fechar o dia (sem atendimento), true = abrir.",
        },
      },
      required: ["dia_semana", "ativo"],
    },
  },
  {
    type: "function",
    name: "criar_agendamento",
    description:
      "Cria um agendamento para um cliente (por nome + telefone) em um serviço (por nome) numa data (AAAA-MM-DD) e horário (HH:MM). Ação direta solicitada pela dona — pode executar sem confirmação prévia.",
    parameters: {
      type: "object",
      properties: {
        nome_cliente: { type: "string", description: "Nome da cliente." },
        telefone_cliente: {
          type: "string",
          description: "Telefone da cliente com DDD (ex.: 27996140639).",
        },
        servico_nome: { type: "string", description: "Nome exato do serviço no cardápio." },
        data: { type: "string", description: "Data no formato AAAA-MM-DD." },
        horario: { type: "string", description: "Horário no formato HH:MM." },
      },
      required: ["nome_cliente", "telefone_cliente", "servico_nome", "data", "horario"],
    },
  },
  {
    type: "function",
    name: "cancelar_dia",
    description:
      "Cancela TODOS os agendamentos de um dia inteiro (ex.: a dona pediu para desmarcar todos os horários de uma data). Use APENAS quando a dona pedir explicitamente para cancelar/desmarcar um dia inteiro e confirmar (sinal verde). O dia deve ser futuro.",
    parameters: {
      type: "object",
      properties: {
        data: {
          type: "string",
          description:
            "Data do dia a cancelar no formato AAAA-MM-DD (ex.: 2026-08-17).",
        },
      },
      required: ["data"],
    },
  },
];

/** Cota DIÁRIA de perguntas da assistente — renova todo dia às 00h. */
const LIMITE_DIARIO = 200;

/** Data por extenso (pt-BR) para a resposta de confirmação. */
function formatarDataBR(data: string): string {
  const [y, m, d] = data.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

/** Preço em reais (ex.: 45.5 → "45,50"). */
function formatarPrecoBR(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}

/** Nome do dia da semana por número (0 = domingo). */
const NOMES_DIAS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

/** Monta a resposta amigável após cancelar um dia inteiro. */
function montarRespostaCancelamento(resultado: {
  data: string;
  cancelados: number;
  push?: { enviados?: number; sem_configuracao?: boolean };
}): string {
  const dia = formatarDataBR(resultado.data);
  if (resultado.cancelados === 0) {
    return `Não havia agendamentos ativos para ${dia}. Nada foi cancelado. 💛`;
  }
  const base = `✅ ${dia} cancelado(a) — ${resultado.cancelados} atendimento(s) cancelado(s).`;
  if (resultado.push?.sem_configuracao) {
    return `${base}\n⚠️ Para avisar as clientes por notificação, falta configurar a chave VAPID privada no Convex (VAPID_PRIVATE_KEY).`;
  }
  return `${base}\n💌 ${resultado.push?.enviados ?? 0} cliente(s) avisado(s) por notificação.`;
}

/** Dia corrente (YYYY-MM-DD) no fuso local — base da cota DIÁRIA. */
function diaAtual(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

/** Data de corte: hoje menos N meses (YYYY-MM-DD, fuso local). */
function mesesAtrasISO(meses: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

/**
 * PROMPT DA DONA (verbatim, instalado 2026-08-12) + apêndice técnico com o
 * mapa das tabelas reais do banco. NÃO remover nenhuma seção do prompt.
 */
const INSTRUCAO_SISTEMA = `# CONTEXTO E PAPEL
Você é uma inteligência artificial agente conectada ao banco de dados Convex de um sistema de gestão para salões de beleza. Seu papel é atuar como um assistente de IA com autonomia total de execução (CRUD), obedecendo estritamente aos comandos da proprietária do salão (a chefa), operando dentro dos parâmetros de tabelas fornecidos e respeitando os protocolos de segurança.

---

# [DIRETRIZES DE GÊNERO DO CLIENTE]
- Analise o nome da cliente recebido do banco de dados antes de formular a resposta.
- Trate nomes obviamente masculinos no masculino (o cliente) e femininos no feminino (a cliente).
- Jamais use marcas genéricas artificiais como "(a/o)".
- Nunca invente históricos de clientes, telefones ou faturamentos que não estejam explicitamente no retorno do Convex.

---

# [MAPA DE TABELAS DO BANCO DE DADOS CONVEX]
Para fazer buscas, alterações, criações, exclusões ou disparar notificações, use exclusivamente a estrutura de tabelas abaixo:
- Tabela 'de_mim': Contém as configurações, informações, preferências da proprietária do salão e a lista/array de 'admins' (usuários com permissão de gestão do dashboard).
- Tabela 'agendamento': Contém o histórico de marcações, nomes das clientes, horários, serviços escolhidos e o status do atendimento.
- Tabela 'dia': Contém os dias da semana e horários disponíveis/bloqueados para atendimento (ex: se a terça-feira está ativa ou fechada).
- Tabela 'servicos': Contém o catálogo de serviços do salão (id, nome do serviço, preço, duração e categoria, como "combo", "manicure", "pedicure", etc.).

---

# [REGRA DE AUTONOMIA UNIVERSAL E EXECUÇÃO]
Você tem permissão para gerar e executar comandos de criação, leitura, atualização e exclusão (CRUD) para QUALQUER pedido feito pela proprietária que envolva as tabelas mapeadas. Você deve obedecer sempre às solicitações dentro dos parâmetros do banco de dados (ex: criar novos serviços de combo, alterar preços de manicure/pedicure, adicionar novos administradores ao painel, etc.).

---

# [PROTOCOLO DE CONFIRMAÇÃO E SEGURANÇA]
Antes de consolidar qualquer ação no banco de dados, você deve avaliar a gravidade do impacto e aplicar a regra correspondente:

1. Ações Diretas (Sem confirmação prévia):
   - Consultas simples (Ex: "Quem eu tenho marcado hoje?").
   - Agendamentos de rotina solicitados diretamente.

2. Ações Críticas ou Drásticas (Confirmação Obrigatória):
   - Alteração de valores/preços de serviços.
   - Criação de novos serviços ou combos.
   - Adição de novos administradores ('admins') com acesso ao dashboard.
   - Exclusão de dados ou bloqueio de dias de trabalho.

Fluxo de Execução Crítica:
- Quando receber um pedido crítico, NÃO gere o comando final imediatamente no banco de dados.
- Primeiro, formule a alteração internamente e faça a pergunta de checagem de forma clara e explícita para a cliente.
- Use exatamente este padrão de resposta para o sinal verde:
  "Você tem certeza que deseja [descrever a ação exata requisitada em negrito]? Fazer o disparo dessa notificação no aplicativo delas agora? Me dê o sinal verde! 🚀"
- Execução no Banco: Só gere e execute o comando final no banco de dados após a proprietária responder explicitamente "Sim", "Pode executar", "Quero", "Pode" ou similar.

---

# [TRADUÇÃO DE INTENÇÃO (EXEMPLOS)]

- Intenção: Consulta de Agendamentos
  * Entrada: "Quem eu tenho marcado hoje?" ou "Quem vai vir?"
  * Ação: Procurar na tabela 'agendamento' filtrando pela data atual.

- Intenção: Bloqueio de Agenda
  * Entrada: "Não vou trabalhar terça-feira"
  * Ação: Alterar o status da terça-feira na tabela 'dia' após confirmação.

- Intenção: Consulta de Perfil
  * Entrada: "Me dê as informações do meu salão"
  * Ação: Buscar dados na tabela 'de_mim'.

- Intenção: Adicionar Administrador (Ação Crítica)
  * Entrada: "Coloca o João como admin do meu painel"
  * Ação: Identificar a tabela 'de_mim', preparar a inclusão do João na lista de administradores e perguntar: "Você tem certeza que deseja adicionar o João como administrador com acesso total ao dashboard? Me dê o sinal verde! 🚀"

- Intenção: Criar Novo Combo/Serviço (Ação Crítica)
  * Entrada: "Crie um novo serviço de combo: Cabelo + Maquiagem por R$ 200"
  * Ação: Preparar a inserção na tabela 'servicos' (categoria combo) e pedir a confirmação com a frase padrão antes de salvar.

- Intenção: Alterar Valor de Serviço (Ação Crítica)
  * Entrada: "Troca o valor da manicure para 45 reais"
  * Ação: Localizar o serviço "manicure" na tabela 'servicos', preparar o update do preço e pedir a confirmação com a frase padrão antes de executar.

---

# [APÊNDICE TÉCNICO — MAPA PARA O BANCO REAL (NÃO REMOVER)]
Este é o mapeamento dos nomes do prompt para as tabelas reais do Convex deste projeto:

- 'de_mim' → tabelas 'barbearias' (nome, telefone, instagram, endereço) e 'configuracoes' (nome de exibição, horário de funcionamento, dias_disponiveis). A lista de 'admins' fica na tabela própria 'admins' (usuario, senha, nome, ativo).
- 'agendamento' → tabela 'agendamentos' (cliente_id, servico_id, data, horario, status, duracao_minutos).
- 'dia' → tabela 'horarios' (dia_semana 0=domingo a 6=sábado, hora_inicio, hora_fim, ativo) + 'configuracoes.dias_disponiveis'.
- 'servicos' → tabela 'servicos' (nome, preco, duracao_minutos, ativo, is_combo, itens_combo).

Para EXECUTAR mudanças use SEMPRE as ferramentas (function calling) disponíveis — nunca invente comandos SQL nem tente escrever direto no banco. As ferramentas chamam as funções oficiais do sistema com todas as validações (anti-conflito de horário, expediente ativo, proteção do último admin). Se a dona pedir algo que você não tem ferramenta para fazer, diga que não consegue executar e sugira usar o dashboard.

Dias da semana (dia_semana): 0 = domingo, 1 = segunda, 2 = terça, 3 = quarta, 4 = quinta, 5 = sexta, 6 = sábado.

## PERSONALIDADE E FORMATO
Responda de maneira feminina, simpática, elegante, acolhedora, profissional e objetiva — com o cuidado e a atenção do Studio Natália Braga.
- Responda CURTO: no máximo 3 frases, ou uma listinha bem enxuta.
- NUNCA use markdown pesado (#, ##) — asteriscos simples para destaque são aceitáveis.
- Use EMOJIS delicados (💅✨🌸💛) para dar charme — sem exagerar.
- Se a informação não existir no banco, diga claramente "Não encontrei essa informação nos dados cadastrados."
- Se a pergunta estiver fora dos dados do sistema, responda: "Posso consultar e gerenciar apenas as informações cadastradas no sistema de agendamentos."
- CONSULTAR → VALIDAR → RESPONDER. Nunca invente → nunca pesquisar fora → nunca modificar dados sem o protocolo acima.`;

/** Dados deste projeto em formato compacto — o único "mundo" do assistente. */
export const contexto = query({
  handler: async (ctx) => {
    const [clientes, servicos, agendamentos, barbearia, config, horarios, admins] =
      await Promise.all([
        ctx.db.query("clientes").collect(),
        ctx.db.query("servicos").collect(),
        ctx.db.query("agendamentos").collect(),
        ctx.db.query("barbearias").first(),
        ctx.db.query("configuracoes").first(),
        ctx.db.query("horarios").collect(),
        ctx.db.query("admins").collect(),
      ]);

    const corte = mesesAtrasISO(6);
    const recentes = agendamentos
      .filter((a) => a.data >= corte)
      .sort((a, b) =>
        `${b.data}${b.horario}`.localeCompare(`${a.data}${a.horario}`),
      )
      .slice(0, 400);

    const nomeCliente = new Map(
      clientes.map((c) => [c._id, `${c.nome} (tel ${c.telefone})`]),
    );
    // Mapa com TODOS os serviços (inclusive inativos) para o histórico de
    // agendamentos continuar mostrando o nome/valor do que foi marcado.
    const infoServico = new Map(
      servicos.map((s) => [
        s._id,
        `${s.nome} — R$ ${s.preco.toFixed(2).replace(".", ",")} (${s.duracao_minutos} min)`,
      ]),
    );
    // Cardápio ATUAL: apenas serviços/combo ATIVOS (o que o site oferece de
    // verdade). Serviços desativados (testes/antigos) não são citados pela IA.
    const servicosAtivos = servicos.filter((s) => s.ativo);

    return {
      // 'de_mim' → dados do salão + configurações
      barbearia: barbearia
        ? {
            nome: barbearia.nome,
            telefone: barbearia.telefone ?? null,
            instagram: barbearia.instagram ?? null,
            endereco: barbearia.endereco ?? null,
          }
        : null,
      configuracao: config
        ? {
            nome_barbearia: config.nome_barbearia,
            horario_funcionamento: config.horario_funcionamento ?? null,
            dias_disponiveis: config.dias_disponiveis,
          }
        : null,
      // 'dia' → expediente por dia da semana
      dias: horarios.map((h) => ({
        dia_semana: h.dia_semana,
        hora_inicio: h.hora_inicio,
        hora_fim: h.hora_fim,
        ativo: h.ativo,
      })),
      // admins → apenas usuário/nome (NUNCA a senha no contexto da IA)
      admins: admins.map((a) => ({
        usuario: a.usuario,
        nome: a.nome ?? null,
        ativo: a.ativo,
      })),
      clientes: clientes
        .map((c) => `${c.nome} (tel ${c.telefone})`)
        .slice(0, 200),
      servicos: servicosAtivos.map(
        (s) =>
          `${s.nome} — R$ ${s.preco.toFixed(2).replace(".", ",")} (${s.duracao_minutos} min)${s.is_combo ? " · COMBO" : ""}`,
      ),
      agendamentos: recentes.map(
        (a) =>
          `- ${a.data} às ${a.horario} | ${a.status} | cliente: ${
            nomeCliente.get(a.cliente_id) ?? "?"
          } | serviço: ${infoServico.get(a.servico_id) ?? "?"}`,
      ),
    };
  },
});

/** Uso da assistente HOJE — alimenta a barrinha do dashboard. */
export const uso = query({
  args: {},
  handler: async (ctx) => {
    const dia = diaAtual();
    const doc = await ctx.db
      .query("gemini_uso")
      .withIndex("por_mes", (q) => q.eq("mes", dia))
      .first();
    return { dia, usados: doc?.usos ?? 0, limite: LIMITE_DIARIO };
  },
});

/** Contabiliza mais uma pergunta respondida hoje. */
export const registrarUso = mutation({
  handler: async (ctx) => {
    const dia = diaAtual();
    const doc = await ctx.db
      .query("gemini_uso")
      .withIndex("por_mes", (q) => q.eq("mes", dia))
      .first();
    if (doc) {
      await ctx.db.patch(doc._id, { usos: doc.usos + 1 });
    } else {
      await ctx.db.insert("gemini_uso", { mes: dia, usos: 1 });
    }
  },
});

/** Formato dos dados que a query `contexto` devolve (fonte única de verdade). */
interface DadosContexto {
  barbearia: {
    nome: string;
    telefone: string | null;
    instagram: string | null;
    endereco: string | null;
  } | null;
  configuracao: {
    nome_barbearia: string;
    horario_funcionamento: string | null;
    dias_disponiveis: number[];
  } | null;
  dias: {
    dia_semana: number;
    hora_inicio: string;
    hora_fim: string;
    ativo: boolean;
  }[];
  admins: {
    usuario: string;
    nome: string | null;
    ativo: boolean;
  }[];
  clientes: string[];
  servicos: string[];
  agendamentos: string[];
}

/** Monta o bloco de dados do estúdio que vai no prompt (fonte única de verdade). */
function montarBlocoDados(dados: DadosContexto): string {
  const linhas: string[] = [];

  const nomeSalon = dados.barbearia?.nome ?? dados.configuracao?.nome_barbearia;
  if (nomeSalon) {
    const extras: string[] = [];
    if (dados.barbearia?.telefone) extras.push(`tel ${dados.barbearia.telefone}`);
    if (dados.barbearia?.instagram) extras.push(`Instagram ${dados.barbearia.instagram}`);
    if (dados.barbearia?.endereco) extras.push(dados.barbearia.endereco);
    linhas.push(`SALÃO (de_mim): ${nomeSalon}${extras.length ? ` — ${extras.join(" · ")}` : ""}`);
  }
  if (dados.configuracao?.horario_funcionamento) {
    linhas.push(`Horário de funcionamento: ${dados.configuracao.horario_funcionamento}`);
  }

  const diasTexto = dados.dias
    .filter((d) => d.ativo)
    .map((d) => `${NOMES_DIAS[d.dia_semana]} (${d.hora_inicio}–${d.hora_fim})`)
    .join(", ");
  linhas.push(
    `DIAS (dia) — abertos: ${diasTexto || "nenhum dia ativo"}`,
  );

  linhas.push("CLIENTES DO ESTÚDIO:");
  linhas.push(...(dados.clientes.length ? dados.clientes : ["(nenhum cliente cadastrado)"]));
  linhas.push("");
  linhas.push("SERVIÇOS:");
  linhas.push(...(dados.servicos.length ? dados.servicos : ["(nenhum serviço cadastrado)"]));
  linhas.push("");
  linhas.push("AGENDAMENTOS (últimos 6 meses):");
  linhas.push(
    ...(dados.agendamentos.length
      ? dados.agendamentos
      : ["(nenhum agendamento no período)"]),
  );
  linhas.push("");
  linhas.push("ADMINISTRADORES (admins):");
  linhas.push(
    ...(dados.admins.length
      ? dados.admins.map((a) => `- ${a.nome ?? a.usuario} (${a.usuario})${a.ativo ? "" : " — inativo"}`)
      : ["(nenhum admin cadastrado além do padrão)"]),
  );

  return linhas.join("\n");
}

/**
 * Executa uma ferramenta chamada pelo Gemini e devolve a resposta amigável
 * já formatada (a ação no banco acontece aqui, nas funções oficiais).
 */
async function executarFerramenta(
  ctx: ActionCtx,
  nome: string,
  args: Record<string, unknown>,
): Promise<string> {
  switch (nome) {
    case "criar_servico": {
      const servico = await ctx.runMutation(api.servicos.criar, {
        nome: String(args.nome ?? "").trim(),
        descricao: typeof args.descricao === "string" ? args.descricao : undefined,
        preco: Number(args.preco ?? 0),
        duracao_minutos: Number(args.duracao_minutos ?? 30),
        is_combo: args.is_combo === true,
        itens_combo: Array.isArray(args.itens_combo)
          ? args.itens_combo.map(String)
          : undefined,
      });
      const tipo = servico.is_combo ? "Combo" : "Serviço";
      return `✅ ${tipo} "${servico.nome}" criado(a) por R$ ${formatarPrecoBR(servico.preco)} (${servico.duracao_minutos} min). Já aparece no site.`;
    }

    case "alterar_servico": {
      await ctx.runMutation(api.servicos.atualizarPorNome, {
        nome: String(args.nome ?? "").trim(),
        novo_nome: typeof args.novo_nome === "string" ? args.novo_nome : undefined,
        descricao: typeof args.descricao === "string" ? args.descricao : undefined,
        preco: typeof args.preco === "number" ? args.preco : undefined,
        duracao_minutos:
          typeof args.duracao_minutos === "number" ? args.duracao_minutos : undefined,
        ativo: typeof args.ativo === "boolean" ? args.ativo : undefined,
        is_combo: typeof args.is_combo === "boolean" ? args.is_combo : undefined,
        itens_combo: Array.isArray(args.itens_combo)
          ? args.itens_combo.map(String)
          : undefined,
      });
      const mudou: string[] = [];
      if (args.novo_nome !== undefined) mudou.push(`nome "${args.novo_nome}"`);
      if (args.preco !== undefined) mudou.push(`preço R$ ${formatarPrecoBR(Number(args.preco))}`);
      if (args.duracao_minutos !== undefined) mudou.push(`${args.duracao_minutos} min`);
      if (args.ativo === false) mudou.push("desativado no site");
      if (args.ativo === true) mudou.push("ativado no site");
      return `✅ "${args.nome}" atualizado: ${mudou.join(", ") || "sem mudanças"}.`;
    }

    case "excluir_servico": {
      await ctx.runMutation(api.servicos.excluirPorNome, {
        nome: String(args.nome ?? "").trim(),
      });
      return `✅ "${args.nome}" excluído do cardápio.`;
    }

    case "adicionar_admin": {
      await ctx.runMutation(api.admin.criarViaAssistente, {
        usuario: String(args.usuario ?? "").trim().toLowerCase(),
        senha: String(args.senha ?? ""),
        nome: typeof args.nome === "string" ? args.nome : undefined,
      });
      return `✅ Admin "${args.usuario}" adicionado com acesso total ao dashboard.`;
    }

    case "remover_admin": {
      await ctx.runMutation(api.admin.removerViaAssistente, {
        usuario: String(args.usuario ?? "").trim().toLowerCase(),
      });
      return `✅ Admin "${args.usuario}" removido do painel.`;
    }

    case "bloquear_dia": {
      const dia = Number(args.dia_semana);
      const ativo = args.ativo === true;
      const r = await ctx.runMutation(api.configuracoes.alternarDia, {
        dia_semana: dia,
        ativo,
      });
      return ativo
        ? `✅ ${r.nome} liberada para atendimento.`
        : `✅ ${r.nome} fechada — sem agendamentos neste dia.`;
    }

    case "criar_agendamento": {
      const ag = await ctx.runMutation(api.agendamentos.criarViaAssistente, {
        nome_cliente: String(args.nome_cliente ?? "").trim(),
        telefone_cliente: String(args.telefone_cliente ?? "").replace(/\D/g, ""),
        servico_nome: String(args.servico_nome ?? "").trim(),
        data: String(args.data ?? "").trim(),
        horario: String(args.horario ?? "").trim(),
      });
      return `✅ ${ag.cliente?.nome ?? "Cliente"} agendado(a) para ${formatarDataBR(ag.data)} às ${ag.horario} — ${ag.servico?.nome ?? "serviço"}.`;
    }

    case "cancelar_dia": {
      const data = String(args.data ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        throw new ConvexError(
          "Não consegui identificar o dia para cancelar. Me diga qual data (ex.: 'segunda-feira' ou '17/08').",
        );
      }
      const resultado = await ctx.runAction(api.push.cancelarDiaCompleto, { data });
      return montarRespostaCancelamento(resultado);
    }

    default:
      throw new ConvexError(
        `Não tenho essa ferramenta disponível (${nome}). Use o dashboard para essa ação.`,
      );
  }
}

/** Pergunta ao Gemini — chama a API com a chave do servidor. */
export const perguntar = action({
  args: {
    pergunta: v.string(),
    historico: v.optional(
      v.array(
        v.object({
          papel: v.union(v.literal("usuario"), v.literal("assistente")),
          texto: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, { pergunta, historico }): Promise<string> => {
    const perguntaLimpa = pergunta.trim();
    if (perguntaLimpa.length < 3) {
      throw new ConvexError("Digite uma pergunta mais completa.");
    }

    const chave = process.env.GEMINI_API_KEY;
    if (!chave) {
      throw new ConvexError(
        "Assistente ainda não configurada: adicione a chave GEMINI_API_KEY nas variáveis de ambiente do Convex.",
      );
    }

    // Busca os dados DESTE projeto (a query roda no mesmo deployment).
    const dados = await ctx.runQuery(api.gemini.contexto);
    const contextoDados = montarBlocoDados(dados);

    // Cota mensal: bloqueia antes de gastar a chamada da API.
    const { usados, limite } = await ctx.runQuery(api.gemini.uso);
    if (usados >= limite) {
      throw new ConvexError(
        `A cota da assistente de hoje (${limite} perguntas) chegou ao fim. Ela renova amanhã. 💛`,
      );
    }

    const modelo = process.env.GEMINI_MODEL ?? MODELO_PADRAO;

    // Histórico recente da conversa — sem ele o protocolo de confirmação
    // ("Me dê o sinal verde! 🚀" → "Sim") não funciona entre mensagens.
    const conversa = (historico ?? [])
      .slice(-12)
      .map((m) => `${m.papel === "usuario" ? "Dona" : "Assistente"}: ${m.texto}`)
      .join("\n");

    // Data atual do SISTEMA (fuso do servidor) — sem ela o modelo inventa a
    // data e erra perguntas como "quem está marcado hoje?". Teste real de
    // 2026-08-12 confirmou o erro (o Gemini achava que era 17/08).
    const agora = new Date();
    const hojeISO = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    const diaSemanaHoje = NOMES_DIAS[agora.getDay()];
    const dataHoje = agora.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const input = [
      conversa ? `Histórico da conversa:\n${conversa}\n` : "",
      `HOJE (data atual do sistema, use SEMPRE esta — nunca invente): ${dataHoje} (${diaSemanaHoje}, formato ISO ${hojeISO}).`,
      "",
      `Pergunta da dona do estúdio: ${perguntaLimpa}`,
      "",
      "Dados do estúdio (fonte única de verdade):",
      contextoDados,
    ].join("\n");

    let resposta: Response;
    try {
      resposta = await fetch(URL_INTERACTIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": chave,
        },
        body: JSON.stringify({
          model: modelo,
          system_instruction: INSTRUCAO_SISTEMA,
          input,
          tools: FERRAMENTAS,
          generation_config: {
            max_output_tokens: 800,
            thinking_level: "minimal",
          },
        }),
      });
    } catch {
      throw new ConvexError(
        "Não foi possível falar com o Gemini agora. Tente novamente em instantes.",
      );
    }

    if (!resposta.ok) {
      const corpo = (await resposta.text()).slice(0, 300);
      throw new ConvexError(
        `Erro na API do Gemini (${resposta.status}). Verifique a chave GEMINI_API_KEY.${corpo ? ` ${corpo}` : ""}`,
      );
    }

    const json = (await resposta.json()) as {
      steps?: {
        type?: string;
        name?: string;
        arguments?: unknown;
        content?: { type?: string; text?: string }[];
      }[];
    };

    // 1) Function calling: executar as ferramentas pedidas pelo Gemini
    const chamadas = (json.steps ?? []).filter((s) => s.type === "function_call");
    if (chamadas.length > 0) {
      const mensagens: string[] = [];
      for (const chamada of chamadas) {
        const args = (chamada.arguments ?? {}) as Record<string, unknown>;
        try {
          mensagens.push(await executarFerramenta(ctx, chamada.name ?? "", args));
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Erro ao executar a ação.";
          mensagens.push(`⚠️ ${msg}`);
        }
      }
      await ctx.runMutation(api.gemini.registrarUso);
      return mensagens.join("\n");
    }

    // 2) Resposta normal de texto (consulta/confirmação pedida)
    const texto = (json.steps ?? [])
      .filter((s) => s.type === "model_output")
      .flatMap((s) => s.content ?? [])
      .map((p) => p.text ?? "")
      .join("\n")
      .trim();
    if (!texto) {
      throw new ConvexError("O Gemini não retornou uma resposta. Tente de novo.");
    }

    await ctx.runMutation(api.gemini.registrarUso);
    return texto;
  },
});
