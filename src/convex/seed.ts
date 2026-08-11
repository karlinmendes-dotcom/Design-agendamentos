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
      horario_funcionamento: "Terça a Sábado — 09h às 19h",
      dias_disponiveis: [1, 2, 3, 4, 5, 6],
    });

    // 3. Cardápio
    const servicos = [
      {
        nome: "Manicure",
        descricao:
          "Cuidados com as cutículas, lixação, formato dos seus sonhos e esmaltação na cor da sua escolha.",
        preco: 40,
        duracao_minutos: 45,
        video_url: "https://assets.mixkit.co/videos/15806/15806-360.mp4",
      },
      {
        nome: "Pedicure",
        descricao:
          "Pés renovados: banho relaxante, cutículas, esfoliação leve e esmaltação impecável.",
        preco: 50,
        duracao_minutos: 60,
        video_url: "https://assets.mixkit.co/videos/27906/27906-360.mp4",
      },
      {
        nome: "Esmaltação em Gel",
        descricao:
          "Brilho intenso e durabilidade de até 3 semanas com esmalte em gel.",
        preco: 70,
        duracao_minutos: 60,
        video_url: "https://assets.mixkit.co/videos/13084/13084-360.mp4",
      },
      {
        nome: "Alongamento em Gel",
        descricao:
          "Unhas alongadas, leves e resistentes, modeladas no formato ideal para você.",
        preco: 120,
        duracao_minutos: 90,
        video_url: "https://assets.mixkit.co/videos/24817/24817-360.mp4",
      },
      {
        nome: "Nail Art",
        descricao:
          "Designs exclusivos: francesinha, degradê, desenhos personalizados e brilhos.",
        preco: 35,
        duracao_minutos: 30,
        video_url: "https://assets.mixkit.co/videos/36905/36905-360.mp4",
      },
      {
        nome: "Spa dos Pés",
        descricao:
          "Hidratação profunda, esfoliação e massagem relaxante para os pés.",
        preco: 85,
        duracao_minutos: 75,
        video_url: "https://assets.mixkit.co/videos/21970/21970-360.mp4",
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
        video_url: s.video_url,
      });
    }

    // 4. Profissional
    await ctx.db.insert("barbeiros", {
      barbearia_id: estId,
      nome: "Natália Braga",
      especialidade: "Nail Designer · unhas de alto padrão",
      ativo: true,
    });

    // 5. Horários — Terça a Sábado
    const horarios = [
      { dia_semana: 1, hora_inicio: "09:00", hora_fim: "19:00" },
      { dia_semana: 2, hora_inicio: "09:00", hora_fim: "19:00" },
      { dia_semana: 3, hora_inicio: "09:00", hora_fim: "19:00" },
      { dia_semana: 4, hora_inicio: "09:00", hora_fim: "19:00" },
      { dia_semana: 5, hora_inicio: "09:00", hora_fim: "19:00" },
      { dia_semana: 6, hora_inicio: "08:00", hora_fim: "18:00" },
    ];
    for (const h of horarios) {
      await ctx.db.insert("horarios", {
        barbearia_id: estId,
        dia_semana: h.dia_semana,
        hora_inicio: h.hora_inicio,
        hora_fim: h.hora_fim,
        ativo: true,
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
