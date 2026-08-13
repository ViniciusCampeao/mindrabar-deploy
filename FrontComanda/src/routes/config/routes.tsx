import { RouteConfig } from './types';
import { PATHS, WAITER_PATHS } from './paths';
import Login from '../../pages/Login/Index';
import Register from '../../pages/Register/Index';
import Dashboard from '../../pages/Dashboard';
import WaiterTables from '../../pages/WaiterTables/Index';
import WaiterOrders from '../../pages/WaiterOrders/Index';
import SalesPage from '../../pages/Sales';
import QueuePage from '../../pages/Queue';
import { MenuPage } from '../../modules/menu';
import { OrdersPage } from '../../modules/orders';
import { MainLayout } from '../../layouts';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { PublicRoute } from '../guards/PublicRoute';
import { RoleBasedRedirect } from '../guards/RoleBasedRedirect';
import UserManagement from '../../pages/UserManagement';

/**
 * Public routes configuration (no authentication required)
 */
export const publicRoutes: RouteConfig[] = [
  {
    path: PATHS.LOGIN,
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
    isPublic: true
  }
];

/**
 * Protected routes configuration (authentication required)
 */
export const protectedRoutes: RouteConfig[] = [
  // Root path with role-based redirect
  {
    path: PATHS.ROOT,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleBasedRedirect />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  
  // Manager routes
  {
    path: PATHS.REGISTER,
    element: (
      <ProtectedRoute allowedRoles={['MANAGER']}>
        <MainLayout>
          <Register />
        </MainLayout>
      </ProtectedRoute>
    ),
    roles: ['MANAGER']
  },
  {
    path: PATHS.DASHBOARD,
    element: (
      <ProtectedRoute allowedRoles={['MANAGER']}>
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </ProtectedRoute>
    ),
    roles: ['MANAGER']
  },
  {
    path: PATHS.SALES,
    element: (
      <ProtectedRoute allowedRoles={['MANAGER']}>
        <MainLayout>
          <SalesPage />
        </MainLayout>
      </ProtectedRoute>
    ),
    roles: ['MANAGER']
  },
  {
    path: PATHS.QUEUE,
    element: (
      <ProtectedRoute allowedRoles={['MANAGER']}>
        <MainLayout>
          <QueuePage />
        </MainLayout>
      </ProtectedRoute>
    ),
    roles: ['MANAGER']
  },
  
  // Shared routes (both Manager and Waiter)
  {
    path: PATHS.TABLES,
    element: (
      <ProtectedRoute allowedRoles={['MANAGER', 'WAITER']}>
        <MainLayout>
          <WaiterTables />
        </MainLayout>
      </ProtectedRoute>
    ),
    roles: ['MANAGER', 'WAITER']
  },
  {
    path: WAITER_PATHS.TABLES,
    element: (
      <ProtectedRoute allowedRoles={['MANAGER', 'WAITER']}>
        <MainLayout>
          <WaiterTables />
        </MainLayout>
      </ProtectedRoute>
    ),
    roles: ['MANAGER', 'WAITER']
  },
  {
    path: PATHS.MENU,
    element: (
      <ProtectedRoute allowedRoles={['MANAGER', 'WAITER']}>
        <MainLayout>
          <MenuPage />
        </MainLayout>
      </ProtectedRoute>
    ),
    roles: ['MANAGER', 'WAITER']
  },
  {
    path: PATHS.ORDERS,
    element: (
      <ProtectedRoute allowedRoles={['MANAGER', 'WAITER']}>
        <MainLayout>
          <OrdersPage />
        </MainLayout>
      </ProtectedRoute>
    ),
    roles: ['MANAGER', 'WAITER']
  },
  
  // Waiter specific routes
  {
    path: WAITER_PATHS.ORDERS,
    element: (
      <ProtectedRoute allowedRoles={['WAITER']}>
        <MainLayout>
          <WaiterOrders />
        </MainLayout>
      </ProtectedRoute>
    ),
    roles: ['WAITER']
  },
  
  // User Management route (Manager only)
  {
    path: PATHS.USER_MANAGEMENT,
    element: (
      <ProtectedRoute allowedRoles={['MANAGER']}>
        <MainLayout>
          <UserManagement />
        </MainLayout>
      </ProtectedRoute>
    ),
    roles: ['MANAGER']
  }
];

/**
 * All routes combined (public + protected)
 */
export const routes: RouteConfig[] = [...publicRoutes, ...protectedRoutes];
