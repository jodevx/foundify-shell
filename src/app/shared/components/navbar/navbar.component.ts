import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="nav-content">
        <div class="nav-brand">
          <a routerLink="/">
            <span class="brand-icon">🔍</span>
            <span class="brand-text">Foundify</span>
          </a>
        </div>
        
        @if (authService.isAuthenticated()) {
          <div class="nav-menu">
            <div class="nav-links">
              <a routerLink="/" class="nav-link">Inicio</a>
              <span class="nav-link disabled">Objetos Perdidos</span>
              <span class="nav-link disabled">Objetos Encontrados</span>
              <span class="nav-link disabled">Mis Publicaciones</span>
            </div>
            
            <div class="nav-user">
              @if (authService.currentUser(); as user) {
                <span class="user-email">{{ user.email }}</span>
              }
              <button class="logout-button" (click)="onLogout()">
                Cerrar Sesión
              </button>
            </div>
          </div>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .nav-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .nav-brand {
      a {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        color: #333;
        font-weight: 700;
        font-size: 1.5rem;
        transition: transform 0.2s ease;
        
        &:hover {
          transform: scale(1.05);
        }
      }
      
      .brand-icon {
        font-size: 2rem;
      }
      
      .brand-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    
    .nav-links {
      display: flex;
      gap: 24px;
      align-items: center;
      
      .nav-link {
        text-decoration: none;
        color: #333;
        font-weight: 500;
        transition: color 0.2s ease;
        
        &:hover:not(.disabled) {
          color: #667eea;
        }
        
        &.disabled {
          color: #ccc;
          cursor: not-allowed;
          font-size: 0.9rem;
        }
      }
    }
    
    .nav-user {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .user-email {
        color: #666;
        font-size: 0.9rem;
        font-weight: 500;
      }
      
      .logout-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 8px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      }
    }
    
    @media (max-width: 768px) {
      .nav-content {
        flex-direction: column;
        height: auto;
        padding: 16px;
        gap: 16px;
      }
      
      .nav-menu {
        flex-direction: column;
        width: 100%;
        gap: 16px;
      }
      
      .nav-links {
        flex-direction: column;
        gap: 12px;
        width: 100%;
        text-align: center;
      }
      
      .nav-user {
        flex-direction: column;
        gap: 12px;
        width: 100%;
      }
    }
  `]
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  
  onLogout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout().subscribe();
    }
  }
}
