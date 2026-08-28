<?php
/**
 * Agência Cavalcante — Configuração central
 *
 * Ajuste aqui os dados da agência, a URL do backend ("ponte") e os planos.
 * Nenhuma chave secreta deve ficar neste arquivo — apenas configuração pública.
 */

// ----------------------------------------------------------------------------
// Backend / Ponte
// ----------------------------------------------------------------------------
// Endereço do serviço que gera trials e links de checkout (voucher).
// Pode ser sobrescrito por variável de ambiente PONTE_URL no servidor.
if (!defined('PONTE_URL')) {
    define('PONTE_URL', getenv('PONTE_URL') ?: 'https://lavinia-nonremissible-les.ngrok-free.dev');
}

// Timeout (segundos) das chamadas ao backend.
if (!defined('PONTE_TIMEOUT')) {
    define('PONTE_TIMEOUT', 12);
}

// ----------------------------------------------------------------------------
// Dados da agência
// ----------------------------------------------------------------------------
$AGENCIA = [
    'nome'        => 'Agência Cavalcante',
    'marca'       => 'Cavalcante',
    'slogan'      => 'Agentes de IA no WhatsApp',
    'descricao'   => 'Atendimento inteligente 24 horas: sua empresa responde, qualifica e vende no WhatsApp com um agente de IA que trabalha sem parar.',
    'whatsapp'    => '5584999492725', // DDI+DDD+numero, apenas dígitos
    'email'       => 'contato@agenciacavalcante.com.br',
    'instagram'   => 'https://instagram.com/agenciacavalcante',
    'cidade'      => '', // cidade/UF da agência, ex.: 'Recife - PE'
    'ano'         => (int) date('Y'),
];

// Mensagem padrão usada quando o visitante fala com a agência pelo WhatsApp.
$WHATS_MSG_PADRAO = 'Olá! Vim pelo site da Agência Cavalcante e quero conhecer o Agente de IA para WhatsApp.';

// ----------------------------------------------------------------------------
// Planos
// ----------------------------------------------------------------------------
// O campo "plano" é o identificador enviado ao backend (voucher.php?plano=N).
// "destaque" marca o plano recomendado. Preços em reais (BRL).
$PLANOS = [
    [
        'plano'      => 1,
        'nome'       => 'Essencial',
        'resumo'     => 'Para começar a automatizar o atendimento.',
        'preco'      => 197,
        'periodo'    => '/mês',
        'cobranca'   => 'cobrança trimestral — R$ 591 a cada 3 meses',
        'creditos'   => '7.500 créditos de IA / trimestre',
        'destaque'   => false,
        'cta'        => 'Assinar Essencial',
        'recursos'   => [
            ['texto' => 'Agente de IA respondendo em texto', 'incluso' => true],
            ['texto' => 'Atendimento automático 24h por dia', 'incluso' => true],
            ['texto' => '1 número de WhatsApp conectado', 'incluso' => true],
            ['texto' => 'Qualificação básica de leads', 'incluso' => true],
            ['texto' => 'Painel de conversas', 'incluso' => true],
            ['texto' => 'Respostas em áudio com voz humana', 'incluso' => false],
            ['texto' => 'Leitura de imagens e follow-up', 'incluso' => false],
            ['texto' => 'Integrações e agendamento', 'incluso' => false],
        ],
    ],
    [
        'plano'      => 2,
        'nome'       => 'Profissional',
        'resumo'     => 'O mais escolhido por quem quer vender mais.',
        'preco'      => 397,
        'periodo'    => '/mês',
        'cobranca'   => 'cobrança trimestral — R$ 1.191 a cada 3 meses',
        'creditos'   => '15.000 créditos de IA / trimestre',
        'destaque'   => true,
        'cta'        => 'Assinar Profissional',
        'recursos'   => [
            ['texto' => 'Tudo do plano Essencial', 'incluso' => true],
            ['texto' => 'Respostas em áudio com voz humana', 'incluso' => true],
            ['texto' => 'Leitura de imagens enviadas pelo cliente', 'incluso' => true],
            ['texto' => 'Follow-up automático de leads', 'incluso' => true],
            ['texto' => 'Agendamento de reuniões', 'incluso' => true],
            ['texto' => 'Integrações com seus sistemas', 'incluso' => true],
            ['texto' => 'Pipeline visual de vendas', 'incluso' => true],
            ['texto' => 'Pesquisa na web em tempo real', 'incluso' => false],
        ],
    ],
    [
        'plano'      => 3,
        'nome'       => 'Premium',
        'resumo'     => 'Escala total para operações e equipes.',
        'preco'      => 697,
        'periodo'    => '/mês',
        'cobranca'   => 'cobrança trimestral — R$ 2.091 a cada 3 meses',
        'creditos'   => '30.000 créditos de IA / trimestre',
        'destaque'   => false,
        'cta'        => 'Assinar Premium',
        'recursos'   => [
            ['texto' => 'Tudo do plano Profissional', 'incluso' => true],
            ['texto' => 'Pesquisa na web em tempo real', 'incluso' => true],
            ['texto' => 'Múltiplos números de WhatsApp', 'incluso' => true],
            ['texto' => 'Vários atendentes humanos no painel', 'incluso' => true],
            ['texto' => 'Integrações avançadas e API', 'incluso' => true],
            ['texto' => 'Follow-up e cadências ilimitadas', 'incluso' => true],
            ['texto' => 'Suporte prioritário', 'incluso' => true],
            ['texto' => 'Gerente de conta dedicado', 'incluso' => true],
        ],
    ],
];

/**
 * Retorna um plano pelo identificador, ou null.
 */
function plano_por_id($id, array $planos) {
    foreach ($planos as $p) {
        if ((string) $p['plano'] === (string) $id) {
            return $p;
        }
    }
    return null;
}

/**
 * Chama o backend (ponte) e devolve o corpo bruto da resposta.
 * Retorna array [body, httpCode, erro].
 */
function chamar_ponte($caminho) {
    $url = rtrim(PONTE_URL, '/') . '/' . ltrim($caminho, '/');

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => PONTE_TIMEOUT,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_HTTPHEADER     => [
            'Accept: application/json',
            'ngrok-skip-browser-warning: true',
        ],
    ]);
    $body  = curl_exec($ch);
    $code  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erro  = curl_error($ch);
    curl_close($ch);

    return [$body, $code, $erro];
}
