import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RefreshIcon from '@mui/icons-material/Refresh';
import { customerOrderService } from '../../api/customer';
import type {
  PublicTableInfo,
  PublicMenuProduct,
  BillResponse,
} from '../../api/customer/customerOrder.interface';
import { isValidBrazilianPhone, formatPhoneInput } from './phoneValidation';

const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const sessionStorageKey = (qrToken: string) => `qr_session_${qrToken}`;

export default function CustomerOrderPage() {
  const { qrToken } = useParams<{ qrToken: string }>();

  const [loadingTable, setLoadingTable] = useState(true);
  const [tableInfo, setTableInfo] = useState<PublicTableInfo | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [tab, setTab] = useState(0);

  const [menu, setMenu] = useState<PublicMenuProduct[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const [bill, setBill] = useState<BillResponse | null>(null);
  const [billLoading, setBillLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (!qrToken) return;

    const load = async () => {
      try {
        setLoadingTable(true);
        const info = await customerOrderService.getTableInfo(qrToken);
        setTableInfo(info);
        setTableError(null);

        const storedSession = localStorage.getItem(sessionStorageKey(qrToken));
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession) as { sessionToken: string; customerName: string };
            setSessionToken(parsed.sessionToken);
            setCustomerName(parsed.customerName);
          } catch {
            localStorage.removeItem(sessionStorageKey(qrToken));
          }
        }
      } catch {
        setTableError('QR inválido ou mesa não encontrada.');
      } finally {
        setLoadingTable(false);
      }
    };

    load();
  }, [qrToken]);

  const loadMenu = useCallback(async () => {
    if (!qrToken) return;
    try {
      setMenuLoading(true);
      const products = await customerOrderService.getMenu(qrToken);
      setMenu(products);
    } catch {
      setSnackbar({ open: true, message: 'Não foi possível carregar o cardápio.', severity: 'error' });
    } finally {
      setMenuLoading(false);
    }
  }, [qrToken]);

  const loadBill = useCallback(async () => {
    if (!sessionToken) return;
    try {
      setBillLoading(true);
      const data = await customerOrderService.getBill(sessionToken);
      setBill(data);
    } catch {
      setSnackbar({ open: true, message: 'Não foi possível carregar a conta.', severity: 'error' });
    } finally {
      setBillLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    if (sessionToken) {
      loadMenu();
      loadBill();
    }
  }, [sessionToken, loadMenu, loadBill]);

  const handleStartSession = async () => {
    if (!qrToken) return;
    setFormError(null);

    if (formName.trim().length < 2) {
      setFormError('Digite seu nome.');
      return;
    }
    if (!isValidBrazilianPhone(formPhone)) {
      setFormError('Digite um telefone válido, com DDD.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await customerOrderService.startSession(qrToken, {
        name: formName.trim(),
        phone: formPhone,
      });
      setSessionToken(response.sessionToken);
      setCustomerName(response.customerName);
      localStorage.setItem(
        sessionStorageKey(qrToken),
        JSON.stringify({ sessionToken: response.sessionToken, customerName: response.customerName })
      );
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível iniciar seu pedido. Confira os dados e tente novamente.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const changeQuantity = (productId: number, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] ?? 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAddItem = async (product: PublicMenuProduct) => {
    if (!sessionToken) return;
    const quantity = quantities[product.id] ?? 1;
    try {
      await customerOrderService.placeItem(sessionToken, { productId: product.id, quantity });
      setSnackbar({ open: true, message: `${product.name} adicionado ao pedido.`, severity: 'success' });
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível adicionar este item.';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  if (loadingTable) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (tableError || !tableInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
        <Paper sx={{ p: 4, maxWidth: 420, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            QR inválido
          </Typography>
          <Typography color="text.secondary">
            {tableError || 'Não foi possível encontrar esta mesa. Chame um garçom para te ajudar.'}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Container maxWidth="sm" sx={{ pt: 3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            {tableInfo.companyName}
          </Typography>
          <Typography color="text.secondary">{tableInfo.tableName}</Typography>
        </Paper>

        {!sessionToken ? (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bem-vindo(a)!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Informe seu nome e telefone para começar a pedir.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Seu nome"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Seu telefone (com DDD)"
                value={formPhone}
                onChange={e => setFormPhone(formatPhoneInput(e.target.value))}
                fullWidth
                placeholder="(11) 91234-5678"
              />
              {formError && (
                <Alert severity="error">{formError}</Alert>
              )}
              <Button
                variant="contained"
                size="large"
                onClick={handleStartSession}
                disabled={submitting}
              >
                {submitting ? 'Entrando...' : 'Começar a pedir'}
              </Button>
            </Stack>
          </Paper>
        ) : (
          <>
            <Typography sx={{ mb: 1 }} color="text.secondary">
              Olá, {customerName}! Seu pedido será confirmado por um garçom em instantes.
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="fullWidth">
              <Tab label="Cardápio" />
              <Tab label="Conta" onClick={() => loadBill()} />
            </Tabs>

            {tab === 0 && (
              <Box>
                {menuLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {menu.map(product => (
                      <Card key={product.id} variant="outlined">
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography fontWeight={600}>{product.name}</Typography>
                              <Typography color="text.secondary">{currency(product.salePrice)}</Typography>
                            </Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <IconButton size="small" onClick={() => changeQuantity(product.id, -1)}>
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography sx={{ minWidth: 20, textAlign: 'center' }}>
                                {quantities[product.id] ?? 1}
                              </Typography>
                              <IconButton size="small" onClick={() => changeQuantity(product.id, 1)}>
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                          <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 1.5 }}
                            onClick={() => handleAddItem(product)}
                          >
                            Adicionar
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    {menu.length === 0 && (
                      <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                        Nenhum produto disponível no momento.
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>
            )}

            {tab === 1 && (
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6">Conta da mesa</Typography>
                  <IconButton onClick={() => loadBill()} disabled={billLoading}>
                    <RefreshIcon />
                  </IconButton>
                </Stack>
                {billLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : bill && bill.items.length > 0 ? (
                  <Stack divider={<Divider />} spacing={1.5}>
                    {bill.items.map((item, index) => (
                      <Box key={index}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography fontWeight={600}>
                            {item.quantity}x {item.productName}
                          </Typography>
                          <Typography fontWeight={600}>{currency(item.subtotal)}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Pedido por: {item.orderedBy}
                        </Typography>
                      </Box>
                    ))}
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>Total</Typography>
                      <Typography fontWeight={700}>{currency(bill.totalAmount)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Pendente</Typography>
                      <Typography color="text.secondary">{currency(bill.amountPending)}</Typography>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    Nenhum pedido feito na mesa ainda.
                  </Typography>
                )}
              </Paper>
            )}
          </>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
