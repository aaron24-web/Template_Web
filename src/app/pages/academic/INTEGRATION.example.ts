/**
 * GUÍA DE INTEGRACIÓN - Módulo Académico
 * 
 * Este archivo muestra cómo integrar el módulo académico en tu aplicación Angular 20
 * con ngx-admin + Nebular.
 */

// ============================================================================
// 1. INTEGRAR RUTAS EN EL ROUTER PRINCIPAL
// ============================================================================

// Archivo: src/app/app.routes.ts (o donde configures tus rutas principales)

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pages',
    loadComponent: () =>
      import('./pages/pages.component').then(m => m.PagesComponent),
    children: [
      // ... tus otras rutas existentes
      
      // AGREGAR ESTA RUTA:
      {
        path: 'academic',
        loadChildren: () =>
          import('./pages/academic/academic.routes').then(m => m.ACADEMIC_ROUTES),
      },
    ],
  },
  // ... resto de rutas
];

// ============================================================================
// 2. AGREGAR AL MENÚ DE NAVEGACIÓN
// ============================================================================

// Archivo: src/app/pages/pages-menu.ts (o donde configures tu menú)

import { NbMenuItem } from '@nebular/theme';
import { ACADEMIC_MENU } from './academic/academic-menu';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/dashboard',
  },
  // ... otros items del menú
  
  // AGREGAR EL MENÚ ACADÉMICO:
  ...ACADEMIC_MENU,
  
  // O si prefieres incluirlo manualmente:
  // {
  //   title: 'Gestión Académica',
  //   icon: 'briefcase-outline',
  //   children: [
  //     {
  //       title: 'Solicitudes',
  //       icon: 'inbox-outline',
  //       link: '/pages/academic/requests',
  //     },
  //     {
  //       title: 'Programas en Planificación',
  //       icon: 'edit-2-outline',
  //       link: '/pages/academic/enrollments/new',
  //     },
  //   ],
  // },
];

// ============================================================================
// 3. VERIFICAR QUE NEBULAR ESTÉ CONFIGURADO
// ============================================================================

// Archivo: src/app/app.config.ts (o main.ts)

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NbThemeModule } from '@nebular/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), // Requerido para Nebular
    importProvidersFrom(
      NbThemeModule.forRoot({ name: 'default' }) // O 'dark', 'cosmic', 'corporate'
    ),
  ],
};

// ============================================================================
// 4. IMPORTAR ESTILOS DE NEBULAR (si no lo has hecho)
// ============================================================================

// Archivo: angular.json

{
  "styles": [
    "node_modules/@nebular/theme/styles/prebuilt/default.css", // o dark.css, cosmic.css, corporate.css
    "src/styles.scss"
  ]
}

// O en tu archivo: src/styles.scss

// @import '@nebular/theme/styles/globals';
// @include nb-install() {
//   @include nb-theme-global();
// }

// ============================================================================
// 5. RUTAS DISPONIBLES
// ============================================================================

/**
 * Una vez integrado, tendrás acceso a estas rutas:
 * 
 * /pages/academic/requests
 *   - Vista Kanban/Lista de solicitudes
 * 
 * /pages/academic/enrollments/new
 *   - Crear nueva inscripción (wizard)
 * 
 * /pages/academic/enrollments/:id
 *   - Editar inscripción existente (wizard)
 */

// ============================================================================
// 6. NAVEGACIÓN PROGRAMÁTICA (Ejemplo)
// ============================================================================

// Desde cualquier componente de tu aplicación:

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-example',
  template: `
    <button (click)="goToRequests()">Ver Solicitudes</button>
    <button (click)="createEnrollment()">Nueva Inscripción</button>
    <button (click)="editEnrollment(123)">Editar Inscripción #123</button>
  `,
})
export class ExampleComponent {
  constructor(private router: Router) {}

  goToRequests() {
    this.router.navigate(['/pages/academic/requests']);
  }

  createEnrollment() {
    this.router.navigate(['/pages/academic/enrollments/new']);
  }

  editEnrollment(id: number) {
    this.router.navigate(['/pages/academic/enrollments', id]);
  }
}

// ============================================================================
// 7. PERSONALIZACIÓN DE TEMA (Opcional)
// ============================================================================

// Si quieres personalizar los colores del módulo, edita tu tema en:
// src/themes.scss

@import '@nebular/theme/styles/theming';
@import '@nebular/theme/styles/themes/default';

$nb-themes: nb-register-theme((
  // Personaliza los colores aquí
  color-primary-100: #f2f6ff,
  color-primary-200: #d9e4ff,
  color-primary-300: #a6c1ff,
  color-primary-400: #598bff,
  color-primary-500: #3366ff, // Color principal
  color-primary-600: #274bdb,
  color-primary-700: #1a34b8,
  color-primary-800: #102694,
  color-primary-900: #091c7a,
  
  // Más colores...
), default, default);

// ============================================================================
// 8. TESTING (Ejemplo de prueba unitaria)
// ============================================================================

// Archivo: src/app/pages/academic/requests/requests.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestsComponent } from './requests.component';
import { provideRouter } from '@angular/router';

describe('RequestsComponent', () => {
  let component: RequestsComponent;
  let fixture: ComponentFixture<RequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestsComponent], // Standalone component
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 7 mock requests', () => {
    expect(component.requests.length).toBe(7);
  });

  it('should filter new requests', () => {
    expect(component.newRequests.length).toBe(2);
  });

  it('should switch view mode', () => {
    expect(component.viewMode).toBe('kanban');
    component.setView('list');
    expect(component.viewMode).toBe('list');
  });
});

// ============================================================================
// ✅ CHECKLIST DE INTEGRACIÓN
// ============================================================================

/**
 * [ ] Angular 20 instalado
 * [ ] @nebular/theme instalado (npm install @nebular/theme)
 * [ ] @angular/animations instalado
 * [ ] Rutas agregadas al router principal
 * [ ] Menú agregado a la configuración del sidebar
 * [ ] Estilos de Nebular importados
 * [ ] NbThemeModule configurado en app.config
 * [ ] Navegación probada
 * [ ] Mock data funcionando
 * [ ] Responsive verificado en diferentes tamaños de pantalla
 */

// ============================================================================
// 🎉 ¡LISTO! Tu módulo académico está integrado
// ============================================================================
