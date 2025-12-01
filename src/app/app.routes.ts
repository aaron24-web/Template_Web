import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pages',
    pathMatch: 'full',
  },
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.routes').then(m => m.PAGES_ROUTES),
  },
];
