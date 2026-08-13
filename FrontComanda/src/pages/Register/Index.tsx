import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import type { RegisterData } from "../../modules/auth";
import UserService from "../../services/Users";

const schema = yup
  .object({
    username: yup
      .string()
      .min(3, "O nome do garçom deve ter no mínimo 3 caracteres")
      .max(20, "O nome do garçom deve ter no máximo 20 caracteres")
      .matches(
        /^[a-zA-Z0-9]+$/,
        "O nome do garçom deve conter apenas letras e números"
      )
      .required("Nome do garçom é obrigatório"),
    password: yup
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres")
      .required("Senha é obrigatória"),
  })
  .required();

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Definir um tipo simplificado para o formulário
  type FormData = {
    username: string;
    password: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  } as { resolver: any });

  const onSubmit = async (formData: FormData) => {
    try {
      // Buscar o usuário atual para obter o companyId
      const currentUserStr = localStorage.getItem("userData");
      let companyId = 0;

      if (currentUserStr) {
        try {
          const currentUser = JSON.parse(currentUserStr);
          companyId = currentUser.companyId || 0;
        } catch (e) {
          console.error("Erro ao obter companyId do usuário atual:", e);
        }
      }

      if (!companyId) {
        throw new Error(
          "É necessário estar autenticado com uma empresa válida para registrar um garçom"
        );
      }

      // Criar o objeto de dados para a API
      const userData: RegisterData = {
        username: formData.username,
        password: formData.password,
        // Garçom é sempre o papel padrão
        role: "WAITER",
        // Usar o companyId do usuário atual
        companyId: companyId,
        // Gerar um email com base no nome de usuário (pois é obrigatório)
        email: `${formData.username}@comanda.com`,
      };

      // Chamar o serviço para criar o usuário
      await UserService.createUser(userData);
      navigate("/login", {
        state: { message: "Garçom registrado com sucesso!" },
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" &&
              err !== null &&
              "response" in err &&
              typeof err.response === "object" &&
              err.response !== null &&
              "data" in err.response &&
              typeof err.response.data === "object" &&
              err.response.data !== null &&
              "message" in err.response.data
            ? String(err.response.data.message)
            : "Erro ao realizar registro do garçom. Tente novamente.";

      setError(errorMessage);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        px: { xs: 2, sm: 3 },
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          p: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: { xs: 2, sm: 2 },
          boxShadow: { xs: 0, sm: 3 },
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          sx={{
            mb: 3,
            fontSize: { xs: "1.5rem", sm: "1.75rem" },
            fontWeight: 500,
          }}
        >
          Registrar Novo Garçom
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              width: "100%",
              mb: 2,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%" }}
        >
          <TextField
            margin="normal"
            fullWidth
            label="Nome do Garçom"
            placeholder="Digite o nome do garçom"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent',
                '& input': {
                  backgroundColor: 'transparent',
                },
                '& input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 100px transparent inset',
                  WebkitTextFillColor: 'inherit',
                },
              },
            }}
            size="medium"
            InputProps={{
              sx: { 
                borderRadius: 1.5,
              },
            }}
            inputProps={{
              style: { backgroundColor: 'transparent' }
            }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Senha"
            type="password"
            placeholder="Digite a senha do garçom"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ 
              mb: 4,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent',
                '& input': {
                  backgroundColor: 'transparent',
                },
                '& input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 100px transparent inset',
                  WebkitTextFillColor: 'inherit',
                },
              },
            }}
            size="medium"
            InputProps={{
              sx: { 
                borderRadius: 1.5,
              },
            }}
            inputProps={{
              style: { backgroundColor: 'transparent' }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              mb: 2,
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: "1rem", sm: "1.1rem" },
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 500,
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando Garçom..." : "Registrar Garçom"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
