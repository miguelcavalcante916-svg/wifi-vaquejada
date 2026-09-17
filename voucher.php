<?php
/**
 * voucher.php — gera o link de checkout (voucher) de um plano.
 *
 * Repassa a solicitação para o backend (ponte) e devolve a resposta em JSON.
 * Uso: GET /voucher.php?plano=2
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

list($body, $code, $erro) = chamar_ponte('voucher?plano=' . urlencode($plano));

if ($erro !== '' || $body === false) {
    http_response_code(502);
    echo json_encode([
        'ok'      => false,
        'erro'    => 'Não foi possível gerar o checkout agora.',
        'detalhe' => $erro ?: 'Sem resposta do servidor.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (is_string($body) && $body !== '') {
    json_decode($body);
    if (json_last_error() === JSON_ERROR_NONE) {
        http_response_code($code >= 200 && $code < 600 ? $code : 200);
        echo $body;
        exit;
    }
}

http_response_code($code >= 200 && $code < 600 ? $code : 200);
echo json_encode([
    'ok'    => $code >= 200 && $code < 300,
    'dados' => $body,
], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
