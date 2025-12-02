import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- FIX: Import FormsModule
import {
  NbStepperModule,
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbAccordionModule,
  NbInputModule,
  NbCheckboxModule,
  NbAlertModule,
  NbListModule,
  NbBadgeModule,
  NbTooltipModule,
  NbSelectModule,
} from '@nebular/theme';
import { forkJoin } from 'rxjs';
import { EnrollmentService } from '../services/enrollment.service';
import { AdvisorService } from '../services/advisor.service';
import { SubjectService } from '../services/subject.service';
import { RequestService } from '../../../core/services/request.service';
import { Enrollment, ENROLLMENT_STATUS_CONFIG, Subject, Advisor, TutoringRequest } from '../academic.models';

@Component({
  standalone: true,
  selector: 'app-enrollment-wizard',
  imports: [
    CommonModule,
    FormsModule, // <-- FIX: Add FormsModule here
    NbStepperModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbAccordionModule,
    NbInputModule,
    NbCheckboxModule,
    NbAlertModule,
    NbListModule,
    NbBadgeModule,
    NbTooltipModule,
    NbSelectModule,
  ],
  templateUrl: './enrollment-wizard.component.html',
  styleUrls: ['./enrollment-wizard.component.scss'],
})
export class EnrollmentWizardComponent implements OnInit {
  
  enrollment: Enrollment | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  requestId: string | null = null;

  // --- Properties for Step 2: Add Subjects ---
  availableSubjects: Subject[] = [];
  availableAdvisors: Advisor[] = [];
  subjectToAdd: number | null = null;
  advisorToAssign: string | null = null;
  isAdding: boolean = false;
  // -----------------------------------------

  // Expose status config to the template
  public statusConfig = ENROLLMENT_STATUS_CONFIG;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private enrollmentService: EnrollmentService,
    private advisorService: AdvisorService,
    private subjectService: SubjectService,
    private requestService: RequestService,
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
    
    // Check if we're creating a new enrollment from a request
    this.route.queryParams.subscribe(queryParams => {
      this.requestId = queryParams['requestId'];
      if (this.requestId) {
        console.log('Creating new enrollment from request:', this.requestId);
        this.createEnrollmentFromRequest(this.requestId);
        return;
      }
    });

    // Check if we're editing an existing enrollment
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && id !== 'new') {
        console.log('Loading existing enrollment:', id);
        this.loadEnrollment(id);
      } else if (!this.requestId) {
        // If no ID and no requestId, show error
        this.isLoading = false;
        this.error = 'No se proporcionó un ID de inscripción o solicitud.';
        console.error(this.error);
      }
    });
  }

  loadInitialData(): void {
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => this.availableSubjects = subjects,
      error: (err) => console.error('Error loading subjects', err)
    });
  }

  createEnrollmentFromRequest(requestId: string): void {
    this.isLoading = true;
    this.error = null;
    console.log('[WIZARD] Starting enrollment creation for request:', requestId);
    
    this.requestService.getRequest(requestId).subscribe({
      next: (request: TutoringRequest) => {
        console.log('[WIZARD] Request data loaded:', request);
        if (!request) {
          this.error = 'No se encontró la solicitud especificada.';
          this.isLoading = false;
          return;
        }
        
        this.enrollmentService.createEnrollmentFromRequest(request).subscribe({
          next: (enrollment: Enrollment) => {
            this.enrollment = enrollment;
            this.isLoading = false;
            console.log('[WIZARD] New enrollment created successfully:', this.enrollment);
          },
          error: (err: any) => {
            console.error('[WIZARD] Error creating enrollment from request:', err);
            this.error = 'No se pudo crear la inscripción desde la solicitud. Error: ' + JSON.stringify(err);
            this.isLoading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('[WIZARD] Error loading request:', err);
        this.error = 'No se pudo cargar la solicitud. Error: ' + JSON.stringify(err);
        this.isLoading = false;
      }
    });
  }

  loadEnrollment(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.enrollmentService.getEnrollmentById(id).subscribe({
      next: (data) => {
        this.enrollment = data;
        this.isLoading = false;
        console.log('Enrollment data loaded:', this.enrollment);
      },
      error: (err) => {
        console.error('Error loading enrollment:', err);
        this.error = 'No se pudo cargar la información de la inscripción. Por favor, intente de nuevo. Error: ' + (err.message || 'Desconocido');
        this.isLoading = false;
      }
    });
  }

  onSubjectSelected(subjectId: number): void {
    this.advisorToAssign = null;
    this.availableAdvisors = [];
    if (!subjectId) return;

    const selectedSubject = this.availableSubjects.find(s => s.id === subjectId);
    if (selectedSubject) {
      this.advisorService.getAdvisorsBySubject(selectedSubject.name).subscribe({
        next: (advisors) => this.availableAdvisors = advisors,
        error: (err) => console.error('Error loading advisors for subject', err)
      });
    }
  }

  addSubject(): void {
    if (!this.enrollment || !this.subjectToAdd || !this.advisorToAssign) {
      this.error = 'Por favor, seleccione una materia y un asesor.';
      return;
    }
    this.isAdding = true;
    this.error = null;

    this.enrollmentService.addSubjectToEnrollment(this.enrollment.id, this.subjectToAdd, this.advisorToAssign).subscribe({
      next: () => {
        console.log('Subject added successfully');
        this.subjectToAdd = null;
        this.advisorToAssign = null;
        this.availableAdvisors = [];
        // --- FIX: Add null check ---
        if (this.enrollment) {
          this.loadEnrollment(this.enrollment.id); // Refresh enrollment data
        }
        this.isAdding = false;
      },
      error: (err) => {
        console.error('Error adding subject:', err);
        this.error = 'No se pudo añadir la materia.';
        this.isAdding = false;
      }
    });
  }

  removeSubject(enrollmentSubjectId: string): void {
    if (!confirm('¿Estás seguro de que quieres quitar esta materia?')) return;

    this.enrollmentService.removeSubjectFromEnrollment(enrollmentSubjectId).subscribe({
      next: () => {
        console.log('Subject removed successfully');
        // --- FIX: Add null check ---
        if (this.enrollment) {
          this.loadEnrollment(this.enrollment.id); // Refresh
        }
      },
      error: (err) => {
        console.error('Error removing subject:', err);
        this.error = 'No se pudo quitar la materia.';
      }
    });
  }

  sendToClient(): void {
    if (!this.enrollment || !this.enrollment.request_id) {
      console.error('Cannot send to client: enrollment or request ID is missing.');
      this.error = 'No se puede enviar al cliente porque falta información esencial.';
      return;
    }

    const enrollmentId = this.enrollment.id;
    const requestId = this.enrollment.request_id;

    const updateEnrollment$ = this.enrollmentService.updateEnrollmentStatus(enrollmentId, 'pending-approval');
    const updateRequest$ = this.requestService.updateStatus(requestId, 'review');

    forkJoin([updateEnrollment$, updateRequest$]).subscribe({
      next: () => {
        console.log('Enrollment sent to client successfully.');
        this.router.navigate(['/pages/academic/requests']);
      },
      error: (err) => {
        console.error('Error sending enrollment to client:', err);
        this.error = 'Hubo un error al enviar la inscripción. Por favor, intente de nuevo.';
      }
    });
  }

  cancel(): void {
    if (confirm('¿Estás seguro de que quieres salir? Se perderán los cambios no guardados.')) {
      this.router.navigate(['/pages/academic/requests']);
    }
  }
}
