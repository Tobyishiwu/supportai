export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
  industry?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
