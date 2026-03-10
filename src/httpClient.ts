import { OAuth2Token } from "./tokens";

export type TokenState = OAuth2Token | Record<string, unknown> | null;

export class HttpClient {
  oauth2Token: TokenState = null;

  refreshOAuth2(): void {
    this.oauth2Token = new OAuth2Token("fresh-token", 10 ** 10);
  }

  // Helper to check if an object is a valid token-like object
  private isValidTokenObject(obj: any): obj is { accessToken: string; expiresAt: number } {
    return obj && 
           typeof obj === 'object' && 
           'accessToken' in obj && 
           'expiresAt' in obj &&
           typeof obj.accessToken === 'string' &&
           typeof obj.expiresAt === 'number';
  }

  // Helper to check if token is expired (works for both class instances and plain objects)
  private isTokenExpired(token: TokenState): boolean {
    if (!token) return true;
    
    if (token instanceof OAuth2Token) {
      return token.expired;
    }
    
    // Handle plain object token
    if (this.isValidTokenObject(token)) {
      const now = Math.floor(Date.now() / 1000);
      return now >= token.expiresAt;
    }
    
    // If it's a plain object but missing required fields, treat as expired
    return true;
  }

  request(
    method: string,
    path: string,
    opts?: { api?: boolean; headers?: Record<string, string> }
  ): { method: string; path: string; headers: Record<string, string> } {
    const api = opts?.api ?? false;
    const headers = opts?.headers ?? {};

    if (api) {
      // Check if token is missing or expired (handles both class instances and plain objects)
      if (!this.oauth2Token || this.isTokenExpired(this.oauth2Token)) {
        this.refreshOAuth2();
      }

      // Set authorization header (works for both class instances and plain objects)
      if (this.oauth2Token instanceof OAuth2Token) {
        headers["Authorization"] = this.oauth2Token.asHeader();
      } else if (this.isValidTokenObject(this.oauth2Token)) {
        headers["Authorization"] = `Bearer ${this.oauth2Token.accessToken}`;
      }
    }

    return { method, path, headers };
  }
}