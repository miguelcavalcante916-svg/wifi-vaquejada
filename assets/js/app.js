/* =========================================================================
   Agência Cavalcante — Painel do Agente de IA (interatividade)
   ========================================================================= */
(function () {
  'use strict';

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
    '.feature, .value__card, .step, .testimonial, .section__head, .cta-final'
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

  /* ---------- Ano no rodapé (fallback caso necessário) ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
