import api from "../api";
import type { User, RegisterData } from "../../modules/auth";
import { AUTH, USERS } from "../../api/endpoints";

/**
 * Serviço para gerenciar usuários
 */
const UserService = {
  /**
   * Cria um novo usuário
   * @param userData Dados do usuário a ser criado
   */
  createUser: async (userData: RegisterData): Promise<User> => {
    const response = await api.post<User>(AUTH.USER_CREATE, userData);
    return response.data;
  },

  /**
   * Busca dados do usuário atual
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>(AUTH.ME);
    return response.data;
  },

  /**
   * Busca todos os usuários da mesma empresa
   */
  getUsersByCompany: async (companyId: number): Promise<User[]> => {
    const response = await api.get<User[]>(USERS.BY_COMPANY(companyId));
    return response.data;
  },

  /**
   * Atualiza dados de um usuário específico
   */
  updateUser: async (userId: number, userData: any): Promise<User> => {
    const response = await api.post<User>(USERS.UPDATE(userId), userData);
    return response.data;
  },

  /**
   * Remove um usuário
   */
  deleteUser: async (userId: number): Promise<void> => {
    await api.post(USERS.DELETE(userId), {});
  },
};

export default UserService;
