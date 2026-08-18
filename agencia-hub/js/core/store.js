/* AgênciaHub — armazenamento, dados de demonstração e utilitários de domínio */
(function () {
  'use strict';

  var STORAGE_KEY = 'agenciahub:dados:v1';

  var AH = (window.AH = window.AH || {});

  /* ---------- utilitários básicos ---------- */

  AH.uid = function () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  };

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  AH.hojeISO = function () {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };

  // Desloca a data de hoje em `dias` e devolve YYYY-MM-DD
  AH.diasISO = function (dias) {
    var d = new Date();
    d.setDate(d.getDate() + dias);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };

  // Primeiro dia do mês deslocado em `meses`, como YYYY-MM
  AH.mesISO = function (meses) {
    var d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + (meses || 0));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
  };

  AH.fmt = {
    moeda: function (v) {
      return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    // '2026-08-18' -> '18/08/2026' (sem fuso: trata como data local)
    data: function (iso) {
      if (!iso) return '—';
      var p = String(iso).slice(0, 10).split('-');
      if (p.length !== 3) return iso;
      return p[2] + '/' + p[1] + '/' + p[0];
    },
    dataCurta: function (iso) {
      if (!iso) return '—';
      var p = String(iso).slice(0, 10).split('-');
      var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return parseInt(p[2], 10) + ' ' + meses[parseInt(p[1], 10) - 1];
    },
    mesAno: function (yyyymm) {
      var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      var p = String(yyyymm).split('-');
      return meses[parseInt(p[1], 10) - 1] + ' de ' + p[0];
    },
    mesCurto: function (yyyymm) {
      var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      var p = String(yyyymm).split('-');
      return meses[parseInt(p[1], 10) - 1] + '/' + p[0].slice(2);
    },
    iniciais: function (nome) {
      var partes = String(nome || '?').trim().split(/\s+/);
      var s = partes[0].charAt(0) + (partes.length > 1 ? partes[partes.length - 1].charAt(0) : '');
      return s.toUpperCase();
    }
  };

  // Diferença em dias entre hoje e uma data ISO (negativo = atrasado)
  AH.diasAte = function (iso) {
    if (!iso) return null;
    var p = String(iso).slice(0, 10).split('-');
    var alvo = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return Math.round((alvo - hoje) / 86400000);
  };

  /* ---------- vocabulário do domínio ---------- */

  AH.dominio = {
    colunasProjeto: [
      { id: 'briefing', nome: 'Briefing' },
      { id: 'planejamento', nome: 'Planejamento' },
      { id: 'producao', nome: 'Produção' },
      { id: 'edicao', nome: 'Edição / Design' },
      { id: 'revisao', nome: 'Revisão do cliente' },
      { id: 'entregue', nome: 'Entregue' }
    ],
    tiposProjeto: [
      'Vídeo institucional', 'Social media', 'Cobertura de evento', 'Tráfego pago',
      'Identidade visual', 'Filmagem com drone', 'Site / Landing page',
      'Ensaio fotográfico', 'Podcast', 'Outro'
    ],
    statusCliente: [
      { id: 'lead', nome: 'Lead' },
      { id: 'ativo', nome: 'Ativo' },
      { id: 'inativo', nome: 'Inativo' }
    ],
    segmentos: [
      'Agronegócio', 'Alimentação', 'Educação', 'Eventos', 'Imobiliário',
      'Indústria', 'Moda', 'Saúde', 'Serviços', 'Varejo', 'Outro'
    ],
    prioridades: [
      { id: 'alta', nome: 'Alta' },
      { id: 'media', nome: 'Média' },
      { id: 'baixa', nome: 'Baixa' }
    ],
    tiposEvento: [
      { id: 'gravacao', nome: 'Gravação' },
      { id: 'entrega', nome: 'Entrega' },
      { id: 'reuniao', nome: 'Reunião' },
      { id: 'postagem', nome: 'Postagem' },
      { id: 'outro', nome: 'Outro' }
    ],
    statusProposta: [
      { id: 'rascunho', nome: 'Rascunho' },
      { id: 'enviada', nome: 'Enviada' },
      { id: 'aprovada', nome: 'Aprovada' },
      { id: 'recusada', nome: 'Recusada' }
    ],
    categoriasReceita: ['Projeto', 'Mensalidade (fee)', 'Locação de equipamento', 'Outro'],
    categoriasDespesa: ['Equipamento', 'Software / Assinaturas', 'Equipe / Freela', 'Transporte', 'Impostos', 'Marketing', 'Outro'],
    categoriasEquipamento: ['Câmera', 'Lente', 'Drone', 'Iluminação', 'Áudio', 'Estabilizador / Gimbal', 'Computador', 'Acessório'],
    statusEquipamento: [
      { id: 'disponivel', nome: 'Disponível' },
      { id: 'em_uso', nome: 'Em uso' },
      { id: 'manutencao', nome: 'Manutenção' }
    ],
    funcoes: [
      'Direção', 'Filmmaker', 'Edição de vídeo', 'Social media', 'Design',
      'Gestão de tráfego', 'Fotografia', 'Atendimento / Comercial', 'Roteiro'
    ],
    servicosSugeridos: [
      'Vídeo institucional (roteiro + captação + edição)',
      'Pacote social media mensal (12 posts + 8 stories)',
      'Cobertura de evento (diária de filmagem)',
      'Diária de filmagem com drone',
      'Edição de vídeo (por minuto finalizado)',
      'Gestão de tráfego pago (mensal)',
      'Identidade visual completa',
      'Ensaio fotográfico (até 3h)',
      'Captação e edição de podcast (por episódio)',
      'Landing page'
    ]
  };

  AH.nomeColuna = function (id) {
    var c = AH.dominio.colunasProjeto.filter(function (x) { return x.id === id; })[0];
    return c ? c.nome : id;
  };

  /* ---------- estado + persistência ---------- */

  function estadoVazio() {
    return {
      versao: 1,
      configuracoes: {
        nomeAgencia: 'Sua agência',
        slogan: 'Marketing & Produção Audiovisual',
        responsavel: '',
        email: '',
        whatsapp: '',
        instagram: '',
        site: '',
        cidade: '',
        cnpj: '',
        pix: '',
        condicoesPadrao: '50% na aprovação e 50% na entrega. Valores válidos conforme prazo da proposta.'
      },
      clientes: [],
      projetos: [],
      tarefas: [],
      eventos: [],
      propostas: [],
      lancamentos: [],
      equipamentos: [],
      equipe: [],
      proximoNumeroProposta: 1
    };
  }

  AH.carregar = function () {
    try {
      var bruto = localStorage.getItem(STORAGE_KEY);
      if (bruto) {
        var dados = JSON.parse(bruto);
        // garante chaves novas em dados antigos
        var base = estadoVazio();
        Object.keys(base).forEach(function (k) {
          if (dados[k] === undefined) dados[k] = base[k];
        });
        AH.state = dados;
        return;
      }
    } catch (e) {
      console.warn('AgênciaHub: falha ao ler dados salvos, iniciando com demonstração.', e);
    }
    AH.state = AH.dadosDemo();
    AH.salvar();
  };

  AH.salvar = function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(AH.state));
    } catch (e) {
      console.error('AgênciaHub: não foi possível salvar no navegador.', e);
      if (AH.ui && AH.ui.toast) AH.ui.toast('Não foi possível salvar os dados neste navegador.', 'erro');
    }
  };

  AH.limparTudo = function () {
    AH.state = estadoVazio();
    AH.salvar();
  };

  AH.restaurarDemo = function () {
    AH.state = AH.dadosDemo();
    AH.salvar();
  };

  AH.estadoVazio = estadoVazio;

  /* ---------- consultas comuns ---------- */

  AH.clientePorId = function (id) {
    return AH.state.clientes.filter(function (c) { return c.id === id; })[0] || null;
  };
  AH.projetoPorId = function (id) {
    return AH.state.projetos.filter(function (p) { return p.id === id; })[0] || null;
  };
  AH.membroPorId = function (id) {
    return AH.state.equipe.filter(function (m) { return m.id === id; })[0] || null;
  };
  AH.nomeCliente = function (id) {
    var c = AH.clientePorId(id);
    return c ? c.nome : 'Sem cliente';
  };

  AH.totalProposta = function (p) {
    var soma = (p.itens || []).reduce(function (acc, it) {
      return acc + (Number(it.qtd) || 0) * (Number(it.valor) || 0);
    }, 0);
    return Math.max(0, soma - (Number(p.desconto) || 0));
  };

  /* ---------- dados de demonstração ---------- */

  AH.dadosDemo = function () {
    var s = estadoVazio();
    var d = AH.diasISO, m = AH.mesISO;

    s.configuracoes.nomeAgencia = 'Sua agência';
    s.configuracoes.slogan = 'Marketing & Produção Audiovisual';
    s.configuracoes.condicoesPadrao = '50% na aprovação e 50% na entrega. Proposta válida por 15 dias.';

    var eq = function (nome, funcao, whatsapp, cor) {
      return { id: AH.uid(), nome: nome, funcao: funcao, email: '', whatsapp: whatsapp || '', cor: cor };
    };
    var m1 = eq('Você', 'Direção', '', '#fb923c');
    var m2 = eq('Ana Souza', 'Edição de vídeo', '(88) 99999-0002', '#a78bfa');
    var m3 = eq('Pedro Lima', 'Filmmaker', '(88) 99999-0003', '#60a5fa');
    var m4 = eq('Carla Dias', 'Social media', '(88) 99999-0004', '#f472b6');
    s.equipe = [m1, m2, m3, m4];

    var cli = function (nome, empresa, segmento, status, whatsapp, instagram, origem) {
      return {
        id: AH.uid(), nome: nome, empresa: empresa, segmento: segmento, status: status,
        email: '', whatsapp: whatsapp || '', instagram: instagram || '', origem: origem || 'Indicação',
        notas: '', criadoEm: AH.hojeISO()
      };
    };
    var c1 = cli('Haras Boa Vista', 'Haras Boa Vista', 'Agronegócio', 'ativo', '(88) 98888-0001', '@harasboavista');
    var c2 = cli('Supermercado Central', 'Central Ltda', 'Varejo', 'ativo', '(88) 98888-0002', '@supercentral', 'Instagram');
    var c3 = cli('Clínica Vida', 'Clínica Vida', 'Saúde', 'ativo', '(88) 98888-0003', '@clinicavida');
    var c4 = cli('Parque de Vaquejada Serra Verde', 'Serra Verde Eventos', 'Eventos', 'ativo', '(88) 98888-0004', '@vaquejadaserraverde', 'Evento');
    var c5 = cli('Loja Estilo Sertão', 'Estilo Sertão', 'Moda', 'lead', '(88) 98888-0005', '@estilosertao', 'Instagram');
    var c6 = cli('Colégio Saber', 'Colégio Saber', 'Educação', 'inativo', '(88) 98888-0006', '@colegiosaber');
    s.clientes = [c1, c2, c3, c4, c5, c6];

    var proj = function (titulo, clienteId, tipo, status, prazo, valor, respId, descricao) {
      return {
        id: AH.uid(), titulo: titulo, clienteId: clienteId, tipo: tipo, status: status,
        prazo: prazo, valor: valor, responsavelId: respId, descricao: descricao || '',
        criadoEm: AH.hojeISO()
      };
    };
    var p1 = proj('Aftermovie da vaquejada', c4.id, 'Cobertura de evento', 'edicao', d(4), 4500, m2.id, 'Vídeo resumo de 2 min + cortes para reels.');
    var p2 = proj('Vídeo institucional 2 min', c3.id, 'Vídeo institucional', 'producao', d(9), 6800, m3.id, 'Roteiro aprovado. Gravação na clínica.');
    var p3 = proj('Social media — agosto', c2.id, 'Social media', 'producao', d(12), 1900, m4.id, '12 posts + 8 stories + relatório.');
    var p4 = proj('Campanha de tráfego — inauguração', c2.id, 'Tráfego pago', 'planejamento', d(6), 1500, m1.id, 'Meta Ads. Verba do cliente: R$ 2.000.');
    var p5 = proj('Ensaio do plantel', c1.id, 'Ensaio fotográfico', 'briefing', d(15), 2200, m3.id, 'Fotos dos animais para catálogo de leilão.');
    var p6 = proj('Identidade visual da loja', c5.id, 'Identidade visual', 'briefing', d(20), 3200, m1.id, 'Logo + paleta + papelaria básica.');
    var p7 = proj('Vídeo aéreo do haras', c1.id, 'Filmagem com drone', 'revisao', d(2), 1800, m3.id, 'Aguardando retorno do cliente sobre o corte 1.');
    var p8 = proj('Making of — festa junina', c6.id, 'Cobertura de evento', 'entregue', d(-9), 1600, m2.id, 'Entregue e aprovado.');
    s.projetos = [p1, p2, p3, p4, p5, p6, p7, p8];

    var tarefa = function (titulo, projetoId, respId, prioridade, prazo, feita) {
      return {
        id: AH.uid(), titulo: titulo, projetoId: projetoId || '', responsavelId: respId || '',
        prioridade: prioridade, prazo: prazo || '', feita: !!feita, criadoEm: AH.hojeISO()
      };
    };
    s.tarefas = [
      tarefa('Selecionar takes do aftermovie', p1.id, m2.id, 'alta', d(1)),
      tarefa('Trilha e color do aftermovie', p1.id, m2.id, 'alta', d(3)),
      tarefa('Confirmar diária do drone', p2.id, m3.id, 'media', d(2)),
      tarefa('Agendar gravação com a Dra. Paula', p2.id, m1.id, 'alta', d(-1)),
      tarefa('Aprovar calendário de posts com o cliente', p3.id, m4.id, 'media', d(2)),
      tarefa('Subir campanha no Gerenciador', p4.id, m1.id, 'alta', d(5)),
      tarefa('Enviar contrato da identidade visual', p6.id, m1.id, 'baixa', d(7)),
      tarefa('Cobrar retorno do corte 1 (drone)', p7.id, m1.id, 'media', d(0)),
      tarefa('Emitir NF do making of', p8.id, m1.id, 'baixa', d(-3), true),
      tarefa('Backup dos cartões no HD 2', '', m2.id, 'media', d(-2), true)
    ];

    var ev = function (titulo, data, hora, tipo, clienteId, local) {
      return {
        id: AH.uid(), titulo: titulo, data: data, hora: hora || '', tipo: tipo,
        clienteId: clienteId || '', projetoId: '', local: local || '', notas: ''
      };
    };
    s.eventos = [
      ev('Gravação — Clínica Vida', d(3), '08:00', 'gravacao', c3.id, 'Clínica Vida, Centro'),
      ev('Entrega — Aftermovie', d(4), '18:00', 'entrega', c4.id, ''),
      ev('Reunião de pauta — Supermercado', d(1), '14:30', 'reuniao', c2.id, 'Online'),
      ev('Posts da semana — Supermercado', d(2), '10:00', 'postagem', c2.id, ''),
      ev('Voo de drone — Haras', d(6), '05:30', 'gravacao', c1.id, 'Haras Boa Vista'),
      ev('Entrega — corte final drone', d(5), '', 'entrega', c1.id, ''),
      ev('Reunião comercial — Estilo Sertão', d(7), '16:00', 'reuniao', c5.id, 'Loja do cliente')
    ];

    var num = 1;
    var prop = function (clienteId, titulo, status, itens, desconto, criadoEm, validade) {
      return {
        id: AH.uid(), numero: num++, clienteId: clienteId, titulo: titulo, status: status,
        itens: itens, desconto: desconto || 0, validade: validade || d(15),
        condicoes: s.configuracoes.condicoesPadrao, notas: '', criadoEm: criadoEm || AH.hojeISO()
      };
    };
    var pr1 = prop(c5.id, 'Identidade visual + lançamento', 'enviada', [
      { descricao: 'Identidade visual completa', qtd: 1, valor: 3200 },
      { descricao: 'Pacote social media mensal (12 posts + 8 stories)', qtd: 1, valor: 1900 }
    ], 300, d(-2));
    var pr2 = prop(c1.id, 'Vídeo aéreo do haras', 'aprovada', [
      { descricao: 'Diária de filmagem com drone', qtd: 1, valor: 1200 },
      { descricao: 'Edição de vídeo (por minuto finalizado)', qtd: 2, valor: 300 }
    ], 0, d(-12));
    var pr3 = prop(c2.id, 'Cobertura da inauguração', 'rascunho', [
      { descricao: 'Cobertura de evento (diária de filmagem)', qtd: 1, valor: 1500 },
      { descricao: 'Cortes para reels (pacote com 4)', qtd: 1, valor: 800 }
    ], 0);
    var pr4 = prop(c6.id, 'Vídeo de matrículas 2027', 'recusada', [
      { descricao: 'Vídeo institucional (roteiro + captação + edição)', qtd: 1, valor: 5500 }
    ], 0, d(-25), d(-10));
    s.propostas = [pr1, pr2, pr3, pr4];
    s.proximoNumeroProposta = num;

    var lanc = function (tipo, descricao, categoria, valor, data, status, clienteId, projetoId) {
      return {
        id: AH.uid(), tipo: tipo, descricao: descricao, categoria: categoria,
        valor: valor, data: data, status: status, clienteId: clienteId || '', projetoId: projetoId || '',
        propostaId: ''
      };
    };
    var mmAtual = m(0);
    s.lancamentos = [
      // meses anteriores (para o gráfico do painel)
      lanc('receita', 'Vídeo de lançamento — Estilo Sertão', 'Projeto', 2800, m(-5) + '-15', 'pago', c5.id),
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1700, m(-5) + '-05', 'pago', c2.id),
      lanc('receita', 'Cobertura leilão — Haras', 'Projeto', 3900, m(-4) + '-20', 'pago', c1.id),
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1700, m(-4) + '-05', 'pago', c2.id),
      lanc('receita', 'Institucional — Colégio Saber', 'Projeto', 5200, m(-3) + '-12', 'pago', c6.id),
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1900, m(-3) + '-05', 'pago', c2.id),
      lanc('receita', 'Ensaio — Clínica Vida', 'Projeto', 1400, m(-2) + '-18', 'pago', c3.id),
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1900, m(-2) + '-05', 'pago', c2.id),
      lanc('receita', 'Making of festa junina — 1ª parcela', 'Projeto', 800, m(-1) + '-10', 'pago', c6.id, p8.id),
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1900, m(-1) + '-05', 'pago', c2.id),
      lanc('receita', 'Drone haras — 50% aprovação', 'Projeto', 900, m(-1) + '-22', 'pago', c1.id, p7.id),
      // mês atual
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1900, mmAtual + '-05', 'pago', c2.id, p3.id),
      lanc('receita', 'Aftermovie — 50% na aprovação', 'Projeto', 2250, mmAtual + '-08', 'pago', c4.id, p1.id),
      lanc('receita', 'Aftermovie — 50% na entrega', 'Projeto', 2250, AH.diasISO(4), 'pendente', c4.id, p1.id),
      lanc('receita', 'Institucional clínica — entrada', 'Projeto', 3400, AH.diasISO(2), 'pendente', c3.id, p2.id),
      lanc('despesa', 'Adobe Creative Cloud', 'Software / Assinaturas', 290, mmAtual + '-03', 'pago'),
      lanc('despesa', 'Freela captação — Pedro (diária extra)', 'Equipe / Freela', 350, mmAtual + '-07', 'pago'),
      lanc('despesa', 'Combustível — gravações', 'Transporte', 220, mmAtual + '-09', 'pago'),
      lanc('despesa', 'Cartão SD 128GB', 'Equipamento', 180, mmAtual + '-10', 'pendente')
    ];

    var eqp = function (nome, categoria, marca, serial, status) {
      return { id: AH.uid(), nome: nome, categoria: categoria, marca: marca || '', serial: serial || '', status: status, notas: '' };
    };
    s.equipamentos = [
      eqp('Sony FX30', 'Câmera', 'Sony', 'FX30-0142', 'em_uso'),
      eqp('Canon R6', 'Câmera', 'Canon', 'R6-8830', 'disponivel'),
      eqp('Sigma 18-35mm f/1.8', 'Lente', 'Sigma', '', 'disponivel'),
      eqp('Sony 70-200mm f/2.8', 'Lente', 'Sony', '', 'em_uso'),
      eqp('DJI Mavic 3 Pro', 'Drone', 'DJI', 'MAV3-2211', 'disponivel'),
      eqp('DJI RS 3', 'Estabilizador / Gimbal', 'DJI', '', 'disponivel'),
      eqp('Kit iluminação Amaran (2x 200d)', 'Iluminação', 'Aputure', '', 'disponivel'),
      eqp('Lapela Rode Wireless GO II', 'Áudio', 'Rode', '', 'em_uso'),
      eqp('Zoom H6 (gravador)', 'Áudio', 'Zoom', '', 'manutencao'),
      eqp('MacBook Pro M2 (ilha de edição)', 'Computador', 'Apple', '', 'em_uso')
    ];

    return s;
  };
})();
