import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule, NbButtonModule } from '@nebular/theme';
import { SupabaseService } from '../../../core/services/supabase.service';
import { User } from '../../academic/academic.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbButtonModule],
  templateUrl: './browse.component.html',
})
export class BrowseComponent implements OnInit {
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

  requestTutoring(advisorId: string) {
    this.router.navigate(['/pages/client/requests/new'], { queryParams: { advisorId } });
  }
}
