# 🎬 AgênciaHub

Sistema de gestão completo para **agências de marketing e produtoras audiovisuais**.
Clientes, projetos, gravações, propostas, financeiro e equipamentos — tudo em um só lugar.

Funciona **100% no navegador**: sem instalação, sem servidor, sem mensalidade e até sem internet.
Os dados ficam salvos no próprio navegador (localStorage).

## ✨ Módulos

| Módulo | O que faz |
|---|---|
| **Visão geral** | Indicadores do mês, gráfico de receita dos últimos 6 meses, prazos e próximos compromissos |
| **Clientes** | CRM simples: leads, clientes ativos, contatos com link direto para WhatsApp e Instagram |
| **Projetos** | Kanban com arrastar e soltar: Briefing → Planejamento → Produção → Edição → Revisão → Entregue |
| **Tarefas** | Lista rápida com prazos, prioridades, responsáveis e filtros (hoje, semana, atrasadas) |
| **Calendário** | Agenda mensal de gravações, entregas, reuniões e postagens |
| **Propostas** | Orçamentos com itens, desconto e total automático — imprima ou salve em PDF para enviar no WhatsApp |
| **Financeiro** | Receitas e despesas por mês, contas a receber, resultado do mês |
| **Equipamentos** | Controle de câmeras, lentes, drones, áudio e iluminação (disponível / em uso / manutenção) |
| **Equipe** | Pessoas fixas e freelas, com carga de trabalho de cada uma |
| **Configurações** | Dados da agência (saem nas propostas), backup e restauração |

## 🚀 Como usar

### Opção 1 — Abrir direto (mais simples)

1. Baixe este repositório: botão verde **Code → Download ZIP** (ou `git clone`).
2. Extraia e dê **dois cliques em `index.html`**.
3. Pronto — o app abre com dados de demonstração para você explorar.

### Opção 2 — Publicar na internet (GitHub Pages)

1. No repositório, vá em **Settings → Pages**.
2. Em *Source*, escolha **Deploy from a branch**, branch **`main`**, pasta **`/ (root)`** e salve.
3. Em ~1 minuto o app estará no ar em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
   > Atenção: no plano gratuito do GitHub, o Pages exige repositório **público**.

### Primeiros passos dentro do app

1. Vá em **Configurações** e preencha os dados da sua agência (nome, WhatsApp, PIX...) — eles saem no cabeçalho das propostas.
2. Ainda em Configurações, quando quiser começar de verdade, use **Apagar todos os dados** para limpar a demonstração.
3. Cadastre seus clientes, crie os projetos e arraste os cartões conforme o trabalho avança.

## 💾 Seus dados

- Tudo é salvo **somente no navegador que você está usando** (nada vai para a internet).
- Trocou de computador ou vai limpar o navegador? **Exporte o backup** em *Configurações → Backup* e importe no outro aparelho.
- Recomendação: exporte um backup por semana e guarde no seu Drive.

## 🛠️ Tecnologia

- HTML + CSS + JavaScript puros (sem frameworks, sem build, sem dependências).
- Persistência via `localStorage`.
- Interface escura, responsiva (funciona no celular) e em português.

### Estrutura

```
index.html          → página única do app
css/styles.css      → tema e componentes visuais
js/core/store.js    → dados, persistência e utilitários
js/core/ui.js       → modais, toasts, ícones e badges
js/views/*.js       → uma tela por arquivo
js/app.js           → rotas e inicialização
```

## 📄 Licença

Uso livre pela agência. Personalize à vontade.
