# FrontComanda - Sistema de Comandas Digitais

Sistema de gerenciamento de comandas digitais para restaurantes, desenvolvido com React, TypeScript, Material UI e Vite.

## Estrutura do Projeto

```
src/
  ├── components/            # Componentes reutilizáveis da aplicação
  │   ├── auth/              # Componentes relacionados à autenticação
  │   ├── navigation/        # Componentes de navegação (header, menu, etc.)
  │   └── ui/                # Componentes de UI básicos
  ├── layouts/               # Layouts reutilizáveis para as páginas
  ├── modules/               # Módulos da aplicação (organização por domínio)
  │   ├── auth/              # Autenticação e autorização
  │   │   ├── components/    # Componentes do módulo
  │   │   ├── contexts/      # Contextos relacionados à autenticação
  │   │   ├── services/      # Serviços de autenticação
  │   │   └── types/         # Tipos relacionados à autenticação
  │   ├── dashboard/         # Módulo do dashboard
  │   ├── menu/              # Módulo do cardápio
  │   ├── orders/            # Módulo de pedidos
  │   ├── shared/            # Recursos compartilhados entre módulos
  │   ├── tables/            # Módulo de mesas
  │   └── users/             # Módulo de usuários
  ├── pages/                 # Páginas da aplicação
  ├── services/              # Serviços globais
  └── types/                 # Tipos globais
```

## Executando o Projeto

### Requisitos
- Node.js
- npm ou yarn

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```