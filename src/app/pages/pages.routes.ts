import { Routes } from '@angular/router';

export const PAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages.component').then(m => m.PagesComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'academic',
        loadChildren: () => import('./academic/academic.routes').then(m => m.ACADEMIC_ROUTES),
      },
    ],
  },
];
