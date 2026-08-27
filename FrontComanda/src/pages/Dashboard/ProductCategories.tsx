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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import type { MenuItem, ProductCategory } from "../../types/dashboard";
import ProductCategoriesService from "../../services/ProductCategories";
import MenuItemsService from "../../services/MenuItems";

export default function ProductCategories() {
  const [categories, setCategories] = React.useState<ProductCategory[]>([]);
  const [products, setProducts] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<ProductCategory | null>(null);
  const [name, setName] = React.useState("");

  const [manageCategory, setManageCategory] = React.useState<ProductCategory | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [itemSearch, setItemSearch] = React.useState("");
  const [savingItems, setSavingItems] = React.useState(false);

  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [categoriesData, productsData] = await Promise.all([
        ProductCategoriesService.getAll(),
        MenuItemsService.getAllMenuItems(),
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar categorias/produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAll();
  }, []);

  const itemCountByCategory = React.useMemo(() => {
    const counts = new Map<number, number>();
    for (const product of products) {
      if (product.categoryId != null) {
        counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
      }
    }
    return counts;
  }, [products]);

  const handleOpenDialog = (category?: ProductCategory) => {
    if (category) {
      setEditCategory(category);
      setName(category.name);
    } else {
      setEditCategory(null);
      setName("");
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditCategory(null);
    setName("");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setSnackbar({ open: true, message: "Digite um nome para a categoria.", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      if (editCategory) {
        await ProductCategoriesService.update(editCategory.id, name.trim());
        setSnackbar({ open: true, message: "Categoria atualizada.", severity: "success" });
      } else {
        await ProductCategoriesService.create(name.trim());
        setSnackbar({ open: true, message: "Categoria criada.", severity: "success" });
      }
      await fetchAll();
      handleCloseDialog();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Não foi possível salvar a categoria.";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: ProductCategory) => {
    if (!window.confirm(`Remover a categoria "${category.name}"?`)) return;

    try {
      setLoading(true);
      await ProductCategoriesService.remove(category.id);
      setSnackbar({ open: true, message: "Categoria removida.", severity: "success" });
      await fetchAll();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Não foi possível remover esta categoria. Verifique se ainda há produtos associados a ela.";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenManageItems = (category: ProductCategory) => {
    setManageCategory(category);
    setSelectedIds(new Set(products.filter(p => p.categoryId === category.id).map(p => p.id)));
    setItemSearch("");
  };

  const handleCloseManageItems = () => {
    if (savingItems) return;
    setManageCategory(null);
    setSelectedIds(new Set());
    setItemSearch("");
  };

  const toggleItem = (productId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleConfirmItems = async () => {
    if (!manageCategory) return;

    const originalIds = new Set(products.filter(p => p.categoryId === manageCategory.id).map(p => p.id));
    const toAssign = [...selectedIds].filter(id => !originalIds.has(id));
    const toRemove = [...originalIds].filter(id => !selectedIds.has(id));

    if (toAssign.length === 0 && toRemove.length === 0) {
      handleCloseManageItems();
      return;
    }

    try {
      setSavingItems(true);
      await Promise.all([
        ...toAssign.map(id => MenuItemsService.assignCategory(id, manageCategory.id)),
        ...toRemove.map(id => MenuItemsService.assignCategory(id, null)),
      ]);
      setSnackbar({ open: true, message: "Itens da categoria atualizados.", severity: "success" });
      await fetchAll();
      handleCloseManageItems();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Não foi possível atualizar os itens desta categoria.";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setSavingItems(false);
    }
  };

  const filteredProducts = React.useMemo(() => {
    const term = itemSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter(p => p.name.toLowerCase().includes(term));
  }, [products, itemSearch]);

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 }, borderRadius: { xs: 2, sm: 3 }, boxShadow: { xs: 1, sm: 2 } }}>
      <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Categorias do cardápio</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Nova categoria
        </Button>
      </Box>

      {categories.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Clique em uma categoria para escolher os itens que fazem parte dela.
        </Typography>
      )}

      {loading && categories.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          Nenhuma categoria criada ainda. Crie categorias como "Bebidas", "Comidas" ou "Espetos" para organizar o
          cardápio.
        </Typography>
      ) : (
        <List>
          {categories.map(category => (
            <ListItem
              key={category.id}
              divider
              disablePadding
              secondaryAction={
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    edge="end"
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenDialog(category);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(category);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemButton onClick={() => handleOpenManageItems(category)} sx={{ pr: 10 }}>
                <ListItemText primary={category.name} />
                <Chip label={`${itemCountByCategory.get(category.id) ?? 0} ${itemCountByCategory.get(category.id) === 1 ? "item" : "itens"}`} size="small" />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Diálogo de criar/editar categoria */}
      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editCategory ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da categoria"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Bebidas, Comidas, Espetos..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editCategory ? "Salvar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de seleção de itens da categoria */}
      <Dialog open={!!manageCategory} onClose={handleCloseManageItems} fullWidth maxWidth="sm">
        <DialogTitle>Itens em "{manageCategory?.name}"</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 2, pb: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar item..."
              value={itemSearch}
              onChange={e => setItemSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Divider />
          {filteredProducts.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              Nenhum item encontrado.
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 420, overflowY: "auto" }}>
              {filteredProducts.map(product => {
                const checked = selectedIds.has(product.id);
                const belongsElsewhere =
                  product.categoryId != null && product.categoryId !== manageCategory?.id;
                return (
                  <ListItem key={product.id} disablePadding>
                    <ListItemButton onClick={() => toggleItem(product.id)}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple />
                      </ListItemIcon>
                      <ListItemText primary={product.name} />
                      {belongsElsewhere && (
                        <Chip
                          label={product.categoryName || "Outra categoria"}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%", px: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedIds.size} {selectedIds.size === 1 ? "item selecionado" : "itens selecionados"}
            </Typography>
            <Box>
              <Button onClick={handleCloseManageItems} disabled={savingItems}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmItems} variant="contained" disabled={savingItems} sx={{ ml: 1 }}>
                {savingItems ? "Salvando..." : "Confirmar"}
              </Button>
            </Box>
          </Stack>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
