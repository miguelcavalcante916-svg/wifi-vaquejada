# Agência Cavalcante — Agentes de IA no WhatsApp

Site de vendas completo + endpoints de checkout para o serviço de **Agente de
IA no WhatsApp** da Agência Cavalcante: atendimento automático 24h,
qualificação de leads, agendamento, follow-up, pipeline de vendas, planos por
créditos de IA, teste grátis e assinatura.

Feito em **PHP puro** (sem framework), com a **paleta azul da marca**, e
conversa com um backend próprio (a "ponte") que gera os trials e os links de
pagamento.

> Design, textos e código são **originais** — o conceito (agente de IA para
> WhatsApp com planos por créditos) é comum no mercado; nada aqui é cópia de
> site de terceiros.

---

## Estrutura

```
.
├── index.php          # Landing page completa (hero com demo animada, recursos,
│                      #   como funciona, PLANOS, exemplos de uso, FAQ, CTA, rodapé)
├── dashboard.php      # PAINEL do cliente: visão geral (métricas + gráfico),
│                      #   conversas, pipeline de vendas e chat com o Agente IA
├── ia.php             # Endpoint do chat de IA (Anthropic API ou modo demo)
├── config.php         # Configuração central: agência, PONTE_URL e os 3 planos
├── trial.php          # Endpoint: inicia teste grátis (proxy p/ a ponte)
├── voucher.php        # Endpoint: gera link de checkout de um plano
├── status.php         # Healthcheck simples (GET /status.php → JSON)
├── composer.json      # Requisito de versão do PHP
└── assets/
    ├── css/style.css  # Design system (azul #4361ee sobre #030409, responsivo)
    ├── css/dash.css   # Estilos do painel (usa os tokens do style.css)
    ├── js/app.js      # Menu, FAQ, demo animada + integração de checkout
    └── js/dash.js     # Abas do painel + chat do Agente IA
```

## Painel do cliente (`dashboard.php`)

Acessível em `/dashboard.php` (link no rodapé do site). Abas:

- **Visão geral** — atendimentos do dia, leads qualificados, reuniões,
  tempo de resposta, gráfico dos últimos 7 dias e consumo de créditos de IA.
- **Conversas** — caixa de entrada estilo WhatsApp com etiquetas
  IA / Humano / Aguardando e botão "Assumir conversa".
- **Pipeline** — funil kanban: novo lead → qualificação → qualificado →
  reunião marcada → fechado.
- **Agente IA** — chat funcional com o agente (veja abaixo).
- **⚙️ Configurações** — configure TUDO pelo navegador (veja abaixo).

## ⚙️ Configurações pelo navegador

A aba **Configurações** do painel permite configurar o sistema inteiro pelo
Chrome, sem tocar em código:

- WhatsApp, e-mail, Instagram e cidade da agência
- URL do backend de checkout (`ponte`)
- **Chave da API da Anthropic** (ativa a IA real do chat)
- Preço e créditos de cada plano (o total trimestral do site é recalculado
  automaticamente)

Como funciona:

1. **Primeira visita** à aba: você cria uma senha. ⚠ **Faça isso assim que
   publicar o site**, antes de divulgar o endereço.
2. Depois, a aba pede a senha para entrar.
3. Tudo que você salvar vale imediatamente no site e no agente.

Onde os dados ficam: em `dados/config.local.php` — arquivo **fora do Git**
(`.gitignore`), que não expõe nada se acessado por URL, com a senha guardada
como hash e a chave da IA nunca reexibida (só os 4 últimos dígitos).
Variáveis de ambiente (`PONTE_URL`, `IA_API_KEY`), quando existirem no
servidor, têm prioridade sobre o painel.

> A pasta `dados/` precisa de permissão de escrita pelo PHP (na maioria das
> hospedagens compartilhadas isso já funciona sem ajuste).

> Os números e conversas do painel são **dados de demonstração** (rotulados
> como tal na interface). Em produção, conecte às fontes reais da agência.

## IA integrada (`ia.php`)

O chat da aba **Agente IA** chama `ia.php`, que responde em um de dois modos:

