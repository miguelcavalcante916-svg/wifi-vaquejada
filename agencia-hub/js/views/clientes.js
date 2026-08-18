/* AgênciaHub — Clientes (CRM) */
(function () {
  'use strict';
  var AH = window.AH;

  var filtro = { busca: '', status: 'todos' };

  function abrirForm(cliente) {
    var c = cliente || {};
    var ui = AH.ui;
    AH.ui.modal({
      titulo: c.id ? 'Editar cliente' : 'Novo cliente',
      corpo:
        '<div class="form-grid">' +
        ui.campo('Nome *', ui.input('nome', c.nome, 'required placeholder="Nome do cliente"'), 'campo-cheio') +
        ui.campo('Empresa', ui.input('empresa', c.empresa)) +
        ui.campo('Segmento', ui.select('segmento', AH.dominio.segmentos, c.segmento || 'Serviços')) +
        ui.campo('WhatsApp', ui.input('whatsapp', c.whatsapp, 'placeholder="(00) 00000-0000"')) +
        ui.campo('E-mail', ui.input('email', c.email, 'type="email"')) +
        ui.campo('Instagram', ui.input('instagram', c.instagram, 'placeholder="@perfil"')) +
        ui.campo('Origem', ui.select('origem', ['Indicação', 'Instagram', 'Google', 'Evento', 'Prospecção', 'Outro'], c.origem || 'Indicação')) +
        ui.campo('Status', ui.select('status', AH.dominio.statusCliente, c.status || 'lead'), 'campo-cheio') +
        ui.campo('Anotações', ui.textarea('notas', c.notas, 'rows="3" placeholder="Preferências, histórico, combinados..."'), 'campo-cheio') +
        '</div>',
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('nome')).trim()) return;
        if (c.id) {
          Object.assign(c, lerForm(f));
          AH.ui.toast('Cliente atualizado.');
        } else {
          var novo = Object.assign({ id: AH.uid(), criadoEm: AH.hojeISO() }, lerForm(f));
          AH.state.clientes.push(novo);
          AH.ui.toast('Cliente cadastrado.');
        }
        AH.salvar(); fechar(); AH.rerender();
      }
    });
  }

  function lerForm(f) {
    return {
      nome: String(f.get('nome')).trim(),
      empresa: String(f.get('empresa')).trim(),
      segmento: f.get('segmento'),
      whatsapp: String(f.get('whatsapp')).trim(),
      email: String(f.get('email')).trim(),
      instagram: String(f.get('instagram')).trim(),
      origem: f.get('origem'),
      status: f.get('status'),
      notas: String(f.get('notas')).trim()
    };
  }

  function excluir(c) {
    var usos = AH.state.projetos.filter(function (p) { return p.clienteId === c.id; }).length;
    var msg = 'Excluir o cliente "' + c.nome + '"?' + (usos ? ' Ele tem ' + usos + ' projeto(s) vinculados — eles não serão apagados, só ficarão sem cliente.' : '');
    AH.ui.confirmar(msg, function () {
      AH.state.clientes = AH.state.clientes.filter(function (x) { return x.id !== c.id; });
      AH.salvar(); AH.ui.toast('Cliente excluído.'); AH.rerender();
    });
  }

  function render(el) {
    var lista = AH.state.clientes.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });
    if (filtro.status !== 'todos') lista = lista.filter(function (c) { return c.status === filtro.status; });
    if (filtro.busca) {
      var q = filtro.busca.toLowerCase();
      lista = lista.filter(function (c) {
        return (c.nome + ' ' + c.empresa + ' ' + c.segmento + ' ' + c.instagram).toLowerCase().indexOf(q) >= 0;
      });
    }

    var html = '<div class="toolbar">' +
      '<div class="busca">' + AH.icons.clientes + '<input class="input" id="busca-cli" placeholder="Buscar cliente..." value="' + AH.esc(filtro.busca) + '"></div>' +
      '<div class="segmentos" id="seg-status">' +
      seg('todos', 'Todos') + seg('lead', 'Leads') + seg('ativo', 'Ativos') + seg('inativo', 'Inativos') +
      '</div>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-primario" id="btn-novo">' + AH.icons.mais + 'Novo cliente</button>' +
      '</div>';

    if (!lista.length) {
      html += AH.ui.vazio('clientes', 'Nenhum cliente por aqui',
        filtro.busca || filtro.status !== 'todos' ? 'Ajuste a busca ou os filtros.' : 'Cadastre seu primeiro cliente para começar.');
    } else {
      html += '<div class="tabela-wrap"><table class="tabela"><thead><tr>' +
        '<th>Cliente</th><th>Contato</th><th>Segmento</th><th>Origem</th><th>Status</th><th class="num">Projetos</th><th class="acoes"></th>' +
        '</tr></thead><tbody>';
      lista.forEach(function (c) {
        var projs = AH.state.projetos.filter(function (p) { return p.clienteId === c.id; }).length;
        var contatos = [];
        if (c.whatsapp) contatos.push('<a href="' + AH.telLink(c.whatsapp) + '" target="_blank" rel="noopener" title="WhatsApp">' + AH.esc(c.whatsapp) + '</a>');
        if (c.instagram) contatos.push('<a href="' + AH.instaLink(c.instagram) + '" target="_blank" rel="noopener">' + AH.esc(c.instagram) + '</a>');
        if (!contatos.length && c.email) contatos.push('<a href="mailto:' + AH.esc(c.email) + '">' + AH.esc(c.email) + '</a>');
        html += '<tr data-id="' + c.id + '">' +
          '<td><div class="celula-principal">' + AH.esc(c.nome) + '</div>' +
          (c.empresa && c.empresa !== c.nome ? '<div class="celula-sub">' + AH.esc(c.empresa) + '</div>' : '') + '</td>' +
          '<td>' + (contatos.join('<br>') || '<span class="celula-sub">—</span>') + '</td>' +
          '<td>' + AH.esc(c.segmento || '—') + '</td>' +
          '<td><span class="celula-sub">' + AH.esc(c.origem || '—') + '</span></td>' +
          '<td>' + AH.ui.badgeStatusCliente(c.status) + '</td>' +
          '<td class="num">' + projs + '</td>' +
          '<td class="acoes">' +
          '<button class="btn btn-ghost btn-icon btn-p" data-acao="editar" title="Editar">' + AH.icons.editar + '</button>' +
          '<button class="btn btn-ghost btn-icon btn-p" data-acao="excluir" title="Excluir">' + AH.icons.excluir + '</button>' +
          '</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    el.innerHTML = html;

    el.querySelector('#btn-novo').addEventListener('click', function () { abrirForm(null); });
    var busca = el.querySelector('#busca-cli');
    busca.addEventListener('input', function () {
      filtro.busca = busca.value;
      var pos = busca.selectionStart;
      render(el);
      var b2 = el.querySelector('#busca-cli');
      b2.focus(); b2.setSelectionRange(pos, pos);
    });
    el.querySelectorAll('#seg-status button').forEach(function (b) {
      b.addEventListener('click', function () { filtro.status = b.getAttribute('data-v'); render(el); });
    });
    el.querySelectorAll('tbody tr').forEach(function (tr) {
      var c = AH.clientePorId(tr.getAttribute('data-id'));
      tr.querySelector('[data-acao="editar"]').addEventListener('click', function () { abrirForm(c); });
      tr.querySelector('[data-acao="excluir"]').addEventListener('click', function () { excluir(c); });
    });
  }

  function seg(valor, rotulo) {
    return '<button data-v="' + valor + '" class="' + (filtro.status === valor ? 'ativo' : '') + '">' + rotulo + '</button>';
  }

  AH.views = AH.views || {};
  AH.views.clientes = { titulo: 'Clientes', render: render, novo: function () { abrirForm(null); } };
})();
