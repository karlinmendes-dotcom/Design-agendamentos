import { mutation } from "./_generated/server";

/**
 * Seed inicial do Nail Design Studio — cria o estúdio, a configuração,
 * o cardápio, os horários e a profissional quando o banco está vazio.
 *
 * Executar uma única vez: `bunx convex run seed:inicial`
 */
export const inicial = mutation({
  handler: async (ctx) => {
    const existente = await ctx.db.query("barbearias").first();
    if (existente) return { semeados: false, motivo: "banco já populado" };

    // 1. Tenant principal (estúdio)
    const estId = await ctx.db.insert("barbearias", {
      nome: "Studio Natália Braga – Nail Design",
      slug: "studio-natalia-braga",
      descricao: "Elegância e cuidado em cada detalhe.",
      ativo: true,
    });

    // 2. Configuração
    await ctx.db.insert("configuracoes", {
      barbearia_id: estId,
      nome_barbearia: "Studio Natália Braga – Nail Design",
    horario_funcionamento:
      "Segunda a quinta: 08h às 18h · Sexta-feira: 08h às 16h",
    dias_disponiveis: [1, 2, 3, 4, 5],
    });

    // 3. Cardápio — serviços REAIS do estúdio (valores oficiais 2026-08).
    // Durações REAIS passadas pela cliente (17/08/2026): aplicação 2h30,
    // manutenção 2h, esmaltação mãos 1h30, esmaltação pés 2h, banho de gel
    // 2h, retirada 30min. Ajustáveis pelo painel (Serviços → editar).
    const servicos = [
      {
        nome: "Aplicação Esmaltada",
        descricao:
          "Aplicação completa de alongamento com esmaltação em gel — unhas impecáveis do início ao fim.",
        preco: 250,
        duracao_minutos: 150,
      },
      {
        nome: "Aplicação Natural",
        descricao:
          "Aplicação completa de alongamento com acabamento natural e discreto.",
        preco: 220,
        duracao_minutos: 150,
      },
      {
        nome: "Manutenção Esmaltada",
        descricao:
          "Manutenção do alongamento esmaltado — suas unhas sempre prontas.",
        preco: 185,
        duracao_minutos: 120,
      },
      {
        nome: "Manutenção Natural",
        descricao:
          "Manutenção do alongamento natural com cuidado e precisão.",
        preco: 165,
        duracao_minutos: 120,
      },
      {
        nome: "Banho de Gel",
        descricao:
          "Banho de gel para revitalizar e hidratar as unhas.",
        preco: 155,
        duracao_minutos: 120,
      },
      {
        nome: "Esmaltação em Gel – Mãos",
        descricao:
          "Esmaltação em gel com brilho intenso e durabilidade — mãos.",
        preco: 115,
        duracao_minutos: 90,
      },
      {
        nome: "Esmaltação em Gel – Pés",
        descricao:
          "Esmaltação em gel com brilho intenso e durabilidade — pés.",
        preco: 100,
        duracao_minutos: 120,
      },
      {
        nome: "Retirada",
        descricao: "Retirada do procedimento em gel existente.",
        preco: 50,
        duracao_minutos: 30,
      },
    ];
    for (const s of servicos) {
      await ctx.db.insert("servicos", {
        barbearia_id: estId,
        nome: s.nome,
        descricao: s.descricao,
        preco: s.preco,
        duracao_minutos: s.duracao_minutos,
        ativo: true,
      });
    }

    // 4. Profissional
    await ctx.db.insert("barbeiros", {
      barbearia_id: estId,
      nome: "Natália Braga",
      especialidade: "Nail Designer · unhas de alto padrão",
      ativo: true,
    });

    // 5. Horários — Segunda a quinta 08h–18h · Sexta 08h–16h · Sáb/Dom fechado
    //    Horários FIXOS de agendamento (1h cada), com o almoço 11h–14h fora.
    const SEG_QUI = ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "17:00"];
    const SEX = ["08:00", "09:00", "10:00", "14:00", "15:00"];
    const horarios = [
      { dia_semana: 1, hora_inicio: "08:00", hora_fim: "18:00", slots: SEG_QUI },
      { dia_semana: 2, hora_inicio: "08:00", hora_fim: "18:00", slots: SEG_QUI },
      { dia_semana: 3, hora_inicio: "08:00", hora_fim: "18:00", slots: SEG_QUI },
      { dia_semana: 4, hora_inicio: "08:00", hora_fim: "18:00", slots: SEG_QUI },
      { dia_semana: 5, hora_inicio: "08:00", hora_fim: "16:00", slots: SEX },
    ];
    for (const h of horarios) {
      await ctx.db.insert("horarios", {
        barbearia_id: estId,
        dia_semana: h.dia_semana,
        hora_inicio: h.hora_inicio,
        hora_fim: h.hora_fim,
        ativo: true,
        slots_fixos: h.slots,
      });
    }

    // 6. Biblioteca de mídia
    const midias = [
      {
        chave: "hero",
        url: "https://assets.mixkit.co/videos/15125/15125-360.mp4",
        poster_url:
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=70",
        alt: "Estúdio em ação",
      },
      {
        chave: "servico-manicure",
        url: "https://assets.mixkit.co/videos/15806/15806-360.mp4",
        poster_url:
          "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=70",
        alt: "Manicure",
      },
      {
        chave: "servico-pedicure",
        url: "https://assets.mixkit.co/videos/27906/27906-360.mp4",
        poster_url:
          "https://images.unsplash.com/photo-1599553478940-d7d2d66cf9af?auto=format&fit=crop&w=1200&q=70",
        alt: "Pedicure",
      },
    ];
    for (const [i, m] of midias.entries()) {
      await ctx.db.insert("midias", {
        barbearia_id: estId,
        tipo: "video",
        chave: m.chave,
        url: m.url,
        poster_url: m.poster_url,
        alt: m.alt,
        ordem: i,
        ativo: true,
      });
    }

    return { semeados: true };
  },
});
