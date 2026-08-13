import { useState, useEffect, useMemo } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardMedia, 
  Divider, 
  TextField, 
  InputAdornment,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Fab,
  Snackbar,
  Alert
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import CakeIcon from "@mui/icons-material/Cake";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { productService } from "../../../api/products";
import type { MenuItem } from "../../../types/dashboard";
import { useAuth } from "../../../modules/auth/contexts/AuthContext";

// Configuração inicial das categorias
const defaultCategories = [
  { id: 'main', name: 'Pratos Principais', icon: <RestaurantMenuIcon /> },
  { id: 'drinks', name: 'Bebidas', icon: <LocalBarIcon /> },
  { id: 'desserts', name: 'Sobremesas', icon: <CakeIcon /> },
];

// Função para categorizar itens do menu (baseada no nome do produto)
const defaultCategorizeMenuItem = (item: MenuItem): string => {
  const name = item.name.toLowerCase();
  if (name.includes('água') || name.includes('suco') || name.includes('refri') || 
      name.includes('cerveja') || name.includes('drink') || name.includes('vinho')) {
    return 'drinks';
  }
  if (name.includes('bolo') || name.includes('pudim') || name.includes('doce') || 
      name.includes('sobremesa') || name.includes('sorvete')) {
    return 'desserts';
  }
  return 'main';
};

// Interface para gerenciamento de categorias personalizadas
interface ItemCategory {
  itemId: number;
  categoryId: string;
}

