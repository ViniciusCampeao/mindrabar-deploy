import type { User, RegisterData } from '../../modules/auth';

/**
 * Tipo para representar os dados de atualização de um usuário
 */
export interface UserUpdateData {
  username?: string;
  password?: string;
  role?: string;
}

/**
 * Porta de serviço de usuários
 */
export interface UserService {
  /**
   * Cria um novo usuário
   */
  createUser(userData: RegisterData): Promise<User>;
  
  /**
   * Busca dados do usuário atual
   */
  getCurrentUser(): Promise<User>;

  /**
   * Busca todos os usuários da mesma empresa
   */
  getUsersByCompany(companyId: number): Promise<User[]>;

  /**
   * Atualiza dados de um usuário específico
   */
  updateUser(userId: number, userData: UserUpdateData): Promise<User>;

  /**
   * Remove um usuário
   */
  deleteUser(userId: number): Promise<void>;
}
