<?php
require __DIR__ . '/config.php';

/** Monta um link de WhatsApp com mensagem pré-preenchida. */
function whats_link($numero, $msg) {
    return 'https://wa.me/' . preg_replace('/[^0-9]/', '', $numero) . '?text=' . rawurlencode($msg);
}

$whatsPadrao = whats_link($AGENCIA['whatsapp'], $WHATS_MSG_PADRAO);
$anoAtual    = $AGENCIA['ano'];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#030409">
    <title><?= htmlspecialchars($AGENCIA['nome']) ?> — Painel do Agente de IA</title>
    <meta name="description" content="<?= htmlspecialchars($AGENCIA['descricao']) ?>">

    <meta property="og:type" content="website">
    <meta property="og:title" content="<?= htmlspecialchars($AGENCIA['nome']) ?> — <?= htmlspecialchars($AGENCIA['slogan']) ?>">
    <meta property="og:description" content="<?= htmlspecialchars($AGENCIA['descricao']) ?>">
    <meta property="og:locale" content="pt_BR">
    <meta name="twitter:card" content="summary_large_image">
    <!-- Antes de publicar, defina o domínio real e uma imagem de compartilhamento (1200x630):
    <meta property="og:image" content="https://SEU-DOMINIO/assets/og-cover.png">
    <meta property="og:url" content="https://SEU-DOMINIO/">
    <link rel="canonical" href="https://SEU-DOMINIO/"> -->

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%234361ee'/><text x='50' y='68' font-size='58' text-anchor='middle' fill='%23f2f5fc' font-family='Arial' font-weight='bold'>C</text></svg>">
</head>
<body data-whatsapp="<?= htmlspecialchars($whatsPadrao) ?>">

<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>

<!-- ===================== HEADER ===================== -->
<header class="site-header" id="topo">
    <div class="container header__inner">
        <a class="brand" href="#topo" aria-label="<?= htmlspecialchars($AGENCIA['nome']) ?>">
            <span class="brand__mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
            </span>
            <span class="brand__text">
                <strong><?= htmlspecialchars($AGENCIA['marca']) ?></strong>
                <small>Agência de IA</small>
            </span>
        </a>

        <nav class="nav" id="nav" aria-label="Navegação principal">
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#depoimentos">Exemplos</a>
            <a href="#perguntas">Perguntas</a>
        </nav>

        <div class="header__actions">
            <span class="status-pill" aria-label="Agente ativo"><span class="status-pill__dot" aria-hidden="true"></span> Agente ativo</span>
            <a class="btn btn--primary btn--sm" href="<?= htmlspecialchars($whatsPadrao) ?>" target="_blank" rel="noopener">Conversar no WhatsApp</a>
        </div>

        <button class="nav-toggle" id="navToggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav">
            <span></span><span></span><span></span>
        </button>
    </div>
</header>

<main id="conteudo">

