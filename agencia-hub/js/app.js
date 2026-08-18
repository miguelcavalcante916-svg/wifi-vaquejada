/* AgênciaHub — roteador e inicialização */
(function () {
  'use strict';
  var AH = window.AH;

  var ROTAS = [
    { hash: '#/dashboard', view: 'dashboard', nome: 'Visão geral', icone: 'dashboard' },
    { hash: '#/clientes', view: 'clientes', nome: 'Clientes', icone: 'clientes' },
    { hash: '#/projetos', view: 'projetos', nome: 'Projetos', icone: 'projetos' },
    { hash: '#/tarefas', view: 'tarefas', nome: 'Tarefas', icone: 'tarefas' },
    { hash: '#/calendario', view: 'calendario', nome: 'Calendário', icone: 'calendario' },
    { hash: '#/propostas', view: 'propostas', nome: 'Propostas', icone: 'propostas' },
    { hash: '#/financeiro', view: 'financeiro', nome: 'Financeiro', icone: 'financeiro' },
    { hash: '#/equipamentos', view: 'equipamentos', nome: 'Equipamentos', icone: 'equipamentos' },
    { hash: '#/equipe', view: 'equipe', nome: 'Equipe', icone: 'equipe' },
    { hash: '#/configuracoes', view: 'config', nome: 'Configurações', icone: 'config' }
  ];

  var rotaAtual = null;

  function contadores() {
    return {
      tarefas: AH.state.tarefas.filter(function (t) { return !t.feita; }).length,
      projetos: AH.state.projetos.filter(function (p) { return p.status !== 'entregue'; }).length
    };
  }

  function montarNav() {
    var nav = document.getElementById('nav');
    var cont = contadores();
    nav.innerHTML = ROTAS.map(function (r) {
      var extra = '';
      if (r.view === 'tarefas' && cont.tarefas) extra = '<span class="nav-cont">' + cont.tarefas + '</span>';
      if (r.view === 'projetos' && cont.projetos) extra = '<span class="nav-cont">' + cont.projetos + '</span>';
      return '<a class="nav-item' + (rotaAtual && rotaAtual.view === r.view ? ' ativo' : '') + '" href="' + r.hash + '">' +
        AH.icons[r.icone] + '<span>' + r.nome + '</span>' + extra + '</a>';
    }).join('');
  }

  AH.atualizarMarca = function () {
    var cfg = AH.state.configuracoes;
    document.getElementById('brand-agencia').textContent = cfg.nomeAgencia || 'Sua agência';
    document.title = (cfg.nomeAgencia && cfg.nomeAgencia !== 'Sua agência' ? cfg.nomeAgencia + ' · ' : '') + 'AgênciaHub';
  };

  function fecharSidebarMobile() {
    document.getElementById('sidebar').classList.remove('aberta');
    document.getElementById('sidebar-backdrop').hidden = true;
  }

  function navegar() {
    var hash = location.hash || '#/dashboard';
    var rota = ROTAS.filter(function (r) { return hash.indexOf(r.hash) === 0; })[0] || ROTAS[0];
    rotaAtual = rota;

    AH.ui.fecharModal();
    fecharSidebarMobile();

    var view = AH.views[rota.view];
    document.getElementById('page-title').textContent = view.titulo || rota.nome;
    var el = document.getElementById('view');
    view.render(el);
    montarNav();
    el.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // Rerenderiza a tela atual (chamado após qualquer alteração de dados)
  AH.rerender = function () {
    if (!rotaAtual) return;
    AH.views[rotaAtual.view].render(document.getElementById('view'));
    montarNav();
  };

  function iniciar() {
    AH.carregar();
    AH.atualizarMarca();

    var hoje = new Date();
    document.getElementById('sidebar-hoje').textContent =
      hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    document.getElementById('btn-menu').addEventListener('click', function () {
      document.getElementById('sidebar').classList.add('aberta');
      document.getElementById('sidebar-backdrop').hidden = false;
    });
    document.getElementById('sidebar-backdrop').addEventListener('click', fecharSidebarMobile);

    window.addEventListener('hashchange', navegar);
    if (!location.hash) location.hash = '#/dashboard';
    navegar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
