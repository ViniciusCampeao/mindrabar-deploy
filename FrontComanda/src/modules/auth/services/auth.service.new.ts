import type { LoginCredentials, User } from "../types/user.types";
import { authService } from "../../../api/auth";

export async function authLogin(
  data: LoginCredentials
): Promise<{ token: string }> {
  return authService.login(data);
}

export async function fetchUser(): Promise<User> {
  return authService.getMe();
}

// Apenas token - repassando para a implementação centralizada
export function saveToken(token: string): void {
  authService.saveToken(token);
}

// Apenas user - repassando para a implementação centralizada
export function saveUser(user: User): void {
  authService.saveUser(user);
}

export function clearSession(): void {
  authService.clearSession();
}

export function getSession(): { token: string; user: User } | null {
  return authService.getSession();
}
