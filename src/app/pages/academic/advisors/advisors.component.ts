import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbCardModule } from '@nebular/theme';
import { SupabaseService } from '../../../core/services/supabase.service';
import { User } from '../academic.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-advisors',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbButtonModule],
  templateUrl: './advisors.component.html',
})
export class AdvisorsComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  advisors: User[] = [];

  async ngOnInit() {
    const { data: advisors, error } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('role', 'advisor');
    if (advisors) {
      this.advisors = advisors;
    }
  }

  addAdvisor() {
    this.router.navigate(['/pages/academic/advisors/new']);
  }

  editAdvisor(id: string) {
    this.router.navigate([`/pages/academic/advisors/edit/${id}`]);
  }

  async deleteAdvisor(id: string) {
    if (confirm('Are you sure you want to delete this advisor?')) {
      const { error } = await this.supabaseService.client.from('users').delete().eq('id', id);
      if (error) {
        alert(`Error deleting advisor: ${error.message}`);
      } else {
        this.advisors = this.advisors.filter(a => a.id !== id);
      }
    }
  }
}