// Interface para uma categoria
interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const MenuPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const isManager = user?.role === "MANAGER" || user?.role === "ADMIN";
  
  // Estados para itens do menu e busca
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Estados para gerenciamento de categorias (apenas para gerentes)
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [customCategories, setCustomCategories] = useState<ItemCategory[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemCategory, setSelectedItemCategory] = useState<string>("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");
  
  // Função para encontrar a categoria atual de um item
  const getItemCategory = (itemId: number): string => {
    const customCategory = customCategories.find(cc => cc.itemId === itemId);
    if (customCategory) return customCategory.categoryId;
    
    const item = menuItems.find(item => item.id === itemId);
    return item ? defaultCategorizeMenuItem(item) : 'main';
  };
  
  // Carregar dados do servidor
  useEffect(() => {
    // Carregar configurações de categorias
    fetchCategoriesConfig();
    
    // Carregar itens do cardápio
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const items = await productService.getAllMenuItems();
        setMenuItems(items);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar itens do cardápio:', err);
        setError('Não foi possível carregar o cardápio. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
    
    // Configurar atualizações periódicas para garçons (a cada 30 segundos)
    let interval: number | null = null;
    
    if (!isManager) {
      interval = window.setInterval(() => {
        console.log("Garçom: Atualizando dados do cardápio...");
        fetchCategoriesConfig();
        fetchMenuItems();
      }, 30000); // 30 segundos
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isManager]);
  
  // Salvar alterações nas categorias no servidor e localStorage
  const saveCategories = async () => {
    try {
      // Remover os objetos React dos ícones antes de salvar
      const categoriesToSave = categories.map(cat => ({
        id: cat.id,
        name: cat.name
      }));
      
      // Salvar localmente como fallback
      localStorage.setItem('menuCategories', JSON.stringify(categoriesToSave));
      localStorage.setItem('menuCustomCategories', JSON.stringify(customCategories));
      
      // Simular envio para o servidor
      // Na implementação real, isso seria uma chamada para o backend
      // Exemplo: 
      // await api.post('/menu-categories', {
      //   categories: categoriesToSave,
      //   customCategories: customCategories
      // });
      
      // Simulação de tempo de resposta de servidor
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setShowSnackbar(true);
      setSnackbarMessage("Configurações de categorias salvas com sucesso! Todos os dispositivos serão atualizados.");
      setSnackbarSeverity("success");
    } catch (err) {
      console.error("Erro ao salvar configurações de categorias:", err);
      setShowSnackbar(true);
      setSnackbarMessage("Erro ao salvar configurações. Tente novamente.");
      setSnackbarSeverity("error");
    }
  };
  
  // Handler para abrir diálogo de edição de categoria
  const handleEditCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setEditingCategoryId(categoryId);
      setEditingCategoryName(category.name);
    }
  };
  
  // Handler para salvar o nome editado de uma categoria
  const handleSaveCategoryName = () => {
    if (!editingCategoryId || !editingCategoryName.trim()) return;
    
    setCategories(categories.map(cat => 
      cat.id === editingCategoryId ? { ...cat, name: editingCategoryName.trim() } : cat
    ));
    
    setEditingCategoryId(null);
    setEditingCategoryName("");
    saveCategories();
  };
  
  // Handler para cancelar a edição de categoria
  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };
  
  // Handler para abrir diálogo de edição de item
  const handleEditItemCategory = (itemId: number) => {
    const currentCategory = getItemCategory(itemId);
    setSelectedItemId(itemId);
    setSelectedItemCategory(currentCategory);
    setIsEditingItem(true);
  };
  
  // Handler para salvar a categoria de um item
  const handleSaveItemCategory = () => {
    if (!selectedItemId || !selectedItemCategory) return;
    
    // Atualizar a categoria personalizada do item
    const existingIndex = customCategories.findIndex(cc => cc.itemId === selectedItemId);
    
    if (existingIndex >= 0) {
      // Atualizar categoria existente
      setCustomCategories([
        ...customCategories.slice(0, existingIndex),
        { itemId: selectedItemId, categoryId: selectedItemCategory },
        ...customCategories.slice(existingIndex + 1)
      ]);
    } else {
      // Adicionar nova categoria personalizada
      setCustomCategories([
        ...customCategories,
        { itemId: selectedItemId, categoryId: selectedItemCategory }
      ]);
    }
    
    setIsEditingItem(false);
    setSelectedItemId(null);
    setSelectedItemCategory("");
    saveCategories();
  };
  
  // Handler para cancelar a edição de item
  const handleCancelItemEdit = () => {
    setIsEditingItem(false);
    setSelectedItemId(null);
    setSelectedItemCategory("");
  };
  
  // Handler para abrir diálogo de adição de categoria
  const handleAddCategory = () => {
    setIsAddingCategory(true);
    setNewCategoryName("");
    setNewCategoryId("");
  };
  
  // Handler para salvar nova categoria
  const handleSaveNewCategory = () => {
    if (!newCategoryName.trim() || !newCategoryId.trim()) return;
    
    // Verificar se o ID já existe
    if (categories.some(cat => cat.id === newCategoryId)) {
      setShowSnackbar(true);
      setSnackbarMessage("Este ID de categoria já existe!");
      setSnackbarSeverity("error");
      return;
    }
    
    // Adicionar nova categoria
    const newCategory: Category = {
      id: newCategoryId.trim(),
      name: newCategoryName.trim(),
      icon: <RestaurantMenuIcon />
    };
    
    setCategories([...categories, newCategory]);
    setIsAddingCategory(false);
    setNewCategoryName("");
    setNewCategoryId("");
    saveCategories();
  };
  
  // Handler para cancelar a adição de categoria
  const handleCancelAddCategory = () => {
    setIsAddingCategory(false);
    setNewCategoryName("");
    setNewCategoryId("");
  };
  
  // Handler para fechar o snackbar
  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  // Filtrar itens do menu com base no termo de busca
  const filteredMenuItems = useMemo(() => {
    if (!searchTerm.trim()) return menuItems;
    
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [menuItems, searchTerm]);
  
  // Organizar itens por categoria
  const categorizedItems = useMemo(() => {
    const itemsByCategory: Record<string, MenuItem[]> = {};
    
    // Inicializar todas as categorias definidas
    categories.forEach(category => {
      itemsByCategory[category.id] = [];
    });
    
    filteredMenuItems.forEach(item => {
      const category = getItemCategory(item.id);
      if (itemsByCategory[category]) {
        itemsByCategory[category].push(item);
      } else {
        // Se a categoria não existir (caso raro), colocar na categoria principal
        if (!itemsByCategory['main']) {
          itemsByCategory['main'] = [];
        }
        itemsByCategory['main'].push(item);
      }
    });
    
    return itemsByCategory;
  }, [filteredMenuItems, categories, customCategories, getItemCategory]);
  
  // Formatar preço em reais
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Renderizar item do cardápio
  const renderMenuItem = (item: MenuItem) => (
    <Card 
      key={item.id}
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        mb: 2,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 3,
        },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isManager && (
        <Tooltip title="Alterar categoria">
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.8)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
              zIndex: 2
            }}
            onClick={() => handleEditItemCategory(item.id)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      
      <CardMedia
        component="img"
        sx={{
          width: isMobile ? '100%' : 140,
          height: isMobile ? 140 : '100%',
          objectFit: 'cover',
        }}
        image={`https://source.unsplash.com/random/300x200?food&id=${item.id}`}
        alt={item.name}
      />
      <CardContent sx={{ flex: '1 0 auto', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
          {item.name}
        </Typography>
        
        <Typography 
          variant="h5" 
          color="primary" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          {formatPrice(item.price)}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {item.stockQuantity !== undefined && (
            <Chip 
              label={`Estoque: ${item.stockQuantity}`} 
              color={item.stockQuantity > 5 ? "success" : item.stockQuantity > 0 ? "warning" : "error"}
              size="small"
            />
          )}
          
          {isManager && (
            <Chip 
              label={`Categoria: ${categories.find(cat => cat.id === getItemCategory(item.id))?.name || 'Sem categoria'}`}
              color="info"
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
  
  // Renderizar seção do cardápio (categoria)
  const renderMenuSection = (categoryId: string) => {
    const items = categorizedItems[categoryId] || [];
    const category = categories.find(cat => cat.id === categoryId);
    
    if (items.length === 0) {
      return null;
    }
    
    return (
      <Box key={categoryId} sx={{ mb: 4 }}>
        {isMobile ? (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {category?.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {category?.name || 'Itens'} ({items.length})
                  </Typography>
                </Box>
                
                {isManager && (
                  <Tooltip title="Editar nome da categoria">
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(categoryId);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {items.map((item) => (
                  <Box key={item.id}>
                    {renderMenuItem(item)}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {category?.icon}
                <Typography variant="h5" component="h2" sx={{ ml: 1 }}>
                  {category?.name || 'Itens'} ({items.length})
                </Typography>
              </Box>
              
              {isManager && (
                <Tooltip title="Editar nome da categoria">
                  <IconButton 
                    onClick={() => handleEditCategory(categoryId)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr'
              }
            }}>
              {items.map((item) => (
                <Box key={item.id}>
                  {renderMenuItem(item)}
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    );
  };
  
  // Estado para controlar quando a última atualização ocorreu
  const [lastUpdate, setLastUpdate] = useState<Date | null>(new Date());

  // Declaração da função fetchCategoriesConfig para ser usada em múltiplos locais
  const fetchCategoriesConfig = async () => {
    try {
      // Simular uma chamada de API para obter as configurações de categorias
      // Na implementação real, isso seria uma chamada para o backend
      // Exemplo: const response = await api.get('/menu-categories');
      
      // Por enquanto, vamos usar localStorage como fallback até implementar o backend
      const savedCategories = localStorage.getItem('menuCategories');
      const savedCustomCategories = localStorage.getItem('menuCustomCategories');
      
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories);
        // Restaurar ícones para os objetos carregados
        const categoriesWithIcons = parsedCategories.map((cat: Category) => {
          let icon;
          switch(cat.id) {
            case 'main': icon = <RestaurantMenuIcon />; break;
            case 'drinks': icon = <LocalBarIcon />; break;
            case 'desserts': icon = <CakeIcon />; break;
            default: icon = <RestaurantMenuIcon />;
          }
          return {...cat, icon};
        });
        setCategories(categoriesWithIcons);
      }
      
      if (savedCustomCategories) {
        setCustomCategories(JSON.parse(savedCustomCategories));
      }
    } catch (err) {
      console.error("Erro ao carregar configurações de categorias:", err);
    }
  };
  
  // Função para recarregar dados manualmente
  const handleManualRefresh = async () => {
    setShowSnackbar(true);
    setSnackbarMessage("Atualizando cardápio...");
    setSnackbarSeverity("info");
    
    try {
      await fetchCategoriesConfig();
      
      setLoading(true);
      const items = await productService.getAllMenuItems();
      setMenuItems(items);
      setError(null);
      
      setLastUpdate(new Date());
      
      setShowSnackbar(true);
      setSnackbarMessage("Cardápio atualizado com sucesso!");
      setSnackbarSeverity("success");
    } catch (err) {
      console.error('Erro ao atualizar cardápio:', err);
      setShowSnackbar(true);
      setSnackbarMessage("Erro ao atualizar. Tente novamente.");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to right, #4a90e2, #50c9c3)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
              flex: 1
            }}
          >
            Cardápio
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Botão de atualização manual para garçons */}
            {!isManager && (
              <Tooltip title="Atualizar cardápio">
                <Fab 
                  color="primary" 
                  size="small" 
                  onClick={handleManualRefresh}
                  sx={{ boxShadow: 2 }}
                >
                  <RefreshIcon />
                </Fab>
              </Tooltip>
            )}
            
            {/* Botão para adicionar categorias (apenas gerentes) */}
            {isManager && (
              <Tooltip title="Adicionar nova categoria">
                <Fab 
                  color="secondary" 
                  size="small" 
                  onClick={handleAddCategory}
                  sx={{ boxShadow: 2 }}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar no cardápio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'white' }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: 'rgba(255,255,255,0.2)',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.5)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.7)',
                opacity: 1,
              },
            },
          }}
        />
        
        {!isManager && lastUpdate && (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'right', 
              mt: 1, 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.75rem'
            }}
          >
            Última atualização: {lastUpdate.toLocaleTimeString()} {lastUpdate.toLocaleDateString()}
          </Typography>
        )}
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : filteredMenuItems.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Nenhum item encontrado no cardápio.</Typography>
        </Paper>
      ) : (
        <>
          {categories.map(category => renderMenuSection(category.id))}
        </>
      )}
      
      {/* Diálogo para edição do nome da categoria */}
      <Dialog open={editingCategoryId !== null} onClose={handleCancelCategoryEdit}>
        <DialogTitle>Editar Categoria</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Edite o nome da categoria abaixo:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Categoria"
            type="text"
            fullWidth
            variant="outlined"
            value={editingCategoryName}
            onChange={(e) => setEditingCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCategoryEdit}>Cancelar</Button>
          <Button onClick={handleSaveCategoryName} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para edição da categoria de um item */}
      <Dialog open={isEditingItem} onClose={handleCancelItemEdit}>
        <DialogTitle>Alterar Categoria do Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Selecione a nova categoria para este item:
          </DialogContentText>
          <FormControl fullWidth margin="dense">
            <InputLabel id="category-select-label">Categoria</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedItemCategory}
              label="Categoria"
              onChange={(e) => setSelectedItemCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MuiMenuItem key={category.id} value={category.id}>
                  {category.name}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelItemEdit}>Cancelar</Button>
          <Button onClick={handleSaveItemCategory} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para adicionar nova categoria */}
      <Dialog open={isAddingCategory} onClose={handleCancelAddCategory}>
        <DialogTitle>Adicionar Nova Categoria</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Preencha os dados da nova categoria:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="ID da Categoria (único, sem espaços)"
            type="text"
            fullWidth
            variant="outlined"
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Nome da Categoria"
            type="text"
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAddCategory}>Cancelar</Button>
          <Button onClick={handleSaveNewCategory} color="primary" variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar para feedback */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MenuPage;
