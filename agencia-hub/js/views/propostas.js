/* AgênciaHub — Propostas e orçamentos */
(function () {
  'use strict';
  var AH = window.AH;

  function linhaItem(item) {
    var it = item || { descricao: '', qtd: 1, valor: '' };
    return '<div class="prop-item" data-item>' +
      '<input class="input" data-desc list="servicos-sugeridos" placeholder="Descrição do serviço" value="' + AH.esc(it.descricao) + '">' +
      '<input class="input" data-qtd type="number" min="0" step="1" value="' + AH.esc(it.qtd) + '">' +
      '<input class="input" data-valor type="number" min="0" step="0.01" placeholder="0,00" value="' + AH.esc(it.valor) + '">' +
      '<button type="button" class="btn btn-ghost btn-icon btn-p" data-remover title="Remover item">' + AH.icons.x + '</button>' +
      '</div>';
  }

  function abrirForm(proposta) {
    var p = proposta || {};
    var ui = AH.ui;
    var itens = (p.itens && p.itens.length ? p.itens : [null]);

    var corpo =
      '<div class="form-grid">' +
      ui.campo('Título da proposta *', ui.input('titulo', p.titulo, 'required placeholder="Ex.: Cobertura da inauguração"'), 'campo-cheio') +
      ui.campo('Cliente *', ui.selectOpcional('clienteId', ui.opcoesClientes(), p.clienteId, 'Selecione...')) +
      ui.campo('Status', ui.select('status', AH.dominio.statusProposta, p.status || 'rascunho')) +
      ui.campo('Válida até', ui.input('validade', p.validade || AH.diasISO(15), 'type="date"')) +
      ui.campo('Nº', '<input class="input" value="' + (p.numero || AH.state.proximoNumeroProposta) + '" disabled>') +
      '</div>' +
      '<div style="margin-top:16px"><div class="prop-item prop-item-cab"><span>Item / serviço</span><span>Qtd</span><span>Valor unit.</span><span></span></div>' +
      '<div class="prop-itens" id="prop-itens">' + itens.map(linhaItem).join('') + '</div>' +
      '<datalist id="servicos-sugeridos">' + AH.dominio.servicosSugeridos.map(function (s) { return '<option value="' + AH.esc(s) + '">'; }).join('') + '</datalist>' +
      '<button type="button" class="btn btn-p btn-contorno" id="btn-add-item" style="margin-top:9px">' + AH.icons.mais + 'Adicionar item</button>' +
      '<div class="prop-totais">' +
      '<div class="linha"><span>Subtotal</span><span id="prop-subtotal">R$ 0,00</span></div>' +
      '<div class="linha"><span>Desconto (R$)</span><input class="input" name="desconto" id="prop-desconto" type="number" min="0" step="0.01" value="' + AH.esc(p.desconto || '') + '"></div>' +
      '<div class="linha total"><span>Total</span><span id="prop-total">R$ 0,00</span></div>' +
      '</div></div>' +
      '<div class="form-grid" style="margin-top:14px">' +
      ui.campo('Condições de pagamento', ui.textarea('condicoes', p.condicoes != null ? p.condicoes : AH.state.configuracoes.condicoesPadrao, 'rows="2"'), 'campo-cheio') +
      ui.campo('Observações (não saem na impressão)', ui.textarea('notas', p.notas, 'rows="2"'), 'campo-cheio') +
      '</div>';

    ui.modal({
      titulo: p.id ? 'Editar proposta #' + p.numero : 'Nova proposta',
      largura: 'g',
      corpo: corpo,
      rodape:
        (p.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        (p.id ? '<button type="button" class="btn btn-contorno" data-imprimir>' + AH.icons.imprimir + 'Imprimir / PDF</button>' : '') +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        var caixaItens = modal.querySelector('#prop-itens');

        function recalcular() {
          var sub = 0;
          caixaItens.querySelectorAll('[data-item]').forEach(function (li) {
            sub += (Number(li.querySelector('[data-qtd]').value) || 0) * (Number(li.querySelector('[data-valor]').value) || 0);
          });
          var desc = Number(modal.querySelector('#prop-desconto').value) || 0;
          modal.querySelector('#prop-subtotal').textContent = AH.fmt.moeda(sub);
          modal.querySelector('#prop-total').textContent = AH.fmt.moeda(Math.max(0, sub - desc));
        }

        function ligarLinha(li) {
          li.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', recalcular); });
          li.querySelector('[data-remover]').addEventListener('click', function () {
            if (caixaItens.querySelectorAll('[data-item]').length > 1) li.remove();
            else li.querySelectorAll('input').forEach(function (inp) { inp.value = inp.hasAttribute('data-qtd') ? 1 : ''; });
            recalcular();
          });
        }

        caixaItens.querySelectorAll('[data-item]').forEach(ligarLinha);
        modal.querySelector('#btn-add-item').addEventListener('click', function () {
          caixaItens.insertAdjacentHTML('beforeend', linhaItem(null));
          var nova = caixaItens.lastElementChild;
          ligarLinha(nova);
          nova.querySelector('[data-desc]').focus();
        });
        modal.querySelector('#prop-desconto').addEventListener('input', recalcular);
        recalcular();

        var btnExcluir = modal.querySelector('[data-excluir]');
        if (btnExcluir) btnExcluir.addEventListener('click', function () {
          fechar();
          AH.ui.confirmar('Excluir a proposta #' + p.numero + '?', function () {
            AH.state.propostas = AH.state.propostas.filter(function (x) { return x.id !== p.id; });
            AH.salvar(); AH.ui.toast('Proposta excluída.'); AH.rerender();
          });
        });

        var btnImprimir = modal.querySelector('[data-imprimir]');
        if (btnImprimir) btnImprimir.addEventListener('click', function () { imprimir(p); });
      },
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('titulo')).trim() || !f.get('clienteId')) {
          AH.ui.toast('Preencha o título e o cliente.', 'erro');
          return;
        }
        var itensNovos = [];
        form.closest('.modal').querySelectorAll('[data-item]').forEach(function (li) {
          var desc = li.querySelector('[data-desc]').value.trim();
          if (!desc) return;
          itensNovos.push({
            descricao: desc,
            qtd: Number(li.querySelector('[data-qtd]').value) || 1,
            valor: Number(li.querySelector('[data-valor]').value) || 0
          });
        });
        var dados = {
          titulo: String(f.get('titulo')).trim(),
          clienteId: f.get('clienteId'),
          status: f.get('status'),
          validade: f.get('validade'),
          desconto: Number(f.get('desconto')) || 0,
          condicoes: String(f.get('condicoes')).trim(),
          notas: String(f.get('notas')).trim(),
          itens: itensNovos
        };
        if (p.id) {
          Object.assign(p, dados);
          AH.ui.toast('Proposta atualizada.');
        } else {
          AH.state.propostas.push(Object.assign({
            id: AH.uid(), numero: AH.state.proximoNumeroProposta++, criadoEm: AH.hojeISO()
          }, dados));
          AH.ui.toast('Proposta criada.');
        }
        AH.salvar(); fechar(); AH.rerender();
      }
    });
  }

  function imprimir(p) {
    var cfg = AH.state.configuracoes;
    var cli = AH.clientePorId(p.clienteId) || {};
    var sub = (p.itens || []).reduce(function (a, it) { return a + (Number(it.qtd) || 0) * (Number(it.valor) || 0); }, 0);
    var total = AH.totalProposta(p);

    var contato = [cfg.whatsapp, cfg.email, cfg.instagram, cfg.site, cfg.cidade]
      .filter(Boolean).map(AH.esc).join('<br>');

    var html = '<div class="print-doc">' +
      '<div class="print-cab"><div>' +
      '<h1>' + AH.esc(cfg.nomeAgencia || 'Sua agência') + '</h1>' +
      '<div class="slogan">' + AH.esc(cfg.slogan || '') + (cfg.cnpj ? ' · CNPJ ' + AH.esc(cfg.cnpj) : '') + '</div>' +
      '</div><div class="contato">' + contato + '</div></div>' +

      '<div class="print-meta">' +
      '<div class="bloco"><b>Proposta</b>Nº ' + p.numero + '<br>Emitida em ' + AH.fmt.data(p.criadoEm) + '<br>Válida até ' + AH.fmt.data(p.validade) + '</div>' +
      '<div class="bloco" style="text-align:right"><b>Para</b>' + AH.esc(cli.nome || '—') +
      (cli.empresa && cli.empresa !== cli.nome ? '<br>' + AH.esc(cli.empresa) : '') +
      (cli.whatsapp ? '<br>' + AH.esc(cli.whatsapp) : '') +
      (cli.email ? '<br>' + AH.esc(cli.email) : '') + '</div>' +
      '</div>' +

      '<div class="print-titulo">' + AH.esc(p.titulo) + '</div>' +

      '<table class="print-itens"><thead><tr><th>Descrição</th><th class="num">Qtd</th><th class="num">Valor unit.</th><th class="num">Subtotal</th></tr></thead><tbody>' +
      (p.itens || []).map(function (it) {
        return '<tr><td>' + AH.esc(it.descricao) + '</td>' +
          '<td class="num">' + (Number(it.qtd) || 0) + '</td>' +
          '<td class="num">' + AH.fmt.moeda(it.valor) + '</td>' +
          '<td class="num">' + AH.fmt.moeda((Number(it.qtd) || 0) * (Number(it.valor) || 0)) + '</td></tr>';
      }).join('') +
      '</tbody></table>' +

      '<div class="print-totais">' +
      '<div class="linha"><span>Subtotal</span><span>' + AH.fmt.moeda(sub) + '</span></div>' +
      (Number(p.desconto) ? '<div class="linha"><span>Desconto</span><span>− ' + AH.fmt.moeda(p.desconto) + '</span></div>' : '') +
      '<div class="linha total"><span>Total</span><span>' + AH.fmt.moeda(total) + '</span></div>' +
      '</div>' +

      (p.condicoes ? '<div class="print-cond"><b>Condições de pagamento</b>' + AH.esc(p.condicoes) + (cfg.pix ? '<br>PIX: ' + AH.esc(cfg.pix) : '') + '</div>' : '') +

      '<div class="print-assinaturas">' +
      '<div class="ass">' + AH.esc(cfg.nomeAgencia || 'Agência') + '</div>' +
      '<div class="ass">' + AH.esc(cli.nome || 'Cliente') + '</div>' +
      '</div>' +
      '<div class="print-rodape">Proposta gerada pelo AgênciaHub em ' + AH.fmt.data(AH.hojeISO()) + '</div>' +
      '</div>';

    document.getElementById('print-root').innerHTML = html;
    window.print();
  }

  function lancarNoFinanceiro(p) {
    var total = AH.totalProposta(p);
    AH.state.lancamentos.push({
      id: AH.uid(), tipo: 'receita',
      descricao: 'Proposta #' + p.numero + ' — ' + p.titulo,
      categoria: 'Projeto', valor: total, data: AH.hojeISO(),
      status: 'pendente', clienteId: p.clienteId, projetoId: '', propostaId: p.id
    });
    AH.salvar();
    AH.ui.toast('Receita pendente de ' + AH.fmt.moeda(total) + ' criada no financeiro.');
    AH.rerender();
  }

  function duplicar(p) {
    var copia = JSON.parse(JSON.stringify(p));
    copia.id = AH.uid();
    copia.numero = AH.state.proximoNumeroProposta++;
    copia.status = 'rascunho';
    copia.criadoEm = AH.hojeISO();
    copia.validade = AH.diasISO(15);
    AH.state.propostas.push(copia);
    AH.salvar(); AH.ui.toast('Proposta duplicada como rascunho #' + copia.numero + '.'); AH.rerender();
  }

  function render(el) {
    var lista = AH.state.propostas.slice().sort(function (a, b) { return b.numero - a.numero; });

    var resumo = { enviada: 0, aprovada: 0 };
    lista.forEach(function (p) {
      if (p.status === 'enviada') resumo.enviada += AH.totalProposta(p);
      if (p.status === 'aprovada') resumo.aprovada += AH.totalProposta(p);
    });

    var html = '<div class="toolbar">' +
      '<span class="chip">Em negociação: <b>&nbsp;' + AH.fmt.moeda(resumo.enviada) + '</b></span>' +
      '<span class="chip">Aprovadas: <b>&nbsp;' + AH.fmt.moeda(resumo.aprovada) + '</b></span>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-primario" id="btn-novo">' + AH.icons.mais + 'Nova proposta</button>' +
      '</div>';

    if (!lista.length) {
      html += AH.ui.vazio('propostas', 'Nenhuma proposta ainda', 'Crie uma proposta, envie ao cliente e acompanhe a negociação por aqui.');
    } else {
      html += '<div class="tabela-wrap"><table class="tabela"><thead><tr>' +
        '<th>Nº</th><th>Proposta</th><th>Cliente</th><th class="num">Valor</th><th>Validade</th><th>Status</th><th class="acoes"></th>' +
        '</tr></thead><tbody>';
      lista.forEach(function (p) {
        var vencida = p.status === 'enviada' && p.validade && AH.diasAte(p.validade) < 0;
        var jaLancada = AH.state.lancamentos.some(function (l) { return l.propostaId === p.id; });
        html += '<tr data-id="' + p.id + '">' +
          '<td class="num">#' + p.numero + '</td>' +
          '<td><div class="celula-principal">' + AH.esc(p.titulo) + '</div>' +
          '<div class="celula-sub">' + (p.itens || []).length + ' item(ns) · criada em ' + AH.fmt.data(p.criadoEm) + '</div></td>' +
          '<td>' + AH.esc(AH.nomeCliente(p.clienteId)) + '</td>' +
          '<td class="num"><b>' + AH.fmt.moeda(AH.totalProposta(p)) + '</b></td>' +
          '<td>' + (p.validade ? AH.fmt.data(p.validade) : '—') + (vencida ? ' <span class="badge badge-vermelho">vencida</span>' : '') + '</td>' +
          '<td><select class="input" data-status style="width:auto;padding:4px 28px 4px 9px;font-size:12.5px">' +
          AH.dominio.statusProposta.map(function (s) {
            return '<option value="' + s.id + '"' + (p.status === s.id ? ' selected' : '') + '>' + s.nome + '</option>';
          }).join('') + '</select></td>' +
          '<td class="acoes">' +
          (p.status === 'aprovada' && !jaLancada
            ? '<button class="btn btn-p btn-contorno" data-acao="financeiro" title="Criar receita no financeiro">' + AH.icons.dinheiro + '→ Financeiro</button>'
            : '') +
          '<button class="btn btn-ghost btn-icon btn-p" data-acao="imprimir" title="Imprimir / PDF">' + AH.icons.imprimir + '</button>' +
          '<button class="btn btn-ghost btn-icon btn-p" data-acao="duplicar" title="Duplicar">' + AH.icons.duplicar + '</button>' +
          '<button class="btn btn-ghost btn-icon btn-p" data-acao="editar" title="Editar">' + AH.icons.editar + '</button>' +
          '</td></tr>';
      });
      html += '</tbody></table></div>';
      html += '<p class="nota-rodape" style="margin-top:10px">Dica: use “Imprimir / PDF” e escolha “Salvar como PDF” para enviar a proposta ao cliente no WhatsApp.</p>';
    }

    el.innerHTML = html;
    el.querySelector('#btn-novo').addEventListener('click', function () { abrirForm(null); });

    el.querySelectorAll('tbody tr').forEach(function (tr) {
      var p = AH.state.propostas.filter(function (x) { return x.id === tr.getAttribute('data-id'); })[0];
      tr.querySelector('[data-status]').addEventListener('change', function (e) {
        p.status = e.target.value;
        AH.salvar(); AH.ui.toast('Status: ' + e.target.selectedOptions[0].textContent + '.');
        render(el);
      });
      tr.querySelector('[data-acao="editar"]').addEventListener('click', function () { abrirForm(p); });
      tr.querySelector('[data-acao="imprimir"]').addEventListener('click', function () { imprimir(p); });
      tr.querySelector('[data-acao="duplicar"]').addEventListener('click', function () { duplicar(p); });
      var fin = tr.querySelector('[data-acao="financeiro"]');
      if (fin) fin.addEventListener('click', function () { lancarNoFinanceiro(p); });
    });
  }

  AH.views = AH.views || {};
  AH.views.propostas = { titulo: 'Propostas', render: render, novo: function () { abrirForm(null); } };
})();
