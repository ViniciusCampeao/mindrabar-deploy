import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { tableSessionService } from '../../api/customer';
import type { TableSessionSummary } from '../../api/customer/tableSession.interface';

const REFRESH_INTERVAL_SECONDS = 30;

export default function QrOrdersPage() {
  const [sessions, setSessions] = useState<TableSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tableSessionService.getPending();
      setSessions(data);
      setError(null);
    } catch {
      setError('Não foi possível carregar as sessões pendentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, REFRESH_INTERVAL_SECONDS * 1000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleConfirm = async (session: TableSessionSummary) => {
    try {
      setConfirmingId(session.id);
      await tableSessionService.confirm(session.id);
      setSnackbar({ open: true, message: `Sessão de ${session.customerName} confirmada.`, severity: 'success' });
      await fetchSessions();
    } catch {
      setSnackbar({ open: true, message: 'Não foi possível confirmar esta sessão.', severity: 'error' });
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Pedidos QR
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Clientes que escanearam o QR Code e estão aguardando confirmação de que há alguém na mesa.
      </Typography>

      <Paper>
        {loading && sessions.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : sessions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Nenhuma sessão aguardando confirmação.</Typography>
          </Box>
        ) : (
          <List>
            {sessions.map(session => (
              <ListItem
                key={session.id}
                divider
                secondaryAction={
                  <Button
                    variant="contained"
                    size="small"
                    disabled={confirmingId === session.id}
                    onClick={() => handleConfirm(session)}
                  >
                    {confirmingId === session.id ? 'Confirmando...' : 'Confirmar'}
                  </Button>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={600}>{session.tableName}</Typography>
                      <Chip label={session.customerName} size="small" />
                    </Box>
                  }
                  secondary={`Solicitado às ${new Date(session.createdAt).toLocaleTimeString('pt-BR')}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

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
