import { httpClient } from '../httpClient';
import { AUTH, USERS } from '../endpoints';
import type { UserService, UserUpdateData } from './user.interface';
import type { User, RegisterData } from '../../modules/auth';

/**
 * Implementação do serviço de usuários
 */
export class UserServiceImpl implements UserService {
  /**
   * Cria um novo usuário
   */
  async createUser(userData: RegisterData): Promise<User> {
    const response = await httpClient.post<User>(AUTH.USER_CREATE, userData);
    return response.data;
  }
  
  /**
   * Busca dados do usuário atual
   */
  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<User>(AUTH.ME);
    return response.data;
  }

  /**
   * Busca todos os usuários da mesma empresa
   */
  async getUsersByCompany(companyId: number): Promise<User[]> {
    const response = await httpClient.get<User[]>(USERS.BY_COMPANY(companyId));
    return response.data;
  }

  /**
   * Atualiza dados de um usuário específico
   */
  async updateUser(userId: number, userData: UserUpdateData): Promise<User> {
    const response = await httpClient.put<User>(USERS.UPDATE(userId), userData);
    return response.data;
  }

  /**
   * Remove um usuário
   */
  async deleteUser(userId: number): Promise<void> {
    await httpClient.delete(USERS.DELETE(userId), {});
  }
}

// Exporta uma instância para uso em toda a aplicação
export const userService: UserService = new UserServiceImpl();
