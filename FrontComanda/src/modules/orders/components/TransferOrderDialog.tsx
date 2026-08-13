import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { SwapHoriz as TransferIcon } from "@mui/icons-material";
import { httpClient } from "../../../api/httpClient";

interface TransferOrderDialogProps {
  orderId: number;
  tables: { id: number; name: string }[];
  onSuccess?: (response: any) => void;
}

interface TransferResponse {
  id: number;
  tableId: number;
  message?: string;
}

/**
 * Componente para transferir um pedido entre mesas
 * 
 * @param orderId - ID do pedido a ser transferido
 * @param tables - Lista de mesas disponíveis para transferência
 * @param onSuccess - Callback opcional executado em caso de sucesso
 */
export const TransferOrderDialog: React.FC<TransferOrderDialogProps> = ({
  orderId,
  tables,
  onSuccess,
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedTableId, setSelectedTableId] = React.useState("" as number | "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null as string | null);

  const handleOpen = () => {
    setOpen(true);
    setSelectedTableId("");
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setSelectedTableId("");
      setError(null);
    }
  };

  const handleConfirm = async () => {
    if (!selectedTableId) {
      setError("Por favor, selecione uma mesa.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.patch<TransferResponse>(
        `/order/${orderId}/table`,
        { newTableId: selectedTableId }
      );

      // Sucesso
      if (onSuccess) {
        onSuccess(response.data);
      }

      handleClose();
    } catch (err: any) {
      console.error("Erro ao transferir pedido:", err);
      
      // Tratamento de erros da API
      if (err.response) {
        const { status, data } = err.response;
        
        switch (status) {
          case 400:
            setError(data?.message || "Requisição inválida. Verifique os dados.");
            break;
          case 404:
            setError("Pedido ou mesa não encontrada.");
            break;
          case 409:
            setError("Conflito ao transferir pedido. A mesa pode já estar ocupada.");
            break;
          default:
            setError(data?.message || "Erro ao transferir pedido. Tente novamente.");
        }
      } else if (err.request) {
        setError("Erro de conexão. Verifique sua internet.");
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<TransferIcon />}
        onClick={handleOpen}
        size="small"
      >
        Trocar mesa
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={loading}
      >
        <DialogTitle>Transferir Pedido para Outra Mesa</DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="table-select-label">Selecione a mesa</InputLabel>
              <Select
                labelId="table-select-label"
                id="table-select"
                value={selectedTableId}
                label="Selecione a mesa"
                onChange={(e) => setSelectedTableId(e.target.value as number)}
              >
                <MenuItem value="" disabled>
                  <em>Escolha uma mesa</em>
                </MenuItem>
                {tables.map((table) => (
                  <MenuItem key={table.id} value={table.id}>
                    {table.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={loading}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !selectedTableId}
            variant="contained"
            color="primary"
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? "Transferindo..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransferOrderDialog;
