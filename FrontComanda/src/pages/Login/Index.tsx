import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  Typography,
} from "@mui/material";
import type { LoginCredentials } from "../../modules/auth";
import { useAuth, authLogin, fetchUser } from "../../modules/auth";
import logo from "../../assets/logo.png";

const schema = yup
  .object({
    username: yup.string().required("Usuário é obrigatório"),
    password: yup.string().required("Senha é obrigatória"),
  })
  .required();

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [error, setError] = useState("");

  // Se já estiver autenticado, redireciona
  useEffect(() => {
    if (user) {
      navigate(user.role === "MANAGER" ? "/dashboard" : "/tables", {
        replace: true,
      });
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  } as { resolver: any });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      // 1. Faz login -> pega o token
      const { token } = await authLogin(data);

      // 2. Busca os dados do usuário com /auth/me
      const user = await fetchUser();

      // 3. Salva no contexto
      login(token, user);

      // 4. Redireciona
      navigate(user.role === "MANAGER" ? "/dashboard" : "/tables");
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Usuário ou senha inválidos");
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        px: { xs: 2, sm: 3 },
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 2, sm: 3 },
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
          boxShadow: { xs: 0, sm: 3 }
        }}
      >
        <Box 
          sx={{ 
            mb: 2,
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center' 
          }}
        >
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              maxWidth: '140px', 
              height: 'auto' 
            }} 
          />
          <Typography
            variant="h6" 
            sx={{ 
              mt: 2, 
              color: 'text.primary',
              fontWeight: 500,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              textAlign: 'center'
            }}
          >
            Bem vindo ao Sistema 
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              textAlign: 'center'
            }}
          >
            Faça login para acessar a sua conta
          </Typography>
        </Box>

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
            label="Nome de Usuário"
            placeholder="Digite seu nome de usuário"
            autoComplete="username"
            autoFocus
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            sx={{ 
              mb: 2,
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
            placeholder="Digite sua senha"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
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
            {isSubmitting ? "Entrando..." : "ENTRAR"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
