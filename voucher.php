<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$ponte = 'https://lavinia-nonremissible-les.ngrok-free.dev';
$plano = $_GET['plano'] ?? '2';

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => "$ponte/voucher?plano=$plano",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10
]);
$result = curl_exec($ch);
curl_close($ch);

echo $result;
?>
