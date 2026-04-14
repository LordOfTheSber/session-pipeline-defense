const TOKEN_KEY = 'session-defense:auth-token';

export function getAuthToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)?.trim();
  return token ? token : null;
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}
