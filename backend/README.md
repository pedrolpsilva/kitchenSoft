# KitchenSoft - Backend API (KDS Service)

Serviço de API REST de alta performance construído em **Go (Golang)** para o ecossistema **KitchenSoft / KDS (Kitchen Display System)**. A API é responsável por gerenciar a entrada de pedidos, roteamento por estações de trabalho da cozinha, consolidação de itens em lotes (*batching*), suporte a **Multi-Tenancy** e sincronização em tempo real com o banco de dados Firebase.

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem**: Go 1.22 (Golang)
- **Servidor HTTP**: Pacote padrão `net/http` (utilizando os recursos de roteamento e *path parameters* do Go 1.22)
- **Integração Backend**: Firebase Admin SDK v4 (`firebase.google.com/go/v4`)
- **Banco de Dados**: Firebase Realtime Database
- **Gerenciamento de Dependências**: Go Modules (`go.mod`)

---

## 🏗️ Arquitetura e Organização do Código

O projeto segue uma **Arquitetura em Camadas (Layered Architecture)** limpa e desacoplada, separando responsabilidades de infraestrutura, regras de negócio e interface HTTP REST:

```text
backend/
├── cmd/
│   └── server/
│       └── main.go                  # Entrypoint, inicialização da API, middlewares CORS e Graceful Shutdown
├── internal/
│   ├── firebase/
│   │   └── client.go                # Cliente Firebase Admin SDK e rotinas multi-tenant (SetOrder, GetOrders, DeleteOrder)
│   ├── handler/
│   │   ├── health.go                # Handler para verificação de saúde da aplicação (Healthcheck)
│   │   └── orders.go                # Handlers REST HTTP para criação, busca, finalização e loteamento
│   ├── model/
│   │   └── order.go                 # Structs do domínio (Order, OrderItem, Modifier, OrderOrigin, BatchGroup, etc.)
│   └── service/
│       ├── batch_service.go         # Regra de negócio para agrupamento de itens em lote por estação e tenant
│       └── order_service.go         # Regras de negócio de gerenciamento do ciclo de vida dos pedidos
├── .env                             # Arquivo local de variáveis de ambiente
├── serviceAccountKey.json           # Credencial da conta de serviço do Firebase (não comitar)
├── go.mod                           # Módulo Go e declaração de dependências
└── go.sum                           # Hashes e checksums de dependências
```

### Detalhamento das Camadas

1. **`cmd/server/main.go`**: 
   - Carrega as variáveis de ambiente a partir do arquivo `.env`.
   - Inicializa a conexão com o Firebase via `firebase.NewClient`.
   - Instancia a árvore de dependências (`Service` -> `Handler`).
   - Configura o roteador de rotas HTTP com suporte a **CORS**.
   - Gerencia a execução assíncrona do servidor e encerramento gracioso (*Graceful Shutdown*) com captura de sinais de interrupção (`SIGINT`, `SIGTERM`).

2. **`internal/firebase`**: 
   - Encapsula as chamadas diretas ao Firebase Realtime Database.
   - Organiza o banco em caminhos isolados por tenant: `tenants/{tenantId}/stations/{stationId}/orders/{orderId}`.
   - Fornece os métodos `SetOrder`, `GetOrders`, `DeleteOrder` e `GetAllStationOrders`.

3. **`internal/model`**:
   - Define a estrutura de dados de Pedido (`Order`), contendo o parâmetro obrigatório `TenantID`.
   - Origens de Pedido (`OrderOrigin`): `Salão`, `Balcão` e `iFood`.
   - Status do Pedido (`OrderStatus`): `pending`, `ready`.
   - Modelos para agregação de lotes (`BatchGroup` e `BatchSource`).

4. **`internal/service`**:
   - `OrderService`: Responsável por validar e processar a criação, remoção (marcação como pronto) e busca de pedidos por estação e tenant.
   - `BatchService`: Responsável por agrupar dinamicamente itens idênticos de múltiplos pedidos ativos na mesma estação para o tenant especificado.

5. **`internal/handler`**:
   - Traduz as requisições HTTP REST para as rotas e tipos do Go, validando JSON e a presença do parâmetro de busca obrigatório `tenantId`.

---

## 🛰️ Ações & Endpoints REST

Todas as respostas são retornadas no formato JSON (`Content-Type: application/json`).

> ⚠️ **Importante:** Todos os endpoints de pedidos exigem a identificação do `tenantId` (seja no corpo do JSON no `POST` ou como Query Parameter `?tenantId=...` nos endpoints `GET` e `PATCH`).

| Método | Endpoint | Parâmetros | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Nenhum | Verificação de disponibilidade da API (Healthcheck). |
| `POST` | `/api/orders` | Body JSON (`tenantId` obrigatório) | Criação de um novo pedido para uma estação específica. |
| `GET` | `/api/orders/{stationId}` | `?tenantId={tenantId}` (Query) | Lista todos os pedidos ativos de uma estação de trabalho do tenant. |
| `PATCH` | `/api/orders/{stationId}/{orderId}/ready` | `?tenantId={tenantId}` (Query) | Marca um pedido como pronto/concluído (remove da fila ativa). |
| `GET` | `/api/orders/{stationId}/batch` | `?tenantId={tenantId}` (Query) | Obtém o agrupamento consolidado de itens em lote para a estação do tenant. |

---

### Exemplo de Payload para Criação de Pedido (`POST /api/orders`)

```json
{
  "tenantId": "restaurante_demo",
  "displayId": "#1042",
  "origin": "Salão",
  "stationId": "grelha",
  "items": [
    {
      "id": "item_1",
      "name": "Hambúrguer Artesanal",
      "quantity": 2,
      "modifiers": [
        {
          "id": "mod_1",
          "name": "Sem cebola",
          "type": "remove"
        }
      ]
    }
  ]
}
```

---

## ⚙️ Configuração de Variáveis de Ambiente e Credenciais

O backend necessita das credenciais do Firebase para comunicar com a base de dados.

### 1. Arquivo `.env`
Crie ou edite o arquivo `.env` na raiz da pasta `backend`:

```env
PORT=8585
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
FIREBASE_DATABASE_URL=https://kitchen-soft-default-rtdb.firebaseio.com
```

### 2. Chave de Serviço Firebase (`serviceAccountKey.json`)
Baixe o arquivo de chave privada da conta de serviço no Console do Firebase (Configurações do Projeto > Contas de serviço > Gerar nova chave privada) e salve-o com o nome `serviceAccountKey.json` na raiz da pasta `backend`.

> ⚠️ **Atenção**: Nunca comite o arquivo `serviceAccountKey.json` no controle de versão Git.

---

## 🚀 Como Executar e Compilar

### Requisitos Prévios
- **Go 1.22** ou superior instalado no ambiente.

### Executar em Modo de Desenvolvimento
Para rodar a aplicação diretamente sem gerar arquivo compilado:

```bash
go run cmd/server/main.go
```

A mensagem a seguir confirmará a inicialização:
```text
KDS PedroLPS Backend running on :8585
```

### Compilar o Binário de Produção
Para compilar o executável para produção:

- **Windows**:
  ```cmd
  go build -o server.exe cmd/server/main.go
  ```
- **Linux / macOS**:
  ```bash
  go build -o server cmd/server/main.go
  ```

Para executar o binário compilado:
```bash
./server.exe
```
