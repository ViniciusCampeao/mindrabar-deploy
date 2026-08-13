import React, { useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  InputAdornment,
  OutlinedInput,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import TablesService from "@/services/Tables/tablesService";
import OrderList from "../../modules/orders/components/OrderList";
import type { Table, Order } from "../../modules/shared/types/common.types";

export default function TableSummary() {
  const [tables, setTables] = React.useState([]);
  const [filteredTables, setFilteredTables] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTable, setSelectedTable] = React.useState(null);
  const [viewingOrders, setViewingOrders] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState("asc"); // asc ou desc
  const modalRef = useRef(null);

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

      // Log detalhado para depuração
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Estados para controle de atualização e notificações
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [lastUpdateTime, setLastUpdateTime] = React.useState(new Date());
  const [showUpdateNotification, setShowUpdateNotification] = React.useState(false);
  const [updateMessage, setUpdateMessage] = React.useState("");
  
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
    
    // Aplicar ordenação natural
    result.sort((a, b) => naturalSort(a, b, sortOrder === "asc"));
    
    setFilteredTables(result);
  }, [tables, searchTerm, sortOrder]);

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

  // A atualização automática foi removida e agora depende apenas do botão "Atualizar"

  // Gera e baixa PDF a partir do conteúdo dentro de modalRef
  const downloadTablePDF = async () => {
    if (!modalRef.current || !selectedTable) return;

    const canvas = await html2canvas(modalRef.current, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const props = pdf.getImageProperties(imgData);
    const h = (props.height * pageW) / props.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageW, h);
    pdf.save(`mesa_${selectedTable.number}.pdf`);
  };

  // Baixa CSV de todas as mesas
  const downloadCSV = () => {
    const headers = ["Mesa", "Total de Itens", "Valor Total"];
    const data = tables.map(t => [
      t.number,
      t.totalItems || 0,
      t.totalValue?.toFixed(2) || "0.00",
    ]);

    const csv =
      headers.join(",") + "\n" + data.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resumo_mesas.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box>
      {/* Botão global para CSV e atualizar */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            Última atualização: {lastUpdateTime.toLocaleTimeString()}
          </Typography>
        </Box>
        
        <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
          {/* Barra de pesquisa */}
          <OutlinedInput
            placeholder="Pesquisar mesa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            sx={{ width: { xs: "100%", sm: "200px" } }}
          />
          
          {/* Botão de ordenação */}
          <Button 
            variant="outlined" 
            startIcon={<SortIcon />} 
            size="medium"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => refreshData("Dados atualizados manualmente")}
          >
            Atualizar
          </Button>
          
          <Button variant="contained" onClick={downloadCSV}>
            Baixar CSV
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
        {filteredTables.map(table => (
          <Card 
            key={table.id}
            sx={{ 
              borderRadius: 2, 
              height: "100%", 
              border: `5px solid ${table.status === "OCCUPIED" ? "#900404" : "#2da33dff"}`,
              transition: 'border-color 0.3s ease'
            }}
          >
            <CardActionArea onClick={() => setSelectedTable(table)}>
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
        ))}
      </Box>

      {/* Modal com detalhes da mesa selecionada */}
      <Dialog
        open={!!selectedTable}
        onClose={() => setSelectedTable(null)}
        maxWidth="md"
        fullWidth
      >
        {!viewingOrders ? (
          <>
            <DialogTitle>Detalhes da {selectedTable?.name}</DialogTitle>
            <DialogContent dividers>
              <Box ref={modalRef} sx={{ py: 1 }}>
                <Typography>
                  Status:{" "}
                  <Box
                    component="span"
                    sx={{
                      color:
                        selectedTable?.status === "OCCUPIED"
                          ? "error.main"
                          : "success.main",
                      fontWeight: 500,
                    }}
                  >
                    {selectedTable?.status === "OCCUPIED" ? "Ocupada" : "Livre"}
                  </Box>
                </Typography>
                <Typography>
                  Total de Itens: {selectedTable?.totalItems || 0}
                </Typography>
                <Typography>
                  Valor Total:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(selectedTable?.totalValue || 0)}
                </Typography>

                {/* Resumo de pedidos, se existirem */}
                {selectedTable?.orders?.map(order => (
                  <Box key={order.id} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Pedido #{order.id} — Total: R${order.total.toFixed(2)}
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {order.items.map((item, idx) => (
                        <Box component="li" key={idx}>
                          {item.menuItem?.name || `Item #${item.menuItemId}`} x{" "}
                          {item.quantity} = R$
                          {(item.price || item.menuItem?.price || 0).toFixed(2)}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTable(null)}>Fechar</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setViewingOrders(true)}
              >
                Gerenciar Pedidos
              </Button>
              <Button variant="contained" onClick={downloadTablePDF}>
                Baixar PDF
              </Button>
            </DialogActions>
          </>
        ) : (
          <DialogContent dividers sx={{ p: 3 }}>
            {selectedTable && (
              <OrderList
                table={selectedTable}
                onClose={() => {
                  setViewingOrders(false);
                  refreshData("Dados atualizados após fechamento de pedidos");
                }}
                onOrderCreated={() =>
                  refreshData("Novo pedido criado com sucesso")
                }
                onOrderUpdated={() =>
                  refreshData("Pedido atualizado com sucesso")
                }
              />
            )}
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}
