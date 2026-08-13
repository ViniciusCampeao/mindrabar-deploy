import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import type { Order } from '../../../shared/types/common.types';

interface PartialPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  orders: Order[];
  onConfirmPayment: (amount: number, paymentMethod: string) => Promise<void>;
  loading: boolean;
}

export const PartialPaymentDialog: React.FC<PartialPaymentDialogProps> = ({
  open,
  onClose,
  orders,
  onConfirmPayment,
  loading
}) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH' as 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX');

  // Calcular total da mesa
  const totalAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  const handleConfirm = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    if (amount > totalAmount) {
      alert('O valor do pagamento não pode ser maior que o total da mesa');
      return;
    }

    await onConfirmPayment(amount, paymentMethod);
    setPaymentAmount('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const remainingAmount = paymentAmount && !isNaN(parseFloat(paymentAmount)) 
    ? totalAmount - parseFloat(paymentAmount) 
    : totalAmount;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" component="div" fontWeight={700}>
          Pagamento Parcial
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, pb: 1 }}>
          {/* Total da Mesa */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.9 }}>
              Total da Mesa
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {formatCurrency(totalAmount)}
            </Typography>
          </Paper>

          {/* Valor do Pagamento */}
          <TextField
            fullWidth
            label="Valor a Pagar"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            disabled={loading}
            inputProps={{
              step: '0.01',
              min: '0',
              max: totalAmount,
            }}
            sx={{ mb: 3 }}
            helperText="Digite o valor que deseja pagar"
          />

          {/* Método de Pagamento */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Método de Pagamento
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={paymentMethod === 'CASH' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('CASH')}
                disabled={loading}
                sx={{ py: 2 }}
              >
                💵 Dinheiro
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={paymentMethod === 'CREDIT_CARD' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                disabled={loading}
                sx={{ py: 2 }}
              >
                💳 Crédito
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={paymentMethod === 'DEBIT_CARD' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('DEBIT_CARD')}
                disabled={loading}
                sx={{ py: 2 }}
              >
                💳 Débito
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={paymentMethod === 'PIX' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('PIX')}
                disabled={loading}
                sx={{ py: 2 }}
              >
                📱 PIX
              </Button>
            </Grid>
          </Grid>

          {/* Preview do Restante */}
          {paymentAmount && !isNaN(parseFloat(paymentAmount)) && parseFloat(paymentAmount) > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'warning.light',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ mb: 0.5, color: 'warning.dark' }}>
                Valor Restante
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: 'warning.dark' }}>
                {formatCurrency(remainingAmount)}
              </Typography>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          size="large"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading || !paymentAmount || parseFloat(paymentAmount) <= 0}
          variant="contained"
          color="success"
          size="large"
        >
          {loading ? 'Processando...' : 'Confirmar Pagamento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
