/* AgênciaHub — Calendário (gravações, entregas, reuniões, postagens) */
(function () {
  'use strict';
  var AH = window.AH;

  var ref = null; // Date do mês exibido

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoDe(ano, mes, dia) { return ano + '-' + pad(mes + 1) + '-' + pad(dia); }

  function abrirFormEvento(evento, dataInicial) {
    var e = evento || {};
    var ui = AH.ui;
    ui.modal({
      titulo: e.id ? 'Editar compromisso' : 'Novo compromisso',
      corpo:
        '<div class="form-grid">' +
        ui.campo('Título *', ui.input('titulo', e.titulo, 'required placeholder="Ex.: Gravação — Clínica Vida"'), 'campo-cheio') +
        ui.campo('Tipo', ui.select('tipo', AH.dominio.tiposEvento, e.tipo || 'gravacao')) +
        ui.campo('Cliente', ui.selectOpcional('clienteId', ui.opcoesClientes(), e.clienteId, 'Sem cliente')) +
        ui.campo('Data *', ui.input('data', e.data || dataInicial || AH.hojeISO(), 'type="date" required')) +
        ui.campo('Hora', ui.input('hora', e.hora, 'type="time"')) +
        ui.campo('Local', ui.input('local', e.local, 'placeholder="Endereço ou online"'), 'campo-cheio') +
        ui.campo('Observações', ui.textarea('notas', e.notas, 'rows="2"'), 'campo-cheio') +
        '</div>',
      rodape:
        (e.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        var btn = modal.querySelector('[data-excluir]');
        if (btn) btn.addEventListener('click', function () {
          AH.state.eventos = AH.state.eventos.filter(function (x) { return x.id !== e.id; });
          AH.salvar(); fechar(); AH.ui.toast('Compromisso excluído.'); AH.rerender();
        });
      },
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('titulo')).trim() || !f.get('data')) return;
        var dados = {
          titulo: String(f.get('titulo')).trim(),
          tipo: f.get('tipo'),
          clienteId: f.get('clienteId'),
          data: f.get('data'),
          hora: f.get('hora'),
          local: String(f.get('local')).trim(),
          notas: String(f.get('notas')).trim()
        };
        if (e.id) Object.assign(e, dados);
        else AH.state.eventos.push(Object.assign({ id: AH.uid(), projetoId: '' }, dados));
        AH.salvar(); fechar(); AH.ui.toast('Compromisso salvo.'); AH.rerender();
      }
    });
  }

  function abrirDia(iso) {
    var eventos = AH.state.eventos.filter(function (e) { return e.data === iso; })
      .sort(function (a, b) { return String(a.hora).localeCompare(String(b.hora)); });
    var corpo = '';
    if (eventos.length) {
      corpo += '<div class="lista">';
      eventos.forEach(function (e) {
        var cor = AH.ui.corEvento[e.tipo] || 'cinza';
        corpo += '<div class="lista-item" style="cursor:pointer" data-ev="' + e.id + '">' +
          '<span class="ponto ponto-' + cor + '"></span>' +
          '<div class="principal"><div class="titulo">' + AH.esc(e.titulo) + '</div>' +
          '<div class="sub">' + (e.hora ? AH.esc(e.hora) + ' · ' : '') +
          AH.esc(AH.ui.nomeEvento[e.tipo]) +
          (e.clienteId ? ' · ' + AH.esc(AH.nomeCliente(e.clienteId)) : '') +
          (e.local ? ' · ' + AH.esc(e.local) : '') + '</div></div>' +
          AH.icons.seta_dir + '</div>';
      });
      corpo += '</div>';
    } else {
      corpo += '<p class="confirmar-texto">Nenhum compromisso neste dia.</p>';
    }
    AH.ui.modal({
      titulo: AH.fmt.data(iso),
      corpo: corpo,
      rodape:
        '<button type="button" class="btn btn-ghost" data-fechar>Fechar</button>' +
        '<button type="submit" class="btn btn-primario">' + AH.icons.mais + 'Adicionar neste dia</button>',
      aoMontar: function (modal) {
        modal.querySelectorAll('[data-ev]').forEach(function (item) {
          item.addEventListener('click', function () {
            var e = AH.state.eventos.filter(function (x) { return x.id === item.getAttribute('data-ev'); })[0];
            abrirFormEvento(e);
          });
        });
      },
      aoEnviar: function (_f, fechar) { fechar(); abrirFormEvento(null, iso); }
    });
  }

  function render(el) {
    if (!ref) ref = new Date();
    var ano = ref.getFullYear(), mes = ref.getMonth();
    var nomeMes = ref.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    nomeMes = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
    var hojeISO = AH.hojeISO();

    var primeiro = new Date(ano, mes, 1);
    var inicioGrade = new Date(ano, mes, 1 - primeiro.getDay()); // começa no domingo
    var dias = [];
    for (var i = 0; i < 42; i++) {
      var d = new Date(inicioGrade.getFullYear(), inicioGrade.getMonth(), inicioGrade.getDate() + i);
      dias.push(d);
    }
    // corta a última semana se ficar toda fora do mês
    if (dias[35].getMonth() !== mes) dias = dias.slice(0, 35);

    var porDia = {};
    AH.state.eventos.forEach(function (e) {
      (porDia[e.data] = porDia[e.data] || []).push(e);
    });

    var html = '<div class="cal-cab">' +
      '<button class="btn btn-icon" id="cal-prev" aria-label="Mês anterior">' + AH.icons.seta_esq + '</button>' +
      '<button class="btn btn-icon" id="cal-prox" aria-label="Próximo mês">' + AH.icons.seta_dir + '</button>' +
      '<h2>' + AH.esc(nomeMes) + '</h2>' +
      '<button class="btn btn-p btn-contorno" id="cal-hoje">Hoje</button>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-primario" id="btn-novo">' + AH.icons.mais + 'Novo compromisso</button>' +
      '</div>';

    html += '<div class="cal-grade-wrap"><div class="cal-grade">';
    ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(function (d) {
      html += '<div class="cal-dia-semana">' + d + '</div>';
    });
    dias.forEach(function (d) {
      var iso = isoDe(d.getFullYear(), d.getMonth(), d.getDate());
      var fora = d.getMonth() !== mes;
      var evs = (porDia[iso] || []).sort(function (a, b) { return String(a.hora).localeCompare(String(b.hora)); });
      html += '<div class="cal-dia' + (fora ? ' fora' : '') + (iso === hojeISO ? ' hoje' : '') + '" data-dia="' + iso + '">' +
        '<span class="num-dia">' + d.getDate() + '</span>';
      evs.slice(0, 3).forEach(function (e) {
        var cor = AH.ui.corEvento[e.tipo] || 'cinza';
        html += '<span class="cal-evento badge-' + cor + '"><span class="ponto ponto-' + cor + '"></span>' + AH.esc((e.hora ? e.hora + ' ' : '') + e.titulo) + '</span>';
      });
      if (evs.length > 3) html += '<span class="cal-evento-mais">+ ' + (evs.length - 3) + ' compromisso(s)</span>';
      html += '</div>';
    });
    html += '</div></div>';

    html += '<div class="cal-legenda">';
    AH.dominio.tiposEvento.forEach(function (t) {
      html += '<span><span class="ponto ponto-' + (AH.ui.corEvento[t.id] || 'cinza') + '"></span>' + AH.esc(t.nome) + '</span>';
    });
    html += '</div>';

    el.innerHTML = html;

    el.querySelector('#cal-prev').addEventListener('click', function () { ref = new Date(ano, mes - 1, 1); render(el); });
    el.querySelector('#cal-prox').addEventListener('click', function () { ref = new Date(ano, mes + 1, 1); render(el); });
    el.querySelector('#cal-hoje').addEventListener('click', function () { ref = new Date(); render(el); });
    el.querySelector('#btn-novo').addEventListener('click', function () { abrirFormEvento(null); });
    el.querySelectorAll('[data-dia]').forEach(function (dia) {
      dia.addEventListener('click', function () { abrirDia(dia.getAttribute('data-dia')); });
    });
  }

  AH.views = AH.views || {};
  AH.views.calendario = { titulo: 'Calendário', render: render, novo: function () { abrirFormEvento(null); } };
})();
