import type { User } from '../../modules/auth/types/user.types';
import type { LoginCredentials } from '../../modules/auth/types/user.types';

/**
 * Interface de resposta de login
 */
export interface LoginResponse {
  token: string;
}

/**
 * Porta de serviço de autenticação
 */
export interface AuthService {
  /**
   * Realiza o login do usuário
   */
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  
  /**
   * Busca dados do usuário atual
   */
  getMe(): Promise<User>;
  
  /**
   * Salva token de autenticação
   */
  saveToken(token: string): void;
  
  /**
   * Salva dados do usuário
   */
  saveUser(user: User): void;
  
  /**
   * Limpa dados de sessão
   */
  clearSession(): void;
  
  /**
   * Recupera dados de sessão
   */
  getSession(): { token: string; user: User } | null;
}
