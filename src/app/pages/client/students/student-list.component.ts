import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule } from '@nebular/theme';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Student } from '../../academic/academic.models';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, NbCardModule],
  templateUrl: './student-list.component.html',
})
export class StudentListComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  students: Student[] = [];

  async ngOnInit() {
    const clientId = await this.supabaseService.getClientId();
    if (clientId) {
      const { data: students, error } = await this.supabaseService.client
        .from('students')
        .select('*')
        .eq('client_id', clientId);
      if (students) {
        this.students = students;
      }
    }
  }
}
