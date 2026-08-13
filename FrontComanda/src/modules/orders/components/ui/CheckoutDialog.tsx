/**
 * Componente de diálogo para fechamento de pedido
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
  Paper,
  TextField,
  Stack,
  CircularProgress,
  Tooltip,
  Divider,
  Slide,
  Collapse,
  Chip,
  InputAdornment,
  Avatar,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Check as CheckIcon,
  MonetizationOn as MoneyIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  QrCode as QrCodeIcon,
  AttachMoney as AttachMoneyIcon
} from "@mui/icons-material";
import { TransitionProps } from '@mui/material/transitions';
import currency from 'currency.js';
import { OrderItem } from "../../../shared/types/common.types";
import { formatCurrency } from "../../../../utils/formatters/currencyFormat";
import type { PaymentMethod } from "../../../../api/orders/order.interface";

// Transição personalizada para o diálogo
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  tableId: number;
  orderItems: OrderItem[];
  totalAmount: number; // Valor total do backend (já considerando pagamentos parciais)
  onConfirmCheckout: (paid: number, change: number, paymentMethod: string, cnpj?: string) => Promise<void>;
  loading: boolean;
}

/**
 * Diálogo para fechamento de pedido e pagamento
 */
const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  orderId: _orderId, // eslint-disable-line @typescript-eslint/no-unused-vars
  tableId: _tableId, // eslint-disable-line @typescript-eslint/no-unused-vars
  orderItems,
  totalAmount, // Valor do backend já considerando pagamentos parciais
  onConfirmCheckout,
  loading
}) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [change, setChange] = useState(null as number | null);
  const [paymentMethod, setPaymentMethod] = useState('CASH' as PaymentMethod);
  // Estados para o campo de CNPJ
  const [cnpjDialogOpen, setCnpjDialogOpen] = useState(false);
  const [manualCnpj, setManualCnpj] = useState("");
  const [useCnpjManual, setUseCnpjManual] = useState(false);

  /**
   * Formata o CNPJ com máscara (xx.xxx.xxx/xxxx-xx)
   */
  const formatCnpj = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const cnpjNumbers = value.replace(/\D/g, '');
    
    // Limita a 14 dígitos
    const cnpj = cnpjNumbers.slice(0, 14);
    
    // Aplica a máscara conforme vai digitando
    if (cnpj.length <= 2) {
      return cnpj;
    } else if (cnpj.length <= 5) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    } else if (cnpj.length <= 8) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    } else if (cnpj.length <= 12) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    } else {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
    }
  };
  
  /**
   * Manipula alterações no campo de CNPJ
   */
  const handleCnpjChange = (e: any) => {
    const formattedCnpj = formatCnpj(e.target.value);
    setManualCnpj(formattedCnpj);
  };
  
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
   * Confirma o fechamento do pedido
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
  
  // Soma total da quantidade de itens
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  
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
            <ReceiptIcon sx={{ mr: 1.5, fontSize: '1.8rem' }} />
            <Typography variant="h5" fontWeight="bold">
              Fechamento de Conta
            </Typography>
          </Box>
          <Chip 
            label={`${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
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
              {/* Seção de resumo da conta */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.primary'
                    }}
                  >
                    <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Resumo do Pedido
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={1.5}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency(totalAmount)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1
                  }}>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      Total a Pagar
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.dark">
                      {formatCurrency(totalAmount)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
              
              {/* Seção de pagamento */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.primary'
                    }}
                  >
                    <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Pagamento
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel id="payment-method-label">Método de Pagamento</InputLabel>
                    <Select
                      labelId="payment-method-label"
                      value={paymentMethod}
                      label="Método de Pagamento"
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      sx={{
                        borderRadius: 2,
                        '& fieldset': {
                          borderWidth: '1.5px',
                        },
                        '&.Mui-focused fieldset': {
                          borderWidth: '2px',
                        }
                      }}
                    >
                      <MenuItem value="CASH">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon fontSize="small" />
                          Dinheiro
                        </Box>
                      </MenuItem>
                      <MenuItem value="CREDIT_CARD">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCardIcon fontSize="small" />
                          Cartão de Crédito
                        </Box>
                      </MenuItem>
                      <MenuItem value="DEBIT_CARD">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalanceIcon fontSize="small" />
                          Cartão de Débito
                        </Box>
                      </MenuItem>
                      <MenuItem value="PIX">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <QrCodeIcon fontSize="small" />
                          PIX
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Valor Pago pelo Cliente"
                    placeholder="Digite o valor recebido"
                    fullWidth
                    value={amountPaid}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAmountPaid(value);
                      
                      const total = currency(totalAmount);
                      const paidValue = parseFloat(value.replace(',', '.'));
                      
                      if (!isNaN(paidValue) && paidValue >= 0) {
                        const paid = currency(paidValue);
                        
                        if (paid.value < total.value) {
                          setChange(null);
                        } else {
                          const changeAmount = paid.subtract(total);
                          setChange(changeAmount.value);
                        }
                      } else {
                        setChange(null);
                      }
                    }}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography 
                            variant="h6" 
                            color="primary.main" 
                            fontWeight="bold" 
                            sx={{ fontSize: '1.1rem' }}
                          >
                            R$
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        '& fieldset': {
                          borderWidth: '1.5px',
                        },
                        '&.Mui-focused fieldset': {
                          borderWidth: '2px',
                        }
                      }
                    }}
                  />
                  
                  <Collapse in={change !== null} timeout={500}>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        bgcolor: alpha('#4caf50', 0.1),
                        color: 'success.dark',
                        borderRadius: 2,
                        mt: 2,
                        border: '1px solid',
                        borderColor: 'success.main',
                        boxShadow: 3
                      }}
                      elevation={1}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar sx={{ 
                          bgcolor: 'success.main', 
                          mr: 1.5,
                          boxShadow: 1,
                          color: 'white'
                        }}>
                          <CheckIcon />
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                          Troco Calculado
                        </Typography>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 2,
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'success.light'
                        }}
                      >
                        <Typography variant="body1" fontWeight={500}>
                          Valor a Devolver:
                        </Typography>
                        <Typography 
                          variant="h5" 
                          fontWeight="bold" 
                          color="success.dark"
                        >
                          {formatCurrency(change || 0)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Collapse>
                </Stack>
              </Paper>
              
              {/* Seção de configuração CNPJ */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.primary'
                    }}
                  >
                    <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Configuração Adicional
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setCnpjDialogOpen(true)}
                  startIcon={<InfoIcon />}
                  fullWidth
                  sx={{ 
                    borderRadius: 2,
                    borderWidth: '1.5px',
                    py: 1.5,
                    '&:hover': {
                      borderWidth: '1.5px'
                    }
                  }}
                >
                  {useCnpjManual && manualCnpj 
                    ? `CNPJ configurado: ${manualCnpj}` 
                    : "Configurar CNPJ para impressão"}
                </Button>
              </Paper>
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
      
      {/* Diálogo para configuração de CNPJ */}
      <Dialog 
        open={cnpjDialogOpen} 
        onClose={() => setCnpjDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <InfoIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Configurar CNPJ para Impressão
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, pb: 2, pt: 0 }}>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Insira o CNPJ que será impresso no comprovante. Se deixar em branco, 
            o sistema usará o CNPJ cadastrado na empresa automaticamente.
          </Typography>
          
          <TextField
            label="CNPJ (opcional)"
            value={manualCnpj}
            onChange={handleCnpjChange}
            fullWidth
            placeholder="00.000.000/0000-00"
            variant="outlined"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderWidth: '1.5px',
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InfoIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          {useCnpjManual && manualCnpj && (
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha('#4caf50', 0.08),
              borderRadius: 2,
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CheckIcon color="success" fontSize="small" />
              <Typography variant="body2" color="success.main">
                CNPJ configurado com sucesso!
              </Typography>
            </Box>
          )}
          
          {manualCnpj === '' && useCnpjManual && (
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha('#ff9800', 0.08),
              borderRadius: 2,
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <InfoIcon color="warning" fontSize="small" />
              <Typography variant="body2" color="warning.main">
                Usando o CNPJ da empresa cadastrado no sistema.
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => {
              setUseCnpjManual(false);
              setManualCnpj('');
              setCnpjDialogOpen(false);
            }}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Limpar
          </Button>
          <Button 
            onClick={handleConfirmCnpj}
            color="primary"
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CheckoutDialog;