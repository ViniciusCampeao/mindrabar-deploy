import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { MenuItem, ProductCategory } from "../../types/dashboard";
import MenuItemsService from "../../services/MenuItems";
import ProductCategoriesService from "../../services/ProductCategories";

export default function MenuItems() {
  const [items, setItems] = React.useState([]);
  const [filteredItems, setFilteredItems] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [editItem, setEditItem] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState("asc"); // asc ou desc
  const [filterType, setFilterType] = React.useState("all"); // all, low-stock, out-of-stock
  const [formData, setFormData] = React.useState({
    name: "",
    price: "0",
    costPrice: "0",
    stockQuantity: "0",
    categoryId: "",
  });
  const [categories, setCategories] = React.useState<ProductCategory[]>([]);

  // Definindo a função fetchItems
  const fetchItems = async () => {
    setLoading(true);
    try {
      const items = await MenuItemsService.getAllMenuItems();
      setItems(items);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await ProductCategoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  React.useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);
  
  // Função auxiliar para ordenação natural (considera números corretamente)
  const naturalSort = (a, b, isAsc = true) => {
    // Extrai números do texto para comparação correta de "Item 2" vs "Item 10"
    const regex = /(\d+)|(\D+)/g;
    const aParts = a.name.match(regex) || [];
    const bParts = b.name.match(regex) || [];
    
    const len = Math.min(aParts.length, bParts.length);
    
    // Compara cada parte, tratando números como números e texto como texto
    for (let i = 0; i < len; i++) {
      const aValue = aParts[i];
      const bValue = bParts[i];
      
      // Se ambas as partes são números, compara como números
      const aNum = parseInt(aValue);
      const bNum = parseInt(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        const diff = isAsc ? aNum - bNum : bNum - aNum;
        if (diff !== 0) return diff;
      } 
      // Senão, compara como texto
      else {
        const diff = isAsc ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
        if (diff !== 0) return diff;
      }
    }
    
    // Se as partes comuns são iguais, a string mais curta vem primeiro
    return isAsc ? 
      aParts.length - bParts.length : 
      bParts.length - aParts.length;
  };

  // Efeito para filtrar e ordenar os itens
  React.useEffect(() => {
    if (!items.length) return;
    
    let result = [...items];
    
    // Aplicar pesquisa por nome
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro de estoque
    if (filterType === "low-stock") {
      result = result.filter(item => item.stockQuantity > 0 && item.stockQuantity <= 5);
    } else if (filterType === "out-of-stock") {
      result = result.filter(item => item.stockQuantity <= 0);
    }
    
    // Aplicar ordenação natural
    result.sort((a, b) => naturalSort(a, b, sortOrder === "asc"));
    
    setFilteredItems(result);
  }, [items, searchTerm, sortOrder, filterType]);

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name,
        price: item.price !== undefined ? item.price.toString() : "0",
        costPrice:
          item.costPrice !== undefined ? item.costPrice.toString() : "0",
        stockQuantity:
          item.stockQuantity !== undefined
            ? item.stockQuantity.toString()
            : "0",
        categoryId: item.categoryId != null ? item.categoryId.toString() : "",
      });
    } else {
      setEditItem(null);
      setFormData({
        name: "",
        price: "0",
        costPrice: "0",
        stockQuantity: "0",
        categoryId: "",
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditItem(null);
    setFormData({
      name: "",
      price: "0",
      costPrice: "0",
      stockQuantity: "0",
      categoryId: "",
    });
  };

  const handleSaveItem = async () => {
    try {
      setLoading(true);

      const salePrice = parseFloat(formData.price.replace(",", ".")) || 0;
      const costPrice = parseFloat(formData.costPrice.replace(",", ".")) || 0;
      const stockQuantity = parseInt(formData.stockQuantity) || 0;
      const categoryId = formData.categoryId ? Number(formData.categoryId) : null;

      if (editItem) {
        // Atualiza o preço de venda
        await MenuItemsService.updateMenuItemPrice(editItem.id, salePrice);

        // Se tiver preço de custo, atualiza também
        if (formData.costPrice) {
          await MenuItemsService.updateMenuItemCostPrice(
            editItem.id,
            costPrice
          );
        }

        // Se o estoque tiver mudado, atualiza o estoque
        if (editItem.stockQuantity !== stockQuantity) {
          const difference = stockQuantity - (editItem.stockQuantity || 0);

          if (difference > 0) {
            await MenuItemsService.addMenuItemStock(editItem.id, difference);
          } else if (difference < 0) {
            await MenuItemsService.removeMenuItemStock(
              editItem.id,
              Math.abs(difference)
            );
          }
        }

        // Se a categoria tiver mudado, atualiza a categoria
        if ((editItem.categoryId ?? null) !== categoryId) {
          await MenuItemsService.assignCategory(editItem.id, categoryId);
        }
      } else {
        // Cria um novo produto
        const created = await MenuItemsService.createMenuItem({
          name: formData.name,
          salePrice,
          costPrice,
          stockQuantity,
        });

        // Se uma categoria foi escolhida, atribui em seguida
        if (categoryId != null) {
          await MenuItemsService.assignCategory(created.id, categoryId);
        }
      }

      await fetchItems();
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao salvar item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm("Tem certeza que deseja remover este item?")) {
      try {
        setLoading(true);
        await MenuItemsService.deleteMenuItem(id);
        await fetchItems();
      } catch (error) {
        console.error("Erro ao remover item:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      minWidth: 70,
      flex: 0.5,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "name",
      headerName: "Nome",
      minWidth: 200,
      flex: 2,
    },
    {
      field: "price",
      headerName: "Preço de Venda",
      minWidth: 120,
      flex: 1,
      renderCell: params => {
        const value =
          typeof params.row.price === "number" ? params.row.price : 0;
        return (
          <Box sx={{ textAlign: "right", width: "100%", fontWeight: "bold" }}>
            {`R$ ${value.toFixed(2)}`}
          </Box>
        );
      },
      headerAlign: "right",
      align: "right",
    },
    {
      field: "costPrice",
      headerName: "Preço de Custo",
      minWidth: 120,
      flex: 1,
      renderCell: params => {
        const value =
          typeof params.row.costPrice === "number" ? params.row.costPrice : 0;
        return (
          <Box sx={{ textAlign: "right", width: "100%", fontWeight: "bold" }}>
            {`R$ ${value.toFixed(2)}`}
          </Box>
        );
      },
      headerAlign: "right",
      align: "right",
    },
    {
      field: "stockQuantity",
      headerName: "Estoque",
      minWidth: 100,
      flex: 1,
      renderCell: params => {
        const value =
          typeof params.row.stockQuantity === "number"
            ? params.row.stockQuantity
            : 0;
        return <Box sx={{ textAlign: "right", width: "100%" }}>{value}</Box>;
      },
      headerAlign: "right",
      align: "right",
    },
    {
      field: "categoryName",
      headerName: "Categoria",
      minWidth: 140,
      flex: 1,
      renderCell: params => params.row.categoryName || "Sem categoria",
    },
    {
      field: "actions",
      headerName: "Ações",
      minWidth: 200,
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: params => (
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 1.5 },
            flexWrap: "nowrap",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            sx={{
              minWidth: { xs: "40px", sm: "60px" },
              px: { xs: 0.5, sm: 1 },
              py: 0.5,
              height: { xs: "28px", sm: "30px" },
              fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.875rem" },
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 500,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDeleteItem(params.row.id)}
            sx={{
              minWidth: { xs: "40px", sm: "60px" },
              px: { xs: 0.5, sm: 1 },
              py: 0.5,
              height: { xs: "28px", sm: "30px" },
              fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.875rem" },
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 500,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Remover
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Paper
      sx={{
        p: { xs: 1, sm: 2 },
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          mb: { xs: 1.5, sm: 2 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          sx={{
            py: { xs: 1, sm: 1.5 },
            px: { xs: 2, sm: 3 },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Adicionar Item
        </Button>
        
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2} width={{ xs: "100%", sm: "auto" }}>
          {/* Barra de pesquisa */}
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <OutlinedInput
              placeholder="Pesquisar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </FormControl>
          
          {/* Filtro de estoque */}
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estoque</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Estoque"
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              }
            >
              <MuiMenuItem value="all">Todos</MuiMenuItem>
              <MuiMenuItem value="low-stock">Estoque baixo</MuiMenuItem>
              <MuiMenuItem value="out-of-stock">Sem estoque</MuiMenuItem>
            </Select>
          </FormControl>
          
          {/* Botão de ordenação */}
          <Button 
            variant="outlined" 
            startIcon={<SortIcon />} 
            size="medium"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          height: { xs: "calc(100vh - 200px)", sm: "auto" },
          width: "100%",
          "& .MuiDataGrid-root": {
            border: "none",
            borderRadius: 2,
            "& .MuiDataGrid-cell": {
              fontSize: { xs: "0.875rem", sm: "1rem" },
            },
            "& .MuiDataGrid-columnHeader": {
              fontSize: { xs: "0.875rem", sm: "1rem" },
              fontWeight: 600,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          },
        }}
      >
        <DataGrid
          rows={filteredItems.map(item => {
            return {
              ...item,
              // Garantir que os valores não são undefined ou null
              price: item.price || 0,
              costPrice: item.costPrice || 0,
              stockQuantity: item.stockQuantity || 0,
            };
          })}
          columns={columns.map(column => ({
            ...column,
            minWidth: column.minWidth ?? 100, // mantém flex original
          }))}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          getRowId={row => row.id}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "background.default",
              borderRadius: "8px 8px 0 0",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "0.9rem",
            },
            '& .MuiDataGrid-cell[data-field="price"], & .MuiDataGrid-cell[data-field="costPrice"]':
              {
                fontWeight: "bold",
              },
          }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            width: { xs: "90%", sm: "auto" },
            maxWidth: "500px",
            m: { xs: 2, sm: 3 },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            fontWeight: 500,
            pt: { xs: 2, sm: 3 },
          }}
        >
          {editItem ? "Editar Item" : "Adicionar Novo Item"}
        </DialogTitle>
        <DialogContent
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Item"
            type="text"
            fullWidth
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { borderRadius: 1.5 },
            }}
          />
          <TextField
            margin="dense"
            label="Preço de Venda"
            type="number"
            fullWidth
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
            inputProps={{ step: "0.01" }}
            InputProps={{
              sx: { borderRadius: 1.5 },
              startAdornment: (
                <Box component="span" sx={{ mr: 1 }}>
                  R$
                </Box>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Preço de Custo"
            type="number"
            fullWidth
            value={formData.costPrice}
            onChange={e =>
              setFormData({ ...formData, costPrice: e.target.value })
            }
            inputProps={{ step: "0.01" }}
            InputProps={{
              sx: { borderRadius: 1.5 },
              startAdornment: (
                <Box component="span" sx={{ mr: 1 }}>
                  R$
                </Box>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Quantidade em Estoque"
            type="number"
            fullWidth
            value={formData.stockQuantity}
            onChange={e =>
              setFormData({ ...formData, stockQuantity: e.target.value })
            }
            inputProps={{ min: 0, step: 1 }}
            InputProps={{
              sx: { borderRadius: 1.5 },
            }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="category-select-label">Categoria</InputLabel>
            <Select
              labelId="category-select-label"
              label="Categoria"
              value={formData.categoryId}
              onChange={e =>
                setFormData({ ...formData, categoryId: e.target.value as string })
              }
              sx={{ borderRadius: 1.5 }}
            >
              <MuiMenuItem value="">
                <em>Sem categoria</em>
              </MuiMenuItem>
              {categories.map(category => (
                <MuiMenuItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: 1.5,
            }}
          >
            {editItem ? "Salvar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
