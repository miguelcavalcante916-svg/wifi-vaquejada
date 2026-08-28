<?php
/**
 * dashboard.php — Painel do cliente (Agente de IA no WhatsApp).
 *
 * Abas: Visão geral, Conversas, Pipeline, Agente IA (chat integrado) e
 * Configurações (protegida por senha — salva em dados/config.local.php).
 * Os números e conversas exibidos são DADOS DE DEMONSTRAÇÃO — em produção,
 * este painel deve ler os dados reais do backend da agência.
 */
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => !empty($_SERVER['HTTPS']),
    ]);
    session_start();
}
require __DIR__ . '/config.php';

$cfgLocal = config_local_carregar();
$temSenha = !empty($cfgLocal['senha_hash']);
$logado   = !empty($_SESSION['cfg_ok']);
if (empty($_SESSION['cfg_csrf'])) {
    $_SESSION['cfg_csrf'] = bin2hex(random_bytes(16));
}
$csrf = $_SESSION['cfg_csrf'];

/** Guarda a mensagem e volta para a aba Configurações (POST → redirect → GET). */
function cfg_flash($msg, $erro = false) {
    $_SESSION['cfg_msg'] = [$msg, (bool) $erro];
    header('Location: dashboard.php#config');
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $acao = (string) ($_POST['acao'] ?? '');
    if (!hash_equals($csrf, (string) ($_POST['csrf'] ?? ''))) {
        cfg_flash('Sessão expirada — recarregue a página e tente de novo.', true);
    }

    if ($acao === 'sair') {
        unset($_SESSION['cfg_ok']);
        cfg_flash('Você saiu das configurações.');
    }

    if ($acao === 'criar_senha' && !$temSenha) {
        $s1 = (string) ($_POST['senha'] ?? '');
        $s2 = (string) ($_POST['senha2'] ?? '');
        if (strlen($s1) < 8) {
            cfg_flash('A senha precisa ter pelo menos 8 caracteres.', true);
        }
        if ($s1 !== $s2) {
            cfg_flash('As duas senhas não conferem.', true);
        }
        $cfgLocal['senha_hash'] = password_hash($s1, PASSWORD_DEFAULT);
        if (!config_local_salvar($cfgLocal)) {
            cfg_flash('Não consegui gravar na pasta dados/ — verifique as permissões no servidor.', true);
        }
        session_regenerate_id(true); // evita fixação de sessão
        $_SESSION['cfg_csrf'] = bin2hex(random_bytes(16));
        $_SESSION['cfg_ok'] = true;
        cfg_flash('Senha criada! Agora configure o sistema abaixo.');
    }

    if ($acao === 'entrar' && $temSenha && !$logado) {
        usleep(400000); // desacelera tentativas de adivinhação
        if (password_verify((string) ($_POST['senha'] ?? ''), (string) $cfgLocal['senha_hash'])) {
            session_regenerate_id(true); // evita fixação de sessão
            $_SESSION['cfg_csrf'] = bin2hex(random_bytes(16));
            $_SESSION['cfg_ok'] = true;
            cfg_flash('Bem-vindo de volta!');
        }
        cfg_flash('Senha incorreta.', true);
    }

    if ($acao === 'salvar' && $logado) {
        // Valida TODOS os campos antes de gravar qualquer coisa, acumulando
        // os erros — assim o usuário corrige tudo de uma vez.
        $erros = [];

        $whats = preg_replace('/\D+/', '', (string) ($_POST['whatsapp'] ?? ''));
        if ($whats !== '' && (strlen($whats) < 10 || strlen($whats) > 15)) {
            $erros[] = 'WhatsApp inválido — use DDI+DDD+número, ex.: 5584999492725.';
        }

        $email = trim((string) ($_POST['email'] ?? ''));
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $erros[] = 'E-mail inválido.';
        }

        $insta = trim((string) ($_POST['instagram'] ?? ''));
        if ($insta !== '' && !preg_match('#^https?://#i', $insta)) {
            // aceita "instagram.com/usuario" ou só "@usuario"
            $insta = preg_match('#^(www\.)?instagram\.com/#i', $insta)
                ? 'https://' . $insta
                : 'https://instagram.com/' . ltrim($insta, '@/');
        }
        if ($insta !== '' && !filter_var($insta, FILTER_VALIDATE_URL)) {
            $erros[] = 'Instagram inválido — use o @usuário ou o link completo.';
        }

        $cidade = trim((string) ($_POST['cidade'] ?? ''));

        $ponte = trim((string) ($_POST['ponte_url'] ?? ''));
        if ($ponte !== '' && (!filter_var($ponte, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $ponte))) {
            $erros[] = 'URL do backend inválida — comece com https://';
        }

        $novaSenha = (string) ($_POST['nova_senha'] ?? '');
        if ($novaSenha !== '' && strlen($novaSenha) < 8) {
            $erros[] = 'A nova senha precisa ter pelo menos 8 caracteres.';
        }

        if ($erros) {
            cfg_flash('Nada foi salvo. Corrija: ' . implode(' ', $erros), true);
        }

        // Tudo válido — aplica. Em branco mantém o atual (exceto os
        // opcionais cidade e backend, que em branco voltam ao padrão).
        if ($whats !== '') { $cfgLocal['whatsapp'] = $whats; }
        if ($email !== '') { $cfgLocal['email'] = $email; }
        if ($insta !== '') { $cfgLocal['instagram'] = $insta; }
        if ($cidade !== '') { $cfgLocal['cidade'] = mb_substr($cidade, 0, 60); } else { unset($cfgLocal['cidade']); }
        if ($ponte !== '') { $cfgLocal['ponte_url'] = rtrim($ponte, '/'); } else { unset($cfgLocal['ponte_url']); }

        // Chave da IA: em branco mantém a atual; "remover" apaga.
        if (!empty($_POST['ia_remover'])) {
            unset($cfgLocal['ia_api_key']);
        } else {
            $chaveNova = trim((string) ($_POST['ia_api_key'] ?? ''));
            if ($chaveNova !== '') {
                $cfgLocal['ia_api_key'] = $chaveNova;
            }
        }

        foreach ([1, 2, 3] as $pid) {
            $preco = (int) ($_POST['preco_' . $pid] ?? 0);
            $cred  = trim((string) ($_POST['creditos_' . $pid] ?? ''));
            if ($preco > 0) {
                $cfgLocal['planos'][(string) $pid]['preco'] = $preco;
            }
            if ($cred !== '') {
                $cfgLocal['planos'][(string) $pid]['creditos'] = mb_substr($cred, 0, 80);
            }
        }

        if ($novaSenha !== '') {
            $cfgLocal['senha_hash'] = password_hash($novaSenha, PASSWORD_DEFAULT);
        }

        if (!config_local_salvar($cfgLocal)) {
            cfg_flash('Não consegui gravar na pasta dados/ — verifique as permissões no servidor.', true);
        }
        cfg_flash('Configurações salvas! O site e o agente já estão usando os novos dados.');
    }

    if ($acao === 'salvar' && !$logado) {
        cfg_flash('Você saiu das configurações em outra aba — entre novamente e salve de novo.', true);
    }
    if ($acao === 'criar_senha' && $temSenha) {
        cfg_flash('A senha já foi criada — entre com ela abaixo.', true);
    }
    cfg_flash('Ação inválida.', true);
}

