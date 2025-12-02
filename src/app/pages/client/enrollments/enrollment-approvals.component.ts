import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbListModule,
  NbBadgeModule,
  NbAlertModule,
  NbSpinnerModule,
  NbAccordionModule,
} from '@nebular/theme';
import { SupabaseService } from '../../../core/services/supabase.service';

interface EnrollmentForApproval {
  id: string;
  status: string;
  created_at: string;
  student: {
    full_name: string;
    grade?: string;
  };
  subjects: Array<{
    id: string;
    subject: {
      name: string;
    };
    advisor: {
      full_name: string;
      email: string;
    };
  }>;
}

@Component({
  selector: 'app-enrollment-approvals',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbListModule,
    NbBadgeModule,
    NbAlertModule,
    NbSpinnerModule,
    NbAccordionModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <h3>Inscripciones Pendientes de Aprobación</h3>
      </nb-card-header>
      <nb-card-body>
        <nb-alert status="info" *ngIf="!isLoading && pendingEnrollments.length === 0">
          No tienes inscripciones pendientes de aprobación.
        </nb-alert>

        <div *ngIf="isLoading" style="text-align: center; padding: 2rem;">
          <nb-spinner status="primary"></nb-spinner>
          <p>Cargando inscripciones...</p>
        </div>

        <nb-alert status="danger" *ngIf="error">{{ error }}</nb-alert>
        <nb-alert status="success" *ngIf="successMessage">{{ successMessage }}</nb-alert>

        <nb-accordion *ngIf="!isLoading && pendingEnrollments.length > 0">
          <nb-accordion-item *ngFor="let enrollment of pendingEnrollments">
            <nb-accordion-item-header>
              <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                <div>
                  <strong>{{ enrollment.student.full_name }}</strong>
                  <span class="caption" style="margin-left: 1rem;">
                    {{ enrollment.subjects?.length || 0 }} materias
                  </span>
                </div>
                <nb-badge status="warning" text="Pendiente"></nb-badge>
              </div>
            </nb-accordion-item-header>
            <nb-accordion-item-body>
              <div class="enrollment-details">
                <h5>Detalles del Programa</h5>
                
                <div class="info-section">
                  <label>Estudiante:</label>
                  <p>{{ enrollment.student.full_name }}</p>
                  <label>Grado:</label>
                  <p>{{ enrollment.student.grade || 'No especificado' }}</p>
                </div>

                <div class="info-section" style="margin-top: 1.5rem;">
                  <h6>Materias y Asesores Asignados:</h6>
                  <nb-list *ngIf="enrollment.subjects && enrollment.subjects.length > 0">
                    <nb-list-item *ngFor="let item of enrollment.subjects">
                      <div class="subject-item">
                        <nb-icon icon="book-open-outline" status="primary"></nb-icon>
                        <div class="subject-info">
                          <strong>{{ item.subject.name || 'Materia desconocida' }}</strong>
                          <span class="caption">Asesor: {{ item.advisor.full_name || 'No asignado' }}</span>
                          <span class="caption" style="display: block;">{{ item.advisor.email }}</span>
                        </div>
                      </div>
                    </nb-list-item>
                  </nb-list>
                  <p *ngIf="!enrollment.subjects || enrollment.subjects.length === 0" class="caption">
                    No hay materias asignadas
                  </p>
                </div>

                <div class="action-buttons" style="margin-top: 2rem; display: flex; gap: 1rem;">
                  <button 
                    nbButton 
                    status="success" 
                    (click)="approveEnrollment(enrollment.id)"
                    [disabled]="isProcessing">
                    <nb-icon icon="checkmark-circle-outline"></nb-icon>
                    {{ isProcessing ? 'Procesando...' : 'Aprobar Inscripción' }}
                  </button>
                  <button 
                    nbButton 
                    status="danger" 
                    (click)="rejectEnrollment(enrollment.id)"
                    [disabled]="isProcessing">
                    <nb-icon icon="close-circle-outline"></nb-icon>
                    Rechazar
                  </button>
                </div>
              </div>
            </nb-accordion-item-body>
          </nb-accordion-item>
        </nb-accordion>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .enrollment-details {
      padding: 1rem;
    }
    .info-section {
      margin-bottom: 1rem;
    }
    .info-section label {
      font-weight: 600;
      margin-bottom: 0.25rem;
      display: block;
    }
    .info-section p {
      margin: 0 0 0.5rem 0;
    }
    .subject-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .subject-info {
      flex: 1;
    }
    .subject-info strong {
      display: block;
      margin-bottom: 0.25rem;
    }
    .action-buttons button {
      flex: 1;
    }
  `]
})
export class EnrollmentApprovalsComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  pendingEnrollments: EnrollmentForApproval[] = [];
  isLoading = true;
  isProcessing = false;
  error: string | null = null;
  successMessage: string | null = null;

  async ngOnInit() {
    await this.loadPendingEnrollments();
  }

  async loadPendingEnrollments() {
    this.isLoading = true;
    this.error = null;

    try {
      // Obtener el ID del cliente actual
      const clientId = await this.supabaseService.getClientId();
      if (!clientId) {
        this.error = 'No se pudo obtener la información del cliente';
        this.isLoading = false;
        return;
      }

      // Obtener inscripciones pendientes del cliente
      const { data, error } = await this.supabaseService.client
        .from('enrollments')
        .select(`
          id,
          status,
          created_at,
          student:students (
            full_name,
            grade
          ),
          subjects:enrollment_subjects (
            id,
            subject:subjects (
              name
            ),
            advisor:users (
              full_name,
              email
            )
          )
        `)
        .eq('student.client_id', clientId)
        .eq('status', 'pending-approval')
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.pendingEnrollments = (data as any) || [];
      console.log('Pending enrollments loaded:', this.pendingEnrollments);
    } catch (err: any) {
      console.error('Error loading pending enrollments:', err);
      this.error = 'Error al cargar las inscripciones: ' + err.message;
    } finally {
      this.isLoading = false;
    }
  }

  async approveEnrollment(enrollmentId: string) {
    if (!confirm('¿Estás seguro de que quieres aprobar esta inscripción?')) {
      return;
    }

    this.isProcessing = true;
    this.error = null;
    this.successMessage = null;

    try {
      // Actualizar estado de la inscripción
      const { error: enrollmentError } = await this.supabaseService.client
        .from('enrollments')
        .update({ status: 'active' })
        .eq('id', enrollmentId);

      if (enrollmentError) throw enrollmentError;

      // Actualizar estado de la solicitud relacionada
      const { data: enrollment } = await this.supabaseService.client
        .from('enrollments')
        .select('request_id')
        .eq('id', enrollmentId)
        .single();

      if (enrollment?.request_id) {
        await this.supabaseService.client
          .from('tutoring_requests')
          .update({ status: 'closed' })
          .eq('id', enrollment.request_id);
      }

      this.successMessage = 'Inscripción aprobada exitosamente';
      
      // Recargar la lista después de 1 segundo
      setTimeout(() => {
        this.successMessage = null;
        this.loadPendingEnrollments();
      }, 1500);
    } catch (err: any) {
      console.error('Error approving enrollment:', err);
      this.error = 'Error al aprobar la inscripción: ' + err.message;
    } finally {
      this.isProcessing = false;
    }
  }

  async rejectEnrollment(enrollmentId: string) {
    const reason = prompt('¿Por qué deseas rechazar esta inscripción? (opcional)');
    
    if (reason === null) return; // Usuario canceló

    this.isProcessing = true;
    this.error = null;
    this.successMessage = null;

    try {
      // Actualizar estado de la inscripción a rechazado
      const { error: enrollmentError } = await this.supabaseService.client
        .from('enrollments')
        .update({ 
          status: 'rejected',
          // Puedes agregar un campo 'rejection_reason' a la tabla si quieres guardar el motivo
        })
        .eq('id', enrollmentId);

      if (enrollmentError) throw enrollmentError;

      // Actualizar estado de la solicitud a 'new' para que el admin pueda revisarla de nuevo
      const { data: enrollment } = await this.supabaseService.client
        .from('enrollments')
        .select('request_id')
        .eq('id', enrollmentId)
        .single();

      if (enrollment?.request_id) {
        await this.supabaseService.client
          .from('tutoring_requests')
          .update({ status: 'new' })
          .eq('id', enrollment.request_id);
      }

      this.successMessage = 'Inscripción rechazada. El equipo académico será notificado.';
      
      // Recargar la lista después de 1 segundo
      setTimeout(() => {
        this.successMessage = null;
        this.loadPendingEnrollments();
      }, 1500);
    } catch (err: any) {
      console.error('Error rejecting enrollment:', err);
      this.error = 'Error al rechazar la inscripción: ' + err.message;
    } finally {
      this.isProcessing = false;
    }
  }
}
