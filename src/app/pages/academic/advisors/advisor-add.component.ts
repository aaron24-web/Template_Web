import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbInputModule, NbCheckboxModule, NbListModule, NbSpinnerModule } from '@nebular/theme';
import { SupabaseService } from '@core/services/supabase.service';
import { Router } from '@angular/router';
import { SubjectService, Subject } from '../services/subject.service';

@Component({
  selector: 'app-advisor-add',
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
  templateUrl: './advisor-add.component.html',
})
export class AdvisorAddComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private subjectService = inject(SubjectService);

  advisorForm = this.formBuilder.group({
    full_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  allSubjects: Subject[] = [];
  selectedSubjectIds: Set<number> = new Set();
  isLoadingSubjects = true;

  ngOnInit() {
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

  toggleSubject(subjectId: number, checked: boolean) {
    if (checked) {
      this.selectedSubjectIds.add(subjectId);
    } else {
      this.selectedSubjectIds.delete(subjectId);
    }
  }

  async addAdvisor() {
    if (this.advisorForm.invalid) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const { full_name, email, password } = this.advisorForm.value;
    
    // 1. Crear el usuario/asesor en Auth
    const { data: authData, error: authError } = await this.supabaseService.client.auth.signUp({
      email: email!,
      password: password!,
      options: {
        data: {
          full_name: full_name,
          role: 'advisor',
        },
      },
    });

    if (authError) {
      alert(`Error adding advisor: ${authError.message}`);
      return;
    }

    // 2. Obtener el ID del usuario recién creado
    const userId = authData.user?.id;
    if (!userId) {
      alert('No se pudo obtener el ID del usuario creado.');
      return;
    }

    // 3. Esperar un momento para que el trigger copie el usuario a public.users
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Agregar especialidades si hay materias seleccionadas
    if (this.selectedSubjectIds.size > 0) {
      const specializations = Array.from(this.selectedSubjectIds).map(subjectId => ({
        user_id: userId,
        subject_id: subjectId
      }));

      const { error: specError } = await this.supabaseService.client
        .from('advisor_specializations')
        .insert(specializations);

      if (specError) {
        console.error('Error adding specializations:', specError);
        alert(`Asesor creado, pero hubo un error al agregar especialidades: ${specError.message}.\n\nPuedes agregar las especialidades editando el asesor después.`);
      } else {
        alert('Asesor creado exitosamente con sus especialidades');
      }
    } else {
      alert('Asesor creado exitosamente (sin especialidades asignadas)');
    }

    this.router.navigate(['/pages/academic/advisors']);
  }
}
