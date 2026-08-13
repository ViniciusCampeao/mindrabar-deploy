import { Box, Typography, Paper } from "@mui/material";

const OrdersPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Pedidos
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Esta página mostrará os pedidos ativos.</Typography>
      </Paper>
    </Box>
  );
};

export default OrdersPage;
