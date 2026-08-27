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
  ListItemText,
  IconButton,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { ProductCategory } from "../../types/dashboard";
import ProductCategoriesService from "../../services/ProductCategories";

export default function ProductCategories() {
  const [categories, setCategories] = React.useState<ProductCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<ProductCategory | null>(null);
  const [name, setName] = React.useState("");
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await ProductCategoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

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
      await fetchCategories();
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
      await fetchCategories();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Não foi possível remover esta categoria. Verifique se ainda há produtos associados a ela.";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 }, borderRadius: { xs: 2, sm: 3 }, boxShadow: { xs: 1, sm: 2 } }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Categorias do cardápio</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Nova categoria
        </Button>
      </Box>

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
              secondaryAction={
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton edge="end" onClick={() => handleOpenDialog(category)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton edge="end" color="error" onClick={() => handleDelete(category)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={category.name} />
            </ListItem>
          ))}
        </List>
      )}

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
