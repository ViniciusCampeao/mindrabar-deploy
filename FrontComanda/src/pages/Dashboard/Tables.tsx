import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Paper,
  TextField,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Toolbar,
  OutlinedInput,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import FilterListIcon from "@mui/icons-material/FilterList";
import type {
  Table as TableType,
} from "../../modules/shared/types/common.types";
import TablesService from "@/services/Tables/tablesService";

export default function TableManagement() {
  const [tables, setTables] = React.useState([]);
  const [filteredTables, setFilteredTables] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [newTableName, setNewTableName] = React.useState("");
  const [editTable, setEditTable] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState("asc"); // asc ou desc
  const [filterStatus, setFilterStatus] = React.useState("all"); // all, occupied, free

  const fetchTables = async () => {
    try {
      setLoading(true);
      // Usar o método que também carrega os detalhes dos pedidos, itens e valores
      const tables = await TablesService.getTablesWithOrderDetails();

      // Log para depuração
      setTables(tables);
    } catch (error) {
      console.error("Erro ao carregar mesas:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTables();

    // Atualizar dados a cada 30 segundos
    const intervalId = setInterval(() => {
      fetchTables();
    }, 30000);

    // Limpar intervalo quando o componente for desmontado
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Função auxiliar para ordenação natural (considera números corretamente)
  const naturalSort = (a, b, isAsc = true) => {
    // Extrai números do texto para comparação correta de "Mesa 2" vs "Mesa 10"
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

  // Efeito para filtrar e ordenar as mesas
  React.useEffect(() => {
    if (!tables.length) return;
    
    let result = [...tables];
    
    // Aplicar pesquisa por nome
    if (searchTerm) {
      result = result.filter(table => 
        table.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro de status
    if (filterStatus !== "all") {
      result = result.filter(table => {
        const hasActiveOrders = table.orders?.some(order => order.status !== "COMPLETED" && order.status !== "CANCELLED");
        return filterStatus === "occupied" ? hasActiveOrders : !hasActiveOrders;
      });
    }
    
    // Aplicar ordenação natural
    result.sort((a, b) => naturalSort(a, b, sortOrder === "asc"));
    
    setFilteredTables(result);
  }, [tables, searchTerm, sortOrder, filterStatus]);

  const handleAddTable = async () => {
    try {
      await TablesService.createTable({
        name: newTableName || `Mesa ${tables.length + 1}`,
      });
      fetchTables();
      setOpen(false);
      setNewTableName("");
    } catch (error) {
      console.error("Erro ao adicionar mesa:", error);
    }
  };

  const handleCloseEditDialog = () => {
    setEditTable(null);
  };

  const handleDeleteTable = async (id: number) => {
    if (window.confirm("Tem certeza que deseja remover esta mesa?")) {
      try {
        await TablesService.deleteTable(id);
        fetchTables();
      } catch (error) {
        console.error("Erro ao remover mesa:", error);
      }
    }
  };

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
          onClick={() => setOpen(true)}
          sx={{
            py: { xs: 1, sm: 1.5 },
            px: { xs: 2, sm: 3 },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Adicionar Mesa
        </Button>
        
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2} width={{ xs: "100%", sm: "auto" }}>
          {/* Barra de pesquisa */}
          <FormControl variant="outlined" size="small" sx={{ minWidth: 100, flexGrow: 1 }}>
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
          
          {/* Filtro de status */}
          <FormControl variant="outlined" size="small" sx={{ minWidth: 100, flexGrow: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="occupied">Ocupadas</MenuItem>
              <MenuItem value="free">Livres</MenuItem>
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
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <MuiTable>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Itens</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTables.map(table => (
                  <TableRow key={table.id}>
                    <TableCell>{table.name}</TableCell>
                    <TableCell>
                      {table.status === "OCCUPIED" ? (
                        <Typography color="error">Ocupada</Typography>
                      ) : (
                        <Typography color="success.main">Livre</Typography>
                      )}
                    </TableCell>
                    <TableCell>{table.totalItems || 0}</TableCell>
                    <TableCell>
                      {(table.totalValue || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteTable(table.id)}
                          disabled={table.status === "OCCUPIED"}
                        >
                          Remover
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </MuiTable>
          </TableContainer>
        )}
      </Box>

      {/* Dialog para adicionar nova mesa */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
          Adicionar Nova Mesa
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
            label="Nome da Mesa"
            type="text"
            fullWidth
            variant="outlined"
            value={newTableName}
            onChange={e => setNewTableName(e.target.value)}
            placeholder={`Mesa ${tables.length + 1}`}
            sx={{ mt: 1 }}
          />
          <Box
            component="p"
            sx={{
              margin: "10px 0 0",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              color: "text.secondary",
            }}
          >
            Se não especificar um nome, será usado um nome automático.
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          <Button
            onClick={() => setOpen(false)}
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddTable}
            variant="contained"
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: 1.5,
            }}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar mesa (pode ser implementado conforme necessidade) */}
      {editTable && (
        <Dialog
          open={!!editTable}
          onClose={handleCloseEditDialog}
          PaperProps={{
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              width: { xs: "90%", sm: "auto" },
              maxWidth: "500px",
              m: { xs: 2, sm: 3 },
            },
          }}
        >
          <DialogTitle>Editar Mesa</DialogTitle>
          <DialogContent>{/* Conteúdo do diálogo de edição */}</DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancelar</Button>
            <Button variant="contained">Salvar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
}
