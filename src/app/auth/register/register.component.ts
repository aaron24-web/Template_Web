import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbCardModule, NbInputModule, NbSelectModule } from '@nebular/theme';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbInputModule, NbButtonModule, RouterLink, ReactiveFormsModule, NbSelectModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private formBuilder = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  registerForm = this.formBuilder.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    role: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  async register() {
    // Mark all fields as touched to show validation errors
    this.registerForm.markAllAsTouched();
    
    if (this.registerForm.invalid) {
      console.log('Form is invalid:', this.registerForm.errors);
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    const { fullName, email, password, role } = this.registerForm.value;
    const { error } = await this.supabaseService.client.auth.signUp({
      email: email!,
      password: password!,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      console.error('Registration error:', error);
      alert(`Error al registrar: ${error.message}`);
    } else {
      alert('Usuario registrado exitosamente. Por favor inicia sesión.');
      this.router.navigate(['/auth/login']);
    }
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      return { passwordMismatch: true };
    }

    return null;
  }
}
