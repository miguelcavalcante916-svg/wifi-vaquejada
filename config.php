<?php
/**
 * Agência Cavalcante — Configuração central
 *
 * Painel / apresentação do Agente de IA no WhatsApp.
 * Ajuste aqui os dados da agência. Nenhuma chave secreta deve ficar neste arquivo.
 */

// ----------------------------------------------------------------------------
// Dados da agência
// ----------------------------------------------------------------------------
$AGENCIA = [
    'nome'        => 'Agência Cavalcante',
    'marca'       => 'Cavalcante',
    'slogan'      => 'Agentes de IA no WhatsApp',
    'descricao'   => 'Atendimento inteligente 24 horas: seu Agente de IA responde, qualifica e agenda no WhatsApp sem parar.',
    'whatsapp'    => '5511999999999', // DDI+DDD+numero, apenas dígitos — troque pelo número real do agente
    'email'       => 'contato@agenciacavalcante.com.br',
    'instagram'   => 'https://instagram.com/agenciacavalcante',
    'cidade'      => '', // cidade/UF da agência, ex.: 'Recife - PE'
    'ano'         => (int) date('Y'),
];

// Mensagem pré-preenchida quando o visitante inicia a conversa com o agente pelo WhatsApp.
$WHATS_MSG_PADRAO = 'Olá! Quero conversar com o Agente de IA da Agência Cavalcante.';
