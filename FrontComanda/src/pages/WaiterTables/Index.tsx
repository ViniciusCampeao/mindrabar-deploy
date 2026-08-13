import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TablesService from "@/services/Tables/tablesService";
import OrderList from "../../modules/orders/components/OrderList";


export default function WaiterTablesIndex() {
  const [tables, setTables] = React.useState([]);
  const [filteredTables, setFilteredTables] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTable, setSelectedTable] = React.useState(null);
  const [viewingOrders, setViewingOrders] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState("asc"); // asc ou desc

  // Busca mesas e pedidos abertos
  const fetchTablesWithOrders = async () => {
    try {
      setLoading(true);

      // Usar o método que já calcula todos os totais e detalhes
      const tablesWithDetails = await TablesService.getTablesWithOrderDetails();

      // Verificar se há mesas sem orders definidos e corrigir
      const cleanedTables = tablesWithDetails.map(table => {
        if (!table.orders) {
          return { ...table, orders: [], totalItems: 0, totalValue: 0 };
        }
        return table;
      });

      setTables(cleanedTables);
      setFilteredTables(cleanedTables);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Estados para controle de atualização e notificações
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [lastUpdateTime, setLastUpdateTime] = React.useState(new Date());
  const [showUpdateNotification, setShowUpdateNotification] = React.useState(false);
  const [updateMessage, setUpdateMessage] = React.useState("");

  // Função para forçar atualização dos dados
  const refreshData = (message?: string) => {
    setRefreshTrigger(prev => prev + 1);
    setLastUpdateTime(new Date());

    if (message) {
      setUpdateMessage(message);
      setShowUpdateNotification(true);
    }
  };

  // Buscar dados quando o refreshTrigger mudar
  React.useEffect(() => {
    fetchTablesWithOrders();
  }, [refreshTrigger]);
  
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
    
    // Aplicar ordenação natural
    result.sort((a, b) => naturalSort(a, b, sortOrder === "asc"));
    
    setFilteredTables(result);
  }, [tables, searchTerm, sortOrder]);

  // Encontra a mesa selecionada atualizada para evitar problemas de referência
  const currentSelectedTable = React.useMemo(() => {
    if (!selectedTable || !tables.length) return selectedTable;
    
    // Procura a mesa atualizada com o mesmo ID
    const updatedTable = tables.find(table => table.id === selectedTable.id);
    return updatedTable || selectedTable;
  }, [selectedTable, tables]);

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box>
      {/* Controles de pesquisa, ordenação e atualização */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          {/* Campo de pesquisa */}
          <Box sx={{ minWidth: 200, flex: 1 }}>
            <input
              type="text"
              placeholder="Pesquisar mesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", 
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ccc"
              }}
            />
          </Box>
          
          {/* Botão de ordenação */}
          <Button 
            variant="outlined"
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            startIcon={sortOrder === "asc" ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
            sx={{ minWidth: 120 }}
          >
            {sortOrder === "asc" ? "A → Z" : "Z → A"}
          </Button>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary">
            Última atualização: {lastUpdateTime.toLocaleTimeString()}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => refreshData("Dados atualizados manualmente")}
          >
            Atualizar
          </Button>
        </Box>
      </Box>

      {/* Notificação de atualização */}
      <Snackbar
        open={showUpdateNotification}
        autoHideDuration={3000}
        onClose={() => setShowUpdateNotification(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowUpdateNotification(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {updateMessage || "Dados atualizados"}
        </Alert>
      </Snackbar>

      {/* Grid de cards clicáveis */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2,1fr)",
            md: "repeat(3,1fr)",
            lg: "repeat(4,1fr)",
          },
        }}
      >
        {filteredTables.length > 0 ? filteredTables.map(table => (
          <Card 
            key={table.id} 
            sx={{ 
              borderRadius: 2, 
              height: "100%", 
              border: `5px solid ${table.status === "OCCUPIED" ? "#900404" : "#2d7c37"}`,
              transition: 'border-color 0.3s ease'
            }}
          >
            <CardActionArea
              onClick={() => {
                setSelectedTable(table);
                setViewingOrders(true);
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {table.name}
                </Typography>
                <Typography>
                  Status:{" "}
                  <Box
                    component="span"
                    sx={{
                      color:
                        table.status === "OCCUPIED"
                          ? "error.main"
                          : "success.main",
                      fontWeight: 500,
                    }}
                  >
                    {table.status === "OCCUPIED" ? "Ocupada" : "Livre"}
                  </Box>
                </Typography>
                <Typography>Total de Itens: {table.totalItems || 0}</Typography>
                <Typography>
                  Valor Total:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(table.totalValue || 0)}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        )) : (
          <Box sx={{ gridColumn: "1/-1", textAlign: "center", py: 4 }}>
            <Typography variant="h6">
              {searchTerm ? "Nenhuma mesa corresponde à pesquisa" : "Não há mesas disponíveis"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Modal com OrderList */}
      <Dialog
        open={!!selectedTable && viewingOrders}
        onClose={() => {
          setSelectedTable(null);
          setViewingOrders(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogContent dividers sx={{ p: 3 }}>
          {currentSelectedTable && (
            <OrderList
              table={currentSelectedTable}
              onClose={() => {
                setSelectedTable(null);
                setViewingOrders(false);
                // Atualizar dados apenas ao fechar
                refreshData("Dados atualizados após fechamento");
              }}
              onOrderCreated={() => {
                // Atualizar dados quando um pedido for criado
                refreshData("Novo pedido criado com sucesso");
              }}
              onOrderUpdated={() => {
                // Atualizar dados quando um pedido for atualizado  
                refreshData("Pedido atualizado com sucesso");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
