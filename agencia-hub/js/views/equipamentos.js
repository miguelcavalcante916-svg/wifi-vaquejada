/* AgênciaHub — Equipamentos da produtora */
(function () {
  'use strict';
  var AH = window.AH;

  var filtro = 'todos';

  function abrirForm(equip) {
    var q = equip || {};
    var ui = AH.ui;
    ui.modal({
      titulo: q.id ? 'Editar equipamento' : 'Novo equipamento',
      corpo:
        '<div class="form-grid">' +
        ui.campo('Nome *', ui.input('nome', q.nome, 'required placeholder="Ex.: Sony FX30"'), 'campo-cheio') +
        ui.campo('Categoria', ui.select('categoria', AH.dominio.categoriasEquipamento, q.categoria || 'Câmera')) +
        ui.campo('Marca', ui.input('marca', q.marca)) +
        ui.campo('Nº de série / patrimônio', ui.input('serial', q.serial)) +
        ui.campo('Status', ui.select('status', AH.dominio.statusEquipamento, q.status || 'disponivel')) +
        ui.campo('Observações', ui.textarea('notas', q.notas, 'rows="2" placeholder="Com quem está, defeitos, acessórios..."'), 'campo-cheio') +
        '</div>',
      rodape:
        (q.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        var btn = modal.querySelector('[data-excluir]');
        if (btn) btn.addEventListener('click', function () {
          AH.state.equipamentos = AH.state.equipamentos.filter(function (x) { return x.id !== q.id; });
          AH.salvar(); fechar(); AH.ui.toast('Equipamento excluído.'); AH.rerender();
        });
      },
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('nome')).trim()) return;
        var dados = {
          nome: String(f.get('nome')).trim(),
          categoria: f.get('categoria'),
          marca: String(f.get('marca')).trim(),
          serial: String(f.get('serial')).trim(),
          status: f.get('status'),
          notas: String(f.get('notas')).trim()
        };
        if (q.id) Object.assign(q, dados);
        else AH.state.equipamentos.push(Object.assign({ id: AH.uid() }, dados));
        AH.salvar(); fechar(); AH.ui.toast('Equipamento salvo.'); AH.rerender();
      }
    });
  }

  var proximoStatus = { disponivel: 'em_uso', em_uso: 'manutencao', manutencao: 'disponivel' };

  function render(el) {
    var lista = AH.state.equipamentos.slice();
    if (filtro !== 'todos') lista = lista.filter(function (q) { return q.status === filtro; });
    lista.sort(function (a, b) { return (a.categoria + a.nome).localeCompare(b.categoria + b.nome, 'pt-BR'); });

    var contagem = { disponivel: 0, em_uso: 0, manutencao: 0 };
    AH.state.equipamentos.forEach(function (q) { contagem[q.status] = (contagem[q.status] || 0) + 1; });

    var html = '<div class="toolbar">' +
      '<div class="segmentos" id="seg-eq">' +
      seg('todos', 'Todos (' + AH.state.equipamentos.length + ')') +
      seg('disponivel', 'Disponíveis (' + contagem.disponivel + ')') +
      seg('em_uso', 'Em uso (' + contagem.em_uso + ')') +
      seg('manutencao', 'Manutenção (' + contagem.manutencao + ')') +
      '</div>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-primario" id="btn-novo">' + AH.icons.mais + 'Novo equipamento</button>' +
      '</div>';

    if (!lista.length) {
      html += AH.ui.vazio('equipamentos', 'Nenhum equipamento', 'Cadastre câmeras, lentes, drones e acessórios para controlar o uso.');
    } else {
      html += '<div class="tabela-wrap"><table class="tabela"><thead><tr>' +
        '<th>Equipamento</th><th>Categoria</th><th>Nº série</th><th>Status</th><th>Observações</th><th class="acoes"></th>' +
        '</tr></thead><tbody>';
      lista.forEach(function (q) {
        html += '<tr data-id="' + q.id + '">' +
          '<td><div class="celula-principal">' + AH.esc(q.nome) + '</div>' +
          (q.marca ? '<div class="celula-sub">' + AH.esc(q.marca) + '</div>' : '') + '</td>' +
          '<td><span class="chip">' + AH.esc(q.categoria) + '</span></td>' +
          '<td><span class="celula-sub">' + AH.esc(q.serial || '—') + '</span></td>' +
          '<td><button data-status style="all:unset;cursor:pointer" title="Clique para alternar">' + AH.ui.badgeStatusEquip(q.status) + '</button></td>' +
          '<td><span class="celula-sub">' + AH.esc(q.notas || '') + '</span></td>' +
          '<td class="acoes"><button class="btn btn-ghost btn-icon btn-p" data-acao="editar" title="Editar">' + AH.icons.editar + '</button></td>' +
          '</tr>';
      });
      html += '</tbody></table></div>';
    }

    el.innerHTML = html;
    el.querySelector('#btn-novo').addEventListener('click', function () { abrirForm(null); });
    el.querySelectorAll('#seg-eq button').forEach(function (b) {
      b.addEventListener('click', function () { filtro = b.getAttribute('data-v'); render(el); });
    });
    el.querySelectorAll('tbody tr').forEach(function (tr) {
      var q = AH.state.equipamentos.filter(function (x) { return x.id === tr.getAttribute('data-id'); })[0];
      tr.querySelector('[data-acao="editar"]').addEventListener('click', function () { abrirForm(q); });
      tr.querySelector('[data-status]').addEventListener('click', function () {
        q.status = proximoStatus[q.status] || 'disponivel';
        AH.salvar(); render(el);
      });
    });
  }

  function seg(valor, rotulo) {
    return '<button data-v="' + valor + '" class="' + (filtro === valor ? 'ativo' : '') + '">' + rotulo + '</button>';
  }

  AH.views = AH.views || {};
  AH.views.equipamentos = { titulo: 'Equipamentos', render: render, novo: function () { abrirForm(null); } };
})();
