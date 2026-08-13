import type { LoginCredentials, User } from "../../types/user";
import api from "../api";
import { AUTH } from "../../api/endpoints";

interface LoginResponse {
  token: string;
}

export async function authLogin(
  data: LoginCredentials
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(AUTH.LOGIN, data);

  // Salva apenas o token por enquanto
  saveToken(response.data.token);

  return response.data;
}

export async function fetchUser(): Promise<User> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token não encontrado");

  const response = await api.get<User>(AUTH.ME, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Salva os dados do usuário
  saveUser(response.data);

  return response.data;
}

// Apenas token
export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}

// Apenas user
export function saveUser(user: User): void {
  localStorage.setItem("userData", JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
}

export function getSession(): { token: string; user: User } | null {
  const token = localStorage.getItem("token");
  const userDataStr = localStorage.getItem("userData");

  if (token && userDataStr) {
    try {
      const user = JSON.parse(userDataStr) as User;
      return { token, user };
    } catch (error) {
      console.error("Erro ao parsear dados do usuário do localStorage", error);
      clearSession();
      return null;
    }
  }

  return null;
}