$cfgMsg = $_SESSION['cfg_msg'] ?? null;
unset($_SESSION['cfg_msg']);

$iaConfigurada = ia_chave() !== '';
$iaViaEnv      = (bool) (getenv('IA_API_KEY') ?: getenv('ANTHROPIC_API_KEY'));
$iaViaPainel   = !$iaViaEnv && !empty($cfgLocal['ia_api_key']);

// ---------------------------------------------------------------------------
// Dados de demonstração
// ---------------------------------------------------------------------------
$STATS = [
    ['💬', '47',    'Atendimentos hoje'],
    ['🎯', '12',    'Leads qualificados'],
    ['📅', '5',     'Reuniões agendadas'],
    ['⚡', '3s',    'Tempo médio de resposta'],
];

$CREDITOS = ['usados' => 8420, 'total' => 15000, 'plano' => 'Profissional'];

// Atendimentos nos últimos 7 dias (dados de demonstração)
$GRAFICO = [
    ['Qui', 32], ['Sex', 41], ['Sáb', 38], ['Dom', 24],
    ['Seg', 55], ['Ter', 44], ['Hoje', 47],
];

$CONVERSAS = [
    ['MR', 'Mariana R.',  'Perfeito, pode agendar quinta às 15h então!',          '09:42', 'agente',    3],
    ['JS', 'João S.',     'Quanto fica o plano com dois números?',                 '09:37', 'agente',    1],
    ['AL', 'Ana L.',      'Vou pensar e te retorno, obrigada!',                    '09:21', 'agente',    0],
    ['PC', 'Pedro C.',    '[Áudio recebido — 0:32]',                               '08:58', 'humano',    0],
    ['FM', 'Fernanda M.', 'O catálogo chegou certinho aqui 👍',                     '08:44', 'agente',    0],
    ['RT', 'Ricardo T.',  'Bom dia! Vocês atendem no sábado?',                     '08:12', 'aguardando', 2],
];

