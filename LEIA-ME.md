# BarberFlow — o que foi implementado e o que você precisa configurar

## O que mudou

### `index.html` (painel do barbeiro)
- **Login por e-mail e senha** (Firebase Authentication), com criar conta, entrar, sair e recuperar senha.
- **Teste grátis de 30 dias** contado a partir da criação da conta.
- **Trava de "burlar o teste grátis"**: cada aparelho grava um ID local (`localStorage`). Se o barbeiro sair e criar uma conta nova com outro e-mail *no mesmo aparelho*, o app reconhece que aquele aparelho já usou o teste grátis e não reinicia a contagem — ele já entra com os dias restantes (ou 0, se já tiver acabado).
- **Tela "Gold"**: quando o teste acaba, o app trava o painel e mostra botão do WhatsApp para comprar + campo para ativar um **código Gold**.
- **Sistema de código de ativação Gold**: você vende manualmente (Pix, WhatsApp, etc.) e gera um código no Firestore; o barbeiro digita o código no app e o plano vira Gold permanentemente naquela conta.
- **Tutorial (onboarding)** na primeira vez que o barbeiro loga, explicando os 5 passos para configurar a barbearia.
- **1 conta = 1 barbearia** (antes era possível criar várias barbearias no mesmo aparelho sem login; isso foi substituído pelo modelo de conta).

### `cliente.html` (app do cliente, hospedado no GitHub Pages)
- **Login anônimo automático** do Firebase (o cliente não precisa de senha — só o barbeiro loga). Isso é necessário para que as novas regras de segurança do Firestore funcionem.
- **Tutorial na primeira vez** que o cliente abre o app, explicando como agendar (código → serviços → dia/horário → aguardar confirmação → pagar).
- Link "Como funciona o app?" para rever o tutorial quando quiser.

### ⭐ Avaliações dos clientes (novo)
- Depois que o barbeiro marca um agendamento como **"Atendido"**, o cliente que fez aquele agendamento passa a ver um botão **"⭐ Avaliar atendimento"** no card dele, dentro de "Meus agendamentos".
- O cliente escolhe de **1 a 5 estrelas** e pode escrever um comentário opcional. Cada agendamento só pode ser avaliado uma vez (o botão some depois de avaliado e mostra a nota/comentário enviados).
- Todas as avaliações da barbearia (nota média + comentários de todos os clientes) aparecem numa seção **"Avaliações"** ao final da tela inicial do cliente — ou seja, **qualquer cliente que entrar pelo link/código** vê as notas e comentários de quem já avaliou, e também pode avaliar seus próprios atendimentos concluídos.
- No painel do barbeiro (`index.html`), há uma nova aba **"⭐ Avaliações"** na barra inferior, mostrando a nota média, o total de avaliações e a lista completa de comentários recebidos (mais recentes primeiro).
- As avaliações ficam salvas dentro do próprio documento da barbearia (`shop.reviews`), sincronizadas em tempo real como o resto do app — e valem também para quem estiver usando a "Ver cliente" (prévia) dentro do painel do barbeiro.

### `firestore.rules` (novo arquivo — **atualizado agora para permitir avaliações**)
Regras de segurança prontas para colar no Firestore. Sem elas, hoje **qualquer pessoa** com o link do seu projeto Firebase pode ler ou alterar os dados de qualquer barbearia. Com elas:
- Só o dono de uma barbearia pode mudar configurações, preços, horários etc.
- Um cliente só pode criar/alterar agendamentos, seu próprio cadastro e **avaliações**.
- Só o próprio barbeiro vê os dados da sua conta (plano, teste grátis).
- O plano só vira "Gold" se um código de ativação válido for consumido — não dá para "hackear" isso direto pelo navegador.

> ⚠️ Se você já tinha publicado as regras antigas no Firestore, **precisa colar e publicar de novo** o conteúdo atualizado de `firestore.rules` (passo 2 abaixo) — senão o campo `reviews` fica bloqueado e os clientes não conseguem avaliar.

---

## Passo a passo para deixar 100% funcional

