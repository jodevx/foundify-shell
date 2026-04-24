import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ItemsService } from '../../../core/services/items.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { Item, CreateItemRequest, ItemType } from '../../../core/interfaces/item.interface';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="form-container">
      <div class="form-card">
        <div class="form-header">
          <button class="btn-back" (click)="router.navigate(['/items'])">← Volver</button>
          <h2>{{ editMode() ? 'Editar publicación' : 'Nueva publicación' }}</h2>
        </div>

        @if (loadingItem()) {
          <div class="loading"><div class="spinner"></div></div>
        } @else {
          <form (ngSubmit)="submit()">
            <!-- Tipo -->
            @if (!editMode()) {
              <div class="field">
                <label>Tipo de publicación *</label>
                <div class="type-selector">
                  <label class="type-option" [class.selected]="form.type === 'perdido'">
                    <input type="radio" name="type" value="perdido" [(ngModel)]="form.type" />
                    🔍 Perdido
                  </label>
                  <label class="type-option" [class.selected]="form.type === 'encontrado'">
                    <input type="radio" name="type" value="encontrado" [(ngModel)]="form.type" />
                    ✨ Encontrado
                  </label>
                </div>
              </div>
            }

            <!-- Título -->
            <div class="field">
              <label for="title">Título *</label>
              <input
                id="title" type="text" name="title"
                [(ngModel)]="form.title"
                placeholder="Ej: Cartera negra de cuero"
                required maxlength="100"
              />
            </div>

            <!-- Descripción -->
            <div class="field">
              <label for="description">Descripción *</label>
              <textarea
                id="description" name="description"
                [(ngModel)]="form.description"
                placeholder="Describe el objeto con el mayor detalle posible..."
                rows="4" required maxlength="1000"
              ></textarea>
            </div>

            <!-- Categoría -->
            <div class="field">
              <label for="category">Categoría *</label>
              <select id="category" name="categorySlug" [(ngModel)]="form.categorySlug" required>
                <option value="">Selecciona una categoría</option>
                @for (cat of categoriesService.categories(); track cat.id) {
                  <option [value]="cat.slug">{{ cat.icon }} {{ cat.name }}</option>
                }
              </select>
            </div>

            <!-- Ubicación -->
            <div class="field">
              <label for="location">Ubicación *</label>
              <input
                id="location" type="text" name="location"
                [(ngModel)]="form.location"
                placeholder="Ej: Metro Insurgentes, Col. Roma Norte, CDMX"
                required maxlength="200"
              />
            </div>

            <!-- Fecha del evento -->
            <div class="field">
              <label for="eventDate">Fecha en que ocurrió *</label>
              <input
                id="eventDate" type="date" name="eventDate"
                [(ngModel)]="form.eventDate"
                [max]="today"
                required
              />
            </div>

            <!-- Imagen -->
            <div class="field">
              <label for="photo">Imagen (opcional, máx 5MB)</label>
              <input
                #photoInput
                id="photo"
                type="file"
                accept="image/*"
                class="photo-input-hidden"
                (change)="onPhotoSelected($event)"
              />
              @if (!photoPreview()) {
                <button type="button" class="btn-secondary" (click)="openPhotoPicker()">
                  Seleccionar archivo
                </button>
              }
              @if (photoPreview()) {
                <div class="photo-preview">
                  <img [src]="photoPreview()!" alt="Vista previa" />
                  <div class="photo-actions">
                    <button type="button" class="btn-secondary" (click)="openPhotoPicker()">Cambiar imagen</button>
                    <button type="button" class="btn-secondary" (click)="clearPhoto()">Quitar imagen</button>
                  </div>
                </div>
              }
            </div>

            <!-- Detalles opcionales -->
            <div class="optional-section">
              <h3>Detalles adicionales (opcional)</h3>
              <div class="fields-row">
                <div class="field">
                  <label for="color">Color</label>
                  <input id="color" type="text" name="color" [(ngModel)]="form.color" placeholder="Ej: Negro" maxlength="50" />
                </div>
                <div class="field">
                  <label for="brand">Marca</label>
                  <input id="brand" type="text" name="brand" [(ngModel)]="form.brand" placeholder="Ej: Samsung" maxlength="50" />
                </div>
                <div class="field">
                  <label for="material">Material</label>
                  <input id="material" type="text" name="material" [(ngModel)]="form.material" placeholder="Ej: Cuero" maxlength="50" />
                </div>
              </div>
            </div>

            @if (error()) {
              <div class="error-banner">{{ error() }}</div>
            }

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="router.navigate(['/items'])">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="submitting()">
                {{ submitting() ? 'Guardando...' : (editMode() ? 'Guardar cambios' : 'Publicar') }}
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 32px 20px;
    }
    .form-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      padding: 32px;
    }
    .form-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .form-header h2 { margin: 0; color: #1a1a2e; }
    .btn-back {
      background: none;
      border: none;
      color: #6c63ff;
      cursor: pointer;
      font-size: 0.95rem;
      white-space: nowrap;
    }
    .btn-back:hover { text-decoration: underline; }

    .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
    .field label { font-weight: 600; color: #333; font-size: 0.9rem; }
    .field input, .field textarea, .field select {
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .field input:focus, .field textarea:focus, .field select:focus {
      outline: none;
      border-color: #6c63ff;
    }

    .type-selector { display: flex; gap: 12px; }
    .type-option {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .type-option input { display: none; }
    .type-option.selected { border-color: #6c63ff; background: #f0eeff; color: #6c63ff; }

    .optional-section { margin-bottom: 20px; }
    .optional-section h3 { font-size: 0.9rem; color: #888; margin-bottom: 12px; }
    .fields-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

    .photo-input-hidden {
      display: none;
    }

    .photo-preview {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }
    .photo-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .photo-preview img {
      width: 220px;
      max-width: 100%;
      border-radius: 10px;
      border: 1px solid #e0e0e0;
      object-fit: cover;
    }

    .error-banner {
      background: #fff3f3;
      border: 1px solid #e74c3c;
      border-radius: 8px;
      color: #c0392b;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 0.9rem;
    }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-primary {
      padding: 10px 24px;
      background: #6c63ff;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .btn-primary:disabled { opacity: 0.6; cursor: default; }
    .btn-secondary {
      padding: 10px 24px;
      background: white;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .loading { display: flex; justify-content: center; padding: 40px 0; }
    .spinner {
      width: 36px; height: 36px;
      border: 4px solid #f0f0f0;
      border-top-color: #6c63ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 500px) {
      .fields-row { grid-template-columns: 1fr; }
      .type-selector { flex-direction: column; }
    }
  `]
})
export class ItemFormComponent implements OnInit {
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly itemsService = inject(ItemsService);
  readonly categoriesService = inject(CategoriesService);

  readonly editMode = signal(false);
  readonly loadingItem = signal(false);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly photoPreview = signal<string | null>(null);
  @ViewChild('photoInput') private photoInputRef?: ElementRef<HTMLInputElement>;

  readonly today = new Date().toISOString().split('T')[0];

  form: CreateItemRequest = {
    title: '',
    description: '',
    type: 'perdido',
    categorySlug: '',
    location: '',
    eventDate: '',
    color: '',
    material: '',
    brand: '',
    photoFile: undefined,
  };

  private itemId: string | null = null;

  ngOnInit() {
    this.categoriesService.load().subscribe();

    this.itemId = this.route.snapshot.paramMap.get('id');
    if (this.itemId) {
      this.editMode.set(true);
      this.loadItem(this.itemId);
    }
  }

  loadItem(id: string) {
    this.loadingItem.set(true);
    this.itemsService.getById(id).subscribe({
      next: (item: Item) => {
        this.form = {
          title: item.title,
          description: item.description,
          type: item.type,
          categorySlug: item.category?.slug ?? '',
          location: item.location,
          eventDate: item.eventDate.split('T')[0],
          color: item.color ?? '',
          material: item.material ?? '',
          brand: item.brand ?? '',
          photoFile: undefined,
        };
        this.photoPreview.set(item.photoUrl ?? null);
        this.loadingItem.set(false);
      },
      error: () => {
        this.router.navigate(['/items']);
      }
    });
  }

  submit() {
    if (!this.form.title || !this.form.description || !this.form.categorySlug || !this.form.location || !this.form.eventDate) {
      this.error.set('Por favor completa todos los campos obligatorios.');
      return;
    }
    this.error.set('');
    this.submitting.set(true);

    const payload = {
      ...this.form,
      color: this.form.color || undefined,
      material: this.form.material || undefined,
      brand: this.form.brand || undefined,
      photoFile: this.form.photoFile,
    };

    const request$ = this.editMode() && this.itemId
      ? this.itemsService.update(this.itemId, payload)
      : this.itemsService.create(payload);

    request$.subscribe({
      next: (item) => {
        this.router.navigate(['/items', item.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Ocurrió un error. Intenta de nuevo.');
      }
    });
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('El archivo debe ser una imagen válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error.set('La imagen no debe superar 5MB.');
      return;
    }

    this.form.photoFile = file;
    this.error.set('');

    const reader = new FileReader();
    reader.onload = () => this.photoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  openPhotoPicker() {
    this.photoInputRef?.nativeElement.click();
  }

  clearPhoto() {
    this.form.photoFile = undefined;
    this.photoPreview.set(null);
    if (this.photoInputRef?.nativeElement) {
      this.photoInputRef.nativeElement.value = '';
    }
  }
}
