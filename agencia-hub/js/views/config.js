/* AgênciaHub — Configurações da agência, backup e dados */
(function () {
  'use strict';
  var AH = window.AH;

  function render(el) {
    var cfg = AH.state.configuracoes;
    var ui = AH.ui;

    var html = '<div class="config-secoes">';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.config + 'Dados da agência</div>' +
      '<form id="form-cfg"><div class="form-grid">' +
      ui.campo('Nome da agência *', ui.input('nomeAgencia', cfg.nomeAgencia, 'required')) +
      ui.campo('Slogan / área de atuação', ui.input('slogan', cfg.slogan)) +
      ui.campo('WhatsApp', ui.input('whatsapp', cfg.whatsapp, 'placeholder="(00) 00000-0000"')) +
      ui.campo('E-mail', ui.input('email', cfg.email, 'type="email"')) +
      ui.campo('Instagram', ui.input('instagram', cfg.instagram, 'placeholder="@suaagencia"')) +
      ui.campo('Site', ui.input('site', cfg.site, 'placeholder="www.suaagencia.com.br"')) +
      ui.campo('Cidade / UF', ui.input('cidade', cfg.cidade)) +
      ui.campo('CNPJ', ui.input('cnpj', cfg.cnpj)) +
      ui.campo('Chave PIX (sai nas propostas)', ui.input('pix', cfg.pix), 'campo-cheio') +
      ui.campo('Condições de pagamento padrão', ui.textarea('condicoesPadrao', cfg.condicoesPadrao, 'rows="2"'), 'campo-cheio') +
      '</div>' +
      '<div style="margin-top:14px;display:flex;justify-content:flex-end">' +
      '<button class="btn btn-primario" type="submit">Salvar dados</button></div></form>' +
      '<p class="nota-rodape" style="margin-top:8px">Esses dados aparecem no cabeçalho das propostas impressas e no menu lateral.</p>' +
      '</div>';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.download + 'Backup dos dados</div>' +
      '<p class="nota-rodape" style="margin-bottom:12px">Tudo fica salvo <b>somente neste navegador</b>. Exporte um backup com frequência e guarde no seu Drive — assim você não perde nada se trocar de computador ou limpar o navegador.</p>' +
      '<div class="config-acoes">' +
      '<button class="btn" id="btn-exportar">' + AH.icons.download + 'Exportar backup (.json)</button>' +
      '<button class="btn" id="btn-importar">' + AH.icons.upload + 'Importar backup</button>' +
      '<input type="file" id="arquivo-importar" accept="application/json,.json" hidden>' +
      '</div></div>';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.alerta + 'Zona de risco</div>' +
      '<div class="config-acoes">' +
      '<button class="btn btn-contorno" id="btn-demo">Restaurar dados de demonstração</button>' +
      '<button class="btn btn-perigo" id="btn-limpar">' + AH.icons.excluir + 'Apagar todos os dados</button>' +
      '</div></div>';

    html += '<p class="nota-rodape">AgênciaHub · sistema de gestão para agências de marketing e produtoras audiovisuais. Funciona 100% no navegador, sem mensalidade e sem internet.</p>';
    html += '</div>';

    el.innerHTML = html;

    el.querySelector('#form-cfg').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      ['nomeAgencia', 'slogan', 'whatsapp', 'email', 'instagram', 'site', 'cidade', 'cnpj', 'pix', 'condicoesPadrao'].forEach(function (k) {
        cfg[k] = String(f.get(k) || '').trim();
      });
      if (!cfg.nomeAgencia) cfg.nomeAgencia = 'Sua agência';
      AH.salvar();
      AH.atualizarMarca();
      AH.ui.toast('Dados da agência salvos.');
    });

    el.querySelector('#btn-exportar').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(AH.state, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'agenciahub-backup-' + AH.hojeISO() + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
      AH.ui.toast('Backup exportado.');
    });

    var inputArquivo = el.querySelector('#arquivo-importar');
    el.querySelector('#btn-importar').addEventListener('click', function () { inputArquivo.click(); });
    inputArquivo.addEventListener('change', function () {
      var arq = inputArquivo.files[0];
      if (!arq) return;
      var leitor = new FileReader();
      leitor.onload = function () {
        try {
          var dados = JSON.parse(leitor.result);
          if (!dados || typeof dados !== 'object' || !dados.configuracoes) throw new Error('formato');
          AH.ui.confirmar('Importar este backup? Os dados atuais deste navegador serão substituídos.', function () {
            var base = AH.estadoVazio();
            Object.keys(base).forEach(function (k) { if (dados[k] === undefined) dados[k] = base[k]; });
            AH.state = dados;
            AH.salvar();
            AH.atualizarMarca();
            AH.ui.toast('Backup importado.');
            AH.rerender();
          }, 'Importar');
        } catch (e) {
          AH.ui.toast('Arquivo inválido — exporte o backup pelo próprio AgênciaHub.', 'erro');
        }
      };
      leitor.readAsText(arq);
      inputArquivo.value = '';
    });

    el.querySelector('#btn-demo').addEventListener('click', function () {
      AH.ui.confirmar('Substituir os dados atuais pelos dados de demonstração?', function () {
        AH.restaurarDemo();
        AH.atualizarMarca();
        AH.ui.toast('Dados de demonstração restaurados.');
        AH.rerender();
      }, 'Restaurar');
    });

    el.querySelector('#btn-limpar').addEventListener('click', function () {
      AH.ui.confirmar('Apagar TODOS os dados (clientes, projetos, financeiro...)? Essa ação não tem volta — exporte um backup antes.', function () {
        AH.limparTudo();
        AH.atualizarMarca();
        AH.ui.toast('Dados apagados. Começando do zero.');
        AH.rerender();
      }, 'Apagar tudo');
    });
  }

  AH.views = AH.views || {};
  AH.views.config = { titulo: 'Configurações', render: render };
})();
