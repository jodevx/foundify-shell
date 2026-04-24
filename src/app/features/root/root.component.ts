import { Component, OnInit, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Componente raíz que redirige según el estado de autenticación
 * - Autenticado: /items
 * - No autenticado: /login
 */
@Component({
  selector: 'app-root',
  standalone: true,
  template: `<div class="loading"><div class="spinner"></div></div>`,
  styles: [`
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RootComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit() {
    // Efecto reactivo: cuando cambia isAuthenticated, redirige
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      console.log('🔐 RootComponent effect - Autenticado:', isAuth);
      
      // Usar Promise para ejecutar en el siguiente tick
      Promise.resolve().then(() => {
        if (isAuth) {
          console.log('✅ Usuario autenticado, redirigiendo a /items');
          this.router.navigate(['/items'], { replaceUrl: true });
        } else {
          console.log('❌ Usuario no autenticado, redirigiendo a /login');
          this.router.navigate(['/login'], { replaceUrl: true });
        }
      });
    });
  }
}

