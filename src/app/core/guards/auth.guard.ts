import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Redirigir al login guardando la URL solicitada
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

/**
 * Guard funcional para redireccionar usuarios autenticados fuera del login
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return true;
  }
  
  // Si ya está autenticado, redirigir a items
  return router.createUrlTree(['/items']);
};

/**
 * Guard global que redirige a login si no hay token y se intenta acceder a ruta protegida
 * Permite rutas públicas y redirige desde raíz
 */
export const rootGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Si está autenticado, lo deja pasar o redirige a /items
  if (authService.isAuthenticated()) {
    console.log('✅ Usuario autenticado en raíz, redirigiendo a /items');
    return router.createUrlTree(['/items']);
  }
  
  // Si NO está autenticado, redirige a login
  console.log('❌ Usuario no autenticado en raíz, redirigiendo a /login');
  return router.createUrlTree(['/login']);
};

