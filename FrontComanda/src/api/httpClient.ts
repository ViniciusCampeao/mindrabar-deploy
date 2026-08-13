import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from './endpoints';

/**
 * Interface para o cliente HTTP
 */
export interface HttpClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}

/**
 * Implementação de cliente HTTP baseada em Axios
 */
class AxiosHttpClient implements HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
    });

    // Interceptor para adicionar token de autenticação
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratamento de erros
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const { status, data } = error.response;

          // Tratamento específico para cada código de erro
          switch (status) {
            case 401:
              console.error('Erro de autenticação: Token inválido ou expirado');
              break;
            case 403:
              console.error('Erro de autorização: Sem permissão para esta operação', data);
              break;
            case 404:
              console.error('Recurso não encontrado');
              break;
            case 500:
              console.error('Erro interno do servidor', data);
              break;
            default:
              console.error(`Erro ${status}:`, data);
          }
        } else if (error.request) {
          console.error('Sem resposta do servidor', error.request);
        } else {
          console.error('Erro ao configurar requisição', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

// Exporta uma instância do cliente HTTP para ser usada em toda a aplicação
export const httpClient: HttpClient = new AxiosHttpClient(API_BASE_URL);
