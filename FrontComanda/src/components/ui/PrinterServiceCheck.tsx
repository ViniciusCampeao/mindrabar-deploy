import { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { httpClient } from '../../api/httpClient';
import { PRINT } from '../../api/endpoints';

const PrinterServiceCheck = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('warning' as 'success' | 'warning' | 'error');

  useEffect(() => {
    const checkPrinterService = async () => {
      try {
        await httpClient.post(PRINT.SEND, {
          content: 'ping',
          type: 'health',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Erro ao acessar serviço de impressão:', error);
        setMessage('Serviço de impressão não detectado. Verifique se o servidor de backend está em execução.');
        setSeverity('error');
        setShowAlert(true);
      }
    };

    const timer = setTimeout(() => {
      checkPrinterService();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Snackbar
      open={showAlert}
      autoHideDuration={10000}
      onClose={() => setShowAlert(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={() => setShowAlert(false)} 
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default PrinterServiceCheck;