/**
 * Componente de formulário para adicionar itens ao pedido
 */
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Chip,
  CircularProgress,
  Fade,
  useTheme,
  Zoom
} from "@mui/material";
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Restaurant as RestaurantIcon
} from "@mui/icons-material";
import { MenuItem } from "../../../shared/types/common.types";
import { formatCurrency } from "../../../../utils/formatters/currencyFormat";

interface ItemFormProps {
  menuItems: MenuItem[];
  filteredMenuItems: MenuItem[];
  menuSearchTerm: string;
  setMenuSearchTerm: (term: string) => void;
  onAddItem: (menuItemId: number, quantity: number) => Promise<boolean>;
  loading: boolean;
}

/**
 * Componente de formulário para adicionar itens ao pedido
 */
const ItemForm: React.FC<ItemFormProps> = ({
  // Lista completa de itens (não utilizada diretamente neste componente)
  menuItems: _menuItems, // eslint-disable-line @typescript-eslint/no-unused-vars
  filteredMenuItems,
  menuSearchTerm,
  setMenuSearchTerm,
  onAddItem,
  loading
}) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState("" as number | "");
  const [quantity, setQuantity] = useState(1);
  const [addingItem, setAddingItem] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null as MenuItem | null);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  // Atualiza os detalhes do item selecionado quando o usuário seleciona um item
  useEffect(() => {
    if (selectedMenuItem && typeof selectedMenuItem === 'number') {
      const item = filteredMenuItems.find(item => item.id === selectedMenuItem);
      setSelectedItemDetails(item || null);
    } else {
      setSelectedItemDetails(null);
    }
  }, [selectedMenuItem, filteredMenuItems]);

  /**
   * Adiciona o item selecionado ao pedido
   */
  const handleAddItem = async (e?: any) => {
    if (e) e.preventDefault();
    
    if (!selectedMenuItem || quantity <= 0) return;
    
    try {
      setAddingItem(true);
      await onAddItem(selectedMenuItem as number, quantity);
      
      // Limpar o formulário após adicionar com sucesso
      setSelectedMenuItem("");
      setQuantity(1);
      setSelectedItemDetails(null);
    } finally {
      setAddingItem(false);
    }
  };

  // Determina o preço total com base na quantidade
  const totalPrice = selectedItemDetails 
    ? selectedItemDetails.price * quantity 
    : 0;

  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        borderTop: '4px solid',
        borderTopColor: 'primary.main',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: 'primary.main',
          fontWeight: 600,
          mb: 2,
          '&::after': {
            content: '""',
            display: 'block',
            height: '2px',
            background: 'linear-gradient(90deg, rgba(30,136,229,0.5) 0%, rgba(245,0,87,0.1) 100%)',
            flexGrow: 1,
            ml: 2
          }
        }}
      >
        <RestaurantIcon sx={{ mr: 1 }} /> Adicionar Item
      </Typography>

      <form onSubmit={handleAddItem}>
        <Stack spacing={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="menu-item-label" sx={{ bgcolor: 'background.paper', px: 1 }}>
              Selecione um Item do Menu
            </InputLabel>
            <Select
              labelId="menu-item-label"
              value={selectedMenuItem}
              onChange={(e) => setSelectedMenuItem(e.target.value as number)}
              label="Selecione um Item do Menu"
              disabled={loading || addingItem}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '1.5px',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px',
                },
              }}
              // Desabilitar completamente a navegação por teclado no Select
              onKeyDown={(e) => {
                if (!/^[a-zA-Z0-9]$/.test(e.key)) {
                  return;
                }
                e.stopPropagation();
              }}
              MenuProps={{
                PaperProps: {
                  elevation: 3,
                  style: {
                    maxHeight: 350,
                    borderRadius: 12,
                  },
                },
                MenuListProps: {
                  disableListWrap: true,
                  disabledItemsFocusable: false,
                  autoFocusItem: false,
                  style: { 
                    paddingTop: 0 
                  },
                  subheader: (
                    <Box sx={{ 
                      position: 'sticky', 
                      top: 0, 
                      backgroundColor: 'white', 
                      zIndex: 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <TextField
                        fullWidth
                        size="small"
                        autoFocus
                        placeholder="Pesquisar item no menu..."
                        value={menuSearchTerm}
                        onChange={(e) => setMenuSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Escape') {
                            e.preventDefault();
                          }
                        }}
                        sx={{
                          m: 1,
                          width: 'calc(100% - 16px)',
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>
                  )
                }
              }}
            >
              <MuiMenuItem value="">
                <Box sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  Selecione um item do cardápio
                </Box>
              </MuiMenuItem>
              
              {filteredMenuItems.map((item: MenuItem) => (
                <MuiMenuItem 
                  key={item.id} 
                  value={item.id}
                  sx={{
                    borderRadius: 1,
                    my: 0.5,
                    mx: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mr: 1
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        fontWeight: 700,
                        color: 'inherit',
                        bgcolor: 'rgba(0,0,0,0.08)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        flexShrink: 0
                      }}
                    >
                      {formatCurrency(item.price)}
                    </Typography>
                  </Box>
                </MuiMenuItem>
              ))}
              
              {filteredMenuItems.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Nenhum item encontrado com esse termo de busca
                  </Typography>
                </Box>
              )}
            </Select>
          </FormControl>

          {/* Exibe detalhes do item selecionado */}
          <Fade in={!!selectedItemDetails} timeout={500}>
            <Box sx={{ 
              display: selectedItemDetails ? 'block' : 'none',
              mb: 1,
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography 
                variant="subtitle2" 
                component="h3"
                color="primary.main"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Item Selecionado
              </Typography>
              
              {selectedItemDetails && (
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography 
                    variant="body1"
                    sx={{ fontWeight: 600 }}
                  >
                    {selectedItemDetails.name}
                  </Typography>
                  <Chip
                    label={formatCurrency(selectedItemDetails.price)}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              )}
            </Box>
          </Fade>

          <Box sx={{ 
            display: "flex",
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2 
          }}>
            <TextField
              label="Quantidade"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => {
                const value = e.target.value;
                // Permite campo vazio para facilitar digitação
                if (value === '') {
                  setQuantity(0);
                } else {
                  const newValue = parseInt(value);
                  if (!isNaN(newValue)) {
                    setQuantity(newValue);
                  }
                }
              }}
              inputProps={{ min: 1 }}
              disabled={loading || addingItem || !selectedMenuItem}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}>
                      x
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{
                flexBasis: { sm: '40%' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              justifyContent: 'center'
            }}>
              <Button
                variant="contained"
                startIcon={addingItem ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                fullWidth
                onClick={(e) => {
                  e.preventDefault();
                  // Garante que a quantidade seja pelo menos 1 antes de adicionar
                  if (quantity <= 0) {
                    setQuantity(1);
                  }
                  handleAddItem();
                }}
                disabled={!selectedMenuItem || quantity <= 0 || loading || addingItem}
                type="submit"
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'all 0.3s',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  },
                  position: 'relative'
                }}
              >
                {addingItem ? "Adicionando..." : "Adicionar ao Pedido"}
              </Button>
              
              {/* Exibe o preço total quando um item estiver selecionado e houver quantidade */}
              {selectedMenuItem && quantity > 0 && (
                <Zoom in={true}>
                  <Chip
                    label={`Total: ${formatCurrency(totalPrice)}`}
                    color="primary"
                    sx={{ 
                      mt: 1, 
                      alignSelf: 'center',
                      fontWeight: 'bold',
                      boxShadow: 1
                    }}
                  />
                </Zoom>
              )}
            </Box>
          </Box>
        </Stack>
      </form>
      
      {/* Indicador de carregamento */}
      {loading && (
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default ItemForm;