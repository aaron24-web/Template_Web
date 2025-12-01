/**
 * EJEMPLOS DE USO AVANZADO
 * Casos de uso y extensiones para el módulo académico
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// ============================================================================
// EJEMPLO 1: SERVICIO PARA GESTIONAR SOLICITUDES
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  private mockRequests = [
    {
      id: 1,
      studentName: 'Juan Pérez García',
      clientName: 'María Pérez',
      date: '2025-11-10',
      need: 'Apoyo en Matemáticas y Lengua para 3º ESO',
      status: 'new' as const,
    },
    // ... más datos mock
  ];

  // Obtener todas las solicitudes
  getRequests(): Observable<any[]> {
    return of(this.mockRequests).pipe(delay(500));
  }

  // Obtener una solicitud por ID
  getRequestById(id: number): Observable<any> {
    const request = this.mockRequests.find(r => r.id === id);
    return of(request).pipe(delay(300));
  }

  // Actualizar estado de solicitud
  updateRequestStatus(id: number, status: 'new' | 'review' | 'closed'): Observable<any> {
    const request = this.mockRequests.find(r => r.id === id);
    if (request) {
      request.status = status;
    }
    return of(request).pipe(delay(500));
  }

  // Filtrar solicitudes
  filterRequests(filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Observable<any[]> {
    let filtered = [...this.mockRequests];

    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.studentName.toLowerCase().includes(search) ||
        r.clientName.toLowerCase().includes(search) ||
        r.need.toLowerCase().includes(search)
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(r => r.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(r => r.date <= filters.dateTo!);
    }

    return of(filtered).pipe(delay(300));
  }
}

// ============================================================================
// EJEMPLO 2: SERVICIO PARA GESTIONAR INSCRIPCIONES
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private mockEnrollments: Map<number, any> = new Map();

  // Guardar borrador
  saveDraft(enrollmentData: any): Observable<{ success: boolean; id: number }> {
    const id = enrollmentData.id || Date.now();
    this.mockEnrollments.set(id, { ...enrollmentData, status: 'draft' });
    return of({ success: true, id }).pipe(delay(800));
  }

  // Enviar inscripción
  submitEnrollment(enrollmentData: any): Observable<{ success: boolean; message: string }> {
    const id = enrollmentData.id || Date.now();
    this.mockEnrollments.set(id, { ...enrollmentData, status: 'submitted' });
    return of({
      success: true,
      message: 'Inscripción enviada correctamente'
    }).pipe(delay(1000));
  }

  // Obtener inscripción por ID
  getEnrollmentById(id: number): Observable<any> {
    const enrollment = this.mockEnrollments.get(id);
    return of(enrollment).pipe(delay(500));
  }

  // Validar plan pedagógico
  validatePedagogicalPlan(plan: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!plan.diagnosis || plan.diagnosis.length < 20) {
      errors.push('El diagnóstico debe tener al menos 20 caracteres');
    }

    if (!plan.goals || plan.goals.length < 20) {
      errors.push('Las metas deben tener al menos 20 caracteres');
    }

    if (!plan.methodology || plan.methodology.length < 20) {
      errors.push('La metodología debe tener al menos 20 caracteres');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// ============================================================================
// EJEMPLO 3: GUARD PARA PROTEGER RUTAS
// ============================================================================

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const enrollmentGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const id = route.params['id'];

  // Verificar si hay datos guardados para este ID
  const hasData = localStorage.getItem(`enrollment-${id}`) !== null;

  if (!hasData && id !== 'new') {
    // Redirigir a solicitudes si no hay datos
    router.navigate(['/pages/academic/requests']);
    return false;
  }

  return true;
};

// Uso en las rutas:
/*
{
  path: 'enrollments/:id',
  loadComponent: () => import('./enrollments/enrollment-wizard.component'),
  canActivate: [enrollmentGuard],
}
*/

// ============================================================================
// EJEMPLO 4: INTERCEPTOR PARA SIMULAR LOADING
// ============================================================================

import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Mostrar spinner global
  // loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Ocultar spinner
      // loadingService.hide();
    })
  );
};

// ============================================================================
// EJEMPLO 5: DIRECTIVA PERSONALIZADA PARA VALIDACIÓN
// ============================================================================

import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appMinWords]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MinWordsValidatorDirective,
      multi: true,
    },
  ],
})
export class MinWordsValidatorDirective implements Validator {
  @Input() minWords: number = 10;

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const wordCount = control.value.trim().split(/\s+/).length;

    return wordCount < this.minWords
      ? { minWords: { required: this.minWords, actual: wordCount } }
      : null;
  }
}

// ============================================================================
// EJEMPLO 6: PIPE PERSONALIZADO PARA FORMATEAR FECHAS
// ============================================================================

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate',
  standalone: true,
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    const date = new Date(value);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
    return `Hace ${Math.floor(days / 365)} años`;
  }
}

// Uso en template:
// {{ request.date | relativeDate }}

// ============================================================================
// EJEMPLO 7: STORE DE ESTADO (sin NgRx)
// ============================================================================

import { Injectable, signal, computed } from '@angular/core';

