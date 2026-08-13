# Refatoração da API - FrontComanda

Esta refatoração tem como objetivo desacoplar a lógica de comunicação com a API e melhorar a arquitetura do projeto, seguindo princípios SOLID, DDD e padrão Ports/Adapters.

## Estrutura de Pastas

```
src/api/
├── endpoints.ts          # Centraliza todos os endpoints da API
├── httpClient.ts         # Cliente HTTP com interface e implementação
├── index.ts              # Exporta todos os serviços
│
├── auth/                 # Domínio de autenticação
│   ├── auth.interface.ts # Interface do serviço
│   ├── auth.service.ts   # Implementação
│   └── index.ts          # Exporta interfaces e serviço
│
├── users/                # Domínio de usuários
├── tables/               # Domínio de mesas
├── orders/               # Domínio de pedidos
├── items/                # Domínio de itens
└── products/             # Domínio de produtos
```

## Como Usar a Nova API

### 1. Importando os Serviços

```typescript
// Importar um serviço específico
import { authService } from '@/api/auth';
import { tableService } from '@/api/tables';
import { orderService } from '@/api/orders';
import { itemService } from '@/api/items';
import { productService } from '@/api/products';
import { userService } from '@/api/users';

// Ou importar todos os serviços
import { authService, tableService, orderService, itemService, productService, userService } from '@/api';
```

### 2. Usando os Endpoints Diretamente

Se você precisar acessar os endpoints diretamente:

```typescript
import { AUTH, TABLES, ORDERS, ITEMS, PRODUCTS } from '@/api/endpoints';

// Exemplos de uso
const loginEndpoint = AUTH.LOGIN;               // '/auth/login'
const tableEndpoint = TABLES.BY_ID(1);          // '/table/1'
const orderEndpoint = ORDERS.BY_TABLE(2);       // '/order/table/2'
const itemEndpoint = ITEMS.BY_ORDER(3);         // '/item/order/3'
const productEndpoint = PRODUCTS.BY_COMPANY(1); // '/product/company?companyId=1'
```

### 3. Usando o Cliente HTTP Diretamente

Se você precisar usar o cliente HTTP para casos não cobertos pelos serviços:

```typescript
import { httpClient } from '@/api/httpClient';

// Exemplos de uso
const response = await httpClient.get('/custom/endpoint');
const response = await httpClient.post('/custom/endpoint', data);
```

## Migração Gradual

A refatoração atual permite uma migração gradual, pois mantém compatibilidade com o código existente. O arquivo `services/api.ts` ainda existe, mas está marcado como obsoleto e redirecionará para a nova implementação.

## Benefícios da Nova Arquitetura

1. **Separação de Responsabilidades**: Cada domínio tem seu próprio módulo
2. **Reutilização de Código**: Evita duplicação de código
3. **Testabilidade**: Interfaces facilitam a criação de mocks para testes
4. **Manutenção**: Facilita encontrar e modificar código específico
5. **Escalabilidade**: Facilita adicionar novos endpoints e domínios

## Próximos Passos

1. Migrar todos os componentes para usar a nova API
2. Remover código obsoleto
3. Adicionar testes unitários
4. Melhorar tratamento de erros e validação
