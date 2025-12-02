import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbInputModule } from '@nebular/theme';
import { SupabaseService } from '@core/services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@pages/academic/academic.models';

@Component({
  selector: 'app-advisor-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
  ],
  templateUrl: './advisor-edit.component.html',
})
export class AdvisorEditComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  advisor: User | null = null;
  advisorForm = this.formBuilder.group({
    full_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

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
      }
    }
  }

  async updateAdvisor() {
    if (this.advisorForm.invalid || !this.advisor) {
      return;
    }

    const { error } = await this.supabaseService.client
      .from('users')
      .update(this.advisorForm.value)
      .eq('id', this.advisor.id);

    if (error) {
      alert(`Error updating advisor: ${error.message}`);
    } else {
      this.router.navigate(['/pages/academic/advisors']);
    }
  }
}