interface AcademicState {
  requests: any[];
  selectedRequest: any | null;
  filters: any;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AcademicStore {
  // Estado reactivo con signals (Angular 17+)
  private state = signal<AcademicState>({
    requests: [],
    selectedRequest: null,
    filters: {},
    loading: false,
  });

  // Selectores computados
  requests = computed(() => this.state().requests);
  selectedRequest = computed(() => this.state().selectedRequest);
  loading = computed(() => this.state().loading);
  
  filteredRequests = computed(() => {
    const { requests, filters } = this.state();
    // Aplicar filtros
    return requests; // ... lógica de filtrado
  });

  // Acciones
  setRequests(requests: any[]) {
    this.state.update(s => ({ ...s, requests }));
  }

  selectRequest(request: any) {
    this.state.update(s => ({ ...s, selectedRequest: request }));
  }

  setLoading(loading: boolean) {
    this.state.update(s => ({ ...s, loading }));
  }

  setFilters(filters: any) {
    this.state.update(s => ({ ...s, filters }));
  }
}

// ============================================================================
// EJEMPLO 8: EXPORTACIÓN A PDF
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  exportEnrollmentToPdf(enrollment: any): void {
    // Usar una librería como jsPDF o pdfmake
    console.log('Generando PDF para inscripción:', enrollment);
    
    // Ejemplo básico (requiere instalar jspdf):
    /*
    import jsPDF from 'jspdf';
    
    const doc = new jsPDF();
    doc.text(`Inscripción de ${enrollment.student.name}`, 10, 10);
    doc.text(`Curso: ${enrollment.student.grade}`, 10, 20);
    // ... más contenido
    doc.save(`inscripcion-${enrollment.id}.pdf`);
    */
  }

  exportRequestsToExcel(requests: any[]): void {
    // Usar una librería como xlsx
    console.log('Generando Excel con', requests.length, 'solicitudes');
    
    // Ejemplo básico (requiere instalar xlsx):
    /*
    import * as XLSX from 'xlsx';
    
    const ws = XLSX.utils.json_to_sheet(requests);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes');
    XLSX.writeFile(wb, 'solicitudes.xlsx');
    */
  }
}

// ============================================================================
// EJEMPLO 9: NOTIFICACIONES
// ============================================================================

import { NbToastrService } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastrService: NbToastrService) {}

  success(message: string, title: string = 'Éxito') {
    this.toastrService.success(message, title, {
      duration: 3000,
      position: 'top-right',
    });
  }

  error(message: string, title: string = 'Error') {
    this.toastrService.danger(message, title, {
      duration: 5000,
      position: 'top-right',
    });
  }

  info(message: string, title: string = 'Info') {
    this.toastrService.info(message, title, {
      duration: 3000,
      position: 'top-right',
    });
  }

  warning(message: string, title: string = 'Advertencia') {
    this.toastrService.warning(message, title, {
      duration: 4000,
      position: 'top-right',
    });
  }
}

// ============================================================================
// EJEMPLO 10: WEBSOCKETS PARA ACTUALIZACIONES EN TIEMPO REAL
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private ws: WebSocket | null = null;

  connect(url: string): void {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleMessage(data: any): void {
    switch (data.type) {
      case 'NEW_REQUEST':
        // Actualizar store con nueva solicitud
        break;
      case 'REQUEST_UPDATED':
        // Actualizar solicitud existente
        break;
      case 'ENROLLMENT_SUBMITTED':
        // Notificar inscripción enviada
        break;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// ============================================================================
// EJEMPLO 11: ANALYTICS Y TRACKING
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  trackPageView(pageName: string): void {
    // Integración con Google Analytics, Mixpanel, etc.
    console.log('Page view:', pageName);
  }

  trackEvent(category: string, action: string, label?: string, value?: number): void {
    console.log('Event:', { category, action, label, value });
    // gtag('event', action, { ... });
  }

  trackEnrollmentCreated(enrollmentId: number): void {
    this.trackEvent('Enrollment', 'Created', `ID: ${enrollmentId}`);
  }

  trackRequestStatusChanged(requestId: number, newStatus: string): void {
    this.trackEvent('Request', 'Status Changed', `${requestId} -> ${newStatus}`);
  }
}

// ============================================================================
// EJEMPLO 12: CACHÉ LOCAL
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

// ============================================================================
// 🎯 USO DE LOS EJEMPLOS
// ============================================================================

/*
// En tu componente:

import { Component, OnInit, inject } from '@angular/core';
import { RequestsService } from './services/requests.service';
import { NotificationService } from './services/notification.service';
import { AcademicStore } from './store/academic.store';

@Component({
  selector: 'app-requests-advanced',
  standalone: true,
  template: `
    <div>
      @if (store.loading()) {
        <nb-spinner></nb-spinner>
      }
      
      @for (request of store.filteredRequests(); track request.id) {
        <nb-card>
          <nb-card-header>
            {{ request.studentName }}
            <span>{{ request.date | relativeDate }}</span>
          </nb-card-header>
          <nb-card-body>
            {{ request.need }}
          </nb-card-body>
        </nb-card>
      }
    </div>
  `,
})
export class RequestsAdvancedComponent implements OnInit {
  private requestsService = inject(RequestsService);
  private notifications = inject(NotificationService);
  protected store = inject(AcademicStore);

  ngOnInit() {
    this.loadRequests();
  }

  private loadRequests() {
    this.store.setLoading(true);
    this.requestsService.getRequests().subscribe({
      next: (requests) => {
        this.store.setRequests(requests);
        this.store.setLoading(false);
      },
      error: (error) => {
        this.notifications.error('Error al cargar solicitudes');
        this.store.setLoading(false);
      },
    });
  }
}
*/
