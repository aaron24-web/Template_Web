import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  NbCardModule,
  NbIconModule,
  NbButtonModule,
  NbThemeService,
  NbListModule,
  NbBadgeModule,
} from '@nebular/theme';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { takeWhile } from 'rxjs/operators';
import { RequestService } from '../../core/services/request.service';
import { RequestCard, REQUEST_STATUS_CONFIG, TutoringRequest } from '../academic/academic.models';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'ngx-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NgxChartsModule,
    NbListModule,
    NbBadgeModule,
  ],
  template: `
    <div class="row">
      <div class="col-xxxl-3 col-md-6" *ngFor="let card of statusCards">
        <nb-card [status]="card.status">
          <nb-card-body>
            <div class="status-card">
              <div class="icon-container">
                <nb-icon [icon]="card.icon"></nb-icon>
              </div>
              <div class="details">
                <div class="title">{{ card.title }}</div>
                <div class="value">{{ card.value }}</div>
              </div>
            </div>
          </nb-card-body>
        </nb-card>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <nb-card>
          <nb-card-header>
            Últimas Solicitudes
          </nb-card-header>
          <nb-card-body>
            <table class="table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let request of latestRequests">
                  <td>{{ request.studentName }}</td>
                  <td>{{ request.clientName }}</td>
                  <td>{{ request.date }}</td>
                  <td>
                    <ng-container *ngIf="statusConfig[request.status]">
                      <nb-badge 
                        [text]="statusConfig[request.status].text" 
                        [status]="statusConfig[request.status].badge">
                      </nb-badge>
                    </ng-container>
                    <ng-container *ngIf="!statusConfig[request.status]">
                      <nb-badge text="Desconocido" status="basic"></nb-badge>
                    </ng-container>
                  </td>
                  <td>
                    <button 
                      nbButton 
                      status="primary" 
                      size="small"
                      (click)="navigateToRequest(request)">
                      Ver
                    </button>
                  </td>
                </tr>
                <tr *ngIf="latestRequests.length === 0">
                  <td colspan="5" style="text-align: center;">No hay solicitudes recientes.</td>
                </tr>
              </tbody>
            </table>
          </nb-card-body>
        </nb-card>
      </div>
    </div>
  `,
  styles: [`
    .row {
      display: flex;
      flex-wrap: wrap;
      margin: -0.5rem;
    }

    .col-md-6, .col-md-12, .col-xxxl-3, .col-xxxl-4, .col-xxxl-8, .col-xxl-5, .col-xxl-7 {
      padding: 0.5rem;
      flex: 1;
      min-width: 300px;
    }

    .col-md-6 { flex: 0 0 50%; }
    .col-md-12 { flex: 0 0 100%; }

    .status-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;

      .icon-container {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        
        nb-icon {
          font-size: 3rem !important;
          
          svg {
            width: 3rem !important;
            height: 3rem !important;
          }
        }
      }

      .details {
        .title {
          font-size: 0.875rem;
          color: var(--text-hint-color);
          margin-bottom: 0.25rem;
        }

        .value {
          font-size: 2rem;
          font-weight: 600;
        }
      }
    }

    .chart-container, .pie-chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        text-align: left;
        padding: 1rem;
        border-bottom: 1px solid var(--border-basic-color-3);
      }

      /* --- FIX START --- */
      /* Forzar a la insignia a permanecer dentro de la celda de la tabla */
      td nb-badge {
        position: static;
        display: inline-block;
      }
      /* --- FIX END --- */

      thead th {
        font-weight: 600;
        color: var(--text-hint-color);
        font-size: 0.875rem;
      }
    }

    @media (max-width: 768px) {
      .col-md-6, .col-md-12 {
        flex: 0 0 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private alive = true;
  colorScheme: any;
  requestsChartData: any[];
  enrollmentStatusData: any[];

  // Expose status config to the template
  public statusConfig = REQUEST_STATUS_CONFIG;
  
  latestRequests: RequestCard[] = [];

  statusCards = [
    {
      title: 'Solicitudes Nuevas',
      value: '0',
      icon: 'inbox-outline',
      status: 'primary',
    },
    {
      title: 'En Revisión',
      value: '0',
      icon: 'eye-outline',
      status: 'warning',
    },
    {
      title: 'Inscritos',
      value: '0',
      icon: 'checkmark-circle-outline',
      status: 'success',
    },
    {
      title: 'Total Estudiantes',
      value: '0',
      icon: 'people-outline',
      status: 'info',
    },
  ];

  constructor(
    private theme: NbThemeService,
    private requestService: RequestService,
    private supabaseService: SupabaseService, // Inyectar el servicio de Supabase
    private router: Router,
  ) {
    this.theme.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(config => {
        const colors: any = config.variables;
        this.colorScheme = {
          domain: [colors.primaryLight, colors.infoLight, colors.successLight, colors.warningLight, colors.dangerLight],
        };
      });

    // Datos para el gráfico de líneas (Solicitudes por mes)
    this.requestsChartData = [];
    // Datos para el gráfico circular (Estado de inscripciones)
    this.enrollmentStatusData = [];
  }

  ngOnInit(): void {
    // Cargar las últimas 5 solicitudes (lógica existente)
    this.requestService.getRequests().subscribe({
      next: (data) => {
        this.latestRequests = data
          .map(this.mapToRequestCard)
          .slice(0, 5);
      },
      error: (err) => console.error('Error loading requests:', err)
    });

    // Cargar las estadísticas del dashboard
    this.supabaseService.getDashboardStats().then((response: any) => {
      if (response.error) {
        console.error('Error fetching dashboard stats:', response.error);
        return;
      }

      const stats = response.data;
      const newRequestsCard = this.statusCards.find(c => c.title === 'Solicitudes Nuevas');
      if (newRequestsCard) {
        newRequestsCard.value = stats.newRequests.toString();
      }

      const reviewRequestsCard = this.statusCards.find(c => c.title === 'En Revisión');
      if (reviewRequestsCard) {
        reviewRequestsCard.value = stats.reviewRequests.toString();
      }

      const activeEnrollmentsCard = this.statusCards.find(c => c.title === 'Inscritos');
      if (activeEnrollmentsCard) {
        activeEnrollmentsCard.value = stats.activeEnrollments.toString();
      }

      const totalStudentsCard = this.statusCards.find(c => c.title === 'Total Estudiantes');
      if (totalStudentsCard) {
        totalStudentsCard.value = stats.totalStudents.toString();
      }
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
      originalRequest: request,
    };
  }

  navigateToRequest(card: RequestCard) {
    this.requestService.selectRequest(card.originalRequest);
    this.router.navigate(['/pages/academic/requests']);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}

