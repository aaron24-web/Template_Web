# Módulo Académico - CRM Académico

Módulo standalone para gestión académica en Angular 20 con ngx-admin + Nebular.

## 📁 Estructura de Archivos

```
src/app/pages/academic/
├─ academic.routes.ts                      # Rutas del módulo
├─ academic-menu.ts                        # Configuración del menú
├─ requests/
│   ├─ requests.component.ts              # Componente Kanban
│   ├─ requests.component.html
│   └─ requests.component.scss
└─ enrollments/
    ├─ enrollment-wizard.component.ts     # Componente Stepper
    ├─ enrollment-wizard.component.html
    └─ enrollment-wizard.component.scss
```

## 🚀 Integración en tu Aplicación

### 1. Agregar las rutas académicas

En tu archivo principal de rutas (ej: `app.routes.ts` o `pages.routes.ts`):

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  // ... otras rutas
  {
    path: 'pages/academic',
    loadChildren: () => import('./pages/academic/academic.routes').then(m => m.ACADEMIC_ROUTES),
  },
];
```

### 2. Agregar el menú académico

En tu archivo de configuración de menú (ej: `pages-menu.ts`):

```typescript
import { ACADEMIC_MENU } from './pages/academic/academic-menu';

export const MENU_ITEMS = [
  // ... otros items del menú
  ...ACADEMIC_MENU,
];
```

## 🎯 Funcionalidades

### 1. Gestión de Solicitudes (Kanban)

**Ruta:** `/pages/academic/requests`

- Vista tipo Kanban con 3 columnas:
  - Nuevas
  - En Revisión
  - Cerradas / Inscritas
- Alternativa de vista en lista
- Tarjetas con información del estudiante
- Botón para iniciar inscripción
- Datos mock incluidos

### 2. Asistente de Inscripción (Stepper)

**Rutas:** 
- `/pages/academic/enrollments/new` (nueva inscripción)
- `/pages/academic/enrollments/:id` (editar inscripción)

**Paso 1 - Asignar Materias:**
- Panel con información del estudiante
- Grid de materias disponibles con selección múltiple
- 6 materias predefinidas con íconos y colores

**Paso 2 - Planes Pedagógicos:**
- Accordion con formulario por cada materia seleccionada
- Campos validados:
  - Diagnóstico Inicial (min 20 caracteres)
  - Metas de Aprendizaje (min 20 caracteres)
  - Metodología y Estrategias (min 20 caracteres)
- Botón para guardar borrador

**Paso 3 - Revisión y Envío:**
- Resumen completo de la inscripción
- Información del estudiante
- Materias y planes pedagógicos
- Botón hero para enviar

## 📦 Dependencias

El módulo utiliza los siguientes módulos de Nebular:

- `NbStepperModule`
- `NbCardModule`
- `NbButtonModule`
- `NbIconModule`
- `NbAccordionModule`
- `NbInputModule`
- `NbCheckboxModule`
- `NbAlertModule`
- `NbListModule`
- `NbBadgeModule`
- `NbTooltipModule`
- `NbSelectModule`
- `NbButtonGroupModule`

Asegúrate de tener instalado:

```bash
npm install @nebular/theme @angular/animations
```

## 🎨 Características Técnicas

### Standalone Components
Todos los componentes son standalone (sin NgModules):

```typescript
@Component({
  standalone: true,
  selector: 'app-requests',
  imports: [
    CommonModule,
    NbCardModule,
    // ... otros módulos
  ],
  templateUrl: './requests.component.html',
})
```

### Lazy Loading
Las rutas usan `loadComponent` para carga diferida:

```typescript
{
  path: 'requests',
  loadComponent: () =>
    import('./requests/requests.component').then(m => m.RequestsComponent),
}
```

### Formularios Reactivos
El wizard utiliza FormBuilder y validaciones:

```typescript
this.fb.group({
  diagnosis: ['', [Validators.required, Validators.minLength(20)]],
  goals: ['', [Validators.required, Validators.minLength(20)]],
  methodology: ['', [Validators.required, Validators.minLength(20)]],
});
```

### Datos Mock
Todos los datos están incluidos en los componentes (sin API):

- 7 solicitudes de ejemplo con diferentes estados
- 6 materias predefinidas
- Información de estudiante de ejemplo

## 🎯 Casos de Uso

1. **Recepción de Solicitudes:** Ver todas las solicitudes en formato Kanban o Lista
2. **Inicio de Inscripción:** Crear nueva inscripción desde una solicitud
3. **Selección de Materias:** Elegir las asignaturas del programa académico
4. **Planificación Pedagógica:** Definir diagnóstico, metas y metodología por materia
5. **Revisión Final:** Validar información antes de enviar
6. **Guardar Borradores:** Continuar trabajo en otro momento

## 📱 Responsive

Ambos componentes son completamente responsive:
- Breakpoint 1200px: Layout de columnas a vertical
- Breakpoint 768px: Optimización para móviles

## 🔧 Personalización

### Cambiar Materias Disponibles

Edita el array `subjects` en `enrollment-wizard.component.ts`:

```typescript
subjects: Subject[] = [
  {
    id: 1,
    name: 'Tu Materia',
    icon: 'tu-icono-outline',
    color: '#tucolor',
    description: 'Descripción',
    selected: false,
  },
];
```

### Modificar Estados del Kanban

Edita el tipo `RequestCard` y los métodos getter en `requests.component.ts`.

### Agregar más Pasos al Stepper

Añade `<nb-step>` adicionales en `enrollment-wizard.component.html`.

## ✨ Próximas Mejoras Sugeridas

- [ ] Integración con backend real
- [ ] Drag & drop en el Kanban
- [ ] Filtros y búsqueda
- [ ] Exportación a PDF
- [ ] Notificaciones en tiempo real
- [ ] Historial de cambios
- [ ] Firma digital
- [ ] Calendario de clases

## 📄 Licencia

Este módulo es parte de tu aplicación Angular 20 con ngx-admin.