<!-- ===================== HERO ===================== -->
<section class="hero">
    <div class="hero__glow" aria-hidden="true"></div>
    <div class="container hero__grid">
        <div class="hero__copy">
            <span class="pill">
                <span class="pill__dot"></span>
                Seu Agente de IA · por <?= htmlspecialchars($AGENCIA['nome']) ?>
            </span>
            <h1 class="hero__title">
                Bem-vindo ao seu <span class="grad">Agente de IA</span> no WhatsApp.
            </h1>
            <p class="hero__lead">
                A <?= htmlspecialchars($AGENCIA['nome']) ?> preparou um Agente de Inteligência Artificial que
                responde, qualifica e agenda no seu WhatsApp 24 horas por dia — com a naturalidade de um
                atendente humano e a velocidade de uma máquina.
            </p>

            <div class="hero__cta">
                <a class="btn btn--primary btn--lg" href="<?= htmlspecialchars($whatsPadrao) ?>" target="_blank" rel="noopener">
                    Conversar com o agente
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
                <a class="btn btn--outline btn--lg" href="#como-funciona" data-scroll>Ver como funciona</a>
            </div>

            <ul class="hero__stats">
                <li><strong>24/7</strong><span>disponível todo dia</span></li>
                <li><strong>Na hora</strong><span>resposta imediata</span></li>
                <li><strong>Sem folga</strong><span>dia, noite e feriado</span></li>
            </ul>
        </div>

        <div class="hero__demo" aria-hidden="true">
            <div class="phone">
                <div class="phone__notch"></div>
                <div class="phone__topbar">
                    <span class="phone__avatar">C</span>
                    <div class="phone__peer">
                        <strong>Agente Cavalcante</strong>
                        <small><span class="dot-online"></span> online agora</small>
                    </div>
                </div>
                <div class="phone__chat" id="chatDemo"></div>
            </div>
            <div class="hero__badge hero__badge--1">Lead qualificado ✓</div>
            <div class="hero__badge hero__badge--2">Reunião agendada 📅</div>
        </div>
    </div>

    <div class="marquee" aria-hidden="true">
        <div class="marquee__track">
            <span>Atendimento 24h</span><span>•</span>
            <span>Qualificação de leads</span><span>•</span>
            <span>Respostas em áudio</span><span>•</span>
            <span>Agendamento automático</span><span>•</span>
            <span>Follow-up inteligente</span><span>•</span>
            <span>Integrações</span><span>•</span>
            <span>Pipeline de vendas</span><span>•</span>
            <span>Atendimento 24h</span><span>•</span>
            <span>Qualificação de leads</span><span>•</span>
            <span>Respostas em áudio</span><span>•</span>
            <span>Agendamento automático</span><span>•</span>
            <span>Follow-up inteligente</span><span>•</span>
            <span>Integrações</span><span>•</span>
            <span>Pipeline de vendas</span><span>•</span>
        </div>
    </div>
</section>

<!-- ===================== PROBLEMA / VALOR ===================== -->
<section class="section value">
    <div class="container">
        <div class="section__head">
            <span class="eyebrow">O que o agente resolve</span>
            <h2>Cada mensagem sem resposta é uma venda que vai para o concorrente.</h2>
            <p>O cliente do WhatsApp não espera. Se ninguém responde em minutos, ele fecha com quem respondeu primeiro. O Agente de IA da Cavalcante garante que <strong>nenhuma conversa fique parada</strong> — de dia, de noite, no fim de semana e no feriado.</p>
        </div>
        <div class="value__grid">
            <div class="value__card">
                <span class="value__num">1º</span>
                <p>Responda antes do concorrente: quem chega primeiro no WhatsApp costuma fechar o negócio.</p>
            </div>
            <div class="value__card">
                <span class="value__num">24h</span>
                <p>Atende de madrugada, no fim de semana e no feriado — sem deixar ninguém no vácuo.</p>
            </div>
            <div class="value__card">
                <span class="value__num">Sem fila</span>
                <p>Todas as mensagens respondidas na hora, mesmo nos picos de volume.</p>
            </div>
        </div>
    </div>
</section>

<!-- ===================== RECURSOS ===================== -->
<section class="section" id="recursos">
    <div class="container">
        <div class="section__head">
            <span class="eyebrow">Recursos</span>
            <h2>Um atendente de IA completo dentro do seu WhatsApp</h2>
            <p>Muito além de um chatbot de perguntas prontas: o agente entende o contexto, aprende com o seu negócio e conduz a conversa até a venda.</p>
        </div>

        <div class="features">
            <?php
            $features = [
                ['🤖', 'Conversa como gente', 'Entende linguagem natural, áudios e imagens — responde no tom da sua marca, sem parecer robô.'],
                ['🕐', 'Atendimento 24/7', 'Responde na mesma hora, todos os dias, sem folga, sem fila e sem cliente esperando.'],
                ['🎯', 'Qualifica leads', 'Faz as perguntas certas, separa curioso de comprador e entrega só o lead pronto para o time.'],
                ['🎙️', 'Voz humana', 'Envia áudios com voz natural quando faz sentido, deixando a conversa mais próxima.'],
                ['📅', 'Agenda reuniões', 'Marca reuniões e visitas direto na sua agenda, com lembrete automático para o cliente.'],
                ['🔁', 'Follow-up automático', 'Reengaja quem sumiu com cadências inteligentes e recupera vendas que iriam esfriar.'],
                ['🔌', 'Integrações', 'Conecta com seu CRM, planilhas, ERP e sistemas via API para buscar e registrar dados.'],
                ['📊', 'Pipeline de vendas', 'Um funil visual mostra quem entrou, quem está sendo trabalhado e o que está pronto para fechar.'],
                ['🙋', 'Passa para humano', 'Quando a conversa exige cuidado, transfere para um atendente da sua equipe sem ruído.'],
            ];
            foreach ($features as $f): ?>
            <article class="feature">
                <span class="feature__icon" aria-hidden="true"><?= $f[0] ?></span>
                <h3><?= htmlspecialchars($f[1]) ?></h3>
                <p><?= htmlspecialchars($f[2]) ?></p>
            </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ===================== COMO FUNCIONA ===================== -->
