import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbInputModule } from '@nebular/theme';
import { SupabaseService } from '@core/services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-advisor-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
  ],
  templateUrl: './advisor-add.component.html',
})
export class AdvisorAddComponent {
  private formBuilder = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  advisorForm = this.formBuilder.group({
    full_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async addAdvisor() {
    if (this.advisorForm.invalid) {
      return;
    }

    const { full_name, email, password } = this.advisorForm.value;
    const { error } = await this.supabaseService.client.auth.signUp({
      email: email!,
      password: password!,
      options: {
        data: {
          full_name: full_name,
          role: 'advisor',
        },
      },
    });

    if (error) {
      alert(`Error adding advisor: ${error.message}`);
    } else {
      this.router.navigate(['/pages/academic/advisors']);
    }
  }
}
