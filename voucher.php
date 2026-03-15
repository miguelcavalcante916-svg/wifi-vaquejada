<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$mikrotik_ip = '10.5.50.1';
$mikrotik_user = 'admin';
$mikrotik_pass = '1234';

$plano = $_GET['plano'] ?? '2';
$tempos = ['1' => '01:00:00', '2' => '02:00:00', '3' => '03:00:00'];
$tempo = $tempos[$plano] ?? '02:00:00';

$usuario = 'vaq' . rand(10000, 99999);
$senha = rand(10000, 99999);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => "http://$mikrotik_ip/rest/ip/hotspot/user",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_USERPWD => "$mikrotik_user:$mikrotik_pass",
    CURLOPT_POSTFIELDS => json_encode([
        'name' => $usuario,
        'password' => (string)$senha,
        'limit-uptime' => $tempo,
        'comment' => 'pago'
    ]),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT => 5
]);

$result = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo json_encode(['status' => 'erro', 'msg' => $error]);
} else {
    echo json_encode(['status' => 'ok', 'usuario' => $usuario, 'senha' => $senha, 'tempo' => $plano . 'h']);
}
?>
