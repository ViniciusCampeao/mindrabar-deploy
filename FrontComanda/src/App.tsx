import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import { AuthProvider } from "./modules/auth";
import { ThemeModeProvider } from "./contexts/ThemeContext";
import {
  ProtectedRoute,
  PublicRoute,
  RoleBasedRedirect,
} from "./components/auth";
import { MainLayout } from "./layouts";
import Login from "./pages/Login/Index";
import Dashboard from "./pages/Dashboard";
import WaiterTables from "./pages/WaiterTables/Index";
import WaiterOrders from "./pages/WaiterOrders/Index";
import SalesPage from "./pages/Sales";
import QueuePage from "./pages/Queue";
import UserManagement from "./pages/UserManagement";
import QrOrdersPage from "./pages/QrOrders/Index";
import CustomerOrderPage from "./pages/CustomerOrder/Index";
import { MenuPage } from "./modules/menu";
import { OrdersPage } from "./modules/orders";
import "./App.css";

function App() {
  return (
    <ThemeModeProvider>
      <CssBaseline />
      <AuthProvider>
        <Router>
        <Box
          sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <Routes>
            <Route path="/mesa/:qrToken" element={<CustomerOrderPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <RoleBasedRedirect />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tables"
              element={
                <ProtectedRoute allowedRoles={["MANAGER", "WAITER"]}>
                  <MainLayout>
                    <WaiterTables />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/waiter-tables"
              element={
                <ProtectedRoute allowedRoles={["MANAGER", "WAITER"]}>
                  <MainLayout>
                    <WaiterTables />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu"
              element={
                <ProtectedRoute allowedRoles={["MANAGER", "WAITER"]}>
                  <MainLayout>
                    <MenuPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["MANAGER", "WAITER"]}>
                  <MainLayout>
                    <OrdersPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                  <MainLayout>
                    <SalesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/queue"
              element={
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                  <MainLayout>
                    <QueuePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/waiter-orders"
              element={
                <ProtectedRoute allowedRoles={["WAITER"]}>
                  <MainLayout>
                    <WaiterOrders />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                  <MainLayout>
                    <UserManagement />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/qr-orders"
              element={
                <ProtectedRoute allowedRoles={["MANAGER", "WAITER"]}>
                  <MainLayout>
                    <QrOrdersPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
