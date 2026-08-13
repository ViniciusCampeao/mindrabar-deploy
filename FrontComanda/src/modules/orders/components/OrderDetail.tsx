/**
 * Componente de detalhes do pedido, refatorado para melhor organização
 */
import React, { useEffect } from "react";
import { 
  Box, Paper, Typography, Grid, Card, CardContent,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../modules/auth/contexts/AuthContext";
import OrdersService from "../../../services/Orders";
import TablesService from "../../../services/Tables/tablesService";
import { formatCurrency } from "../../../utils/formatters/currencyFormat";
import PrinterService from "../../../services/PrinterService";
import { useOrderItems, useMenuItems } from "../hooks";
import { CheckoutDialog, ItemForm, OrderItemsList } from "./ui";
import { Order, Table } from "../../shared/types/common.types";

interface OrderDetailProps {
  orderId?: number;
  order?: Order; // Objeto completo do pedido, como no código original
  table?: Table; // Objeto completo da mesa
  onOrderItemsChanged?: () => void; // Callback para notificar quando os itens do pedido mudaram
}

/**
 * Componente que exibe os detalhes de um pedido, incluindo itens, valor total
 * e funcionalidades para adicionar ou remover itens e finalizar o pedido
 */
const OrderDetail: React.FC<OrderDetailProps> = ({ orderId: propOrderId, order: propOrder, table: propTable, onOrderItemsChanged }) => {
  // Obtém o ID do pedido das props ou dos parâmetros da rota
  const { id } = useParams();
  const orderId = propOrderId || (propOrder?.id) || Number(id);
  
  // Estado para armazenar o objeto order completo
  const [order, setOrder] = React.useState(propOrder || null as Order | null);
  
  // Estado para armazenar o objeto table completo
  const [table, setTable] = React.useState(propTable || null as Table | null);
  
  // Obtém o usuário logado
  const { user } = useAuth();
  
  // Estado para controle do modal de fechamento
  const [checkoutDialogOpen, setCheckoutDialogOpen] = React.useState(false);
  
  // Estado para indicar se o pedido está fechado
  const [isOrderClosed, setIsOrderClosed] = React.useState(false);
  
  // Estado para controle de carregamento durante o checkout
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  
  // Estado para controle de mensagens
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);
  
  // Estado para diálogo de ajuda da impressora
  const [helpDialogOpen, setHelpDialogOpen] = React.useState(false);
  
  // Hook para gerenciar itens do pedido
  const { 
    orderItems, 
    loading: itemsLoading,
    addItem,
    removeItem,
    calculateTotal
  } = useOrderItems({
    orderId,
    initialItems: order?.items, // Usa items do order se disponível
    // Removemos o callback onOrderUpdated para evitar o ciclo infinito
  });
  
  // Hook para gerenciar itens do menu
  const {
    filteredMenuItems,
    menuSearchTerm,
    setMenuSearchTerm,
    loadMenuItems,
    loading: menuLoading
  } = useMenuItems();
  
  // A função checkOrderStatus foi removida para evitar o looping infinito
  
  // Carrega os dados iniciais ao montar o componente
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('[DEBUG] Carregando dados iniciais, orderId:', orderId);
      
      // Carrega itens do menu sempre
      loadMenuItems();
      
      // Verifica se temos o objeto order completo das props
      if (propOrder) {
        console.log('[DEBUG] Usando objeto order das props');
        setIsOrderClosed(propOrder.status === "closed");
        return;
      }
      
      try {
        // Primeiro verifica o status do pedido
        console.log('[DEBUG] Verificando status do pedido da API');
        const fetchedOrder = await OrdersService.getOrderById(orderId);
        
        if (fetchedOrder) {
          console.log('[DEBUG] Pedido obtido com sucesso:', fetchedOrder);
          setOrder(fetchedOrder);
          setIsOrderClosed(fetchedOrder.status === "closed");
          
          // Buscar informações da mesa se não foi passada como prop
          if (!propTable && fetchedOrder.tableId) {
            try {
              const allTables = await TablesService.getAllTables();
              const foundTable = allTables.find(t => t.id === fetchedOrder.tableId);
              if (foundTable) {
                setTable(foundTable);
              }
            } catch (error) {
              console.warn('[DEBUG] Erro ao buscar informações da mesa:', error);
            }
          }
        } else {
          console.error('[DEBUG] Pedido não encontrado');
          setErrorMessage("Não foi possível carregar os detalhes do pedido.");
          setShowError(true);
        }
      } catch (error) {
        console.error("[DEBUG] Erro ao verificar status do pedido:", error);
        setErrorMessage("Erro ao verificar status do pedido. Tente novamente.");
        setShowError(true);
      }
    };
    
    loadInitialData();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  /**
   * Adiciona um item ao pedido
   */
  const handleAddItem = async (menuItemId: number, quantity: number) => {
    let userId = user?.userId;
    
    // Se não tiver o ID do usuário no contexto de auth, tenta obter do localStorage
    if (!userId) {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const userFromStorage = JSON.parse(userData);
          userId = userFromStorage.userId || userFromStorage.id;
        } catch {
          setErrorMessage("Erro ao processar dados do usuário. Por favor, faça login novamente.");
          setShowError(true);
          return false;
        }
      }
    }
    
    if (!userId) {
      setErrorMessage("Usuário não identificado. Por favor, faça login novamente.");
      setShowError(true);
      console.error("Usuário não logado");
      return false;
    }
    
    // Validar se o ID é um número válido
    userId = Number(userId);
    if (isNaN(userId)) {
      setErrorMessage("ID de usuário inválido. Por favor, faça login novamente.");
      setShowError(true);
      console.error("ID de usuário inválido");
      return false;
    }
    
    try {
      const result = await addItem(menuItemId, quantity, userId);
      if (result) {
        setSuccessMessage("Item adicionado com sucesso!");
        setShowSuccess(true);
        // Notificar o componente pai que os itens do pedido mudaram
        if (onOrderItemsChanged) {
          onOrderItemsChanged();
        }
      }
      return result;
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
      console.error('[DEBUG] Erro ao adicionar item:', errorMsg);
      setErrorMessage(`Erro ao adicionar item: ${errorMsg}`);
      setShowError(true);
      return false;
    }
  };
  
  /**
   * Remove um item do pedido
   */
  const handleRemoveItem = async (itemId: number) => {
    try {
      const result = await removeItem(itemId);
      if (result) {
        setSuccessMessage("Item removido com sucesso!");
        setShowSuccess(true);
        // Notificar o componente pai que os itens do pedido mudaram
        if (onOrderItemsChanged) {
          onOrderItemsChanged();
        }
      } else {
        setErrorMessage("Não foi possível remover o item. Tente novamente.");
        setShowError(true);
      }
      return result;
    } catch (error) {
      console.error("Erro ao remover item:", error);
      setErrorMessage("Erro ao remover item. Tente novamente.");
      setShowError(true);
      return false;
    }
  };
  
  /**
   * Abre o diálogo de fechamento de conta
   */
  const handleOpenCheckoutDialog = () => {
    setCheckoutDialogOpen(true);
  };
  
  /**
   * Fecha o diálogo de fechamento de conta
   */
  const handleCloseCheckoutDialog = () => {
    setCheckoutDialogOpen(false);
  };

  /**
   * Prepara e envia os dados para impressão da comanda térmica
   */
  const printReceipt = async (paid: number, change: number, paymentMethod?: string, cnpj?: string) => {
    try {
      console.log('[DEBUG] Iniciando processo de impressão');
      
      // Obter detalhes da mesa
      const order = await OrdersService.getOrderById(orderId);
      
      if (!order) {
        throw new Error("Pedido não encontrado");
      }
      
      return await PrinterService.printReceipt(
        { 
          id: orderId, 
          tableId: order.tableId,
          tableName: table?.name || `Mesa ${order.tableId}` // Usa o nome da mesa se disponível
        }, 
        orderItems,
        { total: calculateTotal(), paid, change, paymentMethod },
        cnpj // Passar o CNPJ manual se fornecido
      );
    } catch (error) {
      console.error("Erro ao imprimir comanda:", error);
      return false;
    }
  };

  /**
   * Confirma o fechamento da conta e finaliza o pedido
   */
  const handleConfirmCheckout = async (paid: number, change: number, paymentMethod: string, cnpj?: string) => {
    try {
      setCheckoutLoading(true);
      
      // Tenta imprimir o recibo primeiro
      try {
        await printReceipt(paid, change, paymentMethod, cnpj);
        console.log("Impressão enviada com sucesso");
        setSuccessMessage("Impressão enviada com sucesso!");
        setShowSuccess(true);
      } catch (error) {
        // Se a impressão falhar, ainda assim continua com o fechamento
        console.warn("Falha ao imprimir recibo, continuando com o fechamento:", error);
        setErrorMessage("Não foi possível imprimir o recibo, mas o pedido será fechado.");
        setShowError(true);
      }
      
      // Fecha o pedido no sistema
      const success = await OrdersService.closeOrder(orderId);
      
      if (success) {
        setSuccessMessage("Conta fechada com sucesso!");
        setShowSuccess(true);
        setIsOrderClosed(true);
        
        // Notificar o componente pai que o pedido foi alterado
        if (onOrderItemsChanged) {
          onOrderItemsChanged();
        }
        
        // Fechar o diálogo com um pequeno delay para que o usuário veja a confirmação
        setTimeout(() => {
          setCheckoutDialogOpen(false);
        }, 1500);
      } else {
        setErrorMessage("Falha ao fechar o pedido. Tente novamente.");
        setShowError(true);
        console.error("Falha ao fechar o pedido");
      }
    } catch (error) {
      setErrorMessage("Erro ao processar fechamento. Tente novamente.");
      setShowError(true);
      console.error("Erro ao processar fechamento:", error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  /**
   * Imprime prévia da conta sem fechar o pedido
   */
  const handlePrintPreview = async () => {
    try {
      console.log('[DEBUG] Iniciando impressão de prévia da conta');
      
      // Obter detalhes da mesa
      const orderData = await OrdersService.getOrderById(orderId);
      
      if (!orderData) {
        throw new Error("Pedido não encontrado");
      }

      if (orderItems.length === 0) {
        setErrorMessage("Não há itens para imprimir na prévia.");
        setShowError(true);
        return;
      }

      // Usar o mesmo modelo de comanda, mas indicando que é uma prévia
      // Para a prévia, não incluímos valores de pagamento, mas mostramos apenas o total
      const success = await PrinterService.printReceipt(
        { 
          id: orderId, 
          tableId: orderData.tableId,
          tableName: table?.name || `Mesa ${orderData.tableId}` // Usa o nome da mesa se disponível
        }, 
        orderItems,
        { 
          total: calculateTotal(), 
          paid: 0, // Indica que é uma prévia
          change: 0 // Sem troco para prévia
        },
        "PRÉVIA - NÃO É UM CUPOM FISCAL" // Identificar como prévia
      );

      if (success) {
        setSuccessMessage("Prévia da conta impressa com sucesso!");
        setShowSuccess(true);
      } else {
        throw new Error("Falha na impressão da prévia");
      }
    } catch (error) {
      console.error("Erro ao imprimir prévia:", error);
      setErrorMessage("Erro ao imprimir prévia da conta. Verifique se a impressora está conectada e funcionando.");
      setShowError(true);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100%',
      width: '100%',
      p: { xs: 1, sm: 2, md: 3 },
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: '1400px',
        position: 'relative',
      }}>
      {/* Sistema de notificações com aparência melhorada */}
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setShowError(false)}
          variant="filled"
          sx={{ 
            boxShadow: 3,
            minWidth: '250px'
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={showSuccess} 
        autoHideDuration={4000} 
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setShowSuccess(false)}
          variant="filled"
          sx={{ 
            boxShadow: 3,
            minWidth: '250px'
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Cabeçalho da página com animação de gradiente */}
      <Box 
        sx={{ 
          mb: 4,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, rgba(30,136,229,0.05) 0%, rgba(245,0,87,0.05) 100%)',
            zIndex: -1
          }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            py: 1,
            px: { xs: 1, sm: 2 },
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            textShadow: '1px 1px 2px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}
        >
          Pedido #{orderId}
          {isOrderClosed && (
            <Box 
              component="span" 
              sx={{ 
                ml: 2,
                px: 1.5, 
                py: 0.5, 
                bgcolor: 'success.main', 
                color: 'white', 
                borderRadius: 'xl',
                fontSize: '0.75rem',
                fontWeight: 500,
                verticalAlign: 'middle',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Finalizado
            </Box>
          )}
        </Typography>
      </Box>
      
      <Grid container spacing={4} justifyContent="center" sx={{ mx: 'auto' }}>
        {/* Conteúdo principal - Formulário */}
        <Grid item xs={12} md={10} lg={8}>
          {!isOrderClosed && (
            <Box sx={{ mb: 4 }}>
              <ItemForm 
                menuItems={[]}
                filteredMenuItems={filteredMenuItems}
                menuSearchTerm={menuSearchTerm}
                setMenuSearchTerm={setMenuSearchTerm}
                onAddItem={handleAddItem}
                loading={itemsLoading || menuLoading}
              />
            </Box>
          )}
          
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                mb: 2, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                color: 'text.primary',
                '&::after': {
                  content: '""',
                  display: 'block',
                  height: '2px',
                  background: 'linear-gradient(90deg, rgba(30,136,229,0.5) 0%, rgba(245,0,87,0.1) 100%)',
                  flexGrow: 1,
                  ml: 2
                }
              }}
            >
              Itens do Pedido
            </Typography>
            
            <OrderItemsList 
              orderItems={orderItems}
              onRemoveItem={!isOrderClosed ? handleRemoveItem : undefined}
              isOrderClosed={isOrderClosed}
              loading={itemsLoading}
            />
          </Box>
        
        {/* Resumo do pedido - Abaixo dos outros componentes */}
        <Box sx={{ width: '100%' }}>
          <Card 
            elevation={3}
            sx={{ 
              borderRadius: 3,
              overflow: 'visible',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 700,
                  textAlign: 'center',
                  color: 'text.primary',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-10px',
                    left: '30%',
                    width: '40%',
                    height: '3px',
                    borderRadius: '2px'
                  }
                }}
              >
                Resumo
              </Typography>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  bgcolor: 'background.default',
                  borderRadius: 2
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1,
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                    Qtd. Itens:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold" 
                    sx={{ 
                      fontSize: '1.1rem',
                      color: 'text.primary'
                    }}
                  >
                    {orderItems.reduce((acc, item) => acc + item.quantity, 0)}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderTop: '1px dashed',
                    borderColor: 'divider'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: 'primary.main'
                    }}
                  >
                    Total:
                  </Typography>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ 
                      color: 'primary.dark',
                    }}
                  >
                    {formatCurrency(calculateTotal())}
                  </Typography>
                </Box>
              </Paper>
              
              <Box sx={{ mt: 4 }}>
                {isOrderClosed ? (
                  <Paper 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'success.light', 
                      color: 'success.dark',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'success.main',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}
                    >
                      ✓
                    </Box>
                    <Typography 
                      align="center" 
                      sx={{ 
                        fontWeight: 600
                      }}
                    >
                      Este pedido já foi encerrado
                    </Typography>
                  </Paper>
                ) : user?.role === "MANAGER" || user?.role === "ADMIN" ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleOpenCheckoutDialog}
                      disabled={orderItems.length === 0 || itemsLoading}
                      fullWidth
                      size="large"
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 700,
                        boxShadow: 2,
                        transition: 'all 0.3s',
                        '&:hover:not(:disabled)': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      Fechar Conta
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handlePrintPreview}
                      disabled={orderItems.length === 0 || itemsLoading}
                      fullWidth
                      size="large"
                      sx={{
                        py: 1.5,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        borderWidth: 2,
                        transition: 'all 0.3s',
                        '&:hover:not(:disabled)': {
                          transform: 'translateY(-2px)',
                          borderWidth: 2,
                          boxShadow: 2
                        }
                      }}
                    >
                      Imprimir Prévia da Conta
                    </Button>
                  </Box>
                ) : (
                  <Paper 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'info.light', 
                      color: 'info.dark',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'info.main',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%',
                        bgcolor: 'info.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}
                    >
                      i
                    </Box>
                    <Typography 
                      align="center" 
                      sx={{ 
                        fontWeight: 500
                      }}
                    >
                      Apenas gerentes podem fechar contas
                    </Typography>
                  </Paper>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
        </Grid>
      </Grid>
      
      {/* Diálogo de Fechamento de Conta */}
      <CheckoutDialog 
        open={checkoutDialogOpen}
        onClose={handleCloseCheckoutDialog}
        orderId={orderId}
        tableId={0} // Este valor será obtido dinamicamente no componente de impressão
        orderItems={orderItems}
        totalAmount={calculateTotal()} // Valor do backend já considerando pagamentos parciais
        onConfirmCheckout={handleConfirmCheckout}
        loading={checkoutLoading}
      />
      
      {/* Diálogo de ajuda para impressão */}
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} maxWidth="md">
        <DialogTitle>Como Configurar a Impressão Térmica</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Requisitos para impressão térmica:
          </Typography>
          
          <Typography variant="body1" paragraph>
            1. Servidor de backend em execução com o serviço de impressão configurado.
          </Typography>
          
          <Typography variant="body1" paragraph>
            2. Impressora térmica conectada ao computador e configurada corretamente.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Passos para configuração:
          </Typography>
          
          <Typography variant="body2" component="div">
            <ol>
              <li>Baixe e instale o Python 3.8 ou superior.</li>
              <li>Instale as bibliotecas necessárias: <code>pip install flask escpos pyusb python-escpos</code></li>
              <li>Execute o servidor Python local: <code>python servidor_impressao.py</code></li>
              <li>Verifique se a impressora térmica está conectada e ligada.</li>
              <li>Clique no botão "Verificar conexão" para testar a comunicação.</li>
            </ol>
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Solução de problemas:
          </Typography>
          
          <Typography variant="body2" component="div">
            <ul>
              <li>Se a impressora não for detectada, verifique os drivers e conexão USB.</li>
              <li>O servidor Python deve estar rodando na mesma máquina que o navegador.</li>
              <li>Verifique se o servidor de backend está acessível pela rede.</li>
            </ul>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>Entendi</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default OrderDetail;