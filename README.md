# Agência Cavalcante — Painel do Agente de IA (WhatsApp)

Tela de **apresentação / painel** do Agente de IA no WhatsApp da Agência
Cavalcante, feita para viver **dentro do web app da agência** e ser entregue ao
cliente. O foco é *mostrar e usar* o agente — não vender: não há planos nem
checkout.

Feito em **PHP puro** (sem framework) e **sem dependências de backend** — as
ações levam direto ao WhatsApp por deep link (`wa.me`). Isso deixa o painel
autossuficiente e fácil de embutir.

> Todo o design, textos e código são **originais**. O conceito (agente de IA para
> WhatsApp) é comum no mercado; nada aqui é cópia de site de terceiros.

---

## Estrutura

```
.
├── index.php          # O painel/apresentação (hero, recursos, como funciona,
│                      #   exemplos de uso, FAQ, CTA, rodapé)
├── config.php         # Dados da agência (nome, WhatsApp, e-mail, Instagram)
├── status.php         # Healthcheck simples (GET /status.php → JSON)
├── composer.json      # Requisito de versão do PHP
└── assets/
    ├── css/style.css  # Design system (tema escuro, verde/teal, responsivo)
    └── js/app.js      # Menu, FAQ, reveal on scroll, demo de chat animado
```

## Como embutir no app da agência

O painel é uma página web responsiva e autocontida. Formas comuns de usar como
uma **tela dentro do web app**:

- **Rota/iframe:** sirva `index.php` e aponte uma tela do app para essa URL
  (ex.: `/agente` ou um `<iframe>` na área do cliente).
- **PWA/hospedagem:** publique a pasta em qualquer host com PHP 7.4+.

Todos os botões principais abrem o WhatsApp do agente com uma mensagem
pré-preenchida — nenhuma chamada de servidor é necessária.

## Configuração (`config.php`)

| O que ajustar | Onde |
|---|---|
| WhatsApp do agente | `$AGENCIA['whatsapp']` (DDI+DDD+número, só dígitos) |
| E-mail e Instagram | `$AGENCIA['email']`, `$AGENCIA['instagram']` |
| Nome/marca/descrição | `$AGENCIA[...]` |
| Mensagem inicial do WhatsApp | `$WHATS_MSG_PADRAO` |

## Rodando localmente

```bash
php -S localhost:8000
# abra http://localhost:8000
```

Requer **PHP 7.4+**.

---

## ✅ Antes de entregar (checklist)

- [ ] **WhatsApp real** em `config.php` — hoje está um número de exemplo
      (`5511999999999`). É a única integração externa do painel.
- [ ] **E-mail e Instagram** conferidos (aparecem no rodapé e na CTA final).
- [ ] **Exemplos de uso**: a seção é ilustrativa. Ajuste os segmentos para os do
      cliente, se quiser.
- [ ] (Opcional) **Compartilhamento**: no `<head>` do `index.php` há um bloco
      comentado para `og:image`/`canonical` caso o painel também seja acessado
      por link público.

> Observação: o histórico do Git ainda guarda a versão anterior com planos e
> checkout (`trial.php`/`voucher.php`), caso um dia você queira reaproveitar.
