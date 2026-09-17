/* =========================================================================
   Agência Cavalcante — Interatividade e checkout
   ========================================================================= */
(function () {
  'use strict';

  var whatsappBase = (window.AGENCIA && window.AGENCIA.whatsapp)
    || document.body.getAttribute('data-whatsapp')
    || '#';

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Fechar menu ao clicar em CTA com data-scroll ---------- */
  document.querySelectorAll('[data-scroll]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (nav) nav.classList.remove('is-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- FAQ: abrir um por vez ---------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(
    '.feature, .value__card, .step, .plan, .testimonial, .section__head, .cta-final'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(msg, isError) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.toggle('is-error', !!isError);
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-show');
    }, 4200);
  }

  /* ---------- Demo de chat animado ---------- */
  var chat = document.getElementById('chatDemo');
  if (chat) {
    var script = [
      { side: 'in',  text: 'Oi! Vi o anúncio de vocês. Ainda tem horário essa semana?' },
      { side: 'out', text: 'Olá! 😊 Tenho sim. Prefere manhã ou tarde?', typing: 900 },
      { side: 'in',  text: 'Tarde, na quinta.' },
      { side: 'out', text: 'Fechado! Quinta às 15h está livre. Posso reservar no seu nome?', typing: 1100 },
      { side: 'in',  text: 'Pode! Meu nome é Ana.' },
      { side: 'out', text: 'Reunião agendada para quinta, 15h ✅ Já te envio o lembrete. Até lá, Ana!', typing: 1200 }
    ];

    var i = 0;
    function clockNow() {
      var d = new Date();
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }
    function addBubble(item) {
      var b = document.createElement('div');
      b.className = 'bubble bubble--' + item.side;
      b.innerHTML = escapeHtml(item.text) + '<small>' + clockNow() + '</small>';
      chat.appendChild(b);
      chat.scrollTop = chat.scrollHeight;
    }
    function addTyping() {
      var t = document.createElement('div');
      t.className = 'bubble bubble--typing';
      t.innerHTML = '<i></i><i></i><i></i>';
      chat.appendChild(t);
      chat.scrollTop = chat.scrollHeight;
      return t;
    }
    function step() {
      if (i >= script.length) {
        setTimeout(function () { chat.innerHTML = ''; i = 0; step(); }, 3200);
        return;
      }
      var item = script[i++];
      if (item.side === 'out' && item.typing) {
        var t = addTyping();
        setTimeout(function () {
          chat.removeChild(t);
          addBubble(item);
          setTimeout(step, 900);
        }, item.typing);
      } else {
        addBubble(item);
        setTimeout(step, 850);
      }
    }
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      // versão estática: mostra a conversa completa uma vez, sem loop de animação
      script.forEach(function (item) { addBubble(item); });
    } else if ('IntersectionObserver' in window) {
      // inicia quando o demo entra em tela
      var started = false;
      var demoIo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !started) { started = true; step(); demoIo.disconnect(); }
      }, { threshold: 0.3 });
      demoIo.observe(chat);
    } else {
      step();
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Checkout / Trial ---------- */
  // Chaves priorizadas: específicas de checkout primeiro, genéricas por último.
  var URL_KEYS = ['checkout_url', 'checkoutUrl', 'checkout', 'payment_url', 'paymentUrl',
    'pay_url', 'invoice_url', 'invoiceUrl', 'init_point', 'redirect_url', 'redirect',
    'url', 'link'];
  // Chaves que apontam para imagem/QR, nunca destino de navegação.
  var SKIP_KEYS = /qr|image|img|logo|avatar|icon|photo|thumb/i;

  function looksLikeUrl(v) {
    return typeof v === 'string' && /^https?:\/\/\S+/i.test(v.trim());
  }

  // Procura recursivamente uma URL na resposta do backend.
  function findUrl(data, depth) {
    depth = depth || 0;
    if (depth > 4 || data == null) return null;
    if (looksLikeUrl(data)) return data.trim();
    if (typeof data !== 'object') return null;

    // prioriza chaves conhecidas
    for (var k = 0; k < URL_KEYS.length; k++) {
      var val = data[URL_KEYS[k]];
      if (looksLikeUrl(val)) return val.trim();
    }
    // varre demais valores, ignorando campos de imagem/QR
    for (var key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      if (SKIP_KEYS.test(key)) continue;
      var found = findUrl(data[key], depth + 1);
      if (found) return found;
    }
    return null;
  }

  function planMessage(nome, tipo) {
    var acao = tipo === 'trial'
      ? 'quero iniciar o teste grátis'
      : 'quero assinar';
    return 'Olá! Vim pelo site da Agência Cavalcante e ' + acao +
      (nome ? ' o plano ' + nome + '.' : '.');
  }

  function whatsFallback(nome, tipo) {
    // remove qualquer ?text=/&text= existente e recria a query a partir da base limpa
    var base = whatsappBase.split(/[?&]text=/)[0];
    var sep = base.indexOf('?') === -1 ? '?text=' : '&text=';
    return base + sep + encodeURIComponent(planMessage(nome, tipo));
  }

  function handleCheckout(btn, endpoint, tipo) {
    var plano = btn.getAttribute('data-plano') || '2';
    var nome = btn.getAttribute('data-nome') || '';
    if (btn.classList.contains('is-loading')) return;

    btn.classList.add('is-loading');
    btn.setAttribute('aria-busy', 'true');

    var controller = ('AbortController' in window) ? new AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, 15000);

    fetch(endpoint + '?plano=' + encodeURIComponent(plano), {
      headers: { 'Accept': 'application/json' },
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        return res.text().then(function (txt) {
          var data = txt;
          try { data = JSON.parse(txt); } catch (e) { /* mantém texto */ }
          return data;
        });
      })
      .then(function (data) {
        if (data && typeof data === 'object' && data.ok === false && data.erro) {
          throw new Error(data.erro);
        }
        var url = findUrl(data);
        if (url) {
          toast(tipo === 'trial' ? 'Abrindo seu teste grátis…' : 'Redirecionando para o checkout…');
          window.location.href = url;
        } else {
          throw new Error('Sem link de checkout na resposta.');
        }
      })
      .catch(function (err) {
        var msg = (err && err.name === 'AbortError')
          ? 'O servidor demorou a responder. Vamos te levar ao WhatsApp.'
          : 'Não foi possível concluir agora. Continue pelo WhatsApp.';
        toast(msg, true);
        // Navegação na mesma aba: não é bloqueada como popup fora do gesto do usuário.
        setTimeout(function () {
          window.location.href = whatsFallback(nome, tipo);
        }, 900);
      })
      .then(function () {
        clearTimeout(timeout);
        btn.classList.remove('is-loading');
        btn.removeAttribute('aria-busy');
      });
  }

  document.querySelectorAll('.js-assinar').forEach(function (btn) {
    btn.addEventListener('click', function () { handleCheckout(btn, 'voucher.php', 'assinar'); });
  });
  document.querySelectorAll('.js-trial').forEach(function (btn) {
    btn.addEventListener('click', function () { handleCheckout(btn, 'trial.php', 'trial'); });
  });
})();
