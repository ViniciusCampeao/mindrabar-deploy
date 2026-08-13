export type UserRole = "ADMIN" | "USER" | "MANAGER" | "WAITER";

export interface User {
  id: number;
  userId?: number; // Mantido para compatibilidade com código existente
  username: string;
  companyId?: number;
  role: UserRole;
  email?: string; // Mantendo opcional para compatibilidade
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  companyId: number;
}
