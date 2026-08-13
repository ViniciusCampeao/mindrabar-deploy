import { Box, Typography, Paper } from "@mui/material";

const RegisterPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Cadastro de Usuários
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>
          Esta página permitirá o cadastro de novos usuários.
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
