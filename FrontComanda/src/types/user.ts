export type UserRole = "ADMIN" | "USER" | "MANAGER" | "WAITER";

export interface User {
  userId: number;
  username: string;
  companyId: number;
  role: UserRole;
  email?: string;
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
