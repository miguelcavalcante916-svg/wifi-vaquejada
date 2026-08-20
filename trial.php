<?php
/**
 * trial.php — inicia um teste grátis do Agente de IA.
 *
 * Repassa a solicitação para o backend (ponte) e devolve a resposta em JSON.
 * Uso: GET /trial.php?plano=2
 */
require __DIR__ . '/config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$plano = preg_replace('/[^0-9]/', '', (string) ($_GET['plano'] ?? '2'));
if ($plano === '') {
    $plano = '2';
}

list($body, $code, $erro) = chamar_ponte('trial?plano=' . urlencode($plano));

if ($erro !== '' || $body === false) {
    http_response_code(502);
    echo json_encode([
        'ok'    => false,
        'erro'  => 'Não foi possível iniciar o teste agora.',
        'detalhe' => $erro ?: 'Sem resposta do servidor.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Se o backend já respondeu JSON, repassamos como veio.
if (is_string($body) && json_decode($body) !== null) {
    http_response_code($code >= 200 && $code < 600 ? $code : 200);
    echo $body;
    exit;
}

// Caso contrário, embrulhamos a resposta bruta.
echo json_encode([
    'ok'   => $code >= 200 && $code < 300,
    'dados' => $body,
], JSON_UNESCAPED_UNICODE);
