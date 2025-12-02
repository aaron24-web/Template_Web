import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbInputModule, NbCheckboxModule, NbListModule, NbSpinnerModule } from '@nebular/theme';
import { SupabaseService } from '@core/services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@pages/academic/academic.models';
import { SubjectService, Subject } from '../services/subject.service';

@Component({
  selector: 'app-advisor-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbCheckboxModule,
    NbListModule,
    NbSpinnerModule,
  ],
  templateUrl: './advisor-edit.component.html',
})
export class AdvisorEditComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private subjectService = inject(SubjectService);

  advisor: User | null = null;
  advisorForm = this.formBuilder.group({
    full_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  allSubjects: Subject[] = [];
  selectedSubjectIds: Set<number> = new Set();
  isLoadingSubjects = true;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const { data: advisor, error } = await this.supabaseService.client
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (advisor) {
        this.advisor = advisor;
        this.advisorForm.patchValue(advisor);
        
        // Cargar especialidades del asesor
        await this.loadSpecializations(id);
      }
    }

    // Cargar todas las materias
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        this.allSubjects = subjects;
        this.isLoadingSubjects = false;
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
        this.isLoadingSubjects = false;
      }
    });
  }

  async loadSpecializations(advisorId: string) {
    const { data, error } = await this.supabaseService.client
      .from('advisor_specializations')
      .select('subject_id')
      .eq('user_id', advisorId);

    if (error) {
      console.error('Error loading specializations:', error);
    } else if (data) {
      this.selectedSubjectIds = new Set(data.map(s => s.subject_id));
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

  async updateAdvisor() {
    if (this.advisorForm.invalid || !this.advisor) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    // 1. Actualizar datos del asesor
    const { error: updateError } = await this.supabaseService.client
      .from('users')
      .update(this.advisorForm.value)
      .eq('id', this.advisor.id);

    if (updateError) {
      alert(`Error updating advisor: ${updateError.message}`);
      return;
    }

    // 2. Actualizar especialidades
    // Primero eliminar todas las especialidades actuales
    const { error: deleteError } = await this.supabaseService.client
      .from('advisor_specializations')
      .delete()
      .eq('user_id', this.advisor.id);

    if (deleteError) {
      console.error('Error deleting old specializations:', deleteError);
    }

    // Luego insertar las nuevas especialidades
    if (this.selectedSubjectIds.size > 0) {
      const specializations = Array.from(this.selectedSubjectIds).map(subjectId => ({
        user_id: this.advisor!.id,
        subject_id: subjectId
      }));

      const { error: insertError } = await this.supabaseService.client
        .from('advisor_specializations')
        .insert(specializations);

      if (insertError) {
        console.error('Error adding new specializations:', insertError);
        alert(`Asesor actualizado, pero hubo un error al actualizar especialidades: ${insertError.message}`);
        return;
      }
    }

    alert('Asesor actualizado exitosamente');
    this.router.navigate(['/pages/academic/advisors']);
  }
}
