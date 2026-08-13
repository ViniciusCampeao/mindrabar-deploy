/**
 * Diálogo para configuração de CNPJ
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  InputAdornment,
  alpha,
} from "@mui/material";
import {
  Info as InfoIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

interface CnpjDialogProps {
  open: boolean;
  onClose: () => void;
  manualCnpj: string;
  setManualCnpj: (value: string) => void;
  useCnpjManual: boolean;
  onConfirm: () => void;
  onClear: () => void;
}

const CnpjDialog: React.FC<CnpjDialogProps> = ({
  open,
  onClose,
  manualCnpj,
  setManualCnpj,
  useCnpjManual,
  onConfirm,
  onClear,
}) => {
  /**
   * Formata o CNPJ com máscara (xx.xxx.xxx/xxxx-xx)
   */
  const formatCnpj = (value: string): string => {
    const cnpjNumbers = value.replace(/\D/g, '');
    const cnpj = cnpjNumbers.slice(0, 14);
    
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

  const handleCnpjChange = (e: any) => {
    const formattedCnpj = formatCnpj(e.target.value);
    setManualCnpj(formattedCnpj);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
          onClick={onClear}
          color="inherit"
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Limpar
        </Button>
        <Button 
          onClick={onConfirm}
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
  );
};

export default CnpjDialog;
