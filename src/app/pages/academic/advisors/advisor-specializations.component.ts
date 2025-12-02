import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbSelectModule,
  NbCheckboxModule,
  NbListModule,
  NbIconModule,
  NbAlertModule,
  NbSpinnerModule,
} from '@nebular/theme';
import { SupabaseService } from '../../../core/services/supabase.service';
import { SubjectService } from '../services/subject.service';
import { Subject } from '../services/subject.service';

interface Advisor {
  id: string;
  full_name: string;
  email: string;
}

interface Specialization {
  user_id: string;
  subject_id: number;
  subject?: Subject;
}

@Component({
  selector: 'app-advisor-specializations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbSelectModule,
    NbCheckboxModule,
    NbListModule,
    NbIconModule,
    NbAlertModule,
    NbSpinnerModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <h3>Administrar Especialidades de Asesores</h3>
      </nb-card-header>
      <nb-card-body>
        <nb-alert status="danger" *ngIf="error">{{ error }}</nb-alert>
        <nb-alert status="success" *ngIf="successMessage">{{ successMessage }}</nb-alert>

        <div *ngIf="isLoading" style="text-align: center; padding: 2rem;">
          <nb-spinner status="primary"></nb-spinner>
          <p>Cargando datos...</p>
        </div>

        <div *ngIf="!isLoading">
          <!-- Selector de Asesor -->
          <div class="form-group">
            <label for="advisor">Seleccionar Asesor</label>
            <nb-select 
              id="advisor" 
              fullWidth 
              [(ngModel)]="selectedAdvisorId"
              (selectedChange)="onAdvisorChange()"
              placeholder="Selecciona un asesor">
              <nb-option *ngFor="let advisor of advisors" [value]="advisor.id">
                {{ advisor.full_name }} ({{ advisor.email }})
              </nb-option>
            </nb-select>
          </div>

          <!-- Materias disponibles -->
          <div *ngIf="selectedAdvisorId" style="margin-top: 2rem;">
            <h5>Materias del Asesor</h5>
            <p class="caption">Selecciona las materias en las que el asesor puede dar tutorías:</p>

            <nb-list>
              <nb-list-item *ngFor="let subject of allSubjects">
                <nb-checkbox 
                  [checked]="isSubjectSelected(subject.id)"
                  (checkedChange)="toggleSubject(subject.id, $event)">
                  {{ subject.name }}
                </nb-checkbox>
              </nb-list-item>
            </nb-list>

            <button 
              nbButton 
              status="primary" 
              (click)="saveSpecializations()"
              [disabled]="isSaving"
              style="margin-top: 1rem;">
              <nb-icon icon="save-outline"></nb-icon>
              {{ isSaving ? 'Guardando...' : 'Guardar Especialidades' }}
            </button>
          </div>

          <!-- Resumen actual -->
          <div *ngIf="selectedAdvisorId && currentSpecializations.length > 0" style="margin-top: 2rem;">
            <nb-card accent="info">
              <nb-card-header>Especialidades Actuales</nb-card-header>
              <nb-card-body>
                <nb-list>
                  <nb-list-item *ngFor="let spec of currentSpecializations">
                    <nb-icon icon="checkmark-circle-outline" status="success"></nb-icon>
                    {{ getSubjectName(spec.subject_id) }}
                  </nb-list-item>
                </nb-list>
              </nb-card-body>
            </nb-card>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .form-group {
      margin-bottom: 1.5rem;
    }
    nb-list-item {
      padding: 0.75rem;
    }
  `]
})
export class AdvisorSpecializationsComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private subjectService = inject(SubjectService);
  private router = inject(Router);

  advisors: Advisor[] = [];
  allSubjects: Subject[] = [];
  currentSpecializations: Specialization[] = [];
  selectedAdvisorId: string | null = null;
  selectedSubjectIds: Set<number> = new Set();
  
  isLoading = true;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    this.error = null;

    try {
      // Cargar asesores
      const { data: advisorsData, error: advisorsError } = await this.supabaseService.client
        .from('users')
        .select('id, full_name, email')
        .eq('role', 'advisor')
        .order('full_name');

      if (advisorsError) throw advisorsError;
      this.advisors = advisorsData || [];

      // Cargar materias
      this.subjectService.getSubjects().subscribe({
        next: (subjects) => {
          this.allSubjects = subjects;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading subjects:', err);
          this.error = 'Error al cargar las materias';
          this.isLoading = false;
        }
      });
    } catch (err: any) {
      console.error('Error loading data:', err);
      this.error = 'Error al cargar los datos: ' + err.message;
      this.isLoading = false;
    }
  }

  async onAdvisorChange() {
    if (!this.selectedAdvisorId) {
      this.currentSpecializations = [];
      this.selectedSubjectIds.clear();
      return;
    }

    try {
      const { data, error } = await this.supabaseService.client
        .from('advisor_specializations')
        .select('user_id, subject_id, subjects(id, name)')
        .eq('user_id', this.selectedAdvisorId);

      if (error) throw error;

      this.currentSpecializations = data || [];
      this.selectedSubjectIds = new Set(this.currentSpecializations.map(s => s.subject_id));
    } catch (err: any) {
      console.error('Error loading specializations:', err);
      this.error = 'Error al cargar las especialidades: ' + err.message;
    }
  }

  isSubjectSelected(subjectId: number): boolean {
    return this.selectedSubjectIds.has(subjectId);
  }

  toggleSubject(subjectId: number, checked: boolean) {
    if (checked) {
      this.selectedSubjectIds.add(subjectId);
    } else {
      this.selectedSubjectIds.delete(subjectId);
    }
  }

  async saveSpecializations() {
    if (!this.selectedAdvisorId) return;

    this.isSaving = true;
    this.error = null;
    this.successMessage = null;

    try {
      // Primero, eliminar todas las especialidades actuales del asesor
      const { error: deleteError } = await this.supabaseService.client
        .from('advisor_specializations')
        .delete()
        .eq('user_id', this.selectedAdvisorId);

      if (deleteError) throw deleteError;

      // Luego, insertar las nuevas especialidades
      if (this.selectedSubjectIds.size > 0) {
        const specializations = Array.from(this.selectedSubjectIds).map(subjectId => ({
          user_id: this.selectedAdvisorId,
          subject_id: subjectId
        }));

        const { error: insertError } = await this.supabaseService.client
          .from('advisor_specializations')
          .insert(specializations);

        if (insertError) throw insertError;
      }

      this.successMessage = 'Especialidades guardadas exitosamente';
      await this.onAdvisorChange(); // Recargar las especialidades
      
      // Limpiar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    } catch (err: any) {
      console.error('Error saving specializations:', err);
      this.error = 'Error al guardar las especialidades: ' + err.message;
    } finally {
      this.isSaving = false;
    }
  }

  getSubjectName(subjectId: number): string {
    const subject = this.allSubjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Desconocida';
  }
}
