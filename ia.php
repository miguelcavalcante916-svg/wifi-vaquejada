<?php
/**
 * ia.php — endpoint do chat do Agente de IA (usado pelo painel).
 *
 * Modos, em ordem de prioridade:
 *   1. "ia"   — chave da Anthropic configurada (env IA_API_KEY ou
 *               ANTHROPIC_API_KEY): responde com o modelo real.
 *   2. "demo" — sem chave: respondedor de demonstração embutido, para o
 *               painel funcionar imediatamente.
 *
 * Uso: POST JSON { "mensagens": [ { "de": "cliente"|"agente", "texto": "..." } ] }
 * Resposta: { "ok": true, "resposta": "...", "modo": "ia"|"demo" }
 */

require __DIR__ . '/config.php';

// Hospedagens compartilhadas nem sempre têm mbstring; degrada para substr
// (pode partir um caractere multibyte no corte, aceitável para sanitização).
if (!function_exists('mb_substr')) {
    function mb_substr($s, $i, $l = null) { return $l === null ? substr($s, $i) : substr($s, $i, $l); }
    function mb_strtolower($s) { return strtolower($s); }
    function mb_strpos($h, $n) { return strpos($h, $n); }
    function mb_strlen($s) { return strlen($s); }
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    echo json_encode(['ok' => false, 'erro' => 'Use POST.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Só o próprio site (o chat do painel) pode usar este endpoint — evita que
// terceiros consumam os créditos da API. Requisições sem esses headers
// (ex.: curl para teste) continuam aceitas.
$sf = $_SERVER['HTTP_SEC_FETCH_SITE'] ?? '';
$hostAtual = strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]);
$origem = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$hostOrigem = $origem !== '' ? strtolower((string) (parse_url($origem, PHP_URL_HOST) ?: '')) : '';
if (($sf !== '' && !in_array($sf, ['same-origin', 'same-site', 'none'], true))
    || ($hostOrigem !== '' && $hostAtual !== '' && $hostOrigem !== $hostAtual)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'erro' => 'Origem não autorizada.'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) {
    http_response_code(415);
    echo json_encode(['ok' => false, 'erro' => 'Envie JSON (Content-Type: application/json).'], JSON_UNESCAPED_UNICODE);
    exit;
}

$corpo = json_decode(file_get_contents('php://input'), true);
$brutas = is_array($corpo['mensagens'] ?? null) ? $corpo['mensagens'] : [];

// Sanitiza: só as últimas 12 mensagens, texto limitado, papéis conhecidos.
$mensagens = [];
foreach (array_slice($brutas, -12) as $m) {
    $de    = ($m['de'] ?? '') === 'agente' ? 'agente' : 'cliente';
    $texto = is_string($m['texto'] ?? null) ? trim(mb_substr($m['texto'], 0, 2000)) : '';
    if ($texto !== '') {
        $mensagens[] = ['de' => $de, 'texto' => $texto];
    }
}
// A API exige que o histórico comece pelo cliente; o corte acima pode ter
// deixado uma resposta do agente na frente.
while ($mensagens && $mensagens[0]['de'] !== 'cliente') {
    array_shift($mensagens);
}
if (!$mensagens || end($mensagens)['de'] !== 'cliente') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'erro' => 'Envie ao menos uma mensagem do cliente.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$chave = ia_chave(); // variável de ambiente ou chave salva na aba Configurações

if ($chave !== '') {
    $resposta = ia_responder_anthropic($chave, $mensagens, $AGENCIA, $PLANOS);
    if ($resposta !== null) {
        echo json_encode(['ok' => true, 'resposta' => $resposta, 'modo' => 'ia'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    // API indisponível: cai para o modo demonstração para não travar o painel.
}

echo json_encode([
    'ok'       => true,
    'resposta' => ia_responder_demo(end($mensagens)['texto'], $AGENCIA, $PLANOS),
    'modo'     => 'demo',
], JSON_UNESCAPED_UNICODE);
exit;

// ---------------------------------------------------------------------------

/**
 * Chama a API Messages da Anthropic (cURL nativo — o projeto não usa Composer;
 * a alternativa oficial é o SDK anthropic-ai/sdk). Retorna o texto ou null.
 */
function ia_responder_anthropic($chave, array $mensagens, array $ag, array $planos) {
    $linhasPlanos = [];
    foreach ($planos as $p) {
        $linhasPlanos[] = sprintf(
            '- %s: R$ %d/mês (%s), %s. CTA: %s',
            $p['nome'], $p['preco'], $p['cobranca'], $p['creditos'], $p['cta']
        );
    }

    $system = "Você é o agente virtual de atendimento da {$ag['nome']} no WhatsApp. "
        . "Fale sempre em português do Brasil, em tom cordial e direto, com no máximo 2 a 4 frases por resposta. "
        . "Seu papel: tirar dúvidas sobre o Agente de IA para WhatsApp, qualificar o interesse do cliente e conduzir para o teste grátis ou para uma conversa com a equipe. "
        . "Planos disponíveis (não invente valores fora desta tabela):\n" . implode("\n", $linhasPlanos) . "\n"
        . "Todos os planos têm teste grátis. "
        . "Se o cliente quiser agendar demonstração, peça nome e melhor horário. "
        . "Se pedirem um atendente humano, diga que vai transferir para a equipe. "
        . "Se perguntarem se você é um robô ou IA, confirme que é o assistente virtual da agência.";

    // A API exige papéis alternados; mensagens seguidas do mesmo lado
    // (ex.: cliente reenviou após falha de rede) são mescladas.
    $msgs = [];
    foreach ($mensagens as $m) {
        $role = $m['de'] === 'agente' ? 'assistant' : 'user';
        $ultimo = $msgs ? array_key_last($msgs) : null;
        if ($ultimo !== null && $msgs[$ultimo]['role'] === $role) {
            $msgs[$ultimo]['content'] .= "\n" . $m['texto'];
        } else {
            $msgs[] = ['role' => $role, 'content' => $m['texto']];
        }
    }

    // Respostas de chat são curtas por instrução do system prompt; o teto
    // maior dá folga ao raciocínio interno do modelo (conta em max_tokens).
    $payload = [
        'model'      => getenv('IA_MODELO') ?: 'claude-opus-5',
        'max_tokens' => 4096,
        'system'     => $system,
        'messages'   => $msgs,
    ];

    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 60,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_HTTPHEADER     => [
            'x-api-key: ' . $chave,
            'anthropic-version: 2023-06-01',
            'content-type: application/json',
        ],
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($body === false || $code < 200 || $code >= 300) {
        return null;
    }

    $dados = json_decode($body, true);
    if (!is_array($dados)) {
        return null;
    }
    if (($dados['stop_reason'] ?? '') === 'refusal') {
        return 'Desculpe, não consigo ajudar com esse assunto. Posso te contar como o Agente de IA funciona ou apresentar os planos?';
    }

    $texto = '';
    foreach ($dados['content'] ?? [] as $bloco) {
        if (($bloco['type'] ?? '') === 'text') {
            $texto .= $bloco['text'];
        }
    }
    $texto = trim($texto);
    if ($texto === '' && ($dados['stop_reason'] ?? '') === 'max_tokens') {
        // Orçamento consumido antes do texto: pede uma reformulação em vez
        // de mascarar o modo IA como demo.
        return 'Essa ficou longa para mim! 😅 Consegue perguntar de forma mais direta? Assim te respondo na hora.';
    }
    return $texto !== '' ? $texto : null;
}

/**
 * Respondedor de demonstração: regras simples em PT-BR usando os dados reais
 * dos planos, para o painel funcionar sem nenhuma configuração.
 */
function ia_responder_demo($ultima, array $ag, array $planos) {
    $t = mb_strtolower($ultima);
    // Palavras curtas ("ia", "oi", "bot") exigem fronteira de palavra para não
    // casarem dentro de outras ("dia", "dois", "botão"); as longas podem ser
    // substring ("obrigad" cobre obrigado/obrigada).
    $tem = function (...$palavras) use ($t) {
        foreach ($palavras as $p) {
            if (mb_strlen($p) <= 3) {
                if (preg_match('/(?<![\p{L}\p{N}])' . preg_quote($p, '/') . '(?![\p{L}\p{N}])/u', $t)) {
                    return true;
                }
            } elseif (mb_strpos($t, $p) !== false) {
                return true;
            }
        }
        return false;
    };

    if ($tem('preço', 'preco', 'valor', 'plano', 'custa', 'quanto')) {
        $linhas = [];
        foreach ($planos as $p) {
            $linhas[] = "• {$p['nome']}: R$ {$p['preco']}/mês ({$p['creditos']})";
        }
        return "Temos 3 planos:\n" . implode("\n", $linhas)
            . "\nTodos com teste grátis. Quer que eu te ajude a escolher o ideal para o seu negócio?";
    }
    if ($tem('teste', 'testar', 'grátis', 'gratis', 'experimentar')) {
        return 'Ótimo! Todos os planos têm teste grátis, sem compromisso. Me conta rapidinho: qual é o seu ramo de atividade e quantos atendimentos você recebe por dia no WhatsApp?';
    }
    if ($tem('agendar', 'demonstração', 'demonstracao', 'reunião', 'reuniao', 'horário', 'horario')) {
        return 'Perfeito, posso agendar uma demonstração com a nossa equipe. Qual o seu nome e qual o melhor dia e horário para você?';
    }
    if ($tem('áudio', 'audio', 'voz', 'imagem', 'foto')) {
        return 'Sim! Nos planos Profissional e Premium o agente responde em áudio com voz natural e entende imagens que o cliente enviar. Quer ver isso funcionando num teste grátis?';
    }
    if ($tem('humano', 'atendente', 'pessoa', 'falar com alguém', 'falar com alguem')) {
        return 'Claro! Vou transferir você para a nossa equipe. Enquanto isso, me adianta o assunto para eu direcionar ao especialista certo?';
    }
    if ($tem('robô', 'robo', 'ia', 'inteligência', 'inteligencia', 'bot')) {
        return "Sou o assistente virtual da {$ag['nome']} — uma IA treinada para atender como gente, 24 horas por dia. É exatamente isso que instalamos no WhatsApp da sua empresa. Quer testar?";
    }
    if ($tem('oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'opa', 'ei')) {
        return "Olá! 😊 Sou o assistente virtual da {$ag['nome']}. Posso te apresentar o Agente de IA para WhatsApp, tirar dúvidas sobre os planos ou agendar uma demonstração. Por onde começamos?";
    }
    if ($tem('obrigad', 'valeu', 'show', 'perfeito', 'legal')) {
        return 'Eu que agradeço! Qualquer dúvida é só chamar — estou aqui 24h. 🚀';
    }
    return "Boa pergunta! O Agente de IA da {$ag['nome']} responde seus clientes 24h no WhatsApp, qualifica leads e agenda reuniões sozinho. Quer saber dos planos ou prefere já começar um teste grátis?";
}