$THREAD = [
    ['in',  'Oi! Vi o anúncio de vocês. Como funciona o agente?', '09:35'],
    ['out', 'Olá, João! 😊 Nosso Agente de IA responde seus clientes 24h no WhatsApp: tira dúvidas, qualifica quem tem interesse e agenda direto na sua agenda. Quer que eu te mostre os planos?', '09:35'],
    ['in',  'Quanto fica o plano com dois números?', '09:37'],
    ['out', 'Para mais de um número, o indicado é o Premium (R$ 697/mês, cobrança trimestral): múltiplos números, vários atendentes no painel e suporte prioritário. Posso agendar uma demonstração?', '09:37'],
];

$PIPELINE = [
    ['Novo lead',        [['Ricardo T.', 'Dúvida sobre horário', 'R$ —'],
                          ['Camila F.',  'Veio do Instagram',    'R$ —'],
                          ['Bruno A.',   'Pediu catálogo',       'R$ —']]],
    ['Em qualificação',  [['João S.',    'Interessado no Premium', 'R$ 2.091'],
                          ['Ana L.',     'Comparando planos',      'R$ 1.191']]],
    ['Qualificado',      [['Fernanda M.', 'Pronta para proposta',  'R$ 1.191'],
                          ['Paulo V.',    'Aguardando aprovação',  'R$ 591']]],
    ['Reunião marcada',  [['Mariana R.',  'Qui 15h — demonstração', 'R$ 1.191']]],
    ['Fechado 🎉',       [['Studio Belle', 'Plano Profissional',    'R$ 1.191']]],
];

// Geometria do gráfico de barras (SVG)
$gW = 520; $gH = 180; $gPad = 26; $gBase = $gH - 24;
$gMax = max(array_column($GRAFICO, 1));
$n = count($GRAFICO);
$slot = ($gW - 2 * $gPad) / $n;
$barW = min(34, $slot - 8);
$maxIdx = array_search($gMax, array_column($GRAFICO, 1));
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#030409">
    <meta name="robots" content="noindex">
    <title>Painel — <?= htmlspecialchars($AGENCIA['nome']) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/dash.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%234361ee'/><text x='50' y='68' font-size='58' text-anchor='middle' fill='%23f2f5fc' font-family='Arial' font-weight='bold'>C</text></svg>">
</head>
<body class="dash-body">

<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>

<!-- Topbar -->
<header class="dash-top">
    <a class="brand" href="index.php" aria-label="Voltar ao site">
        <span class="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </span>
        <span class="brand__text">
            <strong><?= htmlspecialchars($AGENCIA['marca']) ?></strong>
            <small>Painel do cliente</small>
        </span>
    </a>
    <div class="dash-top__right">
        <span class="dash-badge dash-badge--demo" title="Este painel exibe dados fictícios de demonstração">Demonstração</span>
        <span class="dash-badge dash-badge--on"><span class="dash-dot" aria-hidden="true"></span> Agente ativo</span>
    </div>
</header>