<section class="section section--alt" id="como-funciona">
    <div class="container">
        <div class="section__head">
            <span class="eyebrow">Como funciona</span>
            <h2>Do primeiro contato à venda em 4 passos</h2>
            <p>Você cuida do seu negócio. A gente cuida da tecnologia e da implantação.</p>
        </div>

        <ol class="steps">
            <li class="step">
                <span class="step__num">1</span>
                <h3>Diagnóstico</h3>
                <p>Entendemos seu produto, suas perguntas frequentes e o jeito da sua empresa atender.</p>
            </li>
            <li class="step">
                <span class="step__num">2</span>
                <h3>Treinamento do agente</h3>
                <p>Configuramos a IA com o conhecimento do seu negócio e conectamos ao seu WhatsApp.</p>
            </li>
            <li class="step">
                <span class="step__num">3</span>
                <h3>Testes e ajustes</h3>
                <p>Rodamos conversas reais, refinamos o tom e as regras até ficar do seu jeito.</p>
            </li>
            <li class="step">
                <span class="step__num">4</span>
                <h3>No ar, vendendo</h3>
                <p>O agente entra em operação e você acompanha tudo pelo painel e pelo pipeline.</p>
            </li>
        </ol>
    </div>
</section>

<!-- ===================== EXEMPLOS DE USO ===================== -->
<section class="section section--alt" id="depoimentos">
    <div class="container">
        <div class="section__head">
            <span class="eyebrow">Exemplos de uso</span>
            <h2>Como diferentes negócios usam o Agente de IA</h2>
            <p>Cenários ilustrativos de como o agente trabalha no dia a dia de cada segmento.</p>
        </div>
        <div class="testimonials">
            <?php
            $casos = [
                ['🧖', 'Clínicas e estética', 'Agenda avaliações, responde dúvidas sobre procedimentos e preços a qualquer hora e reduz faltas com lembretes automáticos.'],
                ['🏠', 'Imobiliárias', 'Qualifica quem procura imóvel, filtra perfil e orçamento e só passa para o corretor o lead que já está pronto.'],
                ['🛋️', 'Comércio e varejo', 'Tira dúvidas de produto, envia catálogo e conduz o cliente até a compra, mesmo fora do horário da loja.'],
            ];
            foreach ($casos as $c): ?>
            <figure class="testimonial caso">
                <span class="feature__icon" aria-hidden="true"><?= $c[0] ?></span>
                <h3 class="caso__title"><?= htmlspecialchars($c[1]) ?></h3>
                <p><?= htmlspecialchars($c[2]) ?></p>
            </figure>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ===================== PERGUNTAS (FAQ) ===================== -->
