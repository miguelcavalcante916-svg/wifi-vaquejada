# Agência Cavalcante — Agente de IA no WhatsApp

Site de vendas (landing page) + endpoints de checkout para o serviço de
**Agente de IA no WhatsApp** da Agência Cavalcante: atendimento automático 24h,
qualificação de leads, agendamento, follow-up e pipeline de vendas.

O sistema é feito em **PHP puro** (sem framework) e conversa com um backend
próprio (a "ponte") que gera os trials e os links de pagamento.

> **Sobre a inspiração:** o conceito (agente de IA para WhatsApp, com planos por
> créditos, trial e voucher) é comum no mercado. Todo o design, textos e código
> deste repositório são **originais** — não é uma cópia de nenhum site de
> terceiros.

---

## Estrutura

```
.
├── index.php          # Landing page (hero, recursos, planos, FAQ, etc.)
├── config.php         # Configuração central: agência, PONTE_URL, planos
├── trial.php          # Endpoint: inicia teste grátis (proxy p/ a ponte)
├── voucher.php        # Endpoint: gera link de checkout de um plano
├── status.php         # Healthcheck simples (GET /status.php → JSON)
├── composer.json      # Requisito de versão do PHP
└── assets/
    ├── css/style.css  # Design system (tema escuro, verde/teal, responsivo)
    └── js/app.js      # Interatividade + integração de checkout
```

## Como funciona o checkout

1. O visitante clica em **Assinar** ou **Testar grátis** em um plano.
2. O `app.js` chama, respectivamente, `voucher.php?plano=N` ou `trial.php`.
3. Esses endpoints repassam a chamada para a **ponte** (`PONTE_URL`) e devolvem
   a resposta em JSON.
4. O JS procura um link de checkout na resposta e **redireciona** o visitante.
5. Se a ponte estiver fora do ar ou não devolver link, o JS mostra um aviso e
   leva o visitante para o **WhatsApp** da agência (fallback), para não perder
   o lead.

Formato esperado da resposta da ponte (qualquer um destes serve):

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

A `PONTE_URL` pode (e **deve**, em produção) vir de variável de ambiente:

```bash
# Apache (.htaccess ou vhost)
SetEnv PONTE_URL "https://backend.agenciacavalcante.com.br"
```

## Rodando localmente

```bash
php -S localhost:8000
# abra http://localhost:8000
```

Requer **PHP 7.4+** com a extensão **cURL** habilitada.

---

## ✅ Antes de publicar (checklist)

Itens que dependem de dados reais da agência e precisam ser revistos antes de ir
ao ar:

- [ ] **WhatsApp real** em `config.php` (`$AGENCIA['whatsapp']`) — hoje está um
      número de exemplo (`5511999999999`).
- [ ] **Backend de produção** em `PONTE_URL` — o padrão atual é um túnel `ngrok`
      de desenvolvimento e **vai cair**. Aponte para o domínio definitivo ou
      defina a variável de ambiente `PONTE_URL`.
- [ ] **E-mail e Instagram** conferidos e ativos (`config.php`).
- [ ] **Preços e créditos** dos planos revisados (`$PLANOS`). O rótulo mostra o
      valor mensal e o total trimestral cobrado — mantenha os dois coerentes.
- [ ] **Depoimentos**: a seção "Exemplos de uso" é ilustrativa. Se quiser provas
      sociais reais, substitua por depoimentos de clientes **com autorização**.
- [ ] **Compartilhamento (SEO/redes)**: no `<head>` do `index.php` há um bloco
      comentado — defina o domínio real e uma imagem `og:image` (1200×630) e o
      `canonical`.
- [ ] **Cidade/UF** em `config.php` (`$AGENCIA['cidade']`), se for usar.

> Evite afirmações que não dá para comprovar (ex.: "aprovado/certificado pela
> Meta", estatísticas sem fonte). Os textos atuais já foram ajustados para isso.
