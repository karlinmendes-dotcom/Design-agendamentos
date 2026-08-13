/* Service Worker de Web Push (protocolo padrão — SEM Firebase)
 *
 * Recebe o "pop" de notificação mesmo quando a aba do site está fechada e,
 * ao tocar na notificação, abre (ou foca) o app na tela certa.
 *
 * O payload chega como JSON: { titulo, mensagem, url, tipo, dia } — enviado
 * pelo servidor (src/convex/push.ts) via web-push.
 */

self.addEventListener("push", function (event) {
  var dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch (erro) {
    // payload não-JSON: exibe o texto cru, se houver
  }

  var titulo = dados.titulo || "💅 Aviso do estúdio";
  var mensagem =
    dados.mensagem ||
    "Olá! Temos uma novidade sobre o seu agendamento. Toque para ver os detalhes.";
  var url = dados.url || "/";

  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: mensagem,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: { url: url },
    }),
  );
});

// Toque na notificação → abre (ou foca) o app na tela indicada
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  try {
    var bruto = (event.notification.data && event.notification.data.url) || "/";
    var destino = new URL(bruto, self.location.origin);

    // Segurança: só navegar para caminhos internos do próprio site
    if (
      destino.origin !== self.location.origin ||
      !destino.pathname.startsWith("/")
    ) {
      destino.pathname = "/";
      destino.search = "";
      destino.hash = "";
    }

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then(function (lista) {
          for (var i = 0; i < lista.length; i++) {
            var janela = lista[i];
            if ("focus" in janela) {
              janela.focus();
              janela.navigate(destino.toString());
              return;
            }
          }
          return clients.openWindow(destino.toString());
        }),
    );
  } catch (erro) {
    console.error("[sw] Erro ao abrir a notificação:", erro);
  }
});
