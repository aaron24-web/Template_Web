import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule } from '@nebular/theme';
import { SupabaseService } from '../../../core/services/supabase.service';
import { TutoringRequest } from '../../academic/academic.models';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, NbCardModule],
  templateUrl: './request-list.component.html',
})
export class RequestListComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  requests: TutoringRequest[] = [];

  async ngOnInit() {
    const clientId = await this.supabaseService.getClientId();
    if (clientId) {
      const { data: requests, error } = await this.supabaseService.client
        .from('tutoring_requests')
        .select('*')
        .eq('client_id', clientId);
      if (requests) {
        this.requests = requests;
      }
    }
  }
}
