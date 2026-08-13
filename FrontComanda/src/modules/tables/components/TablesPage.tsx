import { Box, Typography, Paper } from "@mui/material";

const TablesPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Mesas
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Esta página mostrará as mesas disponíveis.</Typography>
      </Paper>
    </Box>
  );
};

export default TablesPage;
