# Refatoração das Rotas - FrontComanda

Esta refatoração tem como objetivo organizar a estrutura de rotas da aplicação, aplicando princípios similares aos usados na refatoração da API.

## Estrutura de Pastas

```
src/routes/
├── index.ts                  # Exporta todos os componentes e utilitários
│
├── components/               # Componentes relacionados a rotas
│   ├── AppRouter.tsx         # Componente principal do router
│   └── index.ts              # Exporta os componentes
│
├── config/                   # Configuração de rotas
│   ├── paths.ts              # Constantes de caminhos
│   ├── routes.tsx            # Definição das rotas
│   ├── types.ts              # Tipos e interfaces
│   └── index.ts              # Exporta as configurações
│
├── guards/                   # Guards de proteção de rotas
│   ├── ProtectedRoute.tsx    # Protege rotas autenticadas
│   ├── PublicRoute.tsx       # Gerencia rotas públicas
│   ├── RoleBasedRedirect.tsx # Redirecionamento baseado em papel
│   └── index.ts              # Exporta os guards
│
├── hooks/                    # Hooks relacionados a navegação
│   ├── useAppNavigation.ts   # Hook de navegação com funcionalidades extras
│   ├── useRouteMatch.ts      # Hook para verificar correspondência de rota
│   └── index.ts              # Exporta os hooks
│
└── utils/                    # Utilitários para rotas
    ├── routeUtils.ts         # Funções utilitárias 
    └── index.ts              # Exporta os utilitários
```

## Como Usar o Novo Sistema de Rotas

### 1. Substituindo o Router Atual

O componente `AppRouter` é o substituto para o código de rotas no `App.tsx`:

```tsx
import { AuthProvider } from './modules/auth';
import { AppRouter } from './routes';
import { Box } from '@mui/material';

function App() {
  return (
    <AuthProvider>
      <AppRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Conteúdo global da aplicação (fora das rotas) */}
        </Box>
      </AppRouter>
    </AuthProvider>
  );
}
```

### 2. Usando os Paths Constantes

Substitua strings literais pelos caminhos constantes:

```tsx
import { PATHS, MANAGER_PATHS, WAITER_PATHS } from './routes';

// Exemplos de uso
const loginPath = PATHS.LOGIN;              // '/login'
const dashboardPath = MANAGER_PATHS.DASHBOARD;  // '/dashboard'
const waiterTablesPath = WAITER_PATHS.TABLES;   // '/waiter-tables'
```

### 3. Usando o Hook de Navegação

```tsx
import { useAppNavigation } from './routes';

function MyComponent() {
  const navigation = useAppNavigation();
  
  const handleLogin = () => {
    // Navega para o dashboard
    navigation.goTo(PATHS.DASHBOARD);
    
    // Ou navega para a página inicial baseada no papel do usuário
    navigation.goToRoleHome(user.role);
    
    // Navega para uma rota com parâmetros
    navigation.goToWithParams('/user/:id', { id: 123 });
  };
  
  return (
    <button onClick={handleLogin}>Login</button>
  );
}
```

### 4. Verificando a Rota Atual

```tsx
import { useRouteMatch } from './routes';

function MyComponent() {
  const isOnDashboard = useRouteMatch([PATHS.DASHBOARD, `${PATHS.DASHBOARD}/*`]);
  
  return (
    <div>
      {isOnDashboard ? 'Estamos no Dashboard' : 'Não estamos no Dashboard'}
    </div>
  );
}
```

## Benefícios da Nova Arquitetura

1. **Centralização**: Todas as rotas em um só lugar
2. **Constantes**: Evita erros de digitação em caminhos
3. **Tipagem**: Melhor suporte do TypeScript
4. **Manutenção**: Facilidade para adicionar/modificar rotas
5. **Testabilidade**: Componentes isolados facilitam testes

## Próximos Passos

1. Migrar `App.tsx` para usar o novo sistema de rotas
2. Remover os componentes de auth obsoletos após a migração
3. Substituir todas as strings literais de caminhos por constantes
4. Usar o hook de navegação em vez de `useNavigate` diretamente
