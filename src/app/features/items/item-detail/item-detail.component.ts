import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ItemsService } from '../../../core/services/items.service';
import { ClaimsService } from '../../../core/services/claims.service';
import { AuthService } from '../../../core/services/auth.service';
import { Item, Claim, ItemStatus } from '../../../core/interfaces/item.interface';

const CLAIMABLE_STATUSES = ['reportado_encontrado', 'en_resguardo'];

const STATUS_LABELS: Record<string, string> = {
  reportado_perdido: 'Reportado perdido',
  en_validacion: 'En validación',
  recuperado: 'Recuperado ✅',
  cerrado_sin_recuperar: 'Cerrado sin recuperar',
  reportado_encontrado: 'Reportado encontrado',
  en_resguardo: 'En resguardo',
  devuelto_propietario: 'Devuelto al propietario ✅',
  entregado_autoridad: 'Entregado a autoridad',
  cerrado_sin_reclamo: 'Cerrado sin reclamo',
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  reportado_perdido: ['en_validacion', 'recuperado', 'cerrado_sin_recuperar'],
  en_validacion: ['recuperado', 'cerrado_sin_recuperar', 'reportado_perdido'],
  reportado_encontrado: ['en_resguardo', 'en_validacion', 'cerrado_sin_reclamo'],
  en_resguardo: ['en_validacion', 'cerrado_sin_reclamo', 'entregado_autoridad'],
};

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="detail-container">
      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else if (!item()) {
        <div class="not-found">
          <p>Publicación no encontrada.</p>
          <button class="btn-secondary" (click)="router.navigate(['/items'])">Volver al listado</button>
        </div>
      } @else {
        <div class="detail-layout">
          <!-- Panel principal -->
          <div class="main-panel">
            <div class="back-row">
              <button class="btn-back" (click)="router.navigate(['/items'])">← Volver</button>
              @if (item()!.isOwner) {
                <div class="owner-actions">
                  <button class="btn-outline" (click)="router.navigate(['/items', item()!.id, 'edit'])">Editar</button>
                  <button class="btn-danger-outline" (click)="deleteItem()">Eliminar</button>
                </div>
              }
            </div>

            <!-- Badges -->
            <div class="badges">
              <span class="badge" [class]="'badge-' + item()!.type">
                {{ item()!.type === 'perdido' ? '🔍 Perdido' : '✨ Encontrado' }}
              </span>
              <span class="badge badge-status">{{ formatStatus(item()!.status) }}</span>
            </div>

            <h1 class="item-title">{{ item()!.title }}</h1>
            @if (item()!.photoUrl) {
              <img class="item-photo" [src]="item()!.photoUrl!" alt="Imagen del objeto" />
            }
            <p class="item-desc">{{ item()!.description }}</p>

            <!-- Detalles -->
            <div class="details-grid">
              @if (item()!.category) {
                <div class="detail-item">
                  <span class="detail-label">Categoría</span>
                  <span>{{ item()!.category!.icon }} {{ item()!.category!.name }}</span>
                </div>
              }
              <div class="detail-item">
                <span class="detail-label">Ubicación</span>
                <span>📍 {{ item()!.location }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fecha</span>
                <span>📅 {{ item()!.eventDate | date:'dd/MM/yyyy' }}</span>
              </div>
              @if (item()!.color) {
                <div class="detail-item">
                  <span class="detail-label">Color</span>
                  <span>{{ item()!.color }}</span>
                </div>
              }
              @if (item()!.brand) {
                <div class="detail-item">
                  <span class="detail-label">Marca</span>
                  <span>{{ item()!.brand }}</span>
                </div>
              }
              @if (item()!.material) {
                <div class="detail-item">
                  <span class="detail-label">Material</span>
                  <span>{{ item()!.material }}</span>
                </div>
              }
            </div>

            <!-- Cambiar status (solo dueño) -->
            @if (item()!.isOwner && allowedTransitions().length > 0) {
              <div class="status-section">
                <h3>Cambiar estado</h3>
                <div class="status-actions">
                  @for (status of allowedTransitions(); track status) {
                    <button class="btn-status" (click)="changeStatus(status)">
                      → {{ formatStatus(status) }}
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Botón reclamar (no dueño, objeto encontrado, estado claimable) -->
            @if (!item()!.isOwner && authService.isAuthenticated() && item()!.type === 'encontrado' && isClaimable()) {
              <div class="claim-section">
                @if (!showClaimForm()) {
                  <button class="btn-claim" (click)="showClaimForm.set(true)">
                    🙋 Creo que es mío
                  </button>
                } @else {
                  <div class="claim-form">
                    <h3>Enviar reclamo</h3>
                    <p class="claim-hint">Describe por qué crees que este objeto es tuyo. Incluye detalles que solo el dueño sabría.</p>
                    <textarea
                      [(ngModel)]="claimMessage"
                      placeholder="Ej: Es mi mochila azul Nike, adentro tiene una libreta con mi nombre y unas llaves plateadas..."
                      rows="4"
                    ></textarea>
                    @if (claimError()) {
                      <div class="error-banner">{{ claimError() }}</div>
                    }
                    <div class="claim-actions">
                      <button class="btn-secondary" (click)="showClaimForm.set(false)">Cancelar</button>
                      <button class="btn-claim" (click)="submitClaim()" [disabled]="submittingClaim()">
                        {{ submittingClaim() ? 'Enviando...' : 'Enviar reclamo' }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

            @if (!authService.isAuthenticated() && item()!.type === 'encontrado' && isClaimable()) {
              <div class="claim-section">
                <p>¿Es tuyo? <a (click)="router.navigate(['/login'])">Inicia sesión</a> para reclamarlo.</p>
              </div>
            }
          </div>

          <!-- Panel de reclamos (solo dueño del item encontrado) -->
          @if (item()!.isOwner && item()!.type === 'encontrado') {
            <div class="claims-panel">
              <h2>Reclamos recibidos</h2>
              @if (loadingClaims()) {
                <div class="loading"><div class="spinner small"></div></div>
              } @else if (claims().length === 0) {
                <p class="no-claims">Aún no hay reclamos para esta publicación.</p>
              } @else {
                @for (claim of claims(); track claim.id) {
                  <div class="claim-card" [class]="'claim-' + claim.status">
                    <div class="claim-header">
                      <span class="claim-badge" [class]="'badge-claim-' + claim.status">
                        {{ formatClaimStatus(claim.status) }}
                      </span>
                      <span class="claim-date">{{ claim.createdAt | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <p class="claim-message">{{ claim.claimMessage }}</p>
                    @if (claim.status === 'pendiente') {
                      <div class="claim-btns">
                        <button class="btn-accept" (click)="manageClaim(claim.id, 'aceptado')">✓ Aceptar</button>
                        <button class="btn-reject" (click)="manageClaim(claim.id, 'rechazado')">✗ Rechazar</button>
                      </div>
                    }
                  </div>
                }
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 1100px; margin: 0 auto; padding: 32px 20px; }
    .loading { display: flex; justify-content: center; padding: 80px 0; }
    .not-found { text-align: center; padding: 80px 0; color: #666; }
    .spinner {
      width: 40px; height: 40px;
      border: 4px solid #f0f0f0;
      border-top-color: #6c63ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner.small { width: 24px; height: 24px; border-width: 3px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .detail-layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
    .main-panel, .claims-panel {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      padding: 28px;
    }

    .back-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-back { background: none; border: none; color: #6c63ff; cursor: pointer; font-size: 0.95rem; }
    .owner-actions { display: flex; gap: 8px; }

    .badges { display: flex; gap: 8px; margin-bottom: 16px; }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 0.82rem; font-weight: 600; }
    .badge-perdido { background: #fff3cd; color: #856404; }
    .badge-encontrado { background: #d1e7dd; color: #0f5132; }
    .badge-status { background: #f0f0f0; color: #555; }

    .item-title { font-size: 1.7rem; color: #1a1a2e; margin: 0 0 12px; }
    .item-photo {
      width: 100%;
      max-height: 380px;
      object-fit: cover;
      border-radius: 12px;
      margin: 6px 0 16px;
      border: 1px solid #eee;
    }
    .item-desc { color: #555; line-height: 1.6; margin-bottom: 24px; }

    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .detail-item { display: flex; flex-direction: column; gap: 2px; }
    .detail-label { font-size: 0.78rem; color: #999; text-transform: uppercase; letter-spacing: 0.05em; }

    .status-section { border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 20px; }
    .status-section h3 { font-size: 0.95rem; color: #666; margin: 0 0 12px; }
    .status-actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .btn-status {
      padding: 8px 14px;
      border: 1px solid #6c63ff;
      border-radius: 8px;
      background: white;
      color: #6c63ff;
      cursor: pointer;
      font-size: 0.88rem;
    }
    .btn-status:hover { background: #f0eeff; }

    .claim-section { border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 20px; }
    .claim-section p { color: #555; }
    .claim-section a { color: #6c63ff; cursor: pointer; text-decoration: underline; }
    .btn-claim {
      width: 100%;
      padding: 14px;
      background: #6c63ff;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-claim:disabled { opacity: 0.6; cursor: default; }
    .claim-form { display: flex; flex-direction: column; gap: 12px; }
    .claim-form h3 { margin: 0; color: #1a1a2e; }
    .claim-hint { font-size: 0.88rem; color: #777; margin: 0; }
    .claim-form textarea {
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.95rem;
      resize: vertical;
    }
    .claim-actions { display: flex; gap: 8px; }
    .error-banner {
      background: #fff3f3;
      border: 1px solid #e74c3c;
      border-radius: 8px;
      color: #c0392b;
      padding: 10px 14px;
      font-size: 0.88rem;
    }

    /* Claims panel */
    .claims-panel h2 { margin: 0 0 20px; font-size: 1.1rem; color: #1a1a2e; }
    .no-claims { color: #999; font-size: 0.9rem; }
    .claim-card {
      border: 1px solid #eee;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .claim-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .claim-badge { padding: 3px 10px; border-radius: 10px; font-size: 0.78rem; font-weight: 600; }
    .badge-claim-pendiente { background: #fff3cd; color: #856404; }
    .badge-claim-aceptado { background: #d1e7dd; color: #0f5132; }
    .badge-claim-rechazado { background: #f8d7da; color: #721c24; }
    .badge-claim-cancelado { background: #f0f0f0; color: #888; }
    .claim-date { font-size: 0.78rem; color: #aaa; }
    .claim-message { font-size: 0.9rem; color: #444; margin: 0 0 10px; line-height: 1.5; }
    .claim-btns { display: flex; gap: 8px; }
    .btn-accept {
      flex: 1; padding: 8px; border: none; border-radius: 6px;
      background: #198754; color: white; cursor: pointer; font-weight: 600; font-size: 0.88rem;
    }
    .btn-reject {
      flex: 1; padding: 8px; border: none; border-radius: 6px;
      background: #dc3545; color: white; cursor: pointer; font-weight: 600; font-size: 0.88rem;
    }

    .btn-outline {
      padding: 6px 14px; border: 1px solid #6c63ff; border-radius: 8px;
      background: white; color: #6c63ff; cursor: pointer; font-size: 0.88rem;
    }
    .btn-danger-outline {
      padding: 6px 14px; border: 1px solid #dc3545; border-radius: 8px;
      background: white; color: #dc3545; cursor: pointer; font-size: 0.88rem;
    }
    .btn-secondary {
      padding: 8px 16px; border: 1px solid #ddd; border-radius: 8px;
      background: white; color: #666; cursor: pointer;
    }

    @media (max-width: 768px) {
      .detail-layout { grid-template-columns: 1fr; }
      .details-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ItemDetailComponent implements OnInit {
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);
  readonly itemsService = inject(ItemsService);
  readonly claimsService = inject(ClaimsService);

  readonly item = signal<Item | null>(null);
  readonly loading = signal(true);
  readonly claims = signal<Claim[]>([]);
  readonly loadingClaims = signal(false);
  readonly showClaimForm = signal(false);
  readonly submittingClaim = signal(false);
  readonly claimError = signal('');

  claimMessage = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.itemsService.getById(id).subscribe({
      next: item => {
        this.item.set(item);
        this.loading.set(false);
        if (item.isOwner && item.type === 'encontrado') {
          this.loadClaims(id);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  loadClaims(itemId: string) {
    this.loadingClaims.set(true);
    this.claimsService.getByItem(itemId).subscribe({
      next: res => {
        this.claims.set(res.data);
        this.loadingClaims.set(false);
      },
      error: () => this.loadingClaims.set(false)
    });
  }

  isClaimable(): boolean {
    return CLAIMABLE_STATUSES.includes(this.item()!.status);
  }

  allowedTransitions(): string[] {
    return ALLOWED_TRANSITIONS[this.item()!.status] ?? [];
  }

  formatStatus(status: string): string {
    return STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
  }

  formatClaimStatus(status: string): string {
    const labels: Record<string, string> = {
      pendiente: '⏳ Pendiente',
      aceptado: '✅ Aceptado',
      rechazado: '❌ Rechazado',
      cancelado: '🚫 Cancelado',
    };
    return labels[status] ?? status;
  }

  changeStatus(status: string) {
    const id = this.item()!.id;
    this.itemsService.update(id, { status: status as ItemStatus }).subscribe({
      next: updated => this.item.set({ ...this.item()!, status: updated.status }),
    });
  }

  submitClaim() {
    if (!this.claimMessage.trim()) {
      this.claimError.set('Por favor escribe un mensaje para tu reclamo.');
      return;
    }
    this.claimError.set('');
    this.submittingClaim.set(true);
    this.claimsService.create(this.item()!.id, { claimMessage: this.claimMessage }).subscribe({
      next: () => {
        this.showClaimForm.set(false);
        this.claimMessage = '';
        this.submittingClaim.set(false);
        // Actualizar item para mostrar nuevo estado
        this.itemsService.getById(this.item()!.id).subscribe(i => this.item.set(i));
      },
      error: (err) => {
        this.submittingClaim.set(false);
        this.claimError.set(err?.error?.message ?? 'No se pudo enviar el reclamo.');
      }
    });
  }

  manageClaim(claimId: string, action: 'aceptado' | 'rechazado') {
    this.claimsService.manage(this.item()!.id, claimId, action).subscribe({
      next: () => this.loadClaims(this.item()!.id)
    });
  }

  deleteItem() {
    if (!confirm('¿Seguro que deseas eliminar esta publicación?')) return;
    this.itemsService.remove(this.item()!.id).subscribe({
      next: () => this.router.navigate(['/items'])
    });
  }
}
