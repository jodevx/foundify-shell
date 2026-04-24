import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Category } from '../interfaces/item.interface';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/categories';

  readonly categories = signal<Category[]>([]);

  load() {
    return this.http.get<{ data: Category[] }>(this.apiUrl).pipe(
      tap(res => this.categories.set(res.data))
    );
  }
}