| Modo | Quando | Como ativar |
|---|---|---|
| **IA real** | Chave da Anthropic configurada | Defina a variável de ambiente `IA_API_KEY` (ou `ANTHROPIC_API_KEY`) no servidor. Modelo padrão: `claude-opus-5` (mude com `IA_MODELO`). |
| **Demonstração** | Sem chave | Automático — respostas pré-programadas em PT-BR usando os dados reais dos planos. |

O agente real recebe um system prompt com os planos do `config.php` e
instruções de tom (PT-BR, respostas curtas, qualificação de leads,
transferência para humano). **Nunca** coloque a chave no código — apenas em
variável de ambiente:

```bash
# Apache (.htaccess ou vhost)
SetEnv IA_API_KEY "sk-ant-..."
```

## Planos (config.php)

| Plano | Preço | Créditos de IA |
|---|---|---|
| Essencial | R$ 197/mês (R$ 591/trimestre) | 7.500 / trimestre |
| Profissional ⭐ | R$ 397/mês (R$ 1.191/trimestre) | 15.000 / trimestre |
| Premium | R$ 697/mês (R$ 2.091/trimestre) | 30.000 / trimestre |

Recursos avançados (voz humana, leitura de imagens, follow-up, integrações,
pipeline, pesquisa na web) liberam conforme o plano — tudo editável em
`$PLANOS` no `config.php`.

## Como funciona o checkout

1. O visitante clica em **Assinar** ou **Testar grátis** em um plano.
2. O `app.js` chama `voucher.php?plano=N` ou `trial.php`.
3. Esses endpoints repassam a chamada para a **ponte** (`PONTE_URL`) e
   devolvem a resposta em JSON.
4. O JS localiza o link de checkout na resposta e redireciona o visitante.
5. Se a ponte falhar, o visitante é levado ao **WhatsApp** da agência com uma
   mensagem pré-preenchida sobre o plano — nenhum lead se perde.

Formatos de resposta aceitos da ponte (qualquer um):

```json
{ "checkout_url": "https://pagamento..." }
{ "url": "https://pagamento..." }
{ "ok": true, "link": "https://pagamento..." }
```

## Configuração (`config.php`)

| O que ajustar | Onde |
|---|---|
| Backend que gera trial/checkout | `PONTE_URL` (ou variável de ambiente `PONTE_URL`) |
| WhatsApp da agência | `$AGENCIA['whatsapp']` (DDI+DDD+número, só dígitos) |
| E-mail e Instagram | `$AGENCIA['email']`, `$AGENCIA['instagram']` |
| Preços, créditos e recursos dos planos | `$PLANOS[...]` |

Em produção, defina a ponte por variável de ambiente:

```bash
# Apache (.htaccess ou vhost)
SetEnv PONTE_URL "https://backend.agenciacavalcante.com.br"
```

## Rodando localmente

```bash
php -S localhost:8000
# abra http://localhost:8000
```

Requer **PHP 7.4+** com a extensão **cURL**.

---

## ✅ Antes de publicar (checklist)

- [ ] **WhatsApp real** em `config.php` — hoje está um número de exemplo
      (`5511999999999`).
- [ ] **Backend de produção** em `PONTE_URL` — o padrão atual é um túnel
      `ngrok` de desenvolvimento e **vai expirar**. Aponte para o domínio
      definitivo ou defina a variável de ambiente.
- [ ] **E-mail e Instagram** conferidos e ativos.
- [ ] **Preços e créditos** revisados (`$PLANOS`) — o rótulo mostra o valor
      mensal e o total trimestral cobrado; mantenha os dois coerentes.
- [ ] **Exemplos de uso**: a seção é ilustrativa. Para prova social real, use
      depoimentos de clientes **com autorização**.
- [ ] **Compartilhamento**: no `<head>` do `index.php` há um bloco comentado
      para `og:image` (1200×630), `og:url` e `canonical` — preencha com o
      domínio real.

> Evite afirmações não comprováveis (ex.: "aprovado/certificado pela Meta",
> estatísticas sem fonte). Os textos atuais já seguem essa regra.
