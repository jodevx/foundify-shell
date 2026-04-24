import { Injectable, inject, effect } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth.service';
import { filter } from 'rxjs';

/**
 * Servicio que redirige a /login si no hay token y se intenta acceder 
 * a una ruta que no es pública
 */
@Injectable({ providedIn: 'root' })
export class AuthRedirectService {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly publicRoutes = ['/login', '/register', '/items'];

  init(): Promise<void> {
    return new Promise(resolve => {
      console.log('🔐 AuthRedirectService inicializado');
      
      // Escuchar cambios de ruta
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          const isPublicRoute = this.publicRoutes.some(route => event.url.startsWith(route));
          const isAuthenticated = this.authService.isAuthenticated();

          console.log(`🔐 Navegación a: ${event.url}, Autenticado: ${isAuthenticated}, Público: ${isPublicRoute}`);

          // Si NO está autenticado y va a una ruta que NO es pública → redirige a login
          if (!isAuthenticated && !isPublicRoute && event.url !== '/') {
            console.log('❌ No autenticado en ruta protegida, redirigiendo a /login');
            this.router.navigate(['/login'], { queryParams: { returnUrl: event.url } });
          }
        });

      // Efecto: si se desloguea, redirige a login
      effect(() => {
        const isAuth = this.authService.isAuthenticated();
        if (!isAuth && !['/login', '/register', '/items'].some(r => this.router.url.startsWith(r))) {
          console.log('❌ Sesión expirada, redirigiendo a /login');
          this.router.navigate(['/login']);
        }
      });

      resolve();
    });
  }
}
