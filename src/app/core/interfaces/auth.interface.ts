export interface LoginRequest {
  email: string;
  password: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  secondName?: string;
  firstLastName: string;
  secondLastName: string;
  gender: Gender;
  profilePhotoUrl?: string;
  profilePhotoFile?: File;
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
