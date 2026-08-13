import { httpClient } from '../httpClient';
import { AUTH } from '../endpoints';
import type { AuthService, LoginResponse } from './auth.interface';
import type { User } from '../../modules/auth/types/user.types';
import type { LoginCredentials } from '../../modules/auth/types/user.types';

/**
 * Implementação do serviço de autenticação
 */
export class AuthServiceImpl implements AuthService {
  /**
   * Realiza o login do usuário
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(AUTH.LOGIN, credentials);
    
    // Salva apenas o token por enquanto
    this.saveToken(response.data.token);
    
    return response.data;
  }
  
  /**
   * Busca dados do usuário atual
   */
  async getMe(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado');
    
    try {
      const response = await httpClient.get<User>(AUTH.ME);
      
      // Salva os dados do usuário
      this.saveUser(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
    }
  }
  
  /**
   * Salva token de autenticação
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }
  
  /**
   * Salva dados do usuário
   */
  saveUser(user: User): void {
    localStorage.setItem('userData', JSON.stringify(user));
  }
  
  /**
   * Limpa dados de sessão
   */
  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }
  
  /**
   * Recupera dados de sessão
   */
  getSession(): { token: string; user: User } | null {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('userData');
    
    if (token && userDataStr) {
      try {
        const user = JSON.parse(userDataStr) as User;
        return { token, user };
      } catch (error) {
        console.error('Erro ao parsear dados do usuário do localStorage', error);
        this.clearSession();
        return null;
      }
    }
    
    return null;
  }
}

// Exporta uma instância para uso em toda a aplicação
export const authService: AuthService = new AuthServiceImpl();
