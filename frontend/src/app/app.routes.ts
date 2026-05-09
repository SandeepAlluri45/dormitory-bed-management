import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'beds', 
    loadComponent: () => import('./pages/beds/beds.component').then(m => m.BedsComponent)
  },
  { 
    path: 'customers', 
    loadComponent: () => import('./pages/customers/customers.component').then(m => m.CustomersComponent)
  },
  { 
    path: 'allocations', 
    loadComponent: () => import('./pages/allocations/allocations.component').then(m => m.AllocationsComponent)
  }
];
