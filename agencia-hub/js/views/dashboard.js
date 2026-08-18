/* AgênciaHub — Painel (visão geral) */
(function () {
  'use strict';
  var AH = window.AH;

  function receitaPorMes(qtdMeses) {
    var meses = [];
    for (var i = qtdMeses - 1; i >= 0; i--) {
      var mm = AH.mesISO(-i);
      var total = AH.state.lancamentos.reduce(function (acc, l) {
        if (l.tipo === 'receita' && String(l.data).slice(0, 7) === mm) return acc + (Number(l.valor) || 0);
        return acc;
      }, 0);
      meses.push({ mes: mm, total: total });
    }
    return meses;
  }

  /* Gráfico de barras (série única — sem legenda; o título nomeia a série).
     Barras finas com topo arredondado ancoradas na base, grade discreta,
     rótulos diretos seletivos (maior valor + mês atual) e tooltip no hover. */
  function graficoReceita(dados) {
    var W = 560, H = 210, padL = 58, padR = 12, padT = 16, padB = 30;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var max = Math.max.apply(null, dados.map(function (d) { return d.total; }).concat([1]));
    // teto "redondo" para a escala
    var passo = Math.pow(10, Math.floor(Math.log10(max)));
    var teto = Math.ceil(max / passo) * passo;
    if (teto / max > 2) teto = Math.ceil(max / (passo / 2)) * (passo / 2);

    var n = dados.length;
    var slot = plotW / n;
    var larguraBarra = Math.min(44, slot * 0.52);

    var maxIdx = dados.reduce(function (best, d, i) { return d.total > dados[best].total ? i : best; }, 0);

    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Receita dos últimos ' + n + ' meses">';
    s += '<defs><clipPath id="clip-plot"><rect x="0" y="0" width="' + W + '" height="' + (padT + plotH) + '"/></clipPath></defs>';

    // grade horizontal discreta (3 linhas internas + base)
    for (var g = 1; g <= 3; g++) {
      var gy = padT + plotH - (plotH * g / 3);
      s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + gy + '" y2="' + gy + '" stroke="#262e46" stroke-width="1"/>';
      s += '<text x="' + (padL - 8) + '" y="' + (gy + 3.5) + '" text-anchor="end" font-size="10" fill="#78829e">' + compacto(teto * g / 3).replace('R$ ', '') + '</text>';
    }
    s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + (padT + plotH) + '" y2="' + (padT + plotH) + '" stroke="#34405f" stroke-width="1"/>';

    dados.forEach(function (d, i) {
      var h = teto ? Math.round(plotH * d.total / teto) : 0;
      var x = padL + slot * i + (slot - larguraBarra) / 2;
      var y = padT + plotH - h;
      var rotuloMes = AH.fmt.mesCurto(d.mes);
      s += '<g class="barra" data-i="' + i + '">';
      // barra com topo arredondado: 4px extras abaixo da base, cortados pelo clip
      if (d.total > 0) {
        s += '<rect class="barra-visual" clip-path="url(#clip-plot)" x="' + x + '" y="' + y + '" width="' + larguraBarra + '" height="' + (h + 6) + '" rx="4" fill="#fb923c"/>';
      } else {
        s += '<rect x="' + x + '" y="' + (padT + plotH - 2) + '" width="' + larguraBarra + '" height="2" rx="1" fill="#34405f"/>';
      }
      // rótulo direto seletivo: maior mês e mês atual
      if ((i === maxIdx || i === n - 1) && d.total > 0) {
        s += '<text x="' + (x + larguraBarra / 2) + '" y="' + (y - 7) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="#a6aec4">' + compacto(d.total) + '</text>';
      }
      s += '<text x="' + (padL + slot * i + slot / 2) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="10.5" fill="#78829e">' + rotuloMes + '</text>';
      // área de hover maior que a marca
      s += '<rect class="barra-hit" x="' + (padL + slot * i) + '" y="' + padT + '" width="' + slot + '" height="' + plotH + '" fill="transparent"/>';
      s += '</g>';
    });
    s += '</svg>';
    return s;
  }

  function compacto(v) {
    if (v >= 1000) {
      var k = v / 1000;
      return 'R$ ' + (k % 1 === 0 ? k : k.toFixed(1)).toString().replace('.', ',') + ' mil';
    }
    return 'R$ ' + Math.round(v);
  }

  function render(el) {
    var st = AH.state;
    var hoje = AH.hojeISO();
    var mm = hoje.slice(0, 7);

    var recebidoMes = 0, aReceber = 0;
    st.lancamentos.forEach(function (l) {
      if (l.tipo !== 'receita') return;
      if (String(l.data).slice(0, 7) === mm && l.status === 'pago') recebidoMes += Number(l.valor) || 0;
      if (l.status === 'pendente') aReceber += Number(l.valor) || 0;
    });

    var emAndamento = st.projetos.filter(function (p) { return p.status !== 'entregue'; });
    var pendentes = st.tarefas.filter(function (t) { return !t.feita; });
    var atrasadas = pendentes.filter(function (t) { return t.prazo && AH.diasAte(t.prazo) < 0; });
    var propostasEnviadas = st.propostas.filter(function (p) { return p.status === 'enviada'; });
    var valorEnviadas = propostasEnviadas.reduce(function (a, p) { return a + AH.totalProposta(p); }, 0);
    var clientesAtivos = st.clientes.filter(function (c) { return c.status === 'ativo'; }).length;

    var dadosGrafico = receitaPorMes(6);

    var proximosEventos = st.eventos
      .filter(function (e) { return e.data >= hoje; })
      .sort(function (a, b) { return (a.data + a.hora).localeCompare(b.data + b.hora); })
      .slice(0, 5);

    var prazosProximos = emAndamento
      .filter(function (p) { return p.prazo; })
      .sort(function (a, b) { return a.prazo.localeCompare(b.prazo); })
      .slice(0, 5);

    var html = '';

    html += '<div class="grid grid-4">';
    html += tile(AH.icons.dinheiro, 'Recebido no mês', AH.fmt.moeda(recebidoMes),
      'A receber (pendente): <b>' + AH.fmt.moeda(aReceber) + '</b>');
    html += tile(AH.icons.projetos, 'Projetos em andamento', String(emAndamento.length),
      clientesAtivos + ' cliente' + (clientesAtivos === 1 ? '' : 's') + ' ativo' + (clientesAtivos === 1 ? '' : 's'));
    html += tile(AH.icons.tarefas, 'Tarefas pendentes', String(pendentes.length),
      atrasadas.length ? '<b>' + atrasadas.length + ' atrasada' + (atrasadas.length === 1 ? '' : 's') + '</b>' : 'Nenhuma atrasada 🎉',
      atrasadas.length ? 'tile-alerta' : '');
    html += tile(AH.icons.propostas, 'Propostas aguardando', String(propostasEnviadas.length),
      'Em negociação: <b>' + AH.fmt.moeda(valorEnviadas) + '</b>');
    html += '</div>';

    html += '<div class="grid grid-principal" style="margin-top:16px">';

    // coluna esquerda: gráfico + prazos
    html += '<div class="grid" style="gap:16px">';
    html += '<div class="card"><div class="card-titulo">' + AH.icons.financeiro + 'Receita — últimos 6 meses</div>' +
      '<div class="grafico-wrap grafico" id="grafico-receita">' + graficoReceita(dadosGrafico) +
      '<div class="grafico-tooltip" id="grafico-tip"></div></div></div>';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.alerta + 'Prazos de projetos' +
      '<a href="#/projetos" class="ver-todos">ver kanban →</a></div>';
    if (prazosProximos.length) {
      html += '<div class="lista">';
      prazosProximos.forEach(function (p) {
        html += '<div class="lista-item"><div class="principal">' +
          '<div class="titulo">' + AH.esc(p.titulo) + '</div>' +
          '<div class="sub">' + AH.esc(AH.nomeCliente(p.clienteId)) + ' · ' + AH.esc(AH.nomeColuna(p.status)) + '</div>' +
          '</div>' + AH.ui.prazoBadge(p.prazo) + '</div>';
      });
      html += '</div>';
    } else {
      html += AH.ui.vazio('projetos', 'Nenhum projeto em andamento', 'Crie um projeto para acompanhar prazos aqui.');
    }
    html += '</div>';
    html += '</div>';

    // coluna direita: agenda + atalhos
    html += '<div class="grid" style="gap:16px">';
    html += '<div class="card"><div class="card-titulo">' + AH.icons.calendario + 'Próximos compromissos' +
      '<a href="#/calendario" class="ver-todos">calendário →</a></div>';
    if (proximosEventos.length) {
      html += '<div class="lista">';
      proximosEventos.forEach(function (e) {
        var cor = AH.ui.corEvento[e.tipo] || 'cinza';
        html += '<div class="lista-item"><span class="ponto ponto-' + cor + '"></span><div class="principal">' +
          '<div class="titulo">' + AH.esc(e.titulo) + '</div>' +
          '<div class="sub">' + AH.fmt.dataCurta(e.data) + (e.hora ? ' · ' + AH.esc(e.hora) : '') +
          (e.clienteId ? ' · ' + AH.esc(AH.nomeCliente(e.clienteId)) : '') + '</div>' +
          '</div><span class="badge badge-' + cor + '">' + AH.esc(AH.ui.nomeEvento[e.tipo] || e.tipo) + '</span></div>';
      });
      html += '</div>';
    } else {
      html += AH.ui.vazio('calendario', 'Agenda livre', 'Nenhum compromisso a partir de hoje. Agende gravações e entregas no calendário.');
    }
    html += '</div>';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.mais + 'Atalhos</div>' +
      '<div class="grid grid-2" style="gap:9px">' +
      '<button class="btn" data-atalho="cliente">' + AH.icons.clientes + 'Novo cliente</button>' +
      '<button class="btn" data-atalho="projeto">' + AH.icons.projetos + 'Novo projeto</button>' +
      '<button class="btn" data-atalho="tarefa">' + AH.icons.tarefas + 'Nova tarefa</button>' +
      '<button class="btn" data-atalho="proposta">' + AH.icons.propostas + 'Nova proposta</button>' +
      '</div></div>';

    html += '</div></div>';

    el.innerHTML = html;

    // tooltip do gráfico
    var wrap = el.querySelector('#grafico-receita');
    var tip = el.querySelector('#grafico-tip');
    if (wrap && tip) {
      wrap.querySelectorAll('.barra').forEach(function (b) {
        var i = parseInt(b.getAttribute('data-i'), 10);
        var d = dadosGrafico[i];
        b.addEventListener('mousemove', function (ev) {
          var r = wrap.getBoundingClientRect();
          tip.style.display = 'block';
          tip.style.left = (ev.clientX - r.left) + 'px';
          tip.style.top = Math.max(30, ev.clientY - r.top) + 'px';
          tip.innerHTML = '<span>' + AH.esc(AH.fmt.mesAno(d.mes)) + '</span><b>' + AH.fmt.moeda(d.total) + '</b>';
          b.classList.add('hover');
        });
        b.addEventListener('mouseleave', function () {
          tip.style.display = 'none';
          b.classList.remove('hover');
        });
      });
    }

    el.querySelectorAll('[data-atalho]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var qual = btn.getAttribute('data-atalho');
        if (qual === 'cliente') { location.hash = '#/clientes'; setTimeout(function () { AH.views.clientes.novo(); }, 60); }
        if (qual === 'projeto') { location.hash = '#/projetos'; setTimeout(function () { AH.views.projetos.novo(); }, 60); }
        if (qual === 'tarefa') { location.hash = '#/tarefas'; setTimeout(function () { AH.views.tarefas.novo(); }, 60); }
        if (qual === 'proposta') { location.hash = '#/propostas'; setTimeout(function () { AH.views.propostas.novo(); }, 60); }
      });
    });
  }

  function tile(icone, rotulo, valor, extra, classe) {
    return '<div class="card tile ' + (classe || '') + '">' +
      '<div class="tile-rotulo">' + icone + AH.esc(rotulo) + '</div>' +
      '<div class="tile-valor">' + AH.esc(valor) + '</div>' +
      (extra ? '<div class="tile-extra">' + extra + '</div>' : '') +
      '</div>';
  }

  AH.views = AH.views || {};
  AH.views.dashboard = { titulo: 'Visão geral', render: render };
})();
