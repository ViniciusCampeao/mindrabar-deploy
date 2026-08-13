/**
 * Componente para exibir a lista de itens do pedido
 */
import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Divider,
  Paper,
  Tooltip,
  Fade,
  Chip,
  Avatar,
  useTheme
} from "@mui/material";
import {
  Delete as DeleteIcon,
  LocalDining as DiningIcon,
  Restaurant as RestaurantIcon,
  Fastfood as FastFoodIcon,
  LocalBar as DrinkIcon
} from "@mui/icons-material";
import { OrderItem } from "../../../shared/types/common.types";
import { formatCurrency } from "../../../../utils/formatters/currencyFormat";
import { useAuth } from "../../../auth";

interface OrderItemsListProps {
  orderItems: OrderItem[];
  onRemoveItem?: (itemId: number) => void;
  isOrderClosed?: boolean;
  loading?: boolean;
}

// Função para determinar o ícone com base no nome do item
const getItemIcon = (itemName: string) => {
  const nameLower = itemName.toLowerCase();
  
  if (nameLower.includes('bebida') || nameLower.includes('suco') || nameLower.includes('cerveja') || 
      nameLower.includes('água') || nameLower.includes('refrigerante')) {
    return <DrinkIcon />;
  }
  
  if (nameLower.includes('hamburguer') || nameLower.includes('lanche') || 
      nameLower.includes('sanduíche') || nameLower.includes('sandwich')) {
    return <FastFoodIcon />;
  }
  
  if (nameLower.includes('prato') || nameLower.includes('refeição') || nameLower.includes('feijão') || 
      nameLower.includes('arroz')) {
    return <RestaurantIcon />;
  }
  
  // Ícone padrão
  return <DiningIcon />;
};

/**
 * Componente que lista os itens de um pedido
 */
const OrderItemsList: React.FC<OrderItemsListProps> = ({ 
  orderItems, 
  onRemoveItem,
  isOrderClosed = false,
  loading = false
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';
  
  if (orderItems.length === 0) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          textAlign: "center",
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <RestaurantIcon 
          sx={{ 
            fontSize: '3rem', 
            color: 'text.disabled',
            opacity: 0.6
          }} 
        />
        <Typography 
          color="text.secondary"
          sx={{
            fontWeight: 500,
            fontSize: '1rem'
          }}
        >
          Este pedido ainda não possui itens.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <List
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          p: 0,
        }}
      >
        {orderItems.map((item: OrderItem, index: number) => {
          const itemName = item.menuItem?.name || `Item #${item.menuItemId}`;
          const itemPrice = item.price || item.menuItem?.price || 0;
          const totalPrice = itemPrice * item.quantity;
          const isLastItem = index === orderItems.length - 1;
          
          return (
            <Fade in={true} key={index} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
              <Box>
                <ListItem
                  sx={{
                    py: 1.5,
                    px: { xs: 2, sm: 3 },
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'background.default',
                    },
                  }}
                >
                  {/* Avatar com ícone do item */}
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.light',
                      mr: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {getItemIcon(itemName)}
                  </Avatar>
                  
                  <ListItemText
                    primary={
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          flexWrap: 'wrap',
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            flexGrow: 1,
                          }}
                        >
                          {itemName}
                        </Typography>
                        <Chip 
                          label={`x${item.quantity}`}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            fontSize: '0.75rem',
                            height: 24,
                            borderRadius: 3
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1,
                          flexWrap: { xs: 'wrap', sm: 'nowrap' },
                          gap: 1
                        }}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ 
                            color: 'text.secondary',
                            fontWeight: 500,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 0.5, sm: 1 }
                          }}
                        >
                          <Box component="span">
                            Valor unitário: {formatCurrency(itemPrice)}
                          </Box>
                          <Box 
                            component="span"
                            sx={{ 
                              display: { xs: 'none', sm: 'inline' },
                              color: 'text.disabled'
                            }}
                          >
                            •
                          </Box>
                          <Box 
                            component="span" 
                            sx={{ 
                              fontWeight: 700, 
                              color: theme.palette.primary.main 
                            }}
                          >
                            Total: {formatCurrency(totalPrice)}
                          </Box>
                        </Typography>
                      </Box>
                    }
                    primaryTypographyProps={{
                      style: { 
                        marginBottom: 4 
                      }
                    }}
                  />
                  
                  {!isOrderClosed && onRemoveItem && isManager && (
                    <Tooltip title="Remover item" arrow placement="left">
                      <IconButton
                        onClick={() => onRemoveItem(item.itemId || 0)}
                        color="error"
                        disabled={loading}
                        size="medium"
                        sx={{
                          border: '1px solid',
                          borderColor: 'error.light',
                          opacity: loading ? 0.5 : 0.9,
                          transition: 'all 0.2s',
                          '&:hover': {
                            opacity: loading ? 0.5 : 1,
                            transform: loading ? 'none' : 'scale(1.05)',
                            bgcolor: 'error.light',
                            color: 'white'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
                
                {!isLastItem && (
                  <Divider 
                    sx={{ 
                      mx: { xs: 2, sm: 3 },
                      opacity: 0.6 
                    }}
                  />
                )}
              </Box>
            </Fade>
          );
        })}
      </List>
    </Paper>
  );
};

export default OrderItemsList;