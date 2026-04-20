import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🔍 Foundify</h1>
          <p>Sistema de Objetos Perdidos y Encontrados</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          @if (errorMessage()) {
            <div class="error-message">
              {{ errorMessage() }}
            </div>
          }
          
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="tu@email.com"
              [class.invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <span class="field-error">Email inválido</span>
            }
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              [class.invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <span class="field-error">La contraseña es requerida</span>
            }
          </div>
          
          <button 
            type="submit" 
            class="login-button"
            [disabled]="loginForm.invalid || authService.isLoading()"
          >
            @if (authService.isLoading()) {
              <span class="spinner"></span>
              Iniciando sesión...
            } @else {
              Iniciar Sesión
            }
          </button>
        </form>
        
        <div class="demo-credentials">
          <p><strong>Demo:</strong> admin@foundify.com / Admin123!</p>
          <p class="register-cta">
            ¿No tienes cuenta?
            <a (click)="goToRegister()">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 32px;
      
      h1 {
        font-size: 2.5rem;
        margin: 0 0 8px 0;
        color: #333;
      }
      
      p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      label {
        font-weight: 600;
        color: #333;
        font-size: 0.9rem;
      }
      
      input {
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
        
        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        &.invalid {
          border-color: #f44336;
        }
      }
      
      .field-error {
        color: #f44336;
        font-size: 0.8rem;
      }
    }
    
    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      border-left: 4px solid #f44336;
    }
    
    .login-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .demo-credentials {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      
      p {
        margin: 0;
        color: #666;
        font-size: 0.85rem;
        
        strong {
          color: #667eea;
        }
      }

      .register-cta {
        margin-top: 10px;
      }

      a {
        color: #667eea;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);
  
  readonly errorMessage = signal<string>('');
  
  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.errorMessage.set('');
    const credentials = this.loginForm.getRawValue();
    
    this.authService.login(credentials).subscribe({
      next: () => {
        // Obtener la URL de retorno o ir al home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage.set(
          error.status === 401
            ? 'Credenciales incorrectas'
            : 'Error al iniciar sesión. Intenta de nuevo.'
        );
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
