import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbInputModule, NbSelectModule } from '@nebular/theme';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbSelectModule,
  ],
  templateUrl: './student-add.component.html',
})
export class StudentAddComponent {
  private formBuilder = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  studentForm = this.formBuilder.group({
    full_name: ['', Validators.required],
    birth_date: [''],
    grade: [''],
    learning_style: [''],
    medical_notes: [''],
  });

  async addStudent() {
    console.log('addStudent method called');
    if (this.studentForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const clientId = await this.supabaseService.getClientId();
    console.log('clientId:', clientId);
    if (!clientId) {
      console.log('clientId is null');
      return;
    }

    const { error } = await this.supabaseService.client.from('students').insert({
      ...this.studentForm.value,
      client_id: clientId,
    });

    if (error) {
      console.error('Error adding student:', error);
      alert(`Error adding student: ${error.message}`);
    } else {
      console.log('Student added successfully');
      // I should refresh the student list in the dashboard.
      // For now, I will just navigate back to the home page.
      this.router.navigate(['/pages/client/home']);
    }
  }
}
