/**
 * @deprecated Use httpClient from @/api/httpClient instead
 */

import axios from "axios";
import { API_BASE_URL } from "../api/endpoints";

// Criar cliente HTTP que será substituído pela nova implementação
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;

      // Tratamento específico para cada código de erro
      switch (status) {
        case 401:
          console.error("Erro de autenticação: Token inválido ou expirado");
          // Pode redirecionar para login se necessário
          break;
        case 403:
          console.error(
            "Erro de autorização: Sem permissão para esta operação",
            data
          );
          // Não interromper a aplicação, apenas registrar o erro
          break;
          // Aqui poderia notificar o usuário sobre falta de permissão
          break;
        case 404:
          console.error("Recurso não encontrado");
          break;
        case 500:
          console.error("Erro interno do servidor", data);
          break;
        default:
          console.error(`Erro ${status}:`, data);
      }
    } else if (error.request) {
      console.error("Sem resposta do servidor", error.request);
    } else {
      console.error("Erro ao configurar requisição", error.message);
    }

    return Promise.reject(error);
  }
);

// Marcando como obsoleto
console.warn("api.ts está obsoleto e será removido em versões futuras. Use httpClient de @/api/httpClient");

export default api;
