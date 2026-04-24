import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional para agregar el JWT a las peticiones
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Si hay token y la petición no es a /auth/login, agregarlo
  if (token && !req.url.includes('/auth/login')) {
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedRequest).pipe(
      catchError((error) => {
        if (error?.status === 401 && !req.url.includes('/auth/login')) {
          authService.handleUnauthorized();
        }
        return throwError(() => error);
      })
    );
  }
  
  return next(req).pipe(
    catchError((error) => {
      if (error?.status === 401 && !req.url.includes('/auth/login')) {
        authService.handleUnauthorized();
      }
      return throwError(() => error);
    })
  );
};
