# Agência Cavalcante — Agentes de IA no WhatsApp

Sistema de site/landing page para a **Agência Cavalcante**, que oferece um
**Agente de Inteligência Artificial para WhatsApp**: atendimento 24h,
qualificação de leads, agendamento, follow-up e checkout de planos.

O front-end (PHP + HTML/CSS/JS) exibe a página de vendas e dispara os fluxos de
**teste grátis** e **assinatura**, que são repassados para um backend ("ponte").

## Estrutura

```
.
├── index.php            # Landing page (renderiza planos e dados a partir do config)
├── config.php           # Configuração central: agência, ponte (backend) e planos
├── trial.php            # Inicia teste grátis (proxy -> ponte/trial)
├── voucher.php          # Gera link de checkout (proxy -> ponte/voucher)
├── status.php           # Health-check em JSON
└── assets/
    ├── css/style.css    # Design system (tema escuro, acento verde WhatsApp)
    └── js/app.js        # Interatividade, chat animado e wiring do checkout
```

## Configuração

Edite `config.php`:

- **`PONTE_URL`** — endereço do backend que gera trials e checkout. Pode ser
  definido pela variável de ambiente `PONTE_URL` no servidor.
- **`$AGENCIA`** — nome, WhatsApp (`DDI+DDD+numero`, só dígitos), e-mail,
  Instagram etc.
- **`$PLANOS`** — nome, preço, créditos e recursos de cada plano. O campo
  `plano` é o identificador enviado ao backend (`voucher.php?plano=N`).

## Como funciona o checkout

1. O visitante clica em **Assinar** (`.js-assinar`) ou **Testar grátis**
   (`.js-trial`) num plano.
2. O JS chama `voucher.php?plano=N` ou `trial.php?plano=N`.
3. Esses arquivos repassam a chamada para a `PONTE_URL` e devolvem a resposta.
4. O JS procura uma URL de checkout na resposta (JSON ou texto) e redireciona.
5. Se o backend não responder, o visitante é levado ao **WhatsApp** com uma
   mensagem pré-preenchida (fallback resiliente).

## Rodando localmente

```bash
php -S localhost:8000
# abra http://localhost:8000
```

Requisitos: PHP >= 7.4 com a extensão cURL habilitada.

---

> Sistema original desenvolvido para a Agência Cavalcante. Inspirado no modelo
> de negócio de agentes de IA para WhatsApp, com design, textos e código próprios.
