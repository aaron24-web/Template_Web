import { Component } from '@angular/core';
import { StudentListComponent } from '../students/student-list.component';
import { NbButtonModule } from '@nebular/theme';
import { RouterLink } from '@angular/router';
import { RequestListComponent } from '../requests/request-list.component';

@Component({
  selector: 'app-home',
  template: `
    <h2>Client Dashboard</h2>
    <p>Welcome to your dashboard. Here you can manage your students and tutoring requests.</p>
    <app-student-list></app-student-list>
    <app-request-list></app-request-list>
    <a routerLink="../students/new" nbButton status="primary">Add Student</a>
  `,
  standalone: true,
  imports: [StudentListComponent, RequestListComponent, NbButtonModule, RouterLink],
})
export class HomeComponent {
}
