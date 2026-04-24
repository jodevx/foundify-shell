import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, rootGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [rootGuard],
    loadComponent: () => import('./features/root/root.component').then(m => m.RootComponent),
    title: 'Foundify'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard],
    title: 'Login - Foundify'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [noAuthGuard],
    title: 'Registro - Foundify'
  },
  {
    path: 'items',
    loadComponent: () => import('./features/items/items-list/items-list.component').then(m => m.ItemsListComponent),
    title: 'Publicaciones - Foundify'
  },
  {
    path: 'items/new',
    loadComponent: () => import('./features/items/item-form/item-form.component').then(m => m.ItemFormComponent),
    canActivate: [authGuard],
    title: 'Nueva publicación - Foundify'
  },
  {
    path: 'items/:id/edit',
    loadComponent: () => import('./features/items/item-form/item-form.component').then(m => m.ItemFormComponent),
    canActivate: [authGuard],
    title: 'Editar publicación - Foundify'
  },
  {
    path: 'items/:id',
    loadComponent: () => import('./features/items/item-detail/item-detail.component').then(m => m.ItemDetailComponent),
    title: 'Detalle - Foundify'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