<div class="dash-wrap">
    <!-- Navegação lateral / abas -->
    <nav class="dash-nav" aria-label="Seções do painel">
        <a href="#visao" class="dash-nav__item is-active" data-tab="visao" aria-current="true">📊 <span>Visão geral</span></a>
        <a href="#conversas" class="dash-nav__item" data-tab="conversas">💬 <span>Conversas</span></a>
        <a href="#pipeline" class="dash-nav__item" data-tab="pipeline">🧭 <span>Pipeline</span></a>
        <a href="#agente" class="dash-nav__item" data-tab="agente">🤖 <span>Agente IA</span></a>
        <a href="#config" class="dash-nav__item" data-tab="config">⚙️ <span>Configurações</span></a>
    </nav>

    <main id="conteudo" class="dash-main">

    <!-- ============ VISÃO GERAL ============ -->
    <section class="dash-tab is-active" id="visao" aria-labelledby="h-visao">
        <h1 id="h-visao" class="dash-h1">Visão geral</h1>

        <div class="stats">
            <?php foreach ($STATS as $s): ?>
            <div class="stat">
                <span class="stat__icon" aria-hidden="true"><?= $s[0] ?></span>
                <strong class="stat__num"><?= htmlspecialchars($s[1]) ?></strong>
                <span class="stat__label"><?= htmlspecialchars($s[2]) ?></span>
            </div>
            <?php endforeach; ?>
        </div>

        <div class="dash-grid2">
            <div class="dash-card">
                <h2 class="dash-h2">Atendimentos — últimos 7 dias</h2>
                <div class="chart-scroll">
                <svg class="chart" viewBox="0 0 <?= $gW ?> <?= $gH ?>" role="img"
                     aria-label="Atendimentos por dia: <?= htmlspecialchars(implode(', ', array_map(function ($d) { return $d[0] . ' ' . $d[1]; }, $GRAFICO))) ?>">
                    <line x1="<?= $gPad ?>" y1="<?= $gBase ?>" x2="<?= $gW - $gPad ?>" y2="<?= $gBase ?>" class="chart__axis"/>
                    <?php foreach ($GRAFICO as $i => $d):
                        $h = (int) round(($d[1] / $gMax) * ($gBase - 30));
                        $x = (int) round($gPad + $i * $slot + ($slot - $barW) / 2);
                        $y = $gBase - $h;
                        $hoje = $i === $n - 1;
                    ?>
                    <g class="chart__bar<?= $hoje ? ' chart__bar--hoje' : '' ?>">
                        <title><?= htmlspecialchars($d[0]) ?>: <?= $d[1] ?> atendimentos</title>
                        <path d="M<?= $x ?> <?= $gBase ?> V<?= $y + 4 ?> Q<?= $x ?> <?= $y ?> <?= $x + 4 ?> <?= $y ?> H<?= $x + $barW - 4 ?> Q<?= $x + $barW ?> <?= $y ?> <?= $x + $barW ?> <?= $y + 4 ?> V<?= $gBase ?> Z"/>
                        <?php if ($i === $maxIdx || $hoje): ?>
                        <text class="chart__val" x="<?= $x + $barW / 2 ?>" y="<?= $y - 7 ?>" text-anchor="middle"><?= $d[1] ?></text>
                        <?php endif; ?>
                        <text class="chart__cat" x="<?= $x + $barW / 2 ?>" y="<?= $gBase + 16 ?>" text-anchor="middle"><?= htmlspecialchars($d[0]) ?></text>
                    </g>
                    <?php endforeach; ?>
                </svg>
                </div>
            </div>

            <div class="dash-card">
                <h2 class="dash-h2">Créditos de IA — plano <?= htmlspecialchars($CREDITOS['plano']) ?></h2>
                <?php $pct = (int) round($CREDITOS['usados'] / $CREDITOS['total'] * 100); ?>
                <div class="credit">
                    <strong class="credit__num"><?= number_format($CREDITOS['usados'], 0, ',', '.') ?></strong>
                    <span class="credit__of">de <?= number_format($CREDITOS['total'], 0, ',', '.') ?> créditos no trimestre</span>
                    <div class="credit__bar" role="meter" aria-valuenow="<?= $pct ?>" aria-valuemin="0" aria-valuemax="100"
                         aria-valuetext="<?= number_format($CREDITOS['usados'], 0, ',', '.') ?> de <?= number_format($CREDITOS['total'], 0, ',', '.') ?> créditos (<?= $pct ?>%)"
                         aria-label="Créditos de IA usados">
                        <span style="width: <?= $pct ?>%"></span>
                    </div>
                    <span class="credit__pct"><?= $pct ?>% usados</span>
                </div>
                <p class="dash-note">Precisa de mais créditos? <a href="index.php#planos">Suba de plano</a> a qualquer momento.</p>
            </div>
        </div>

        <div class="dash-card">
            <h2 class="dash-h2">Últimas conversas</h2>
            <ul class="convo-list convo-list--mini">
                <?php foreach (array_slice($CONVERSAS, 0, 4) as $c): ?>
                <li class="convo">
                    <span class="convo__avatar" aria-hidden="true"><?= htmlspecialchars($c[0]) ?></span>
                    <span class="convo__body">
                        <strong><?= htmlspecialchars($c[1]) ?></strong>
                        <small><?= htmlspecialchars($c[2]) ?></small>
                    </span>
                    <span class="convo__meta">
                        <time><?= $c[3] ?></time>
                        <span class="tag tag--<?= $c[4] ?>"><?= ['agente' => 'IA', 'humano' => 'Humano', 'aguardando' => 'Aguardando'][$c[4]] ?></span>
                    </span>
                </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </section>

    <!-- ============ CONVERSAS ============ -->
    <section class="dash-tab" id="conversas" aria-labelledby="h-conversas">
        <h1 id="h-conversas" class="dash-h1">Conversas</h1>
        <div class="inbox">
            <div class="dash-card inbox__list">
                <ul class="convo-list">
                    <?php foreach ($CONVERSAS as $i => $c): ?>
                    <li class="convo<?= $i === 1 ? ' is-open' : '' ?>">
                        <span class="convo__avatar" aria-hidden="true"><?= htmlspecialchars($c[0]) ?></span>
                        <span class="convo__body">
                            <strong><?= htmlspecialchars($c[1]) ?></strong>
                            <small><?= htmlspecialchars($c[2]) ?></small>
                        </span>
                        <span class="convo__meta">
                            <time><?= $c[3] ?></time>
                            <?php if ($c[5]): ?><span class="convo__unread"><?= $c[5] ?></span><?php endif; ?>
                        </span>
                    </li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <div class="dash-card inbox__thread">
                <header class="thread__top">
                    <span class="convo__avatar" aria-hidden="true">JS</span>
                    <div><strong>João S.</strong><small class="thread__status">Atendido pelo Agente de IA</small></div>
                    <button type="button" class="btn btn--outline btn--sm">Assumir conversa</button>
                </header>
                <div class="thread__chat" role="log" aria-label="Mensagens da conversa" tabindex="0">
                    <?php foreach ($THREAD as $m): ?>
                    <div class="bubble bubble--<?= $m[0] ?>"><?= htmlspecialchars($m[1]) ?> <small><span class="sr-only">Enviada às </span><?= $m[2] ?></small></div>
                    <?php endforeach; ?>
                </div>
                <p class="dash-note">Conversa de demonstração — em produção, as conversas reais do seu WhatsApp aparecem aqui.</p>
            </div>
        </div>
    </section>

    <!-- ============ PIPELINE ============ -->
    <section class="dash-tab" id="pipeline" aria-labelledby="h-pipeline">
        <h1 id="h-pipeline" class="dash-h1">Pipeline de vendas</h1>
        <div class="kanban">
            <?php foreach ($PIPELINE as $col): ?>
            <div class="kanban__col">
                <h2 class="kanban__title"><?= htmlspecialchars($col[0]) ?> <span class="kanban__count"><?= count($col[1]) ?></span></h2>
                <?php foreach ($col[1] as $card): ?>
                <div class="kanban__card">
                    <strong><?= htmlspecialchars($card[0]) ?></strong>
                    <small><?= htmlspecialchars($card[1]) ?></small>
                    <span class="kanban__value"><?= htmlspecialchars($card[2]) ?></span>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- ============ AGENTE IA ============ -->
    <section class="dash-tab" id="agente" aria-labelledby="h-agente">
        <h1 id="h-agente" class="dash-h1">Agente IA — converse com o seu agente</h1>
        <div class="dash-grid2 dash-grid2--chat">
            <div class="dash-card ia-chat">
                <header class="thread__top">
                    <span class="convo__avatar convo__avatar--ia" aria-hidden="true">C</span>
                    <div>
                        <strong>Agente <?= htmlspecialchars($AGENCIA['marca']) ?></strong>
                        <small class="thread__status" id="iaModo"><?= $iaConfigurada ? 'IA conectada' : 'Modo demonstração' ?></small>
                    </div>
                </header>
                <div class="thread__chat ia-chat__log" id="iaLog" role="log" aria-live="polite" aria-label="Histórico da conversa com o agente" tabindex="0"></div>
                <form class="ia-chat__form" id="iaForm">
                    <label class="sr-only" for="iaInput">Sua mensagem</label>
                    <input id="iaInput" type="text" maxlength="2000" placeholder="Escreva como se fosse seu cliente…" autocomplete="off">
                    <button type="submit" class="btn btn--primary" id="iaEnviar">Enviar</button>
                </form>
            </div>
            <div class="dash-card">
                <h2 class="dash-h2">Como funciona</h2>
                <p class="dash-note">Este é o mesmo cérebro que atende no seu WhatsApp. Teste perguntas reais dos seus clientes: preços, horários, agendamento…</p>
                <?php if (!$iaConfigurada): ?>
                <p class="dash-note dash-note--warn">⚠ Rodando em <strong>modo demonstração</strong> (respostas pré-programadas). Para ativar a IA real, cole sua chave da Anthropic na aba <a href="#config">⚙️ Configurações</a>.</p>
                <?php else: ?>
                <p class="dash-note">✅ IA real conectada via API da Anthropic<?= $iaViaPainel ? ' (chave salva nas Configurações)' : '' ?>.</p>
                <?php endif; ?>
                <h2 class="dash-h2">Sugestões para testar</h2>
                <div class="ia-sugestoes">
                    <button type="button" class="chip js-sugestao">Quanto custa?</button>
                    <button type="button" class="chip js-sugestao">Quero testar grátis</button>
                    <button type="button" class="chip js-sugestao">Vocês respondem áudio?</button>
                    <button type="button" class="chip js-sugestao">Quero falar com um humano</button>
                </div>
            </div>
        </div>
    </section>

    <!-- ============ CONFIGURAÇÕES ============ -->
    <section class="dash-tab" id="config" aria-labelledby="h-config">
        <h1 id="h-config" class="dash-h1">⚙️ Configurações</h1>

        <?php if ($cfgMsg): ?>
        <p class="cfg-msg<?= $cfgMsg[1] ? ' cfg-msg--erro' : '' ?>" role="status"><?= htmlspecialchars($cfgMsg[0]) ?></p>
        <?php endif; ?>

        <?php if (!$temSenha): ?>
        <!-- Primeiro acesso: criar a senha -->
        <div class="dash-card cfg-card">
            <h2 class="dash-h2">Primeiro acesso — crie sua senha</h2>
            <p class="dash-note">Esta senha protege as configurações do sistema. <strong>Defina-a assim que publicar o site</strong>, antes de divulgar o endereço.</p>
            <form method="post" class="cfg-form">
                <input type="hidden" name="acao" value="criar_senha">
                <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
                <label>Senha (mínimo 8 caracteres)
                    <input type="password" name="senha" minlength="8" required autocomplete="new-password">
                </label>
                <label>Repita a senha
                    <input type="password" name="senha2" minlength="8" required autocomplete="new-password">
                </label>
                <button type="submit" class="btn btn--primary">Criar senha e entrar</button>
            </form>
        </div>

        <?php elseif (!$logado): ?>
        <!-- Login -->
        <div class="dash-card cfg-card">
            <h2 class="dash-h2">Entrar nas configurações</h2>
            <form method="post" class="cfg-form">
                <input type="hidden" name="acao" value="entrar">
                <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
                <label>Senha
                    <input type="password" name="senha" required autocomplete="current-password">
                </label>
                <button type="submit" class="btn btn--primary">Entrar</button>
            </form>
        </div>

        <?php else: ?>
        <!-- Formulário de configurações -->
        <form method="post" class="cfg-grade">
            <input type="hidden" name="acao" value="salvar">
            <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">

            <div class="dash-card">
                <h2 class="dash-h2">📱 Dados da agência</h2>
                <div class="cfg-form">
                    <label>WhatsApp do agente (DDI+DDD+número, só dígitos — em branco mantém o atual)
                        <input type="text" name="whatsapp" inputmode="numeric" autocomplete="tel" value="<?= htmlspecialchars($AGENCIA['whatsapp']) ?>">
                    </label>
                    <label>E-mail de contato (em branco mantém o atual)
                        <input type="email" name="email" autocomplete="email" value="<?= htmlspecialchars($AGENCIA['email']) ?>">
                    </label>
                    <label>Instagram (@usuário ou link — em branco mantém o atual)
                        <input type="text" name="instagram" autocomplete="url" value="<?= htmlspecialchars($AGENCIA['instagram']) ?>">
                    </label>
                    <label>Cidade/UF (opcional — em branco remove)
                        <input type="text" name="cidade" maxlength="60" value="<?= htmlspecialchars($AGENCIA['cidade']) ?>" placeholder="ex.: Natal - RN">
                    </label>
                </div>
            </div>

            <div class="dash-card">
                <h2 class="dash-h2">🤖 Inteligência Artificial</h2>
                <?php if ($iaViaEnv): ?>
                <p class="dash-note">✅ Chave definida por <strong>variável de ambiente</strong> no servidor (tem prioridade sobre este campo).</p>
                <?php elseif ($iaViaPainel): ?>
                <p class="dash-note">✅ IA ativa com a chave salva aqui: <code>•••• <?= htmlspecialchars(substr((string) $cfgLocal['ia_api_key'], -4)) ?></code></p>
                <?php else: ?>
                <p class="dash-note dash-note--warn">⚠ Sem chave — o chat do agente roda em modo demonstração. Crie a sua em <strong>console.anthropic.com</strong> (API Keys) e cole abaixo.</p>
                <?php endif; ?>
                <div class="cfg-form">
                    <label>Chave da API da Anthropic (deixe em branco para manter a atual)
                        <input type="password" name="ia_api_key" autocomplete="new-password" placeholder="sk-ant-...">
                    </label>
                    <?php if (!empty($cfgLocal['ia_api_key'])): ?>
                    <label class="cfg-check"><input type="checkbox" name="ia_remover" value="1"> Remover a chave salva neste painel</label>
                    <?php endif; ?>
                </div>
                <h2 class="dash-h2" style="margin-top:18px">🔗 Backend de checkout (ponte)</h2>
                <?php if (getenv('PONTE_URL')): ?>
                <p class="dash-note">ℹ Há uma URL definida por <strong>variável de ambiente</strong> no servidor — ela tem prioridade sobre este campo.</p>
                <?php endif; ?>
                <div class="cfg-form">
                    <label>URL do serviço que gera trials e links de pagamento (em branco volta ao padrão)
                        <input type="url" name="ponte_url" value="<?= htmlspecialchars($cfgLocal['ponte_url'] ?? '') ?>" placeholder="<?= htmlspecialchars(PONTE_URL) ?>">
                    </label>
                </div>
            </div>

            <div class="dash-card">
                <h2 class="dash-h2">💰 Planos</h2>
                <div class="cfg-planos">
                    <?php foreach ($PLANOS as $p): ?>
                    <fieldset class="cfg-plano">
                        <legend><?= htmlspecialchars($p['nome']) ?></legend>
                        <label>Preço mensal (R$)
                            <input type="number" name="preco_<?= (int) $p['plano'] ?>" min="1" step="1" value="<?= (int) $p['preco'] ?>">
                        </label>
                        <label>Créditos de IA
                            <input type="text" name="creditos_<?= (int) $p['plano'] ?>" maxlength="80" value="<?= htmlspecialchars($p['creditos']) ?>">
                        </label>
                    </fieldset>
                    <?php endforeach; ?>
                </div>
                <p class="dash-note">O total trimestral exibido no site é recalculado automaticamente (preço × 3).</p>
            </div>

            <div class="dash-card">
                <h2 class="dash-h2">🔒 Trocar senha (opcional)</h2>
                <div class="cfg-form">
                    <label>Nova senha (deixe em branco para manter)
                        <input type="password" name="nova_senha" minlength="8" autocomplete="new-password">
                    </label>
                </div>
            </div>

            <div class="cfg-acoes">
                <button type="submit" class="btn btn--primary btn--lg">Salvar configurações</button>
            </div>
        </form>

        <form method="post" class="cfg-sair">
            <input type="hidden" name="acao" value="sair">
            <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
            <button type="submit" class="btn btn--outline btn--sm">Sair das configurações</button>
        </form>
        <?php endif; ?>
    </section>

    </main>
</div>

<footer class="dash-foot">
    <span>© <?= $AGENCIA['ano'] ?> <?= htmlspecialchars($AGENCIA['nome']) ?> · Painel em demonstração com dados fictícios</span>
    <a href="index.php">← Voltar ao site</a>
</footer>

<script src="assets/js/dash.js" defer></script>
</body>
</html>
