export type ItemType = 'lost_item' | 'found_item';

export type ItemStatusPerdido =
  | 'reportado_perdido'
  | 'recuperado'
  | 'cerrado_sin_recuperar';

export type ItemStatusEncontrado =
  | 'reportado_encontrado'
  | 'en_validacion'
  | 'devuelto_propietario'
  | 'entregado_autoridad'
  | 'cerrado_sin_reclamo';

export type ItemStatus = ItemStatusPerdido | ItemStatusEncontrado;

export type ClaimStatus = 'pendiente' | 'aceptado' | 'rechazado' | 'cancelado';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  status: ItemStatus;
  categoryId: string;
  category?: Category;
  location: string;
  eventDate: string;
  color?: string | null;
  material?: string | null;
  brand?: string | null;
  photoUrl?: string | null;
  userId: string;
  isOwner?: boolean;
  pendingClaimsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  claimantId: string;
  claimMessage: string;
  status: ClaimStatus;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ItemFilters {
  type?: ItemType;
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateItemRequest {
  title: string;
  description: string;
  type: ItemType;
  categorySlug: string;
  location: string;
  eventDate: string;
  color?: string;
  material?: string;
  brand?: string;
  photoFile?: File;
}

export interface UpdateItemRequest {
  title?: string;
  description?: string;
  categorySlug?: string;
  location?: string;
  eventDate?: string;
  color?: string;
  material?: string;
  brand?: string;
  photoFile?: File;
  status?: ItemStatus;
}

export interface CreateClaimRequest {
  claimMessage: string;
}
