# 🍳 KitchenSoft - KDS & Gestão de Restaurantes (Frontend)

Interface web moderna, reativa e ultra-performática para **Kitchen Display System (KDS)**, **Atendimento de Salão / Garçom** e **Balcão de Pedidos**. Desenvolvida para garantir controle em tempo real dos pedidos, alta visibilidade operacional, suporte **Multi-Tenant** com **Controle de Acesso (RBAC)** e resiliência a falhas de conexão.

---

## 🚀 1. Visão Geral

O **KitchenSoft Frontend** substitui os comprovantes impressos tradicionais por telas digitais interativas. Oferece visões especializadas para a equipe de produção na cozinha, garçons no salão e atendentes no balcão, permitindo acompanhar SLA de preparo, gerenciar comandas/mesas, visualizar itens em lote e administrar o estabelecimento.

### Principais Destaques
- **Painel KDS em Tempo Real:** Atualizações instantâneas de pedidos via Firebase Firestore / Realtime Database sem recarregar a página.
- **Módulo Salão e Atendimento de Mesas (`/salao`):** Gestão interativa do salão por zonas, adição rápida de itens em comandas, acompanhamento do consumo por mesa e encerramento de conta.
- **Autenticação & Multi-Tenancy:** Login seguro via Firebase Auth com isolamento lógico completo de dados por restaurante (`tenantId`) e troca de estabelecimento.
- **Painel Administrativo & RBAC (`/admin`):** Gestão de usuários e permissões granulares por módulo (`tela_cozinha`, `tela_balcao`, `tela_salao`).
- **Auto-Cadastro de Restaurantes (`/cadastro`, `/confirmar-email`):** Fluxo de onboarding self-service com tela de sucesso e confirmação por e-mail.
- **Header Integrado (TopBar) & User Menu Drawer:** Chaveamento rápido de visões (**Cozinha**, **Lotes**, **Balcão**, **Salão**), status da loja ativa e drawer com permissões e perfil do usuário logado.
- **Operação Offline-First:** Fila local de alterações persistida via LocalForage para evitar perda de ações em oscilações de internet.
- **Desempenho Extremo:** Construído com React 19, Next.js 16 App Router e Zustand.
- **UX de Alto Contraste:** Design otimizado em **Dark Mode** específico para ambiente industrial/operacional de cozinhas.

---

## 🛠️ 2. Tecnologias Utilizadas

