/* AgênciaHub — Equipe */
(function () {
  'use strict';
  var AH = window.AH;

  var CORES = ['#fb923c', '#a78bfa', '#60a5fa', '#f472b6', '#4ade80', '#22d3ee', '#facc15', '#f87171'];

  function abrirForm(membro) {
    var m = membro || {};
    var ui = AH.ui;
    ui.modal({
      titulo: m.id ? 'Editar pessoa' : 'Nova pessoa na equipe',
      corpo:
        '<div class="form-grid">' +
        ui.campo('Nome *', ui.input('nome', m.nome, 'required'), 'campo-cheio') +
        ui.campo('Função', ui.select('funcao', AH.dominio.funcoes, m.funcao || 'Filmmaker')) +
        ui.campo('WhatsApp', ui.input('whatsapp', m.whatsapp, 'placeholder="(00) 00000-0000"')) +
        ui.campo('E-mail', ui.input('email', m.email, 'type="email"'), 'campo-cheio') +
        '</div>',
      rodape:
        (m.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        var btn = modal.querySelector('[data-excluir]');
        if (btn) btn.addEventListener('click', function () {
          fechar();
          AH.ui.confirmar('Remover "' + m.nome + '" da equipe? Projetos e tarefas atribuídos ficarão sem responsável.', function () {
            AH.state.equipe = AH.state.equipe.filter(function (x) { return x.id !== m.id; });
            AH.state.projetos.forEach(function (p) { if (p.responsavelId === m.id) p.responsavelId = ''; });
            AH.state.tarefas.forEach(function (t) { if (t.responsavelId === m.id) t.responsavelId = ''; });
            AH.salvar(); AH.ui.toast('Pessoa removida.'); AH.rerender();
          });
        });
      },
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('nome')).trim()) return;
        var dados = {
          nome: String(f.get('nome')).trim(),
          funcao: f.get('funcao'),
          whatsapp: String(f.get('whatsapp')).trim(),
          email: String(f.get('email')).trim()
        };
        if (m.id) Object.assign(m, dados);
        else AH.state.equipe.push(Object.assign({
          id: AH.uid(), cor: CORES[AH.state.equipe.length % CORES.length]
        }, dados));
        AH.salvar(); fechar(); AH.ui.toast('Equipe atualizada.'); AH.rerender();
      }
    });
  }

  function render(el) {
    var lista = AH.state.equipe.slice();

    var html = '<div class="toolbar">' +
      '<span class="nota-rodape">Atribua responsáveis nos projetos e tarefas para saber o que está com cada pessoa.</span>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-primario" id="btn-novo">' + AH.icons.mais + 'Adicionar pessoa</button>' +
      '</div>';

    if (!lista.length) {
      html += AH.ui.vazio('equipe', 'Equipe vazia', 'Adicione as pessoas que trabalham com você — fixas ou freelancers.');
    } else {
      html += '<div class="grid grid-3">';
      lista.forEach(function (m) {
        var cargaProjetos = AH.state.projetos.filter(function (p) { return p.responsavelId === m.id && p.status !== 'entregue'; }).length;
        var cargaTarefas = AH.state.tarefas.filter(function (t) { return t.responsavelId === m.id && !t.feita; }).length;
        html += '<div class="card pessoa-card" data-id="' + m.id + '" style="cursor:pointer">' +
          AH.ui.avatar(m, 'g') +
          '<div class="info"><strong>' + AH.esc(m.nome) + '</strong>' +
          '<span>' + AH.esc(m.funcao || '') + '</span>' +
          '<div class="celula-sub" style="margin-top:4px">' + cargaProjetos + ' projeto(s) · ' + cargaTarefas + ' tarefa(s)</div>' +
          '</div>' +
          '<div class="contatos">' +
          (m.whatsapp ? '<a class="btn btn-ghost btn-icon btn-p" href="' + AH.telLink(m.whatsapp) + '" target="_blank" rel="noopener" title="WhatsApp" data-link>' + AH.icons.whatsapp + '</a>' : '') +
          '</div></div>';
      });
      html += '</div>';
    }

    el.innerHTML = html;
    el.querySelector('#btn-novo').addEventListener('click', function () { abrirForm(null); });
    el.querySelectorAll('[data-id]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('[data-link]')) return;
        var m = AH.membroPorId(card.getAttribute('data-id'));
        abrirForm(m);
      });
    });
  }

  AH.views = AH.views || {};
  AH.views.equipe = { titulo: 'Equipe', render: render, novo: function () { abrirForm(null); } };
})();
