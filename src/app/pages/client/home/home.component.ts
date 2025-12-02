import { Component } from '@angular/core';
import { StudentListComponent } from '../students/student-list.component';
import { NbButtonModule, NbCardModule } from '@nebular/theme';
import { RouterLink } from '@angular/router';
import { RequestListComponent } from '../requests/request-list.component';
import { EnrollmentApprovalsComponent } from '../enrollments/enrollment-approvals.component';

@Component({
  selector: 'app-home',
  template: `
    <nb-card>
      <nb-card-header>
        <h2>Panel de Cliente</h2>
      </nb-card-header>
      <nb-card-body>
        <p>Bienvenido a tu panel. Aquí puedes gestionar estudiantes, solicitudes e inscripciones.</p>
        
        <!-- Inscripciones Pendientes -->
        <app-enrollment-approvals></app-enrollment-approvals>
        
        <!-- Estudiantes -->
        <app-student-list></app-student-list>
        
        <!-- Solicitudes -->
        <app-request-list></app-request-list>
        
        <div style="margin-top: 1rem;">
          <a routerLink="../students/new" nbButton status="primary">Agregar Estudiante</a>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  standalone: true,
  imports: [
    StudentListComponent, 
    RequestListComponent, 
    EnrollmentApprovalsComponent,
    NbButtonModule, 
    NbCardModule,
    RouterLink
  ],
})
export class HomeComponent {
}
