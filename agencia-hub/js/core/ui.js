/* AgênciaHub — componentes de interface compartilhados (modal, toast, badges, ícones) */
(function () {
  'use strict';

  var AH = (window.AH = window.AH || {});
  var ui = (AH.ui = {});

  /* ---------- segurança / helpers ---------- */

  AH.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  AH.telLink = function (tel) {
    return 'https://wa.me/55' + String(tel || '').replace(/\D/g, '');
  };

  AH.instaLink = function (arroba) {
    return 'https://instagram.com/' + String(arroba || '').replace('@', '');
  };

  /* ---------- ícones (traço 2px, herdam currentColor) ---------- */

  function svg(paths, vb) {
    return '<svg viewBox="' + (vb || '0 0 24 24') + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }

  AH.icons = {
    dashboard: svg('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
    clientes: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    projetos: svg('<rect x="3" y="4" width="5.5" height="16" rx="1.5"/><rect x="12" y="4" width="5.5" height="10" rx="1.5"/><path d="M20.5 4v6"/>'),
    tarefas: svg('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8.5 12 2.5 2.5 5-5"/>'),
    calendario: svg('<rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M8 2v4M16 2v4M3 9.5h18"/>'),
    propostas: svg('<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h4"/>'),
    financeiro: svg('<rect x="2.5" y="6" width="19" height="13" rx="2.5"/><path d="M2.5 10.5h19"/><path d="M6.5 15h3"/>'),
    equipamentos: svg('<path d="m15 8 4.5-2.5v13L15 16"/><rect x="2.5" y="6" width="12.5" height="12" rx="2.5"/>'),
    equipe: svg('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.9-3.3 4-5 7.5-5s6.6 1.7 7.5 5"/>'),
    config: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.09a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/>'),
    mais: svg('<path d="M12 5v14M5 12h14"/>'),
    editar: svg('<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>'),
    excluir: svg('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
    imprimir: svg('<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>'),
    seta_esq: svg('<path d="m15 18-6-6 6-6"/>'),
    seta_dir: svg('<path d="m9 18 6-6-6-6"/>'),
    whatsapp: svg('<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.6A8.5 8.5 0 1 1 21 11.5z"/>'),
    dinheiro: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c0-1.1-1.3-2-3-2s-3 .9-3 2 1 1.8 3 2 3 1 3 2-1.3 2-3 2-3-.9-3-2"/>'),
    alerta: svg('<path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17.5v.5"/>'),
    check: svg('<path d="m5 13 4 4L19 7"/>'),
    x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    duplicar: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    download: svg('<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>'),
    upload: svg('<path d="M12 15V3m0 0 4 4m-4-4-4 4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>'),
    filme: svg('<rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M7 4v16M17 4v16M2.5 9h4.5M2.5 15h4.5M17 9h4.5M17 15h4.5"/>')
  };

  /* ---------- mapas de rótulo/cor ---------- */

  ui.badgeStatusCliente = function (st) {
    var map = { lead: ['Lead', 'azul'], ativo: ['Ativo', 'verde'], inativo: ['Inativo', 'cinza'] };
    var b = map[st] || [st, 'cinza'];
    return '<span class="badge badge-' + b[1] + '">' + AH.esc(b[0]) + '</span>';
  };

  ui.badgeStatusProposta = function (st) {
    var map = { rascunho: ['Rascunho', 'cinza'], enviada: ['Enviada', 'azul'], aprovada: ['Aprovada', 'verde'], recusada: ['Recusada', 'vermelho'] };
    var b = map[st] || [st, 'cinza'];
    return '<span class="badge badge-' + b[1] + '">' + AH.esc(b[0]) + '</span>';
  };

  ui.badgeStatusEquip = function (st) {
    var map = { disponivel: ['Disponível', 'verde'], em_uso: ['Em uso', 'azul'], manutencao: ['Manutenção', 'amarelo'] };
    var b = map[st] || [st, 'cinza'];
    return '<span class="badge badge-' + b[1] + '">' + AH.esc(b[0]) + '</span>';
  };

  ui.badgePrioridade = function (p) {
    var map = { alta: ['Alta', 'vermelho'], media: ['Média', 'amarelo'], baixa: ['Baixa', 'cinza'] };
    var b = map[p] || [p, 'cinza'];
    return '<span class="badge badge-' + b[1] + '">' + AH.esc(b[0]) + '</span>';
  };

  ui.corEvento = { gravacao: 'roxo', entrega: 'laranja', reuniao: 'azul', postagem: 'verde', outro: 'cinza' };
  ui.nomeEvento = { gravacao: 'Gravação', entrega: 'Entrega', reuniao: 'Reunião', postagem: 'Postagem', outro: 'Outro' };

  ui.avatar = function (membro, tam) {
    if (!membro) return '';
    var cls = 'avatar' + (tam === 'g' ? ' avatar-g' : '');
    return '<span class="' + cls + '" style="background:' + AH.esc(membro.cor || '#64748b') + '22;color:' + AH.esc(membro.cor || '#94a3b8') + ';border-color:' + AH.esc(membro.cor || '#64748b') + '55" title="' + AH.esc(membro.nome) + '">' + AH.esc(AH.fmt.iniciais(membro.nome)) + '</span>';
  };

  ui.prazoBadge = function (iso, concluido) {
    if (!iso) return '';
    var dias = AH.diasAte(iso);
    var cls = 'prazo';
    var rotulo = AH.fmt.dataCurta(iso);
    if (!concluido) {
      if (dias < 0) { cls += ' prazo-atrasado'; rotulo += ' · atrasado'; }
      else if (dias === 0) { cls += ' prazo-hoje'; rotulo = 'hoje'; }
      else if (dias <= 3) { cls += ' prazo-perto'; }
    }
    return '<span class="' + cls + '">' + AH.icons.calendario + AH.esc(rotulo) + '</span>';
  };

  ui.vazio = function (icone, titulo, texto) {
    return '<div class="estado-vazio">' +
      '<div class="estado-vazio-icone">' + (AH.icons[icone] || AH.icons.dashboard) + '</div>' +
      '<strong>' + AH.esc(titulo) + '</strong>' +
      (texto ? '<p>' + AH.esc(texto) + '</p>' : '') +
      '</div>';
  };

  /* ---------- toast ---------- */

  ui.toast = function (msg, tipo) {
    var root = document.getElementById('toast-root');
    if (!root) return;
    var t = document.createElement('div');
    t.className = 'toast' + (tipo === 'erro' ? ' toast-erro' : '');
    t.innerHTML = (tipo === 'erro' ? AH.icons.alerta : AH.icons.check) + '<span>' + AH.esc(msg) + '</span>';
    root.appendChild(t);
    setTimeout(function () { t.classList.add('toast-sair'); }, 2600);
    setTimeout(function () { t.remove(); }, 3000);
  };

  /* ---------- modal ---------- */

  var modalAtivo = null;

  ui.fecharModal = function () {
    if (modalAtivo) {
      modalAtivo.remove();
      modalAtivo = null;
      document.body.classList.remove('modal-aberto');
    }
  };

  /**
   * ui.modal({ titulo, corpo (html), rodape (html opcional), largura ('m'|'g'),
   *            aoEnviar(form, fechar), enviarRotulo, extraClasse })
   * O corpo vira um <form>; botão principal dispara aoEnviar com o form.
   */
  ui.modal = function (opts) {
    ui.fecharModal();
    var root = document.getElementById('modal-root');
    var wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    var rodape;
    if (opts.rodape != null) {
      rodape = opts.rodape;
    } else {
      rodape =
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">' + AH.esc(opts.enviarRotulo || 'Salvar') + '</button>';
    }
    wrap.innerHTML =
      '<div class="modal ' + (opts.largura === 'g' ? 'modal-g' : '') + ' ' + (opts.extraClasse || '') + '" role="dialog" aria-modal="true" aria-label="' + AH.esc(opts.titulo) + '">' +
      '  <div class="modal-cabecalho"><h2>' + AH.esc(opts.titulo) + '</h2>' +
      '    <button type="button" class="btn btn-icon btn-ghost" data-fechar aria-label="Fechar">' + AH.icons.x + '</button></div>' +
      '  <form class="modal-form" novalidate>' +
      '    <div class="modal-corpo">' + opts.corpo + '</div>' +
      '    <div class="modal-rodape">' + rodape + '</div>' +
      '  </form>' +
      '</div>';
    root.appendChild(wrap);
    modalAtivo = wrap;
    document.body.classList.add('modal-aberto');

    var form = wrap.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (opts.aoEnviar) opts.aoEnviar(form, ui.fecharModal);
    });
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap || e.target.closest('[data-fechar]')) ui.fecharModal();
    });
    if (opts.aoMontar) opts.aoMontar(wrap.querySelector('.modal'), ui.fecharModal);
    var primeiro = wrap.querySelector('input,select,textarea');
    if (primeiro) primeiro.focus();
    return wrap;
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') ui.fecharModal();
  });

  ui.confirmar = function (msg, aoConfirmar, rotulo) {
    ui.modal({
      titulo: 'Confirmar',
      corpo: '<p class="confirmar-texto">' + AH.esc(msg) + '</p>',
      rodape:
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-perigo">' + AH.esc(rotulo || 'Excluir') + '</button>',
      aoEnviar: function (_form, fechar) { fechar(); aoConfirmar(); }
    });
  };

  /* ---------- campos de formulário ---------- */

  ui.campo = function (rotulo, inner, classe) {
    return '<label class="campo ' + (classe || '') + '"><span class="campo-rotulo">' + AH.esc(rotulo) + '</span>' + inner + '</label>';
  };

  ui.input = function (nome, valor, attrs) {
    return '<input class="input" name="' + nome + '" value="' + AH.esc(valor == null ? '' : valor) + '" ' + (attrs || '') + '>';
  };

  ui.select = function (nome, opcoes, selecionado, attrs) {
    var html = '<select class="input" name="' + nome + '" ' + (attrs || '') + '>';
    opcoes.forEach(function (o) {
      var id = typeof o === 'string' ? o : o.id;
      var nomeOp = typeof o === 'string' ? o : o.nome;
      html += '<option value="' + AH.esc(id) + '"' + (String(id) === String(selecionado) ? ' selected' : '') + '>' + AH.esc(nomeOp) + '</option>';
    });
    return html + '</select>';
  };

  ui.selectOpcional = function (nome, opcoes, selecionado, vazioRotulo) {
    var lista = [{ id: '', nome: vazioRotulo || '—' }].concat(opcoes);
    return ui.select(nome, lista, selecionado);
  };

  ui.textarea = function (nome, valor, attrs) {
    return '<textarea class="input" name="' + nome + '" ' + (attrs || 'rows="3"') + '>' + AH.esc(valor == null ? '' : valor) + '</textarea>';
  };

  ui.opcoesClientes = function () {
    return AH.state.clientes.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); })
      .map(function (c) { return { id: c.id, nome: c.nome }; });
  };

  ui.opcoesProjetos = function () {
    return AH.state.projetos.slice().sort(function (a, b) { return a.titulo.localeCompare(b.titulo, 'pt-BR'); })
      .map(function (p) { return { id: p.id, nome: p.titulo }; });
  };

  ui.opcoesEquipe = function () {
    return AH.state.equipe.map(function (m) { return { id: m.id, nome: m.nome }; });
  };
})();
