import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./client.component').then(m => m.ClientComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'requests/new',
        loadComponent: () => import('./requests/request-creation-wizard.component').then(m => m.RequestCreationWizardComponent),
      },
      {
        path: 'students/new',
        loadComponent: () => import('./students/student-add.component').then(m => m.StudentAddComponent),
      },
      {
        path: 'browse',
        loadComponent: () => import('./browse/browse.component').then(m => m.BrowseComponent),
      }
    ],
  },
];
