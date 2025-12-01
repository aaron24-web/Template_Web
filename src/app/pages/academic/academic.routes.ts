import { Routes } from '@angular/router';

export const ACADEMIC_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'requests',
    pathMatch: 'full',
  },
  {
    path: 'requests',
    loadComponent: () =>
      import('./requests/requests.component').then(m => m.RequestsComponent),
  },
  {
    path: 'enrollments/new',
    loadComponent: () =>
      import('./enrollments/enrollment-wizard.component').then(m => m.EnrollmentWizardComponent),
  },
  {
    path: 'enrollments/:id',
    loadComponent: () =>
      import('./enrollments/enrollment-wizard.component').then(m => m.EnrollmentWizardComponent),
  },
];
