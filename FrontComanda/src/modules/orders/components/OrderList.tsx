import React from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ReceiptLong as ReceiptIcon,
  Payment as PaymentIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import type { Order, Table } from "../../shared/types/common.types";
import OrdersService from "../../../services/Orders";
import OrderDetail from "./OrderDetail";
import { useAuth } from "../../../modules/auth";
import { TableCheckoutDialog, PartialPaymentDialog } from "./ui";
import { TransferOrderDialog } from "./TransferOrderDialog";
import TablesService from "../../../services/Tables/tablesService";
import { itemService } from "../../../api/items";
import { ItemStatus } from "../../../types/item";
import { httpClient } from "../../../api/httpClient";
import { tableSessionService } from "../../../api/customer";
import { PRINT } from "../../../api/endpoints";
// Importe inline para contornar o problema
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

interface OrderListProps {
  table: Table;
  onClose: () => void;
  onOrderCreated?: () => void;
  onOrderUpdated?: () => void;
}

const OrderList = ({
  table,
  onClose,
  onOrderCreated,
  onOrderUpdated,
}: OrderListProps) => {
  const [orders, setOrders] = React.useState([]);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [orderToDelete, setOrderToDelete] = React.useState(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  
  // Estados para fechamento de mesa
  const [tableCheckoutDialogOpen, setTableCheckoutDialogOpen] = React.useState(false);
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  
  // Estados para pagamento parcial
  const [partialPaymentDialogOpen, setPartialPaymentDialogOpen] = React.useState(false);
  const [partialPaymentLoading, setPartialPaymentLoading] = React.useState(false);
  
  // Estado para mesas disponíveis (para transferência)
  const [availableTables, setAvailableTables] = React.useState([]);

  // Função para forçar atualização dos pedidos
  const forceRefresh = React.useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Carrega os pedidos quando o componente é montado ou quando há trigger de atualização
  React.useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]); // Adicionada dependência do refreshTrigger para permitir atualizações controladas

  // Verificar token ao montar o componente
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Você precisa estar autenticado para gerenciar pedidos");
      setShowError(true);
    }
  }, []);

  // Buscar mesas disponíveis para transferência
  React.useEffect(() => {
    const fetchTables = async () => {
      try {
        const allTables = await TablesService.getAllTables();
        // Filtrar para remover a mesa atual e mapear para o formato necessário
        const tablesForTransfer = allTables
          .filter(t => t.id !== table.id)
          .map(t => ({ id: t.id, name: t.name || `Mesa ${t.number}` }));
        setAvailableTables(tablesForTransfer);
      } catch (error) {
        console.error("Erro ao buscar mesas:", error);
      }
    };
    fetchTables();
  }, [table.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await OrdersService.getOrdersByTable(table.id);
      setOrders(data);
      
      // Atualizar o pedido selecionado, se houver
      if (selectedOrder) {
        const updatedSelectedOrder = data.find(
          order => order.id === selectedOrder.id
        );
        if (updatedSelectedOrder) {
          setSelectedOrder(updatedSelectedOrder);
        }
      }
      
      // Removido a notificação automática do componente pai para evitar ciclo infinito
      // onOrderUpdated será chamado apenas quando realmente houver uma ação do usuário
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Estados para o dialog de impressão da comanda de preparo
  const [printDialogOpen, setPrintDialogOpen] = React.useState(false);
  const [pendingItemsLoading, setPendingItemsLoading] = React.useState(false);
  const [confirmPrintLoading, setConfirmPrintLoading] = React.useState(false);
  const [pendingItems, setPendingItems] = React.useState<
    { itemId: number; orderId: number; productName: string; quantity: number }[]
  >([]);

  // Verificar permissão do usuário para criar pedidos
  const canCreateOrder =
    user && (user.role === "MANAGER" || user.role === "WAITER");

  // Verificar permissão do usuário para fechar mesa (apenas gerentes)
  const canCloseTable = user && user.role === "MANAGER";

  // Garçom e gerente podem solicitar impressão via API
  const canPrintOrder =
    user && (user.role === "MANAGER" || user.role === "WAITER" || user.role === "ADMIN");

  // Handler para sucesso na transferência de pedido
  const handleTransferSuccess = (response) => {
    console.log("Pedido transferido com sucesso:", response);
    setErrorMessage(`Pedido transferido com sucesso para a mesa ID: ${response.tableId}`);
    setShowError(true);
    
    // Atualizar a lista de pedidos
    forceRefresh();
    
    // Notificar o componente pai
    if (onOrderUpdated) {
      onOrderUpdated();
    }
  };

  const handleCreateOrder = async () => {
    try {
      // Verificar se o usuário tem permissão para criar pedidos
      if (!canCreateOrder) {
        const msg = !user
          ? "Você precisa estar autenticado para criar pedidos"
          : "Você não tem permissão para criar pedidos. Apenas gerentes e garçons podem criar pedidos.";

        setErrorMessage(msg);
        setShowError(true);
        return;
      }

      setLoading(true);
      // Tentar com estrutura completa do pedido
      const orderData = {
        items: [],
        tableId: table.id,
        status: "OPEN", // Explicitamente definir o status como OPEN
        userId: user?.userId, // Incluir o ID do usuário atual
      };

      await OrdersService.createOrder(orderData);
      forceRefresh();
      if (onOrderCreated) onOrderCreated();
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao criar pedido"
      );
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmDialog = (orderId: number) => {
    setOrderToDelete(orderId);
    setConfirmDialogOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (orderToDelete === null) return;

    try {
      setLoading(true);
      await OrdersService.deleteOrder(orderToDelete);
      forceRefresh();
      if (onOrderUpdated) onOrderUpdated();
    } catch (error) {
      console.error("Erro ao excluir pedido:", error);
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const calculateOrderTotal = (order: Order) => {
    // Usar o total do backend (totalAmount) em vez de calcular manualmente
    // Isso garante que pagamentos parciais sejam refletidos corretamente
    return order.total || 0;
  };

  /**
   * Abre o diálogo de fechamento de mesa
   */
  const handleOpenTableCheckout = () => {
    // Filtrar apenas pedidos abertos
    const openOrders = orders.filter(order => order.status === "open");
    
    if (openOrders.length === 0) {
      setErrorMessage("Não há pedidos abertos para fechar nesta mesa.");
      setShowError(true);
      return;
    }
    
    setTableCheckoutDialogOpen(true);
  };

  /**
   * Confirma o fechamento de todos os pedidos da mesa
   */
  const handleConfirmTableCheckout = async (paid: number, change: number, paymentMethod: string, cnpj?: string) => {
    try {
      setCheckoutLoading(true);
      
      // Filtrar apenas pedidos abertos
      const openOrders = orders.filter(order => order.status === "open");
      
      if (openOrders.length === 0) {
        setErrorMessage("Não há pedidos abertos para fechar.");
        setShowError(true);
        return;
      }
      
      // Agregar todos os itens de todos os pedidos
      const allItems = openOrders.flatMap(order => order.items);
      
      // Calcular o total da mesa usando os valores do backend
      const tableTotal = openOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Usar o ID do primeiro pedido (necessário para o backend processar)
      const firstOrderId = openOrders[0]?.id || 0;
      
      // Tentar imprimir o recibo da mesa
      try {
        await PrinterService.printReceipt(
          { id: firstOrderId, tableId: table.id, tableName: table.name, isTableCheckout: true }, // isTableCheckout indica fechamento de mesa completa
          allItems,
          { total: tableTotal, paid, change, paymentMethod },
          cnpj
        );
        console.log("Impressão enviada com sucesso");
      } catch (error) {
        console.warn("Falha ao imprimir recibo, continuando com o fechamento:", error);
        setErrorMessage("Não foi possível imprimir o recibo, mas os pedidos serão fechados.");
        setShowError(true);
      }
      
      // Fechar cada pedido individualmente
      const closePromises = openOrders.map(order => OrdersService.closeOrder(order.id));
      await Promise.all(closePromises);

      // Encerrar também as sessões de clientes (QR Code) abertas nesta mesa
      try {
        await tableSessionService.closeByTable(table.id);
      } catch (sessionError) {
        console.error("Erro ao encerrar sessões de QR Code da mesa:", sessionError);
      }

      setErrorMessage("");
      setShowError(false);
      
      // Mostrar mensagem de sucesso
      setErrorMessage("");
      
      // Atualizar a lista de pedidos
      forceRefresh();
      if (onOrderUpdated) onOrderUpdated();
      
      // Fechar o diálogo com um pequeno delay
      setTimeout(() => {
        setTableCheckoutDialogOpen(false);
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao fechar mesa:", error);
      setErrorMessage("Erro ao fechar a mesa. Tente novamente.");
      setShowError(true);
    } finally {
      setCheckoutLoading(false);
    }
  };

  /**
   * Abre o diálogo de pagamento parcial
   */
  const handleOpenPartialPayment = () => {
    const openOrders = orders.filter(order => order.status === "open");
    
    if (openOrders.length === 0) {
      setErrorMessage("Não há pedidos abertos para fazer pagamento parcial.");
      setShowError(true);
      return;
    }
    
    setPartialPaymentDialogOpen(true);
  };

  /**
   * Processa o pagamento parcial
   */
  const handleConfirmPartialPayment = async (amount: number, paymentMethod: string) => {
    try {
      setPartialPaymentLoading(true);
      
      // Filtrar apenas pedidos abertos
      const openOrders = orders.filter(order => order.status === "open");
      
      if (openOrders.length === 0) {
        setErrorMessage("Não há pedidos abertos.");
        setShowError(true);
        return;
      }

      let remainingAmount = amount;
      const paidOrders: Order[] = [];
      
      // Processar pagamentos na ordem dos pedidos
      for (const order of openOrders) {
        if (remainingAmount <= 0) break;
        
        const orderTotal = order.total || 0;
        const paymentForThisOrder = Math.min(remainingAmount, orderTotal);
        
        // Registrar pagamento para este pedido
        await OrdersService.registerPayment(
          order.id,
          paymentMethod as 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX',
          paymentForThisOrder
        );
        
        paidOrders.push(order);
        remainingAmount -= paymentForThisOrder;
      }
      
      // Recarregar pedidos para obter valores atualizados
      await fetchOrders();
      
      // Buscar pedidos atualizados para impressão
      const updatedOrders = await Promise.all(
        paidOrders.map(order => OrdersService.getOrderById(order.id))
      );
      
      // Agregar itens de todos os pedidos pagos
      const allItems = updatedOrders.flatMap(order => order?.items || []);
      
      // Usar o ID do primeiro pedido pago
      const firstPaidOrderId = paidOrders[0]?.id || 0;
      
      // Calcular totais
      const totalPaid = amount;
      const totalRemaining = openOrders.reduce((sum, order) => sum + (order.total || 0), 0) - amount;
      
      // Imprimir comanda parcial
      try {
        await PrinterService.printReceipt(
          { id: firstPaidOrderId, tableId: table.id, tableName: table.name },
          allItems,
          { 
            total: totalPaid, 
            paid: totalPaid, 
            change: 0,
            paymentMethod 
          },
          `PAGAMENTO PARCIAL - Restante: ${formatCurrency(totalRemaining)}`
        );
        console.log("Comanda parcial impressa com sucesso");
      } catch (error) {
        console.warn("Falha ao imprimir comanda parcial:", error);
        setErrorMessage("Pagamento registrado, mas não foi possível imprimir a comanda.");
        setShowError(true);
      }
      
      // Atualizar e fechar diálogo
      if (onOrderUpdated) onOrderUpdated();
      
      setTimeout(() => {
        setPartialPaymentDialogOpen(false);
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao processar pagamento parcial:", error);
      setErrorMessage("Erro ao processar pagamento parcial. Tente novamente.");
      setShowError(true);
    } finally {
      setPartialPaymentLoading(false);
    }
  };


  // Abre o dialog e carrega os itens PENDING dos pedidos abertos
  const handlePrintOrder = async () => {
    setPrintDialogOpen(true);
    setPendingItemsLoading(true);
    try {
      const openOrders = orders.filter(o => o.status === "open");
      const collected: { itemId: number; orderId: number; productName: string; quantity: number }[] = [];

      for (const order of openOrders) {
        const rawItems = await itemService.getItemsByOrder(order.id);
        const pending = rawItems.filter(i => i.status === ItemStatus.PENDING);
        for (const raw of pending) {
          const match = order.items.find(i => i.menuItemId === raw.productId);
          collected.push({
            itemId: raw.itemId,
            orderId: order.id,
            productName: match?.menuItem?.name || `Produto #${raw.productId}`,
            quantity: raw.quantity,
          });
        }
      }
      setPendingItems(collected);
    } catch (error) {
      console.error("Erro ao carregar itens pendentes:", error);
      setErrorMessage("Erro ao carregar itens pendentes.");
      setShowError(true);
      setPrintDialogOpen(false);
    } finally {
      setPendingItemsLoading(false);
    }
  };

  // Confirma impressão: envia para API e atualiza status para PREPARING
  const handleConfirmPrint = async () => {
    if (pendingItems.length === 0) return;
    setConfirmPrintLoading(true);
    try {
      const tableName = table.name || `Mesa ${table.number}`;
      const line = "================================";
      const divider = "--------------------------------";
      const hoje = new Date();
      const data = `${hoje.getDate().toString().padStart(2, "0")}/${(hoje.getMonth() + 1).toString().padStart(2, "0")}/${hoje.getFullYear()}`;
      const hora = `${hoje.getHours().toString().padStart(2, "0")}:${hoje.getMinutes().toString().padStart(2, "0")}`;

      let content = `${line}\n     COMANDA DE PREPARO\n${line}\n`;
      content += `Mesa: ${tableName}\nData: ${data}  Hora: ${hora}\n${line}\n`;

      const grouped: Record<number, typeof pendingItems> = {};
      pendingItems.forEach(item => {
        if (!grouped[item.orderId]) grouped[item.orderId] = [];
        grouped[item.orderId].push(item);
      });

      Object.entries(grouped).forEach(([orderId, items]) => {
        content += `Pedido #${orderId}\n${divider}\n`;
        items.forEach(item => { content += `  ${item.quantity}x ${item.productName}\n`; });
        content += `${line}\n`;
      });

      await httpClient.post(PRINT.SEND, {
        content,
        type: "receipt",
        timestamp: new Date().toISOString(),
      });

      await Promise.all(
        pendingItems.map(item => itemService.updateItemStatus(item.itemId, ItemStatus.PREPARING))
      );

      setSuccessMessage("Comanda enviada! Itens marcados como Em Preparo.");
      setShowSuccess(true);
      setPrintDialogOpen(false);
      forceRefresh();
      if (onOrderUpdated) onOrderUpdated();
    } catch (error) {
      console.error("Erro ao confirmar impressão:", error);
      setErrorMessage(error instanceof Error ? error.message : "Erro ao confirmar impressão");
      setShowError(true);
    } finally {
      setConfirmPrintLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          Pedidos da {table.name}
          {table.name && (
            <Typography component="span" sx={{ fontWeight: "normal", ml: 1 }}>
            </Typography>
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOrder}
            disabled={loading}
          >
            Novo Pedido
          </Button>
          {orders.filter(order => order.status === "open").length > 0 && canPrintOrder && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrintOrder}
              disabled={loading}
            >
              Imprimir Comanda
            </Button>
          )}
          {orders.filter(order => order.status === "open").length > 0 && canCloseTable && (
            <>
              <Button
                variant="contained"
                color="warning"
                startIcon={<PaymentIcon />}
                onClick={handleOpenPartialPayment}
                disabled={loading}
              >
                Parcial
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<ReceiptIcon />}
                onClick={handleOpenTableCheckout}
                disabled={loading}
              >
                Fechar Mesa
              </Button>
            </>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <ReceiptIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            Esta mesa não possui pedidos
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={handleCreateOrder}
            disabled={!canCreateOrder}
            title={
              !canCreateOrder ? "Você não tem permissão para criar pedidos" : ""
            }
          >
            Criar Primeiro Pedido
          </Button>
        </Paper>
      ) : (
        <List
          sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 1 }}
          component={Paper}
        >
          {orders.map(order => (
            <Box key={order.id}>
              <ListItem
                onClick={() => setSelectedOrder(order)}
                sx={{
                  py: 1.5,
                  opacity: order.status === "closed" ? 0.7 : 1,
                  bgcolor:
                    order.status === "closed" ? "action.hover" : "inherit",
                  cursor: "pointer",
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        Pedido #{order.id}
                      </Typography>
                      {order.status === "closed" && (
                        <Chip
                          label="Finalizado"
                          size="small"
                          color="success"
                          sx={{ height: 20 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        component="span"
                        display="block"
                      >
                        Criado em: {formatDate(order.createdAt)}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 0.5,
                        }}
                      >
                        <span>{order.items.length} itens</span>
                        <span style={{ fontWeight: 500 }}>
                          Total: {formatCurrency(calculateOrderTotal(order))}
                        </span>
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  {order.status === "open" ? (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Excluir pedido">
                        <IconButton
                          edge="end"
                          aria-label="excluir"
                          onClick={e => {
                            e.stopPropagation();
                            openDeleteConfirmDialog(order.id);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Tooltip title="Ver detalhes">
                      <IconButton
                        edge="end"
                        aria-label="ver detalhes"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              
              {/* Botão de transferência para pedidos abertos */}
              {order.status === "open" && availableTables.length > 0 && (
                <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "flex-end" }}>
                  <TransferOrderDialog
                    orderId={order.id}
                    tables={availableTables}
                    onSuccess={handleTransferSuccess}
                  />
                </Box>
              )}
              
              <Divider component="li" />
            </Box>
          ))}
        </List>
      )}

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={onClose}>Voltar</Button>
      </Box>

      {/* Snackbar para mensagens de erro */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar para mensagens de sucesso */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este pedido? Esta ação não pode ser
            desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteOrder} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Componente de detalhes do pedido */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <OrderDetail 
              orderId={selectedOrder.id}
              order={selectedOrder}
              table={table}
              onOrderItemsChanged={forceRefresh}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedOrder(null)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Dialog de preview da comanda de preparo */}
      <Dialog
        open={printDialogOpen}
        onClose={() => !confirmPrintLoading && setPrintDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Comanda de Preparo — {table.name || `Mesa ${table.number}`}
        </DialogTitle>
        <DialogContent dividers>
          {pendingItemsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : pendingItems.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              Não há itens pendentes para enviar ao preparo.
            </Typography>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Os itens abaixo serão enviados para impressão e marcados como <strong>Em Preparo</strong>:
              </Typography>
              {/* Agrupa por pedido */}
              {Array.from(new Set(pendingItems.map(i => i.orderId))).map(orderId => (
                <Box key={orderId} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Pedido #{orderId}
                  </Typography>
                  <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <List dense disablePadding>
                      {pendingItems.filter(i => i.orderId === orderId).map((item, idx) => (
                        <ListItem key={idx} divider>
                          <ListItemText
                            primary={item.productName}
                            secondary={`Qtd: ${item.quantity}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setPrintDialogOpen(false)}
            disabled={confirmPrintLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={confirmPrintLoading ? <CircularProgress size={18} color="inherit" /> : <PrintIcon />}
            onClick={handleConfirmPrint}
            disabled={pendingItemsLoading || pendingItems.length === 0 || confirmPrintLoading}
          >
            {confirmPrintLoading ? "Enviando..." : "Confirmar Impressão"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de fechamento de mesa */}
      <TableCheckoutDialog
        open={tableCheckoutDialogOpen}
        onClose={() => setTableCheckoutDialogOpen(false)}
        table={table}
        orders={orders.filter(order => order.status === "open")}
        onConfirmCheckout={handleConfirmTableCheckout}
        loading={checkoutLoading}
      />
      
      {/* Diálogo de pagamento parcial */}
      <PartialPaymentDialog
        open={partialPaymentDialogOpen}
        onClose={() => setPartialPaymentDialogOpen(false)}
        orders={orders.filter(order => order.status === "open")}
        onConfirmPayment={handleConfirmPartialPayment}
        loading={partialPaymentLoading}
      />
    </>
  );
};

export default OrderList;
