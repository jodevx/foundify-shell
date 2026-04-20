import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Gender, RegisterRequest } from '../../../core/interfaces/auth.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>📝 Crear cuenta</h1>
          <p>Regístrate para comenzar en Foundify</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          @if (errorMessage()) {
            <div class="error-message">
              {{ errorMessage() }}
            </div>
          }

          <div class="form-grid">
            <div class="form-group">
              <label for="firstName">Primer nombre</label>
              <input
                id="firstName"
                type="text"
                formControlName="firstName"
                placeholder="Juan"
                [class.invalid]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
              />
            </div>

            <div class="form-group">
              <label for="secondName">Segundo nombre (opcional)</label>
              <input
                id="secondName"
                type="text"
                formControlName="secondName"
                placeholder="Carlos"
              />
            </div>

            <div class="form-group">
              <label for="firstLastName">Primer apellido</label>
              <input
                id="firstLastName"
                type="text"
                formControlName="firstLastName"
                placeholder="Pérez"
                [class.invalid]="registerForm.get('firstLastName')?.invalid && registerForm.get('firstLastName')?.touched"
              />
            </div>

            <div class="form-group">
              <label for="secondLastName">Segundo apellido</label>
              <input
                id="secondLastName"
                type="text"
                formControlName="secondLastName"
                placeholder="Gómez"
                [class.invalid]="registerForm.get('secondLastName')?.invalid && registerForm.get('secondLastName')?.touched"
              />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="tu@email.com"
                [class.invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              />
            </div>

            <div class="form-group">
              <label for="password">Contraseña</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="Mínimo 8 caracteres"
                [class.invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              />
            </div>

            <div class="form-group">
              <label for="gender">Género</label>
              <select
                id="gender"
                formControlName="gender"
                [class.invalid]="registerForm.get('gender')?.invalid && registerForm.get('gender')?.touched"
              >
                <option value="">Selecciona una opción</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
                <option value="OTHER">Otro</option>
                <option value="PREFER_NOT_TO_SAY">Prefiero no decir</option>
              </select>
            </div>

            <div class="form-group">
              <label for="profilePhoto">Foto de perfil (opcional)</label>
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                (change)="onProfilePhotoSelected($event)"
              />
              @if (selectedPhotoName()) {
                <small>Archivo seleccionado: {{ selectedPhotoName() }}</small>
              }
            </div>
          </div>

          <button
            type="submit"
            class="register-button"
            [disabled]="registerForm.invalid || authService.isLoading()"
          >
            @if (authService.isLoading()) {
              <span class="spinner"></span>
              Creando cuenta...
            } @else {
              Registrarse
            }
          </button>
        </form>

        <div class="login-link">
          <p>
            ¿Ya tienes cuenta?
            <a (click)="goToLogin()">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 32px;
      width: 100%;
      max-width: 760px;
    }

    .register-header {
      text-align: center;
      margin-bottom: 24px;

      h1 {
        font-size: 2rem;
        margin: 0 0 8px 0;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
      }
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
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

      input,
      select {
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

      small {
        color: #666;
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

    .register-button {
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

    .login-link {
      margin-top: 8px;
      text-align: center;

      p {
        margin: 0;
        color: #666;
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

    @media (max-width: 768px) {
      .register-card {
        max-width: 420px;
        padding: 24px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly errorMessage = signal<string>('');
  readonly selectedPhotoName = signal<string>('');
  private selectedPhotoFile: File | undefined;

  readonly registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', Validators.required],
    secondName: [''],
    firstLastName: ['', Validators.required],
    secondLastName: ['', Validators.required],
    gender: ['' as Gender | '', Validators.required],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');

    const rawValue = this.registerForm.getRawValue();
    const payload: RegisterRequest = {
      email: rawValue.email,
      password: rawValue.password,
      firstName: rawValue.firstName,
      firstLastName: rawValue.firstLastName,
      secondLastName: rawValue.secondLastName,
      gender: rawValue.gender as Gender,
      ...(rawValue.secondName ? { secondName: rawValue.secondName } : {}),
      ...(this.selectedPhotoFile ? { profilePhotoFile: this.selectedPhotoFile } : {})
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error en registro:', error);
        this.errorMessage.set(
          error.status === 409
            ? 'Este email ya está registrado'
            : 'Error al registrarte. Intenta de nuevo.'
        );
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  onProfilePhotoSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];

    if (!file) {
      this.selectedPhotoFile = undefined;
      this.selectedPhotoName.set('');
      return;
    }

    this.selectedPhotoFile = file;
    this.selectedPhotoName.set(file.name);
  }
}
