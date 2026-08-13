/**
 * Componente para seção de pagamento
 */
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Collapse,
  InputAdornment,
  Avatar,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Button,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Check as CheckIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  QrCode as QrCodeIcon,
  AttachMoney as AttachMoneyIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import currency from 'currency.js';
import { formatCurrency } from "../../../../../utils/formatters/currencyFormat";
import type { PaymentMethod } from "../../../../../api/orders/order.interface";

interface PaymentSectionProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  amountPaid: string;
  setAmountPaid: (value: string) => void;
  change: number | null;
  setChange: (value: number | null) => void;
  totalAmount: number;
  onOpenCnpjDialog: () => void;
  useCnpjManual: boolean;
  manualCnpj: string;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentMethod,
  setPaymentMethod,
  amountPaid,
  setAmountPaid,
  change,
  setChange,
  totalAmount,
  onOpenCnpjDialog,
  useCnpjManual,
  manualCnpj,
}) => {
  const handleAmountChange = (value: string) => {
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
  };

  return (
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
          onChange={(e) => handleAmountChange(e.target.value)}
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
        
        {/* Botão para configurar CNPJ */}
        <Button
          variant="outlined"
          color="primary"
          onClick={onOpenCnpjDialog}
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
      </Stack>
    </Paper>
  );
};

export default PaymentSection;
