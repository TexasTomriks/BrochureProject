import { apiRequest } from "./queryClient";
import { type LoginCredentials, type User } from "@shared/schema";

interface AuthResponse {
  user: Omit<User, 'password'>;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  return await response.json();
}

export function getStoredUser(): Omit<User, 'password'> | null {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
}

export function storeUser(user: Omit<User, 'password'>): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem("user");
}
