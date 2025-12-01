import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  NbCardModule,
  NbBadgeModule,
  NbButtonModule,
  NbIconModule,
  NbListModule,
  NbTooltipModule,
  NbButtonGroupModule,
} from '@nebular/theme';
import { RequestCard, TutoringRequest, REQUEST_STATUS_CONFIG } from '../academic.models';
import { RequestService } from '../../../core/services/request.service';
import { EnrollmentService } from '../services/enrollment.service';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil, filter, switchMap, tap } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-requests',
  imports: [
    CommonModule,
    NbCardModule,
    NbBadgeModule,
    NbButtonModule,
    NbIconModule,
    NbListModule,
    NbTooltipModule,
    NbButtonGroupModule,
  ],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
})
export class RequestsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  viewMode: 'kanban' | 'list' = 'kanban';
  
  // Raw data from the service
  private allRequests: TutoringRequest[] = [];
  
  // View model for the template
  requestCards: RequestCard[] = [];
  
  selectedRequestCard: RequestCard | null = null;

  // Expose status config to the template
  public statusConfig = REQUEST_STATUS_CONFIG;

  constructor(
    private router: Router,
    private requestService: RequestService,
    private enrollmentService: EnrollmentService,
  ) { }

  ngOnInit(): void {
    this.loadRequests();
    this.listenForSelectedRequest();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenForSelectedRequest(): void {
    this.requestService.selectedRequest$.pipe(
      takeUntil(this.destroy$),
      filter(request => !!request) // Only proceed if a request is selected
    ).subscribe(requestToSelect => {
      // Ensure requestCards are loaded before trying to find one
      if (this.requestCards.length > 0) {
        const cardToSelect = this.requestCards.find(card => card.id === requestToSelect.id);
        if (cardToSelect) {
          this.openRequestDetail(cardToSelect);
          // Clear the selection so it's not "sticky"
          this.requestService.clearSelection();
        }
      }
    });
  }

  loadRequests(): void {
    this.requestService.getRequests().subscribe({
      next: (data) => {
        this.allRequests = data;
        this.requestCards = data.map(this.mapToRequestCard);
        // After loading requests, check if there's a pending selection
        this.listenForSelectedRequest();
      },
      error: (err) => console.error('Error loading requests:', err)
    });
  }

  private mapToRequestCard(request: TutoringRequest): RequestCard {
    return {
      id: request.id,
      studentName: request.student?.full_name || 'N/A',
      clientName: request.client?.full_name || 'N/A',
      date: new Date(request.created_at).toLocaleDateString(),
      need: request.need_description || 'No especificada',
      status: request.status,
      originalRequest: request, // Keep the original object
    };
  }

  get newRequests(): RequestCard[] {
    return this.requestCards.filter(r => r.status === 'new');
  }

  get reviewRequests(): RequestCard[] {
    return this.requestCards.filter(r => r.status === 'review');
  }

  get closedRequests(): RequestCard[] {
    return this.requestCards.filter(r => r.status === 'closed');
  }

  setView(mode: 'kanban' | 'list'): void {
    this.viewMode = mode;
  }

  openRequestDetail(card: RequestCard): void {
    this.selectedRequestCard = card;
  }

  closeRequestDetail(): void {
    this.selectedRequestCard = null;
  }

  /**
   * Starts the enrollment process from a tutoring request.
   * @param request The full TutoringRequest object.
   */
  startEnrollment(request: TutoringRequest): void {
    if (!request) return;

    // 1. Create a new draft enrollment and navigate to the wizard
    this.enrollmentService.createEnrollmentFromRequest(request).subscribe({
      next: (enrollment) => {
        console.log('Draft enrollment created:', enrollment);
        // 2. Navigate to the enrollment wizard with the NEW enrollment ID
        this.router.navigate(['/pages/academic/enrollments', enrollment.id]);
      },
      error: (err) => console.error('Error starting enrollment process:', err),
      complete: () => this.closeRequestDetail()
    });
  }
}
