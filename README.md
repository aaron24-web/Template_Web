# Boceto - CRM Académico

Sistema de gestión académica desarrollado con Angular 20 + Nebular.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Abrir en el navegador
http://localhost:4200
```

## 📦 Módulos Incluidos

### Módulo Académico (`/pages/academic`)

- **Gestión de Solicitudes**: Vista Kanban/Lista de solicitudes de inscripción
- **Asistente de Inscripción**: Wizard de 3 pasos para crear programas académicos

### Rutas Disponibles

- `/pages/academic/requests` - Vista Kanban de solicitudes
- `/pages/academic/enrollments/new` - Nueva inscripción
- `/pages/academic/enrollments/:id` - Editar inscripción

## 🛠️ Tecnologías

- Angular 20 (Standalone Components)
- Nebular UI Framework
- TypeScript
- SCSS
- Reactive Forms

## 📚 Documentación

Consulta la documentación completa en:
- `src/app/pages/academic/README.md` - Guía del módulo académico
- `src/app/pages/academic/INICIO-RAPIDO.md` - Guía de inicio rápido
- `src/app/pages/academic/INTEGRATION.example.ts` - Ejemplos de integración

## 📝 Scripts Disponibles

```bash
npm start        # Servidor de desarrollo
npm run build    # Compilar para producción
npm run watch    # Compilar en modo watch
npm test         # Ejecutar tests
```

## 🎨 Características

- ✅ Standalone Components (sin NgModules)
- ✅ Lazy Loading con loadComponent
- ✅ Reactive Forms con validaciones
- ✅ Mock data (sin backend)
- ✅ Responsive design
- ✅ Nebular UI integrado
- ✅ TypeScript tipado completo

## 🔧 Estructura del Proyecto

```
boceto/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── academic/          # Módulo académico
│   │   │   ├── pages.component.ts # Layout principal
│   │   │   └── pages.routes.ts    # Rutas de páginas
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
└── tsconfig.json
```

## 📄 Licencia

Proyecto de desarrollo privado.
