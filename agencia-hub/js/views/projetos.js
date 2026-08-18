/* AgênciaHub — Projetos (kanban com arrastar e soltar) */
(function () {
  'use strict';
  var AH = window.AH;

  function abrirForm(projeto, statusInicial) {
    var p = projeto || {};
    var ui = AH.ui;
    ui.modal({
      titulo: p.id ? 'Editar projeto' : 'Novo projeto',
      largura: 'g',
      corpo:
        '<div class="form-grid">' +
        ui.campo('Título *', ui.input('titulo', p.titulo, 'required placeholder="Ex.: Vídeo institucional 2 min"'), 'campo-cheio') +
        ui.campo('Cliente', ui.selectOpcional('clienteId', ui.opcoesClientes(), p.clienteId, 'Sem cliente')) +
        ui.campo('Tipo', ui.select('tipo', AH.dominio.tiposProjeto, p.tipo || 'Vídeo institucional')) +
        ui.campo('Etapa', ui.select('status', AH.dominio.colunasProjeto, p.status || statusInicial || 'briefing')) +
        ui.campo('Responsável', ui.selectOpcional('responsavelId', ui.opcoesEquipe(), p.responsavelId, 'Sem responsável')) +
        ui.campo('Prazo de entrega', ui.input('prazo', p.prazo, 'type="date"')) +
        ui.campo('Valor (R$)', ui.input('valor', p.valor, 'type="number" min="0" step="0.01" placeholder="0,00"')) +
        ui.campo('Descrição / briefing', ui.textarea('descricao', p.descricao, 'rows="4" placeholder="O que será entregue, referências, observações..."'), 'campo-cheio') +
        '</div>',
      rodape:
        (p.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        var btn = modal.querySelector('[data-excluir]');
        if (btn) btn.addEventListener('click', function () {
          fechar();
          AH.ui.confirmar('Excluir o projeto "' + p.titulo + '"? As tarefas vinculadas ficarão sem projeto.', function () {
            AH.state.projetos = AH.state.projetos.filter(function (x) { return x.id !== p.id; });
            AH.state.tarefas.forEach(function (t) { if (t.projetoId === p.id) t.projetoId = ''; });
            AH.salvar(); AH.ui.toast('Projeto excluído.'); AH.rerender();
          });
        });
      },
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('titulo')).trim()) return;
        var dados = {
          titulo: String(f.get('titulo')).trim(),
          clienteId: f.get('clienteId'),
          tipo: f.get('tipo'),
          status: f.get('status'),
          responsavelId: f.get('responsavelId'),
          prazo: f.get('prazo'),
          valor: Number(f.get('valor')) || 0,
          descricao: String(f.get('descricao')).trim()
        };
        if (p.id) {
          Object.assign(p, dados);
          AH.ui.toast('Projeto atualizado.');
        } else {
          AH.state.projetos.push(Object.assign({ id: AH.uid(), criadoEm: AH.hojeISO() }, dados));
          AH.ui.toast('Projeto criado.');
        }
        AH.salvar(); fechar(); AH.rerender();
      }
    });
  }

  function render(el) {
    var html = '<div class="toolbar">' +
      '<span class="nota-rodape">Arraste os cartões entre as etapas para atualizar o andamento.</span>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-primario" id="btn-novo">' + AH.icons.mais + 'Novo projeto</button>' +
      '</div>';

    html += '<div class="kanban">';
    AH.dominio.colunasProjeto.forEach(function (col) {
      var cartoes = AH.state.projetos.filter(function (p) { return p.status === col.id; })
        .sort(function (a, b) { return String(a.prazo || '9999').localeCompare(String(b.prazo || '9999')); });
      var soma = cartoes.reduce(function (a, p) { return a + (Number(p.valor) || 0); }, 0);
      html += '<div class="kanban-col" data-col="' + col.id + '">' +
        '<div class="kanban-col-cab"><strong>' + AH.esc(col.nome) + '</strong>' +
        '<span class="cont">' + cartoes.length + '</span>' +
        (soma ? '<span class="soma">' + AH.fmt.moeda(soma) + '</span>' : '') +
        '</div><div class="kanban-cartoes">';
      cartoes.forEach(function (p) {
        var resp = AH.membroPorId(p.responsavelId);
        html += '<div class="cartao" draggable="true" data-id="' + p.id + '">' +
          '<div class="cartao-titulo">' + AH.esc(p.titulo) + '</div>' +
          '<div class="cartao-cliente">' + AH.icons.clientes + AH.esc(AH.nomeCliente(p.clienteId)) + '</div>' +
          '<div class="cartao-rodape">' +
          '<span class="badge badge-roxo">' + AH.esc(p.tipo) + '</span>' +
          (p.valor ? '<span class="valor">' + AH.fmt.moeda(p.valor) + '</span>' : '') +
          '</div>' +
          '<div class="cartao-rodape">' +
          (p.prazo ? AH.ui.prazoBadge(p.prazo, col.id === 'entregue') : '<span class="celula-sub">sem prazo</span>') +
          '<span style="margin-left:auto">' + (resp ? AH.ui.avatar(resp) : '') + '</span>' +
          '</div></div>';
      });
      if (!cartoes.length) html += '<div class="celula-sub" style="text-align:center;padding:12px 4px">Solte um cartão aqui</div>';
      html += '</div></div>';
    });
    html += '</div>';

    el.innerHTML = html;
    el.querySelector('#btn-novo').addEventListener('click', function () { abrirForm(null); });

    // clique para editar
    el.querySelectorAll('.cartao').forEach(function (card) {
      card.addEventListener('click', function () {
        abrirForm(AH.projetoPorId(card.getAttribute('data-id')));
      });
      card.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('arrastando');
      });
      card.addEventListener('dragend', function () { card.classList.remove('arrastando'); });
    });

    // soltar nas colunas
    el.querySelectorAll('.kanban-col').forEach(function (colEl) {
      colEl.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        colEl.classList.add('arrastando-sobre');
      });
      colEl.addEventListener('dragleave', function (e) {
        if (!colEl.contains(e.relatedTarget)) colEl.classList.remove('arrastando-sobre');
      });
      colEl.addEventListener('drop', function (e) {
        e.preventDefault();
        colEl.classList.remove('arrastando-sobre');
        var id = e.dataTransfer.getData('text/plain');
        var p = AH.projetoPorId(id);
        var novoStatus = colEl.getAttribute('data-col');
        if (p && p.status !== novoStatus) {
          p.status = novoStatus;
          AH.salvar();
          AH.ui.toast('"' + p.titulo + '" → ' + AH.nomeColuna(novoStatus));
          render(el);
        }
      });
    });
  }

  AH.views = AH.views || {};
  AH.views.projetos = { titulo: 'Projetos', render: render, novo: function () { abrirForm(null); } };
})();
