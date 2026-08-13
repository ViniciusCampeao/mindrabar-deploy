/**
 * Componente principal de diálogo para fechamento de mesa completa
 * Agrega todos os pedidos de uma mesa e processa como um único fechamento
 */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  CircularProgress,
  Chip,
  alpha,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Close as CloseIcon,
  Restaurant as RestaurantIcon,
} from "@mui/icons-material";
import { TransitionProps } from '@mui/material/transitions';
import { Slide, Tooltip } from "@mui/material";
import currency from 'currency.js';
import type { Order, Table } from "../../../../shared/types/common.types";
import type { PaymentMethod } from "../../../../../api/orders/order.interface";
import TableSummarySection from './TableSummarySection';
import PaymentSection from './PaymentSection';
import CnpjDialog from './CnpjDialog';

// Transição personalizada para o diálogo
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface TableCheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  table: Table;
  orders: Order[];
  onConfirmCheckout: (paid: number, change: number, paymentMethod: string, cnpj?: string) => Promise<void>;
  loading: boolean;
}

/**
 * Diálogo para fechamento de mesa completa
 * Agrega todos os pedidos e processa como um único pagamento
 */
const TableCheckoutDialog: React.FC<TableCheckoutDialogProps> = ({
  open,
  onClose,
  table,
  orders,
  onConfirmCheckout,
  loading
}) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [change, setChange] = useState(null as number | null);
  const [paymentMethod, setPaymentMethod] = useState('CASH' as PaymentMethod);
  const [cnpjDialogOpen, setCnpjDialogOpen] = useState(false);
  const [manualCnpj, setManualCnpj] = useState("");
  const [useCnpjManual, setUseCnpjManual] = useState(false);
  
  // Calcular total de todos os pedidos da mesa usando o total do backend
  const calculateTableTotal = (): number => {
    return orders.reduce((sum, order) => {
      // Usa o total do backend que já considera pagamentos parciais
      return sum + (order.total || 0);
    }, 0);
  };

  // Agregar todos os itens de todos os pedidos
  const getAllItems = () => {
    return orders.flatMap(order => order.items);
  };

  const totalAmount = calculateTableTotal();
  const allItems = getAllItems();
  const totalItemsCount = allItems.reduce((sum, item) => sum + item.quantity, 0);

  /**
   * Confirma o CNPJ manual e fecha o diálogo de CNPJ
   */
  const handleConfirmCnpj = () => {
    if (manualCnpj.length > 0) {
      setUseCnpjManual(true);
    } else {
      setUseCnpjManual(false);
    }
    setCnpjDialogOpen(false);
  };

  /**
   * Limpa o CNPJ manual
   */
  const handleClearCnpj = () => {
    setUseCnpjManual(false);
    setManualCnpj('');
    setCnpjDialogOpen(false);
  };

  /**
   * Confirma o fechamento da mesa
   */
  const handleConfirm = async () => {
    if (change === null) {
      return;
    }
    
    const paidValue = parseFloat(amountPaid.replace(',', '.'));
    const paid = currency(paidValue);
    const total = currency(totalAmount);
    
    if (isNaN(paidValue) || paid.value < total.value) {
      return;
    }
    
    const finalChange = paid.subtract(total);
    
    // Passa o CNPJ manual apenas se estiver configurado para usar
    const cnpjToUse = useCnpjManual && manualCnpj ? manualCnpj : undefined;
    await onConfirmCheckout(paid.value, finalChange.value, paymentMethod, cnpjToUse);
  };
  
  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          elevation: 5,
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            p: 3,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RestaurantIcon sx={{ mr: 1.5, fontSize: '1.8rem' }} />
            <Typography variant="h5" fontWeight="bold">
              Fechamento da {table.name}
            </Typography>
          </Box>
          <Chip 
            label={`${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'}`}
            color="secondary"
            size="small"
            sx={{ 
              fontWeight: 'bold',
              bgcolor: 'white',
              color: 'primary.main'
            }}
          />
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Seção de resumo da mesa */}
              <TableSummarySection
                orders={orders}
                totalAmount={totalAmount}
                totalItemsCount={totalItemsCount}
              />
              
              {/* Seção de pagamento */}
              <PaymentSection
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                amountPaid={amountPaid}
                setAmountPaid={setAmountPaid}
                change={change}
                setChange={setChange}
                totalAmount={totalAmount}
                onOpenCnpjDialog={() => setCnpjDialogOpen(true)}
                useCnpjManual={useCnpjManual}
                manualCnpj={manualCnpj}
              />
            </Stack>
          </Box>
        </DialogContent>
        
        <DialogActions 
          sx={{ 
            p: 3, 
            background: theme => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.05)})`,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Button 
            onClick={onClose} 
            color="inherit"
            variant="outlined"
            disabled={loading}
            size="large"
            startIcon={loading ? null : <CloseIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.2,
              borderWidth: '1.5px',
              fontSize: '0.95rem',
              fontWeight: 600,
              '&:hover': {
                borderWidth: '1.5px',
                bgcolor: alpha('#000', 0.05)
              }
            }}
          >
            Cancelar
          </Button>
          
          <Tooltip 
            title={change === null ? "Calcule o troco antes de confirmar o pagamento" : ""}
            arrow
            placement="top"
          >
            <span style={{ display: 'inline-block' }}>
              <Button 
                onClick={handleConfirm} 
                color="success" 
                variant="contained"
                disabled={change === null || loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                size="large"
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1.2,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: 3,
                  transition: 'all 0.3s',
                  background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-2px)',
                    boxShadow: 5,
                    background: 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)'
                  }
                }}
              >
                {loading ? "Processando..." : "Confirmar Pagamento"}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de CNPJ */}
      <CnpjDialog
        open={cnpjDialogOpen}
        onClose={() => setCnpjDialogOpen(false)}
        manualCnpj={manualCnpj}
        setManualCnpj={setManualCnpj}
        useCnpjManual={useCnpjManual}
        onConfirm={handleConfirmCnpj}
        onClear={handleClearCnpj}
      />
    </>
  );
};

export default TableCheckoutDialog;
