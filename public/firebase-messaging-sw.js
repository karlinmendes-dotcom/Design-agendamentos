/* Firebase Cloud Messaging — Service Worker
 *
 * Recebe o "pop" de notificação mesmo quando a aba do site está fechada
 * (background message) e, ao tocar na notificação, abre a tela de
 * reagendamento (/reagendar).
 *
 * A config abaixo é pública por design (projeto poupaps-cancelar).
 * A versão dos scripts deve acompanhar a versão do pacote "firebase" do app.
 */
importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBoGKjUODcSC7DpeSMNW_ZWRp7uLKSzuuc",
  authDomain: "poupaps-cancelar.firebaseapp.com",
  projectId: "poupaps-cancelar",
  storageBucket: "poupaps-cancelar.firebasestorage.app",
  messagingSenderId: "66548106345",
  appId: "1:66548106345:web:008a42ef4cd41e5acecef8",
});

const messaging = firebase.messaging();

// App fechado/fundo: o SW mostra a notificação do navegador
messaging.onBackgroundMessage(function (payload) {
  const dados = payload.data || {};
  const titulo =
    (payload.notification && payload.notification.title) ||
    "⚠️ Alteração no seu Agendamento";
  const corpo =
    (payload.notification && payload.notification.body) ||
    "Olá! Houve um imprevisto na nossa agenda. Toque aqui para ver os detalhes e remarcar o seu horário de forma rápida.";
  const url = dados.url || "/reagendar";

  self.registration.showNotification(titulo, {
    body: corpo,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: { url: url },
  });
});

// Toque na notificação → abre (ou foca) o app na tela de reagendamento
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const destino = new URL(
    (event.notification.data && event.notification.data.url) || "/reagendar",
    self.location.origin,
  );
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
});
