/* =========================================================================
   Agência Cavalcante — Painel do cliente (abas + chat do Agente IA)
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- Abas ---------- */
  var itens = document.querySelectorAll('.dash-nav__item');
  var abas = document.querySelectorAll('.dash-tab');

  function abrir(tab) {
    itens.forEach(function (i) { i.classList.toggle('is-active', i.getAttribute('data-tab') === tab); });
    abas.forEach(function (a) { a.classList.toggle('is-active', a.id === 'tab-' + tab); });
  }

  itens.forEach(function (item) {
    item.addEventListener('click', function () {
      abrir(item.getAttribute('data-tab'));
    });
  });

  // Abre a aba indicada no hash (#agente, #pipeline…)
  var hash = (location.hash || '').replace('#', '');
  if (hash && document.getElementById('tab-' + hash)) abrir(hash);
  window.addEventListener('hashchange', function () {
    var h = (location.hash || '').replace('#', '');
    if (h && document.getElementById('tab-' + h)) abrir(h);
  });

  /* ---------- Chat do Agente IA ---------- */
  var log = document.getElementById('iaLog');
  var form = document.getElementById('iaForm');
  var input = document.getElementById('iaInput');
  var botao = document.getElementById('iaEnviar');
  var modoEl = document.getElementById('iaModo');
  if (!log || !form || !input) return;

  var historico = []; // [{de:'cliente'|'agente', texto:'…'}]
  var ocupado = false;

  function hora() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  function bolha(lado, texto) {
    var b = document.createElement('div');
    b.className = 'bubble bubble--' + (lado === 'agente' ? 'out' : 'in');
    b.textContent = texto;
    var t = document.createElement('small');
    t.textContent = hora();
    b.appendChild(t);
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function digitando() {
    var t = document.createElement('div');
    t.className = 'bubble bubble--typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    return t;
  }

  function enviar(texto) {
    texto = (texto || '').trim();
    if (!texto || ocupado) return;
    ocupado = true;
    botao.disabled = true;
    input.value = '';

    bolha('cliente', texto);
    historico.push({ de: 'cliente', texto: texto });

    var tip = digitando();
    var controller = ('AbortController' in window) ? new AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, 70000);

    fetch('ia.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ mensagens: historico }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.ok || !data.resposta) throw new Error('resposta vazia');
        if (modoEl) {
          modoEl.textContent = data.modo === 'ia' ? 'IA conectada' : 'Modo demonstração';
        }
        historico.push({ de: 'agente', texto: data.resposta });
        tip.remove();
        bolha('agente', data.resposta);
      })
      .catch(function () {
        tip.remove();
        bolha('agente', 'Ops, não consegui responder agora. Tente novamente em instantes.');
      })
      .then(function () {
        clearTimeout(timeout);
        ocupado = false;
        botao.disabled = false;
        input.focus();
      });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    enviar(input.value);
  });

  document.querySelectorAll('.js-sugestao').forEach(function (chip) {
    chip.addEventListener('click', function () {
      abrir('agente');
      enviar(chip.textContent);
    });
  });

  // Mensagem de boas-vindas do agente
  bolha('agente', 'Olá! 😊 Eu sou o seu Agente de IA. Escreva aqui como se você fosse um cliente do seu WhatsApp e veja como eu respondo.');
})();
