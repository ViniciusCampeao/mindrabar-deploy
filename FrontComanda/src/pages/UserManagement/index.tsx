import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../modules/auth";
import type { User } from "../../modules/auth/types/user.types";
import { userService } from "../../api/users/user.service";
import type { UserUpdateData } from "../../api/users/user.interface";

export default function UserManagementIndex() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([] as User[]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null as User | null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    role: ""
  } as UserUpdateData);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning"
  });

  // Definir showSnackbar
  const showSnackbar = useCallback((message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, []);

  // Definir fetchUsers com useCallback
  const fetchUsers = useCallback(async () => {
    if (!user?.companyId) return;

    try {
      setLoading(true);
      const fetchedUsers = await userService.getUsersByCompany(user.companyId);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      showSnackbar("Erro ao carregar usuários", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, showSnackbar]);

  // Verificar se o usuário é gerente
  useEffect(() => {
    if (user && user.role !== "MANAGER" && user.role !== "ADMIN") {
      // Redirecionar se não tiver permissão
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  }, [user, navigate, fetchUsers]);

  const handleEditClick = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setEditForm({
      username: selectedUser.username,
      role: selectedUser.role,
      password: ""
    });
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setOpenDeleteDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      
      const userId = selectedUser.id;
      if (!userId) {
        showSnackbar("Erro: ID do usuário não encontrado", "error");
        setLoading(false);
        return;
      }
      
      await userService.updateUser(userId, editForm);
      fetchUsers(); // Recarregar a lista
      setOpenEditDialog(false);
      showSnackbar("Usuário atualizado com sucesso", "success");
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      showSnackbar("Erro ao atualizar usuário", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      
      // Usar a propriedade id em vez de userId
      const userId = selectedUser.id;
      if (!userId) {
        showSnackbar("Erro: ID do usuário não encontrado", "error");
        setLoading(false);
        return;
      }
      
      await userService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setOpenDeleteDialog(false);
      showSnackbar("Usuário excluído com sucesso", "success");
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      showSnackbar("Erro ao excluir usuário", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Handler para alternar a visibilidade da senha
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Traduzir papel do usuário
  const translateRole = (role: string): string => {
    const roles: Record<string, string> = {
      MANAGER: "Gerente",
      WAITER: "Garçom",
    };
    return roles[role] || role;
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Gerenciamento de Usuários
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie os usuários da sua empresa
        </Typography>
      </Box>

      {/* Barra de ações */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1
        }}
      >
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchUsers}
          disabled={loading}
        >
          Atualizar
        </Button>
      </Box>

      {/* Tabela de usuários */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de usuários">
          <TableHead>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Função</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{translateRole(user.role)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="editar"
                      color="primary"
                      onClick={() => handleEditClick(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="excluir"
                      color="error"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de Edição */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="username"
            label="Nome de Usuário"
            type="text"
            fullWidth
            variant="outlined"
            value={editForm.username}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
          />
          <TextField
            margin="dense"
            id="password"
            label="Nova Senha"
            type={showPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={editForm.password}
            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-label">Função</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={editForm.role}
              label="Função"
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            >
              <MenuItem value="WAITER">Garçom</MenuItem>
              <MenuItem value="MANAGER">Gerente</MenuItem>
              {user?.role === "ADMIN" && (
                <MenuItem value="ADMIN">Administrador</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Exclusão */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o usuário {selectedUser?.username}? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}