### 1. Ativar os métodos de login no Firebase
No [Console do Firebase](https://console.firebase.google.com/) → projeto **teste-funcionarios** → **Authentication** → aba **Sign-in method**:
- Ative **E-mail/senha**
- Ative **Anônimo** (Anonymous) — necessário para o app do cliente

### 2. Publicar as regras de segurança
- Firestore Database → aba **Regras**
- Apague o conteúdo atual e cole o conteúdo do arquivo `firestore.rules`
- Clique em **Publicar**

### 3. Criar códigos de ativação Gold (venda manual)
Toda vez que alguém pagar pelo Gold:
1. Firestore Database → coleção `barberflow_giftcodes` → **Adicionar documento**
2. **ID do documento**: o próprio código que você vai enviar ao cliente, em maiúsculas (ex: `GOLD-A8K3`)
3. Adicione o campo: `used` (tipo **boolean**) = `false`
4. Salve, e envie o código `GOLD-A8K3` para o barbeiro digitar na tela Gold do app dele.

Dica: gere códigos únicos e um pouco aleatórios (ex: `GOLD-` + 4 caracteres) para não serem adivinhados.

*(Alternativa rápida, sem gerar código: você também pode abrir o documento do barbeiro em `barberflow_users/{uid}` e mudar o campo `plan` para `gold` manualmente — mas aí ele não passa pela tela de "ativar código", só libera na hora que ele reabrir o app.)*

### 4. Hospedar os arquivos
- `index.html` → é o app que o **barbeiro** usa. Pode ficar no GitHub Pages, ou ser o arquivo empacotado dentro do app da Play Store (veja abaixo).
- `cliente.html` → é o app que o **cliente** usa. Precisa ficar acessível por um link público (GitHub Pages funciona bem). Depois de publicado, cole essa URL em **Configurações → Link do app do cliente** dentro do painel do barbeiro — isso faz o link do WhatsApp Status abrir o app do cliente já com o código preenchido.
- Não esqueça de subir também `manifest.webmanifest`, `sw.js` e os ícones (`icon-192.png`, `icon-180.png`, `icon-512.png`) que o `cliente.html` já referencia, se ainda não estiverem no repositório.

### 5. Publicar na Play Store
Como esses arquivos são só HTML/JS (um "site"), a Play Store não aceita o upload direto — é preciso empacotar como app Android. Isso é feito **por fora** deste código, com uma dessas opções (todas comuns e gratuitas/baratas para apps simples):
- **PWA Builder** (pwabuilder.com) — gera um `.aab` a partir da URL do `index.html` publicado (ele já tem manifest/PWA pronto se você replicar o do cliente.html para o index também).
- **Median.co** ou **Capacitor** — empacotam qualquer site em WebView com ícone e nome personalizados.

Importante: esses empacotadores criam uma "WebView" — ou seja, o app da Play Store simplesmente abre a URL do seu `index.html` hospedado. Então mantenha o `index.html` sempre publicado e atualizado no seu link (GitHub Pages ou outro host).

---

## Testando

1. Crie uma conta de barbeiro nova → confira se aparece o tutorial na primeira vez.
2. Configure serviços/horários, copie o código, abra o `cliente.html` em outra aba (ou celular) e agende como cliente → confira se aparece em tempo real no painel do barbeiro.
3. Para testar o bloqueio de teste grátis sem esperar 30 dias: abra o Firestore, vá em `barberflow_users/{uid}` e mude `trialStartedAt` para uma data de 31+ dias atrás. Recarregue o app do barbeiro — deve cair na tela Gold.
4. Crie um código em `barberflow_giftcodes`, digite na tela Gold → confira se libera o painel e se o campo `plan` virou `gold`.
5. Saia da conta e crie outra conta nova **no mesmo navegador/aparelho** → confira se o teste grátis já vem descontando os dias (não reinicia).
6. No painel do barbeiro, aceite um agendamento e marque como **"Atendido"**. No app do cliente (ou na "Ver cliente" do painel), abra "Meus agendamentos" → deve aparecer o botão "⭐ Avaliar atendimento". Envie uma nota e comentário.
7. Confira se a avaliação aparece: (a) na seção "Avaliações" da tela inicial do cliente, (b) na aba "⭐ Avaliações" do painel do barbeiro, e (c) para um **segundo cliente** que entrar pelo mesmo código (ele deve ver a mesma avaliação, mesmo sem ter agendado nada).

Qualquer ajuste de textos, cores ou regras de negócio (ex: mudar de 30 para outro número de dias, trocar o número de WhatsApp) fica nas constantes `TRIAL_DAYS` e `WHATSAPP_NUMBER` no topo do script de `index.html`.
