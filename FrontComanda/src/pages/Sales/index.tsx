import React, { useEffect, useCallback } from 'react';
import { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Divider, Card, CardContent, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { orderService } from '../../api/orders';
import { DailySalesReport, OrderSale, OrderItemSaleDTO } from '../../api/orders';
import { MainLayout } from '../../layouts';

/**
 * Formata valores monetários em formato BRL
 */
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata data no formato DD/MM/YYYY
 */
const formatDate = (dateString: string) => {
  try {
    // Ajuste para lidar com o problema de fuso horário
    if (dateString.includes('-') && !dateString.includes('T')) {
      // Se for uma data no formato YYYY-MM-DD sem hora
      const [year, month, day] = dateString.split('-').map(Number);
      // Criar uma data usando componentes locais para evitar conversões de fuso horário
      const date = new Date(year, month - 1, day);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } else if (dateString.includes('T')) {
      // Se for uma data ISO com informação de hora
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } else {
      return dateString;
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

/**
 * Formata data/hora ISO em formato legível
 */
const formatDateTime = (dateString: string) => {
  try {
    // Ajustamos para lidar explicitamente com datas ISO
    if (dateString.includes('T')) {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    }
    return dateString;
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error);
    return dateString;
  }
};

/**
 * Componente que exibe os detalhes de um pedido
 */
const OrderDetails = ({ order }: { order: OrderSale }) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          Pedido #{order.orderId} - {formatDateTime(order.createdAt)} - {formatCurrency(order.totalOrderValue)}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="right">Preço Unit.</TableCell>
                <TableCell align="right">Qtd.</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item: OrderItemSaleDTO) => (
                <TableRow key={`${order.orderId}-${item.productId}`}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell align="right">{formatCurrency(item.productPrice)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.itemTotalValue)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right"><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>{formatCurrency(order.totalOrderValue)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

/**
 * Componente para o resumo diário de vendas
 */
const DailySummary = ({ report }: { report: DailySalesReport }) => {
  // Agrupar vendas por produto
  const productSummary = report.orders.flatMap(order => order.items)
    .reduce((acc: Record<string, { name: string, quantity: number, total: number }>, item) => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          name: item.productName,
          quantity: 0,
          total: 0
        };
      }
      acc[item.productId].quantity += item.quantity;
      acc[item.productId].total += item.itemTotalValue;
      return acc;
    }, {});

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resumo do Dia - {formatDate(report.date)}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Total de Vendas: {formatCurrency(report.totalSales)}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Total de Pedidos: {report.orders.length}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Produtos Vendidos
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.values(productSummary).map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Página principal de vendas
 */
const SalesPage: React.FC = () => {
  // Usando as tipagens adequadas sem os generics que causavam erros
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [salesReport, setSalesReport] = useState(null as DailySalesReport | null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);

  const fetchSalesData = useCallback(async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    setError(null);
    try {
      // Extrair ano, mês e dia diretamente do objeto Date
      // sem converter para UTC para evitar problemas de fuso horário
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // getMonth() retorna 0-11
      const day = selectedDate.getDate();
      
      // Formatar manualmente para garantir a data correta
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const report = await orderService.getOrderSalesByDay(formattedDate);
      setSalesReport(report);
    } catch (err) {
      console.error('Erro ao buscar dados de vendas:', err);
      setError('Não foi possível carregar os dados de vendas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    // Carrega dados quando a data for alterada
    if (selectedDate) {
      fetchSalesData();
    }
  }, [selectedDate, fetchSalesData]);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Relatório de Vendas
        </Typography>
        
        {/* Seletor de data */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Selecione a data"
                  value={selectedDate}
                  onChange={(newDate: Date | null) => {
                    if (newDate) {
                      setSelectedDate(newDate);
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ flex: 1 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={40} />
                </Box>
              ) : salesReport ? (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      flex: 1, 
                      backgroundColor: '#1a237e', 
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="subtitle2" align="center">Total Pedidos</Typography>
                    <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {salesReport.orders.length}
                    </Typography>
                  </Paper>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      flex: 1, 
                      backgroundColor: '#b71c1c', 
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="subtitle2" align="center">Valor Total</Typography>
                    <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {formatCurrency(salesReport.totalSales)}
                    </Typography>
                  </Paper>
                </Box>
              ) : null}
            </Box>
          </Box>
        </Paper>
        
        {/* Mensagem de erro */}
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {/* Conteúdo do relatório */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : salesReport ? (
          <Box>
            {/* Resumo diário */}
            <DailySummary report={salesReport} />
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Pedidos do Dia
            </Typography>
            
            {/* Lista de pedidos */}
            {salesReport.orders.length > 0 ? (
              salesReport.orders.map((order) => (
                <OrderDetails key={order.orderId} order={order} />
              ))
            ) : (
              <Typography variant="body1">
                Não há pedidos para este dia.
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body1">
            Selecione uma data para visualizar os dados de vendas.
          </Typography>
        )}
      </Box>
    </MainLayout>
  );
};

export default SalesPage;