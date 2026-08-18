/* AgênciaHub — Financeiro (receitas e despesas) */
(function () {
  'use strict';
  var AH = window.AH;

  var mesRef = null; // 'YYYY-MM'
  var filtroTipo = 'todos';

  function mudarMes(delta) {
    var p = mesRef.split('-');
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1 + delta, 1);
    mesRef = d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1);
  }

  function abrirForm(lanc) {
    var l = lanc || {};
    var ui = AH.ui;
    var tipoAtual = l.tipo || 'receita';

    function categorias(tipo) {
      return tipo === 'despesa' ? AH.dominio.categoriasDespesa : AH.dominio.categoriasReceita;
    }

    ui.modal({
      titulo: l.id ? 'Editar lançamento' : 'Novo lançamento',
      corpo:
        '<div class="form-grid">' +
        ui.campo('Tipo', ui.select('tipo', [{ id: 'receita', nome: 'Receita (entrada)' }, { id: 'despesa', nome: 'Despesa (saída)' }], tipoAtual)) +
        ui.campo('Valor (R$) *', ui.input('valor', l.valor, 'type="number" min="0.01" step="0.01" required placeholder="0,00"')) +
        ui.campo('Descrição *', ui.input('descricao', l.descricao, 'required placeholder="Ex.: Vídeo institucional — 2ª parcela"'), 'campo-cheio') +
        ui.campo('Categoria', '<span id="slot-categoria">' + ui.select('categoria', categorias(tipoAtual), l.categoria) + '</span>') +
        ui.campo('Data *', ui.input('data', l.data || AH.hojeISO(), 'type="date" required')) +
        ui.campo('Situação', ui.select('status', [{ id: 'pago', nome: 'Pago / recebido' }, { id: 'pendente', nome: 'Pendente' }], l.status || 'pago')) +
        ui.campo('Cliente', ui.selectOpcional('clienteId', ui.opcoesClientes(), l.clienteId, 'Sem cliente')) +
        '</div>',
      rodape:
        (l.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        modal.querySelector('[name="tipo"]').addEventListener('change', function (e) {
          document.getElementById('slot-categoria').innerHTML = ui.select('categoria', categorias(e.target.value), null);
        });
        var btn = modal.querySelector('[data-excluir]');
        if (btn) btn.addEventListener('click', function () {
          AH.state.lancamentos = AH.state.lancamentos.filter(function (x) { return x.id !== l.id; });
          AH.salvar(); fechar(); AH.ui.toast('Lançamento excluído.'); AH.rerender();
        });
      },
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('descricao')).trim() || !(Number(f.get('valor')) > 0)) {
          AH.ui.toast('Preencha descrição e valor.', 'erro');
          return;
        }
        var dados = {
          tipo: f.get('tipo'),
          valor: Number(f.get('valor')),
          descricao: String(f.get('descricao')).trim(),
          categoria: f.get('categoria'),
          data: f.get('data'),
          status: f.get('status'),
          clienteId: f.get('clienteId')
        };
        if (l.id) Object.assign(l, dados);
        else AH.state.lancamentos.push(Object.assign({ id: AH.uid(), projetoId: '', propostaId: '' }, dados));
        AH.salvar(); fechar(); AH.ui.toast('Lançamento salvo.'); AH.rerender();
      }
    });
  }

  function render(el) {
    if (!mesRef) mesRef = AH.mesISO(0);

    var doMes = AH.state.lancamentos.filter(function (l) { return String(l.data).slice(0, 7) === mesRef; });
    var receitas = 0, despesas = 0, pendenteReceber = 0;
    doMes.forEach(function (l) {
      var v = Number(l.valor) || 0;
      if (l.tipo === 'receita') {
        if (l.status === 'pago') receitas += v; else pendenteReceber += v;
      } else if (l.status === 'pago') despesas += v;
    });
    var resultado = receitas - despesas;

    var lista = doMes.slice();
    if (filtroTipo !== 'todos') lista = lista.filter(function (l) { return l.tipo === filtroTipo; });
    lista.sort(function (a, b) { return b.data.localeCompare(a.data); });

    var html = '<div class="cal-cab">' +
      '<button class="btn btn-icon" id="fin-prev" aria-label="Mês anterior">' + AH.icons.seta_esq + '</button>' +
      '<button class="btn btn-icon" id="fin-prox" aria-label="Próximo mês">' + AH.icons.seta_dir + '</button>' +
      '<h2>' + AH.esc(AH.fmt.mesAno(mesRef)) + '</h2>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-primario" id="btn-novo">' + AH.icons.mais + 'Novo lançamento</button>' +
      '</div>';

    html += '<div class="grid grid-4">' +
      tile('Recebido', AH.fmt.moeda(receitas), 'verde') +
      tile('Despesas pagas', AH.fmt.moeda(despesas), 'vermelho') +
      tile('Resultado', AH.fmt.moeda(resultado), resultado >= 0 ? 'verde' : 'vermelho') +
      tile('A receber no mês', AH.fmt.moeda(pendenteReceber), 'amarelo') +
      '</div>';

    html += '<div class="toolbar" style="margin-top:18px">' +
      '<div class="segmentos" id="seg-tipo">' +
      seg('todos', 'Tudo') + seg('receita', 'Receitas') + seg('despesa', 'Despesas') +
      '</div></div>';

    if (!lista.length) {
      html += AH.ui.vazio('financeiro', 'Sem lançamentos neste mês', 'Registre receitas e despesas para acompanhar o caixa da agência.');
    } else {
      html += '<div class="tabela-wrap"><table class="tabela"><thead><tr>' +
        '<th>Data</th><th>Descrição</th><th>Categoria</th><th>Situação</th><th class="num">Valor</th><th class="acoes"></th>' +
        '</tr></thead><tbody>';
      lista.forEach(function (l) {
        var ehReceita = l.tipo === 'receita';
        html += '<tr data-id="' + l.id + '">' +
          '<td>' + AH.fmt.dataCurta(l.data) + '</td>' +
          '<td><div class="celula-principal">' + AH.esc(l.descricao) + '</div>' +
          (l.clienteId ? '<div class="celula-sub">' + AH.esc(AH.nomeCliente(l.clienteId)) + '</div>' : '') + '</td>' +
          '<td><span class="chip">' + AH.esc(l.categoria || '—') + '</span></td>' +
          '<td><button class="badge ' + (l.status === 'pago' ? 'badge-verde' : 'badge-amarelo') + '" data-status style="cursor:pointer;border-style:dashed" title="Clique para alternar">' +
          (l.status === 'pago' ? (ehReceita ? 'Recebido' : 'Pago') : 'Pendente') + '</button></td>' +
          '<td class="num" style="color:var(--' + (ehReceita ? 'verde' : 'vermelho') + ');font-weight:700">' +
          (ehReceita ? '+ ' : '− ') + AH.fmt.moeda(l.valor) + '</td>' +
          '<td class="acoes">' +
          '<button class="btn btn-ghost btn-icon btn-p" data-acao="editar" title="Editar">' + AH.icons.editar + '</button>' +
          '</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    el.innerHTML = html;

    el.querySelector('#fin-prev').addEventListener('click', function () { mudarMes(-1); render(el); });
    el.querySelector('#fin-prox').addEventListener('click', function () { mudarMes(1); render(el); });
    el.querySelector('#btn-novo').addEventListener('click', function () { abrirForm(null); });
    el.querySelectorAll('#seg-tipo button').forEach(function (b) {
      b.addEventListener('click', function () { filtroTipo = b.getAttribute('data-v'); render(el); });
    });
    el.querySelectorAll('tbody tr').forEach(function (tr) {
      var l = AH.state.lancamentos.filter(function (x) { return x.id === tr.getAttribute('data-id'); })[0];
      tr.querySelector('[data-acao="editar"]').addEventListener('click', function () { abrirForm(l); });
      tr.querySelector('[data-status]').addEventListener('click', function () {
        l.status = l.status === 'pago' ? 'pendente' : 'pago';
        AH.salvar(); render(el);
      });
    });
  }

  function tile(rotulo, valor, cor) {
    return '<div class="card tile"><div class="tile-rotulo">' + AH.esc(rotulo) + '</div>' +
      '<div class="tile-valor" style="color:var(--' + cor + ')">' + AH.esc(valor) + '</div></div>';
  }

  function seg(valor, rotulo) {
    return '<button data-v="' + valor + '" class="' + (filtroTipo === valor ? 'ativo' : '') + '">' + rotulo + '</button>';
  }

  AH.views = AH.views || {};
  AH.views.financeiro = { titulo: 'Financeiro', render: render, novo: function () { abrirForm(null); } };
})();
