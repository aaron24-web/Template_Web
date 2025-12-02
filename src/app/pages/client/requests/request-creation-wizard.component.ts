import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbStepperModule, NbCardModule, NbButtonModule, NbInputModule, NbSelectModule } from '@nebular/theme';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Student, Subject, User } from '../../academic/academic.models';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-request-creation-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbStepperModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbSelectModule,
  ],
  templateUrl: './request-creation-wizard.component.html',
})
export class RequestCreationWizardComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  students: Student[] = [];
  subjects: Subject[] = [];
  advisors: User[] = [];

  firstForm = this.formBuilder.group({
    student: ['', Validators.required],
  });

  secondForm = this.formBuilder.group({
    subjects: [[], Validators.required],
  });

  thirdForm = this.formBuilder.group({
    advisor: [''],
  });

  fourthForm = this.formBuilder.group({
    description: ['', Validators.required],
  });

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const advisorId = params['advisorId'];
      if (advisorId) {
        this.thirdForm.get('advisor')?.setValue(advisorId);
      }
    });

    const clientId = await this.supabaseService.getClientId();
    if (clientId) {
      const { data: students } = await this.supabaseService.client
        .from('students')
        .select('*')
        .eq('client_id', clientId);
      this.students = students || [];
    }

    const { data: subjects } = await this.supabaseService.client.from('subjects').select('*');
    this.subjects = subjects || [];

    const { data: advisors } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('role', 'advisor');
    this.advisors = advisors || [];
  }

  onFirstSubmit() {
    this.firstForm.markAsDirty();
  }

  onSecondSubmit() {
    this.secondForm.markAsDirty();
  }

  onThirdSubmit() {
    this.thirdForm.markAsDirty();
  }

  async onFourthSubmit() {
    this.fourthForm.markAsDirty();
    if (this.firstForm.invalid || this.secondForm.invalid || this.fourthForm.invalid) {
      return;
    }

    const clientId = await this.supabaseService.getClientId();
    if (!clientId) {
      return;
    }

    const { student } = this.firstForm.value;
    const { subjects } = this.secondForm.value;
    const { advisor } = this.thirdForm.value;
    const { description } = this.fourthForm.value;

    const { error } = await this.supabaseService.client.rpc('create_tutoring_request', {
      p_client_id: clientId,
      p_student_id: student,
      p_need_description: description,
      p_preferred_advisor_id: advisor || null,
      p_subject_ids: subjects,
    });


    if (error) {
      // show error
    } else {
      this.router.navigate(['/pages/client/home']);
    }
  }
}
