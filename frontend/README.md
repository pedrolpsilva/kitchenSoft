# 🍳 KitchenSoft - KDS (Kitchen Display System) Frontend

Interface web moderna, reativa e ultra-performática de **Kitchen Display System (KDS)** para cozinhas de restaurantes e estabelecimentos comerciais. Desenvolvida para garantir controle em tempo real dos pedidos, alta visibilidade em ambientes operacionais e resiliência a falhas de conexão.

---

## 🚀 1. Visão Geral

O **KitchenSoft KDS** substitui os comprovantes impressos tradicionais por telas digitais interativas. Os cozinheiros e chefs conseguem visualizar novos pedidos instantaneamente, acompanhar o tempo decorrido de preparo, alterar status dos itens/pedidos e receber alertas de tempo crítico.

### Principais Destaques
- **Comunicação em Tempo Real:** Atualizações instantâneas de pedidos via Firebase Firestore sem necessidade de recarregar a página.
- **Operação Offline-First:** Fila local de alterações persistida via LocalForage para evitar perda de ações em oscilações de rede.
- **Desempenho Extremo:** Construído com React 19, Next.js 16 App Router e Zustand para trocas de estado ultra-rápidas.
- **Experiência Visual Otimizada:** Design em **Dark Mode** de alto contraste projetado especificamente para telas instaladas em cozinhas.

---

## 🛠️ 2. Tecnologias Utilizadas

- **[Next.js 16 (App Router)](https://nextjs.org/)**: Framework React de última geração utilizando roteamento baseado em arquivos e otimizaciones de performance.
- **[React 19](https://react.dev/)**: Biblioteca base para construção de interfaces reativas e declarativas.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática end-to-end para prevenir erros em tempo de compilação.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework CSS utilitário de alta velocidade com engine renovada.
- **[Zustand](https://zustand-demo.pmnd.rs/)**: Gerenciador de estado global minimalista, rápido e previsível.
- **[LocalForage](https://localforage.github.io/localForage/)**: Armazenamento assíncrono offline (IndexedDB/WebSQL/localStorage) para persistência e filas de sincronização.
- **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones vetoriais modernos e leves.
- **[Firebase Web SDK v12](https://firebase.google.com/)**: Integração direta com Firestore para escuta de eventos em tempo real (*onSnapshot*).

---

## 🎨 3. Escolhas de Design & UX

### 🌙 Dark Mode de Alto Contraste
Telas de cozinha industrial exigem fácil leitura à distância e sob iluminação intensa ou variável. O design utiliza tons escuros profundos com cores vibrantes para codificação de status (ex: verde para novo, amarelo para em preparo, vermelho para atrasado).

### 🧱 Arquitetura Atomic Design
Os componentes da interface são modularizados seguindo a metodologia **Atomic Design**:
- **Atoms**: Botões, badges, tags de tempo, indicadores de status e ícones isolados.
- **Molecules**: Cards de itens individuais de pedidos, temporizadores com progresso visual e controles de ação rápida.
- **Organisms**: Comprovante digital completo do pedido (*Order Card*) contendo lista de itens, observações e ações gerais.
- **Templates**: Grids reativos e painéis organizados por filas de produção e colunas de status.

### ⏱️ Temporizadores e Alertas Visuais
Cada pedido possui contadores regressivos/progressivos sincronizados que mudam de cor conforme o tempo de preparo excede os limites toleráveis da cozinha (SLA), alertando visualmente a equipe sobre itens prioritários.

### 📡 Resiliência e Operação Offline
Em casos de queda temporária de internet na cozinha, as ações executadas pelos operadores (ex: concluir pedido, iniciar preparo) são gravadas em uma fila offline com **LocalForage** e sincronizadas com o servidor no momento em que a conexão for restabelecida.

---

## 📁 4. Estrutura de Pastas e Componentes

```
frontend/
├── src/
│   ├── app/                # Roteamento Next.js App Router (pages, layouts, globals.css)
│   ├── components/         # Componentes visuais organizados por Atomic Design
│   │   ├── atoms/          # Botões, Badges, Typographies e elementos primários
│   │   ├── molecules/      # ItemCard, Timer, ActionButtons
│   │   ├── organisms/      # OrderCard, HeaderBar, NavigationFilter
│   │   └── templates/      # KitchenGridTemplate, KDSLayout
│   ├── hooks/              # Hooks customizados React (ex: useOrders, useOfflineQueue)
│   ├── lib/                # Inicializadores de serviços (firebase.ts, localforage.ts)
│   ├── store/              # Stores globais do Zustand (useOrderStore, useKDSStore)
│   └── types/              # Definições de interfaces TypeScript (Order, Item, Status)
├── public/                 # Arquivos estáticos (imagens, favicons)
├── .env.local              # Variáveis de ambiente (não commitado)
├── package.json            # Dependências e scripts do projeto
└── tsconfig.json           # Configurações do TypeScript
```

---

## ⚙️ 5. Configuração do Ambiente (`.env.local`)

Crie um arquivo `.env.local` na raiz do diretório `frontend` contendo as credenciais de acesso do seu projeto Firebase:

```env
# Configurações do Firebase Web SDK
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

---

## 📜 6. Scripts & Ações Disponíveis

No diretório do frontend, você pode executar os seguintes comandos:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Next.js (por padrão em `http://localhost:3000`). |
| `npm run build` | Compila e otimiza a aplicação para ambiente de produção. |
| `npm run start` | Inicia a aplicação compilada no modo de produção. |
| `npm run lint` | Executa o linter ESLint para validar boas práticas e encontrar erros no código. |

### Rodando em Desenvolvimento

```bash
# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
