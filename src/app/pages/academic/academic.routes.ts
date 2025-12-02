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
  {
    path: 'advisors',
    loadComponent: () =>
      import('./advisors/advisors.component').then(m => m.AdvisorsComponent),
  },
  {
    path: 'advisors/new',
    loadComponent: () =>
      import('./advisors/advisor-add.component').then(m => m.AdvisorAddComponent),
  },
  {
    path: 'advisors/edit/:id',
    loadComponent: () =>
      import('./advisors/advisor-edit.component').then(m => m.AdvisorEditComponent),
  },
  {
    path: 'advisors/specializations',
    loadComponent: () =>
      import('./advisors/advisor-specializations.component').then(m => m.AdvisorSpecializationsComponent),
  },
];
