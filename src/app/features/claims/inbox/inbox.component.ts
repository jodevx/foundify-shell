import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ClaimsService } from '../../../core/services/claims.service';
import { InboxNotification } from '../../../core/interfaces/item.interface';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="inbox-container">
      <div class="inbox-header">
        <h1>Bandeja de entrada</h1>
        <p>Aquí se centralizan todos tus avisos y reclamos pendientes.</p>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else if (notifications().length === 0) {
        <div class="empty-state">
          <div class="icon">📭</div>
          <h3>Sin pendientes</h3>
          <p>No tienes avisos ni reclamos pendientes por gestionar.</p>
        </div>
      } @else {
        <div class="inbox-list">
          @for (notification of notifications(); track notification.id) {
            <article class="inbox-card">
              <div class="card-top">
                <span class="badge" [class]="notification.itemType === 'lost_item' ? 'badge-lost' : 'badge-found'">
                  {{ notification.itemType === 'lost_item' ? '📩 Aviso' : '🙋 Reclamo' }}
                </span>
                <span class="date">{{ notification.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <h3 class="item-title">{{ notification.itemTitle }}</h3>
              <p class="from">De: {{ notification.claimant.email }}</p>
              <p class="message">{{ notification.claimMessage }}</p>

              <div class="actions">
                <button class="btn-view" (click)="goToItem(notification.itemId)">Ver publicación</button>
                <button class="btn-accept" (click)="manage(notification, 'aceptado')">Aceptar</button>
                <button class="btn-reject" (click)="manage(notification, 'rechazado')">Rechazar</button>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .inbox-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 20px;
    }
    .inbox-header { margin-bottom: 24px; }
    .inbox-header h1 { margin: 0 0 8px; color: #1a1a2e; }
    .inbox-header p { margin: 0; color: #666; }

    .loading { display: flex; justify-content: center; padding: 80px 0; }
    .spinner {
      width: 40px; height: 40px;
      border: 4px solid #f0f0f0;
      border-top-color: #6c63ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center;
      background: white;
      border-radius: 14px;
      border: 1px solid #eee;
      padding: 40px 20px;
    }
    .empty-state .icon { font-size: 2rem; margin-bottom: 8px; }
    .empty-state h3 { margin: 0 0 6px; color: #333; }
    .empty-state p { margin: 0; color: #777; }

    .inbox-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .inbox-card {
      background: white;
      border: 1px solid #ececec;
      border-radius: 12px;
      padding: 16px;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      gap: 10px;
    }

    .badge {
      font-size: 0.78rem;
      font-weight: 700;
      border-radius: 12px;
      padding: 4px 10px;
    }
    .badge-lost { background: #fef3c7; color: #92400e; }
    .badge-found { background: #dbeafe; color: #1e40af; }
    .date { font-size: 0.8rem; color: #888; }

    .item-title { margin: 0 0 6px; font-size: 1.05rem; color: #1a1a2e; }
    .from { margin: 0 0 10px; color: #666; font-size: 0.9rem; }
    .message {
      margin: 0 0 12px;
      color: #444;
      line-height: 1.45;
      white-space: pre-wrap;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    button {
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .btn-view { background: #eef2ff; color: #3730a3; }
    .btn-accept { background: #dcfce7; color: #166534; }
    .btn-reject { background: #fee2e2; color: #991b1b; }
  `]
})
export class InboxComponent implements OnInit {
  private readonly claimsService = inject(ClaimsService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly notifications = signal<InboxNotification[]>([]);

  ngOnInit(): void {
    this.loadInbox();
  }

  loadInbox(): void {
    this.loading.set(true);
    this.claimsService.getInbox().subscribe({
      next: (response) => {
        this.notifications.set(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToItem(itemId: string): void {
    this.router.navigate(['/items', itemId]);
  }

  manage(notification: InboxNotification, action: 'aceptado' | 'rechazado'): void {
    this.claimsService.manage(notification.itemId, notification.id, action).subscribe({
      next: () => {
        this.notifications.update((current) =>
          current.filter((item) => item.id !== notification.id),
        );
      },
    });
  }
}
