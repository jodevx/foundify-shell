import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Item,
  CreateItemRequest,
  UpdateItemRequest,
  ItemFilters,
  PaginatedResponse,
} from '../interfaces/item.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/items';

  getAll(filters: ItemFilters = {}): Observable<PaginatedResponse<Item>> {
    let params = new HttpParams();
    if (filters.type)     params = params.set('type', filters.type);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.status)   params = params.set('status', filters.status);
    if (filters.search)   params = params.set('search', filters.search);
    if (filters.page)     params = params.set('page', String(filters.page));
    if (filters.limit)    params = params.set('limit', String(filters.limit));
    return this.http.get<PaginatedResponse<Item>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateItemRequest): Observable<Item> {
    const payload = this.toFormData(data);
    return this.http.post<Item>(this.apiUrl, payload);
  }

  update(id: string, data: UpdateItemRequest): Observable<Item> {
    const payload = this.toFormData(data);
    return this.http.put<Item>(`${this.apiUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private toFormData(data: CreateItemRequest | UpdateItemRequest): FormData {
    const formData = new FormData();

    const entries = Object.entries(data) as Array<[string, unknown]>;
    for (const [key, value] of entries) {
      if (value === undefined || value === null || value === '') continue;
      if (key === 'photoFile' && value instanceof File) {
        formData.append('photo', value);
      } else {
        formData.append(key, String(value));
      }
    }

    return formData;
  }
}
