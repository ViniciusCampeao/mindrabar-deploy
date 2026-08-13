/**
 * Componente que exibe o resumo da mesa com todos os pedidos
 */
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { MonetizationOn as MoneyIcon } from "@mui/icons-material";
import { formatCurrency } from "../../../../../utils/formatters/currencyFormat";
import type { Order } from "../../../../shared/types/common.types";

interface TableSummarySectionProps {
  orders: Order[];
  totalAmount: number;
  totalItemsCount: number;
}

const TableSummarySection: React.FC<TableSummarySectionProps> = ({
  orders,
  totalAmount,
  totalItemsCount,
}) => {
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
          <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
          Resumo da Mesa
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Lista de pedidos */}
      <List dense sx={{ mb: 2 }}>
        {orders.map(order => (
          <ListItem 
            key={order.id}
            sx={{ 
              px: 0,
              py: 0.5
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight={500}>
                    Pedido #{order.id}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatCurrency(order.total || 0)}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ mb: 2 }} />
      
      <Stack spacing={1.5}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body1" color="text.secondary">
            Total de Itens
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'}
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
  );
};

export default TableSummarySection;
