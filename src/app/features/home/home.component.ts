import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="home-container">
      <div class="home-content">
        <div class="welcome-section">
          <h1>🎉 Bienvenido a Foundify</h1>
          @if (authService.currentUser(); as user) {
            <p class="user-greeting">
              Hola, <strong>{{ user.email }}</strong>
            </p>
          }
        </div>
        
        <div class="info-cards">
          <div class="info-card">
            <div class="card-icon">🔍</div>
            <h3>Objetos Perdidos</h3>
            <p>Publica objetos que has perdido y encuentra ayuda de la comunidad</p>
            <span class="coming-soon">Próximamente</span>
          </div>
          
          <div class="info-card">
            <div class="card-icon">✨</div>
            <h3>Objetos Encontrados</h3>
            <p>Reporta objetos que has encontrado y ayuda a otros</p>
            <span class="coming-soon">Próximamente</span>
          </div>
          
          <div class="info-card">
            <div class="card-icon">📋</div>
            <h3>Mis Publicaciones</h3>
            <p>Administra todos tus reportes en un solo lugar</p>
            <span class="coming-soon">Próximamente</span>
          </div>
          
          <div class="info-card">
            <div class="card-icon">👤</div>
            <h3>Mi Perfil</h3>
            <p>Gestiona tu información personal y preferencias</p>
            <span class="coming-soon">Próximamente</span>
          </div>
        </div>
        
        <div class="architecture-info">
          <h2>🏗️ Arquitectura del Proyecto</h2>
          <ul>
            <li><strong>Shell:</strong> Angular 20 con Standalone Components</li>
            <li><strong>Microfrontends:</strong> Stencil Web Components (Próximamente)</li>
            <li><strong>Backend:</strong> NestJS + PostgreSQL + Prisma</li>
            <li><strong>Auth:</strong> JWT con Passport</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: calc(100vh - 70px);
      background: linear-gradient(to bottom, #f8f9fa, #ffffff);
      padding: 40px 20px;
    }
    
    .home-content {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .welcome-section {
      text-align: center;
      margin-bottom: 48px;
      
      h1 {
        font-size: 3rem;
        color: #333;
        margin: 0 0 16px 0;
      }
      
      .user-greeting {
        font-size: 1.2rem;
        color: #666;
        margin: 0;
        
        strong {
          color: #667eea;
        }
      }
    }
    
    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }
    
    .info-card {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
      
      .card-icon {
        font-size: 3rem;
        margin-bottom: 16px;
      }
      
      h3 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 1.4rem;
      }
      
      p {
        margin: 0;
        color: #666;
        line-height: 1.6;
      }
      
      .coming-soon {
        display: inline-block;
        margin-top: 16px;
        padding: 6px 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
      }
    }
    
    .architecture-info {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      
      h2 {
        margin: 0 0 20px 0;
        color: #333;
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          color: #666;
          
          &:last-child {
            border-bottom: none;
          }
          
          strong {
            color: #667eea;
            margin-right: 8px;
          }
        }
      }
    }
  `]
})
export class HomeComponent {
  readonly authService = inject(AuthService);
}
