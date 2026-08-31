export const DEFAULT_ADMIN_PASSWORD = "dev";
export const DEFAULT_SESSION_SECRET = "dev-session-secret-min-32-chars!!";

export function isDefaultAdminPassword(password: string): boolean {
  return password === DEFAULT_ADMIN_PASSWORD;
}

export function isDefaultSessionSecret(secret: string): boolean {
  return secret === DEFAULT_SESSION_SECRET;
}