- **[Next.js 16 (App Router)](https://nextjs.org/)**: Framework React de alta performance com roteamento baseado em arquivos.
- **[React 19](https://react.dev/)**: Biblioteca base para interfaces reativas.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática end-to-end.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework CSS utilitário de alta velocidade.
- **[Zustand](https://zustand-demo.pmnd.rs/)**: Gerenciamento de estado global descentralizado e performático (`useAuthStore`, `useTenantStore`, `useSalaoStore`, `useOrderStore`).
- **[LocalForage](https://localforage.github.io/localForage/)**: Armazenamento assíncrono offline (IndexedDB).
- **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones vetoriais leves.
- **[Firebase Web SDK v12](https://firebase.google.com/)**: Autenticação de usuários, Realtime Database e Firestore em tempo real.

---

## 🎨 3. Escolhas de Design & UX

### 🌙 Dark Mode de Alto Contraste
Projetado para telas em ambientes de cozinha e salão, utilizando cores vibrantes para codificação de status (*verde para novo*, *amarelo para em preparo*, *vermelho para atrasado*).

### 🧱 Arquitetura Atomic Design
Componentes modulares organizados em:
- **Atoms**: Botões, badges, tags de tempo, badges de status e ícones isolados.
- **Molecules**: Cards de itens de pedidos, temporizadores regressivos/progressivos com SLA visual e controles de ação rápida.
- **Organisms**: `OrderCard`, `BatchCard`, `TopBar`, `UserMenuDrawer`, `SalaoBoard`, `ComandaDrawer`, `TableDetailsDrawer`.
- **Templates**: `KDSBoard`, `BalcaoForm`, `LoginScreen`, `SalaoScreen`.

### ⏱️ Temporizadores de SLA e Alertas Visuais
Contadores progressivos e regressivos indicando visualmente quando um pedido excede o tempo limite configurado para a cozinha.

### 📡 Resiliência Offline
Ações executadas em momento de desconexão são salvas na fila offline local (LocalForage) e sincronizadas automaticamente ao reconectar.

---

## 📁 4. Estrutura de Pastas e Componentes

```text
frontend/
├── src/
│   ├── app/                # Roteamento Next.js App Router
│   │   ├── page.tsx        # Página Inicial (KDS / Login / Dynamic Auth Guard)
│   │   ├── admin/          # Painel Admin (page.tsx: Gestão de Usuários e Permissões)
│   │   ├── salao/          # Tela Salão (page.tsx: Atendimento de Mesas e Comandas)
│   │   ├── cadastro/       # Onboarding Self-Service (page.tsx e sucesso/page.tsx)
│   │   ├── confirmar-email/ # Tela de Verificação de E-mail (page.tsx)
│   │   ├── globals.css     # Estilos globais e configurações do Tailwind CSS
│   │   └── layout.tsx      # Root Layout da aplicação
│   ├── components/         # Componentes visuais por Atomic Design
│   │   ├── atoms/          # Botões, Badges, Typographies e elementos primários
│   │   ├── molecules/      # ItemCard, Timer, ActionButtons
│   │   ├── organisms/      # OrderCard, BatchCard, TopBar, UserMenuDrawer, SalaoBoard, ComandaDrawer, TableDetailsDrawer
│   │   └── templates/      # KDSBoard, BalcaoForm, LoginScreen, SalaoScreen
│   ├── hooks/              # Hooks customizados (useOrders, useOfflineQueue)
│   ├── lib/                # Inicialização de Firebase e LocalForage (firebase.ts, localforage.ts)
│   ├── store/              # Gerenciadores de estado Zustand
│   │   ├── useAuthStore.ts   # Autenticação Firebase, sessão e login/logout
│   │   ├── useTenantStore.ts # Perfil do usuário, tenant ativo e verificação RBAC (hasPermission)
│   │   ├── useSalaoStore.ts  # Estado das mesas, zonas, comandas e sincronização do salão
│   │   └── useOrderStore.ts # Estado e ações dos pedidos no KDS e Balcão
│   └── types/              # Definições TypeScript (Order, Item, Status, Permissions)
├── public/                 # Arquivos estáticos (imagens, favicons)
├── .env.local              # Variáveis de ambiente (não comitado)
├── package.json            # Dependências e scripts do projeto
└── tsconfig.json           # Configurações do TypeScript
```

---

## 🔒 5. Roteamento & Lógica de Permissões (RBAC)

A aplicação conta com um sistema de proteção de rotas no cliente (*Auth Guard*):
- Usuários não autenticados são exibidos na tela de `LoginScreen`.
- Usuários autenticados têm seu perfil carregado via `useTenantStore`.
- Perfis `admin` possuem acesso irrestrito a todas as visões (`/admin`, `/salao`, KDS Cozinha, Balcão).
- Operadores (`operator`) têm seu acesso restrito de acordo com suas permissões habilitadas:
  - `tela_cozinha`: Permite visualizar a fila KDS e os Lotes.
  - `tela_balcao`: Permite abrir o formulário de Balcão e lançar novos pedidos.
  - `tela_salao`: Permite acessar `/salao` para atendimento de mesas e comandas.

---

## ⚙️ 6. Configuração do Ambiente (`.env.local`)

Crie um arquivo `.env.local` na raiz do diretório `frontend`:

```env
# Configurações do Firebase Web SDK
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://seu_projeto-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# URL da API Go
NEXT_PUBLIC_GO_BACKEND_URL=http://localhost:8585
```

---

## 📜 7. Scripts & Ações Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Next.js (por padrão em `http://localhost:3000`). |
| `npm run build` | Compila e otimiza a aplicação para ambiente de produção. |
| `npm run start` | Inicia a aplicação compilada no modo de produção. |
| `npm run lint` | Executa o linter ESLint para encontrar erros e padronizar o código. |

### Rodando em Desenvolvimento

```bash
# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
