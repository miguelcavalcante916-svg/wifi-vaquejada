/* AgênciaHub — Tarefas */
(function () {
  'use strict';
  var AH = window.AH;

  var filtro = 'pendentes'; // pendentes | hoje | semana | atrasadas | concluidas | todas

  function abrirForm(tarefa) {
    var t = tarefa || {};
    var ui = AH.ui;
    ui.modal({
      titulo: t.id ? 'Editar tarefa' : 'Nova tarefa',
      corpo:
        '<div class="form-grid">' +
        ui.campo('O que precisa ser feito? *', ui.input('titulo', t.titulo, 'required placeholder="Ex.: Selecionar takes da gravação"'), 'campo-cheio') +
        ui.campo('Projeto', ui.selectOpcional('projetoId', ui.opcoesProjetos(), t.projetoId, 'Sem projeto')) +
        ui.campo('Responsável', ui.selectOpcional('responsavelId', ui.opcoesEquipe(), t.responsavelId, 'Sem responsável')) +
        ui.campo('Prazo', ui.input('prazo', t.prazo, 'type="date"')) +
        ui.campo('Prioridade', ui.select('prioridade', AH.dominio.prioridades, t.prioridade || 'media')) +
        '</div>',
      rodape:
        (t.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        var btn = modal.querySelector('[data-excluir]');
        if (btn) btn.addEventListener('click', function () {
          AH.state.tarefas = AH.state.tarefas.filter(function (x) { return x.id !== t.id; });
          AH.salvar(); fechar(); AH.ui.toast('Tarefa excluída.'); AH.rerender();
        });
      },
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('titulo')).trim()) return;
        var dados = {
          titulo: String(f.get('titulo')).trim(),
          projetoId: f.get('projetoId'),
          responsavelId: f.get('responsavelId'),
          prazo: f.get('prazo'),
          prioridade: f.get('prioridade')
        };
        if (t.id) Object.assign(t, dados);
        else AH.state.tarefas.push(Object.assign({ id: AH.uid(), feita: false, criadoEm: AH.hojeISO() }, dados));
        AH.salvar(); fechar(); AH.ui.toast(t.id ? 'Tarefa atualizada.' : 'Tarefa criada.'); AH.rerender();
      }
    });
  }

  function filtrar(lista) {
    var hoje = AH.hojeISO();
    switch (filtro) {
      case 'pendentes': return lista.filter(function (t) { return !t.feita; });
      case 'hoje': return lista.filter(function (t) { return !t.feita && t.prazo && t.prazo <= hoje; });
      case 'semana': return lista.filter(function (t) { return !t.feita && t.prazo && AH.diasAte(t.prazo) <= 7; });
      case 'atrasadas': return lista.filter(function (t) { return !t.feita && t.prazo && AH.diasAte(t.prazo) < 0; });
      case 'concluidas': return lista.filter(function (t) { return t.feita; });
      default: return lista;
    }
  }

  function render(el) {
    var todas = AH.state.tarefas.slice();
    var lista = filtrar(todas).sort(function (a, b) {
      if (a.feita !== b.feita) return a.feita ? 1 : -1;
      var pa = a.prazo || '9999', pb = b.prazo || '9999';
      if (pa !== pb) return pa.localeCompare(pb);
      var ordem = { alta: 0, media: 1, baixa: 2 };
      return (ordem[a.prioridade] || 1) - (ordem[b.prioridade] || 1);
    });

    var pend = todas.filter(function (t) { return !t.feita; }).length;
    var atras = todas.filter(function (t) { return !t.feita && t.prazo && AH.diasAte(t.prazo) < 0; }).length;

    var html =
      '<form class="form-rapido" id="form-rapido">' +
      '<input class="input" name="titulo" placeholder="Digite uma tarefa e pressione Enter..." autocomplete="off">' +
      '<button class="btn btn-primario" type="submit">' + AH.icons.mais + 'Adicionar</button>' +
      '</form>' +
      '<div class="toolbar">' +
      '<div class="segmentos" id="seg-filtro">' +
      seg('pendentes', 'Pendentes (' + pend + ')') +
      seg('hoje', 'Para hoje') +
      seg('semana', '7 dias') +
      seg('atrasadas', 'Atrasadas' + (atras ? ' (' + atras + ')' : '')) +
      seg('concluidas', 'Concluídas') +
      seg('todas', 'Todas') +
      '</div></div>';

    if (!lista.length) {
      html += AH.ui.vazio('tarefas', 'Nada por aqui',
        filtro === 'atrasadas' ? 'Nenhuma tarefa atrasada. Excelente!' : 'Adicione uma tarefa no campo acima.');
    } else {
      html += '<div class="card" style="padding:6px 16px"><div class="lista">';
      lista.forEach(function (t) {
        var proj = AH.projetoPorId(t.projetoId);
        var resp = AH.membroPorId(t.responsavelId);
        html += '<div class="lista-item tarefa-linha ' + (t.feita ? 'tarefa-feita' : '') + '" data-id="' + t.id + '">' +
          '<button class="tarefa-check" data-toggle title="' + (t.feita ? 'Reabrir' : 'Concluir') + '">' + AH.icons.check + '</button>' +
          '<div class="principal">' +
          '<div class="titulo">' + AH.esc(t.titulo) + '</div>' +
          '<div class="sub">' +
          (proj ? '<span class="chip">' + AH.icons.projetos + AH.esc(proj.titulo) + '</span>' : '') +
          (resp ? '<span class="chip">' + AH.esc(resp.nome) + '</span>' : '') +
          '</div></div>' +
          (t.prazo ? AH.ui.prazoBadge(t.prazo, t.feita) : '') +
          AH.ui.badgePrioridade(t.prioridade) +
          '</div>';
      });
      html += '</div></div>';
    }

    el.innerHTML = html;

    var form = el.querySelector('#form-rapido');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var titulo = form.titulo.value.trim();
      if (!titulo) return;
      AH.state.tarefas.push({
        id: AH.uid(), titulo: titulo, projetoId: '', responsavelId: '',
        prioridade: 'media', prazo: '', feita: false, criadoEm: AH.hojeISO()
      });
      AH.salvar();
      render(el);
      var campo = el.querySelector('#form-rapido input');
      campo.focus();
      AH.ui.toast('Tarefa criada.');
    });

    el.querySelectorAll('#seg-filtro button').forEach(function (b) {
      b.addEventListener('click', function () { filtro = b.getAttribute('data-v'); render(el); });
    });

    el.querySelectorAll('.tarefa-linha').forEach(function (linha) {
      var t = AH.state.tarefas.filter(function (x) { return x.id === linha.getAttribute('data-id'); })[0];
      linha.querySelector('[data-toggle]').addEventListener('click', function (e) {
        e.stopPropagation();
        t.feita = !t.feita;
        AH.salvar(); render(el);
      });
      linha.addEventListener('click', function () { abrirForm(t); });
    });
  }

  function seg(valor, rotulo) {
    return '<button data-v="' + valor + '" class="' + (filtro === valor ? 'ativo' : '') + '">' + rotulo + '</button>';
  }

  AH.views = AH.views || {};
  AH.views.tarefas = { titulo: 'Tarefas', render: render, novo: function () { abrirForm(null); } };
})();
