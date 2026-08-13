import React, { useState, useEffect } from "react";
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
  Chip,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  RestaurantMenu as RestaurantMenuIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import TablesService from "@/services/Tables/tablesService";
import OrderList from "../../modules/orders/components/OrderList";
import type { Table, Order } from "../../modules/shared/types/common.types";

export default function WaiterOrdersIndex() {
  const [tables, setTables] = useState([] as (Table & { orders?: Order[] })[]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null as (Table & { orders?: Order[] }) | null);
  const [viewingOrders, setViewingOrders] = useState(false);

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

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
  useEffect(() => {
    fetchTablesWithOrders();
  }, [refreshTrigger]);

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Gerenciamento de Pedidos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecione uma mesa para visualizar e gerenciar seus pedidos
        </Typography>
      </Box>

      {/* Barra de ações */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Última atualização: {lastUpdateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refreshData("Dados atualizados manualmente")}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Atualizar Dados
        </Button>
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
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {updateMessage || "Dados atualizados"}
        </Alert>
      </Snackbar>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* Status geral */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              borderRadius: 3,
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              <Box sx={{ textAlign: "center", p: 1 }}>
                <Typography variant="h6">{tables.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de Mesas
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center", p: 1 }}>
                <Typography variant="h6">
                  {tables.filter(t => t.status === "OCCUPIED").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mesas Ocupadas
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center", p: 1 }}>
                <Typography variant="h6">
                  {tables.reduce(
                    (sum, table) => sum + (table.totalItems || 0),
                    0
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Itens Totais
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Grid de mesas */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Mesas Disponíveis
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
            }}
          >
            {tables.map(table => (
              <Card
                key={table.id}
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                  border:
                    table.status === "OCCUPIED"
                      ? "5px solid #900404"  // Borda vermelha escura para mesas ocupadas
                      : "5px solid #2d7c37", // Borda verde para mesas livres
                  bgcolor:
                    table.status === "OCCUPIED"
                      ? "rgba(211, 47, 47, 0.04)"
                      : "rgba(76, 175, 80, 0.04)",
                }}
              >
                <CardActionArea
                  onClick={() => {
                    setSelectedTable(table);
                    setViewingOrders(true);
                  }}
                  sx={{ height: "100%", p: 1 }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {table.name}
                      </Typography>
                      <Chip
                        label={
                          table.status === "OCCUPIED" ? "Ocupada" : "Livre"
                        }
                        size="small"
                        color={
                          table.status === "OCCUPIED" ? "error" : "success"
                        }
                        sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                      />
                    </Box>

                    

                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Total de Itens:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {table.totalItems || 0}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Valor Total:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(table.totalValue || 0)}
                        </Typography>
                      </Box>
                    </Box>

                    {table.status === "OCCUPIED" && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mt: 2,
                          p: 1,
                          borderRadius: 2,
                          bgcolor: "primary.main",
                          color: "white",
                        }}
                      >
                        <RestaurantMenuIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" fontWeight={500}>
                          Ver Pedidos
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Modal com OrderList */}
      <Dialog
        open={!!selectedTable && viewingOrders}
        onClose={() => {
          setSelectedTable(null);
          setViewingOrders(false);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedTable && (
            <OrderList
              table={selectedTable}
              onClose={() => {
                setSelectedTable(null);
                setViewingOrders(false);
                refreshData("Dados atualizados após fechamento");
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
      </Dialog>
    </Box>
  );
}
