export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
