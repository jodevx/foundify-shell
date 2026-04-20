import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, LogoutResponse, AuthUser } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly apiUrl = 'http://localhost:3000/auth';
  private readonly tokenKey = 'foundify_access_token';
  
  // Signals para estado reactivo
  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private readonly isLoadingSignal = signal<boolean>(false);
  
  // Computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isLoading = this.isLoadingSignal.asReadonly();
  
  constructor() {
    this.initializeAuth();
  }
  
  /**
   * Inicializa la autenticación verificando si hay un token válido
   */
  private initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      // Decodificar el JWT para obtener los datos del usuario
      const user = this.decodeToken(token);
      if (user) {
        this.currentUserSignal.set(user);
      } else {
        this.clearAuth();
      }
    }
  }
  
  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoadingSignal.set(true);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap({
        next: (response) => {
          this.setToken(response.accessToken);
          this.currentUserSignal.set(this.decodeToken(response.accessToken));
          this.isLoadingSignal.set(false);
        },
        error: () => {
          this.isLoadingSignal.set(false);
        }
      })
    );
  }
  
  /**
   * Logout de usuario
   */
  logout(): Observable<LogoutResponse> {
    this.isLoadingSignal.set(true);
    
    return this.http.post<LogoutResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap({
        next: () => {
          this.clearAuth();
          this.isLoadingSignal.set(false);
          this.router.navigate(['/login']);
        },
        error: () => {
          // Incluso si falla el logout en el servidor, limpiamos localmente
          this.clearAuth();
          this.isLoadingSignal.set(false);
          this.router.navigate(['/login']);
        }
      })
    );
  }
  
  /**
   * Obtiene el token del localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  /**
   * Guarda el token en localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  
  /**
   * Limpia la autenticación
   */
  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSignal.set(null);
  }
  
  /**
   * Decodifica el JWT para obtener los datos del usuario
   */
  private decodeToken(token: string): AuthUser | null {
    try {
      const base64Payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64Payload));
      return {
        id: payload.sub,
        email: payload.email
      };
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }
}
