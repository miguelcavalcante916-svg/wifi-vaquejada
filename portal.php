<?php
/**
 * portal.php — Portal do cliente: entrada com e-mail e senha.
 *
 * Os acessos são cadastrados pela agência na aba 👥 Clientes do painel
 * (dashboard.php). Quem entra por aqui vê o painel sem as abas
 * administrativas (Clientes e Configurações).
 */
if (session_status() === PHP_SESSION_NONE) {
    session_name('cavpainel'); // não colide com o PHPSESSID de outro site no mesmo domínio
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => !empty($_SERVER['HTTPS']),
    ]);
    session_start();
}
require __DIR__ . '/config.php';

if (empty($_SESSION['cfg_csrf'])) {
    $_SESSION['cfg_csrf'] = bin2hex(random_bytes(16));
}
$csrf = $_SESSION['cfg_csrf'];

// Já está logado (cliente ou agência)? Vai direto ao painel. A sessão de
// cliente só vale se o cadastro ainda existir com a MESMA senha.
$cliAtual = !empty($_SESSION['cli_email']) ? cliente_por_email($_SESSION['cli_email']) : null;
$cliValido = $cliAtual
    && hash_equals((string) ($_SESSION['cli_marca'] ?? ''), sha1((string) ($cliAtual['hash'] ?? '')));
if ($cliValido || !empty($_SESSION['cfg_ok'])) {
    header('Location: dashboard.php');
    exit;
}

/** Guarda a mensagem e recarrega a página (POST → redirect → GET). */
function portal_flash($msg, $erro = true) {
    $_SESSION['portal_msg'] = [$msg, (bool) $erro];
    header('Location: portal.php');
    exit;
}

/**
 * Limite de tentativas de login por IP (15 a cada 15 minutos) — barra força
 * bruta de senhas. Estado em dados/login_rate.php; sem onde gravar, não trava.
 */
function portal_taxa_ok($ip) {
    $arq   = __DIR__ . '/dados/login_rate.php';
    $agora = time();
    $dados = is_file($arq) ? @include $arq : [];
    if (!is_array($dados)) {
        $dados = [];
    }
    foreach ($dados as $k => $v) {
        if (!is_array($v) || ($agora - ($v[0] ?? 0)) > 900) {
            unset($dados[$k]);
        }
    }
    $atual = $dados[$ip] ?? [$agora, 0];
    $atual[1]++;
    $dados[$ip] = $atual;
    dados_gravar($arq, "<?php\nreturn " . var_export($dados, true) . ";\n");
    return $atual[1] <= 15;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (!hash_equals($csrf, (string) ($_POST['csrf'] ?? ''))) {
        portal_flash('Sessão expirada — tente entrar de novo.');
    }
    usleep(400000); // desacelera tentativas de adivinhação
    if (!portal_taxa_ok($_SERVER['REMOTE_ADDR'] ?? '?')) {
        portal_flash('Muitas tentativas de login. Aguarde alguns minutos e tente de novo.');
    }
    $email = mb_strtolower(trim((string) ($_POST['email'] ?? '')));
    $senha = (string) ($_POST['senha'] ?? '');
    $_SESSION['portal_email'] = mb_substr($email, 0, 120); // reaparece no campo se der erro
    $lista = clientes_carregar();
    $cli   = cliente_por_email($email);
    // O bcrypt roda SEMPRE, exista ou não o e-mail (contra o hash de outro
    // cadastro ou um fantasma) — o tempo de resposta não revela quais
    // e-mails são de clientes reais.
    $hashCmp = $cli ? (string) ($cli['hash'] ?? '')
        : ($lista ? (string) ($lista[0]['hash'] ?? '') : '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
    $senhaOk = password_verify($senha, $hashCmp);
    if (!$cli || !$senhaOk) {
        portal_flash('E-mail ou senha incorretos. Confira os dados ou fale com a agência.');
    }
    session_regenerate_id(true); // evita fixação de sessão
    $_SESSION['cfg_csrf']  = bin2hex(random_bytes(16));
    $_SESSION['cli_email'] = mb_strtolower(trim((string) $cli['email']));
    // Marca da senha vigente: se a agência trocar a senha, a sessão cai.
    $_SESSION['cli_marca'] = sha1((string) ($cli['hash'] ?? ''));
    unset($_SESSION['portal_email']);
    header('Location: dashboard.php');
    exit;
}

$msg = $_SESSION['portal_msg'] ?? null;
unset($_SESSION['portal_msg']);
$emailAnterior = (string) ($_SESSION['portal_email'] ?? '');
unset($_SESSION['portal_email']);

$whatsAcesso = 'https://wa.me/' . preg_replace('/\D+/', '', $AGENCIA['whatsapp'])
    . '?text=' . rawurlencode('Olá! Sou cliente da ' . $AGENCIA['nome'] . ' e preciso do meu acesso ao portal.');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#030409">
    <meta name="robots" content="noindex">
    <title>Portal do cliente — <?= htmlspecialchars($AGENCIA['nome']) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/dash.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%234361ee'/><text x='50' y='68' font-size='58' text-anchor='middle' fill='%23f2f5fc' font-family='Arial' font-weight='bold'>C</text></svg>">
</head>
<body class="dash-body portal-body">

<main class="portal">
    <a class="brand portal__brand" href="index.php" aria-label="Voltar ao site da <?= htmlspecialchars($AGENCIA['nome']) ?>">
        <span class="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </span>
        <span class="brand__text">
            <strong><?= htmlspecialchars($AGENCIA['marca']) ?></strong>
            <small>Portal do cliente</small>
        </span>
    </a>

    <div class="dash-card portal__card">
        <h1 class="dash-h2 portal__titulo">Entrar no portal</h1>
        <p class="dash-note">Use o e-mail e a senha que a <?= htmlspecialchars($AGENCIA['nome']) ?> cadastrou para você.</p>

        <?php if ($msg): ?>
        <p class="cfg-msg<?= $msg[1] ? ' cfg-msg--erro' : '' ?>" role="status"><?= htmlspecialchars($msg[0]) ?></p>
        <?php endif; ?>

        <form method="post" class="cfg-form">
            <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
            <label>E-mail
                <input type="email" name="email" required autocomplete="email" placeholder="voce@gmail.com" value="<?= htmlspecialchars($emailAnterior) ?>">
            </label>
            <label>Senha
                <input type="password" name="senha" required autocomplete="current-password">
            </label>
            <button type="submit" class="btn btn--primary">Entrar</button>
        </form>
    </div>

    <ul class="portal__links">
        <li>Ainda não é cliente? <a href="index.php#planos">Conheça os planos</a></li>
        <li>Esqueceu a senha ou não tem acesso? <a href="<?= htmlspecialchars($whatsAcesso) ?>" target="_blank" rel="noopener">Fale com a agência</a></li>
        <li><a href="dashboard.php?agencia=1#config">Acesso da agência</a></li>
    </ul>
</main>

</body>
</html>
