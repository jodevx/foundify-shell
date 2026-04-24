import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Claim, CreateClaimRequest } from '../interfaces/item.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClaimsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/items';

  create(itemId: string, data: CreateClaimRequest): Observable<Claim> {
    return this.http.post<Claim>(`${this.apiUrl}/${itemId}/claims`, data);
  }

  getByItem(itemId: string): Observable<{ data: Claim[] }> {
    return this.http.get<{ data: Claim[] }>(`${this.apiUrl}/${itemId}/claims`);
  }

  manage(itemId: string, claimId: string, action: 'aceptado' | 'rechazado'): Observable<Claim> {
    return this.http.patch<Claim>(`${this.apiUrl}/${itemId}/claims/${claimId}`, { action });
  }

  cancel(itemId: string, claimId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${itemId}/claims/${claimId}`);
  }
}