<section class="section" id="perguntas">
    <div class="container container--narrow">
        <div class="section__head">
            <span class="eyebrow">Perguntas frequentes</span>
            <h2>Ficou com alguma dúvida?</h2>
        </div>

        <div class="faq">
            <?php
            $faqs = [
                ['Como começo a usar o agente?', 'É só tocar em “Conversar no WhatsApp” e enviar uma mensagem. O agente responde na hora, a qualquer dia e horário.'],
                ['O agente funciona no meu número atual de WhatsApp?', 'Sim. Conectamos o agente ao número da sua empresa de forma segura, seguindo as diretrizes do WhatsApp Business. Você continua com o mesmo número que seus clientes já conhecem.'],
                ['A IA responde como um robô?', 'Não. O agente entende contexto, interpreta áudios e imagens e conversa no tom da sua marca. A conversa flui de forma natural, e o agente pode se identificar como assistente virtual sempre que necessário.'],
                ['Consigo assumir a conversa quando quiser?', 'Sim. A qualquer momento um atendente humano pode entrar na conversa pelo painel, e o agente também transfere sozinho quando o caso é mais delicado.'],
                ['Preciso saber de tecnologia para usar?', 'Não. A Agência Cavalcante cuida de toda a implantação, do treinamento do agente e dos ajustes. Você acompanha os resultados por um painel simples.'],
            ];
            foreach ($faqs as $i => $q): ?>
            <details class="faq__item"<?= $i === 0 ? ' open' : '' ?>>
                <summary>
                    <span><?= htmlspecialchars($q[0]) ?></span>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                </summary>
                <div class="faq__answer"><p><?= htmlspecialchars($q[1]) ?></p></div>
            </details>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ===================== CTA FINAL ===================== -->
<section class="section">
    <div class="container">
        <div class="cta-final">
            <div class="cta-final__glow" aria-hidden="true"></div>
            <h2>Pronto para colocar seu Agente de IA para trabalhar?</h2>
            <p>Converse agora com o agente no WhatsApp ou fale com a Agência Cavalcante para ajustar qualquer detalhe.</p>
            <div class="cta-final__actions">
                <a class="btn btn--primary btn--lg" href="<?= htmlspecialchars($whatsPadrao) ?>" target="_blank" rel="noopener">Conversar no WhatsApp</a>
                <a class="btn btn--outline btn--lg" href="mailto:<?= htmlspecialchars($AGENCIA['email']) ?>">Falar com a agência</a>
            </div>
        </div>
    </div>
</section>

</main>

<!-- ===================== FOOTER ===================== -->
<footer class="site-footer">
    <div class="container footer__grid">
        <div class="footer__brand">
            <a class="brand" href="#topo">
                <span class="brand__mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </span>
                <span class="brand__text"><strong><?= htmlspecialchars($AGENCIA['marca']) ?></strong><small>Agência de IA</small></span>
            </a>
            <p><?= htmlspecialchars($AGENCIA['descricao']) ?></p>
        </div>

        <nav class="footer__col" aria-label="Navegação do rodapé">
            <h3>Navegação</h3>
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#depoimentos">Exemplos</a>
            <a href="#perguntas">Perguntas</a>
        </nav>

        <div class="footer__col">
            <h3>Contato</h3>
            <a href="<?= htmlspecialchars($whatsPadrao) ?>" target="_blank" rel="noopener">WhatsApp</a>
            <a href="mailto:<?= htmlspecialchars($AGENCIA['email']) ?>"><?= htmlspecialchars($AGENCIA['email']) ?></a>
            <a href="<?= htmlspecialchars($AGENCIA['instagram']) ?>" target="_blank" rel="noopener">Instagram</a>
        </div>
    </div>
    <div class="container footer__bottom">
        <span>© <?= $anoAtual ?> <?= htmlspecialchars($AGENCIA['nome']) ?>. Todos os direitos reservados.</span>
        <span>Atendimento inteligente no WhatsApp.</span>
    </div>
</footer>

<!-- Botão flutuante do WhatsApp -->
<a class="wa-float" href="<?= htmlspecialchars($whatsPadrao) ?>" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
    <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" aria-hidden="true"><path d="M16 3C9 3 3.4 8.6 3.4 15.6c0 2.5.7 4.9 2 7L3 29l6.6-2.3c2 .9 4.1 1.4 6.4 1.4 7 0 12.6-5.6 12.6-12.6C28.6 8.6 23 3 16 3zm0 22.9c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1.4 1.3-3.8-.3-.4a10.3 10.3 0 0 1-1.6-5.5C5.5 9.9 10.2 5.3 16 5.3S26.5 9.9 26.5 15.6 21.8 25.9 16 25.9zm5.9-7.7c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.4-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.8 5.1.8.3 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4z"/></svg>
</a>

<script>
window.AGENCIA = {
    whatsapp: <?= json_encode($whatsPadrao, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
};
</script>
<script src="assets/js/app.js" defer></script>
</body>
</html>
