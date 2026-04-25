import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ItemsService } from '../../../core/services/items.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { AuthService } from '../../../core/services/auth.service';
import { Item, ItemType, ItemFilters } from '../../../core/interfaces/item.interface';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="list-container">
      <!-- Header -->
      <div class="list-header">
        <div class="header-top">
          <h1>Publicaciones</h1>
          @if (authService.isAuthenticated()) {
            <button class="btn-primary" (click)="router.navigate(['/items/new'])">
              + Nueva publicación
            </button>
          }
        </div>

        <!-- Filtros -->
        <div class="filters">
          <div class="filter-tabs">
            <button [class.active]="filters().type === undefined" (click)="setType(undefined)">Todos</button>
            <button [class.active]="filters().type === 'lost_item'" (click)="setType('lost_item')">🔍 Lo perdí</button>
            <button [class.active]="filters().type === 'found_item'" (click)="setType('found_item')">✨ Quiero devolverlo</button>
          </div>

          <div class="filter-row">
            <input
              type="text"
              placeholder="Buscar..."
              [(ngModel)]="searchText"
              (input)="onSearch()"
              class="search-input"
            />
            <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()" class="filter-select">
              <option value="">Todas las categorías</option>
              @for (cat of categoriesService.categories(); track cat.id) {
                <option [value]="cat.slug">{{ cat.icon }} {{ cat.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando publicaciones...</p>
        </div>
      } @else if (items().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No hay publicaciones</h3>
          <p>Sé el primero en reportar un objeto perdido o encontrado.</p>
          @if (authService.isAuthenticated()) {
            <button class="btn-primary" (click)="router.navigate(['/items/new'])">
              Crear publicación
            </button>
          }
        </div>
      } @else {
        <!-- Grid de items -->
        <div class="items-grid">
          @for (item of items(); track item.id) {
            <div class="item-card" (click)="router.navigate(['/items', item.id])">
              @if (item.photoUrl) {
                <img class="card-photo" [src]="item.photoUrl" alt="Imagen del objeto" />
              }
              <div class="card-badges">
                <span class="badge" [class]="'badge-' + item.type.replace('_', '-')">
                  {{ item.type === 'lost_item' ? '🔍 Lo perdí' : '✨ Quiero devolverlo' }}
                </span>
                <span class="badge badge-status">{{ formatStatus(item.status) }}</span>
              </div>
              <h3 class="card-title">{{ item.title }}</h3>
              <p class="card-desc">{{ item.description }}</p>
              <div class="card-meta">
                @if (item.category) {
                  <span>{{ item.category.icon }} {{ item.category.name }}</span>
                }
                <span>📍 {{ item.location }}</span>
                <span>📅 {{ item.eventDate | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Paginación -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">‹ Anterior</button>
            <span>Página {{ currentPage() }} de {{ totalPages() }}</span>
            <button [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">Siguiente ›</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 20px;
    }
    .list-header { margin-bottom: 32px; }
    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .header-top h1 { margin: 0; font-size: 1.8rem; color: #1a1a2e; }
    .filters { display: flex; flex-direction: column; gap: 12px; }
    .filter-tabs { display: flex; gap: 8px; }
    .filter-tabs button {
      padding: 8px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 20px;
      background: white;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .filter-tabs button.active {
      border-color: #6c63ff;
      background: #6c63ff;
      color: white;
    }
    .filter-row { display: flex; gap: 12px; }
    .search-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
    }
    .filter-select {
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      min-width: 200px;
    }
    .btn-primary {
      padding: 10px 20px;
      background: #6c63ff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #5a52d5; }

    .loading-state, .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #666;
    }
    .empty-icon { font-size: 4rem; margin-bottom: 16px; }
    .spinner {
      width: 40px; height: 40px;
      border: 4px solid #f0f0f0;
      border-top-color: #6c63ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .item-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid #f0f0f0;
    }
    .card-photo {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border-radius: 10px;
      margin-bottom: 12px;
    }
    .item-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .card-badges { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .badge-lost-item { background: #fff3cd; color: #856404; }
    .badge-found-item { background: #d1e7dd; color: #0f5132; }
    .badge-status { background: #f0f0f0; color: #555; }
    .card-title { margin: 0 0 8px; font-size: 1.05rem; color: #1a1a2e; font-weight: 600; }
    .card-desc {
      margin: 0 0 12px;
      font-size: 0.88rem;
      color: #666;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-meta { display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: #888; }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 32px;
    }
    .pagination button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      cursor: pointer;
    }
    .pagination button:disabled { opacity: 0.4; cursor: default; }

    @media (max-width: 600px) {
      .header-top { flex-direction: column; align-items: flex-start; gap: 12px; }
      .filter-row { flex-direction: column; }
      .filter-select { min-width: unset; }
    }
  `]
})
export class ItemsListComponent implements OnInit {
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly itemsService = inject(ItemsService);
  readonly categoriesService = inject(CategoriesService);

  readonly items = signal<Item[]>([]);
  readonly loading = signal(false);
  readonly filters = signal<ItemFilters>({ page: 1, limit: 12 });
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);

  searchText = '';
  selectedCategory = '';

  ngOnInit() {
    this.categoriesService.load().subscribe();
    this.loadItems();
  }

  loadItems() {
    this.loading.set(true);
    this.itemsService.getAll(this.filters()).subscribe({
      next: res => {
        this.items.set(res.data);
        this.currentPage.set(res.page);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setType(type: ItemType | undefined) {
    this.filters.update(f => ({ ...f, type, page: 1 }));
    this.loadItems();
  }

  onSearch() {
    this.filters.update(f => ({ ...f, search: this.searchText || undefined, page: 1 }));
    this.loadItems();
  }

  onCategoryChange() {
    this.filters.update(f => ({ ...f, category: this.selectedCategory || undefined, page: 1 }));
    this.loadItems();
  }

  goToPage(page: number) {
    this.filters.update(f => ({ ...f, page }));
    this.loadItems();
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }
}
