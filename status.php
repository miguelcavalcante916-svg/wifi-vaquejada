<?php
/**
 * status.php — verificação simples de saúde do servidor.
 * Uso: GET /status.php
 */
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'ok'       => true,
    'servico'  => $AGENCIA['nome'],
    'status'   => 'online',
    'hora'     => date('c'),
], JSON_UNESCAPED_UNICODE);
