# Sistema de Aprobación de Inscripciones por el Cliente

## 📋 Descripción del Flujo

1. **Admin crea inscripción** desde una solicitud
2. **Admin agrega materias y asesores** al plan
3. **Admin envía al cliente** (status: `pending-approval`)
4. **Cliente revisa la inscripción** en su panel
5. **Cliente aprueba o rechaza**:
   - ✅ **Aprobar** → Status: `active`, Solicitud: `closed`
   - ❌ **Rechazar** → Status: `rejected`, Solicitud vuelve a `new`

## 🔧 Scripts SQL a Ejecutar

### 1. Actualizar estados de enrollments
```bash
database_enrollment_status_update.sql
```
Esto agrega el estado `'rejected'` al constraint de la tabla enrollments.

### 2. Fix de políticas (si aún tienes problemas con especialidades)
```bash
database_advisor_specializations_fix.sql
```

## 🎯 Cómo Usar desde la Interfaz

### Como Admin:

1. **Ir a Solicitudes** → Clic en una solicitud `new`
2. **Iniciar Inscripción** → Crea el borrador
3. **Agregar Materias**:
   - Selecciona una materia del dropdown
   - Aparecen asesores especializados en esa materia
   - Selecciona asesor
   - Clic en "Agregar Materia"
4. **Repetir** para todas las materias necesarias
5. **Enviar a Cliente para Aprobación**

### Como Cliente:

1. **Ir al Panel de Cliente** (`/pages/client/home`)
2. **Ver "Inscripciones Pendientes de Aprobación"** (automático)
3. **Expandir la inscripción** para ver detalles:
   - Estudiante
   - Materias con sus asesores asignados
   - Emails de contacto
4. **Aprobar** ✅:
   - Confirma la inscripción
   - Se activa el programa
   - La solicitud se cierra
5. **Rechazar** ❌:
   - Opcional: dar razón del rechazo
   - La inscripción se marca como rechazada
   - La solicitud vuelve a estado "nuevo" para revisión

## 📍 URLs Importantes

- **Admin - Solicitudes**: `/pages/academic/requests`
- **Admin - Especialidades**: `/pages/academic/advisors/specializations`
- **Cliente - Dashboard**: `/pages/client/home`
- **Cliente - Aprobaciones**: `/pages/client/enrollments/approvals`

## 🗂️ Archivos Creados/Modificados

### Nuevos Componentes:
- `src/app/pages/client/enrollments/enrollment-approvals.component.ts`

### Modificados:
- `src/app/pages/client/home/home.component.ts` - Muestra aprobaciones pendientes
- `src/app/pages/client/client.routes.ts` - Ruta de aprobaciones
- `src/app/pages/academic/academic.models.ts` - Agregado estado 'rejected'
- `src/app/pages/academic/advisors/advisor-add.component.ts` - Especialidades en creación
- `src/app/pages/academic/advisors/advisor-edit.component.ts` - Especialidades en edición

### Scripts SQL:
- `database_enrollment_status_update.sql` - Actualiza constraint de status
- `database_advisor_specializations_fix.sql` - Fix políticas RLS

## 🔍 Verificación del Sistema

### 1. Verificar estructura de enrollments:
```sql
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'enrollments_status_check';
```

Debe incluir: `'rejected'::text`

### 2. Ver inscripciones pendientes de un cliente:
```sql
SELECT 
  e.id,
  e.status,
  s.full_name as estudiante,
  COUNT(es.id) as num_materias
FROM enrollments e
JOIN students s ON e.student_id = s.id
LEFT JOIN enrollment_subjects es ON e.id = es.enrollment_id
WHERE s.client_id = 'UUID_DEL_CLIENTE'
  AND e.status = 'pending-approval'
GROUP BY e.id, e.status, s.full_name;
```

### 3. Ver historial de aprobaciones/rechazos:
```sql
SELECT 
  e.id,
  e.status,
  e.created_at,
  s.full_name as estudiante,
  c.full_name as cliente
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN clients c ON s.client_id = c.id
WHERE e.status IN ('active', 'rejected')
ORDER BY e.created_at DESC;
```

## 🐛 Solución de Problemas

### No aparecen inscripciones pendientes:

1. Verifica que el status sea `'pending-approval'`
2. Verifica que el cliente esté logueado
3. Revisa la consola del navegador para errores

```sql
-- Ver inscripciones del cliente logueado
SELECT * FROM enrollments e
JOIN students s ON e.student_id = s.id
WHERE s.client_id = (
  SELECT id FROM clients WHERE user_id = auth.uid()
);
```

### No aparecen materias/asesores:

```sql
-- Ver enrollment_subjects
SELECT 
  es.*,
  sub.name as materia,
  u.full_name as asesor
FROM enrollment_subjects es
JOIN subjects sub ON es.subject_id = sub.id
JOIN users u ON es.advisor_id = u.id
WHERE es.enrollment_id = 'UUID_ENROLLMENT';
```

### Error al aprobar/rechazar:

Verifica las políticas RLS:
```sql
-- Ver políticas de enrollments
SELECT * FROM pg_policies 
WHERE tablename = 'enrollments';
```

## 📊 Estados del Sistema

### Estados de Enrollment:
- `draft` - Borrador en creación
- `pending-approval` - Enviado al cliente, esperando decisión
- `active` - Aprobado por cliente, programa activo
- `rejected` - Rechazado por cliente
- `on-hold` - En pausa
- `completed` - Finalizado
- `cancelled` - Cancelado

### Estados de Request:
- `new` - Nueva solicitud
- `review` - En revisión (con inscripción en proceso)
- `closed` - Cerrada (inscripción aprobada)

## 🎨 Personalización

### Cambiar notificaciones:
Edita los `alert()` en `enrollment-approvals.component.ts` líneas 197, 208, 235

### Agregar campo de comentarios:
1. Agrega columna en DB: `ALTER TABLE enrollments ADD COLUMN client_notes TEXT;`
2. Agrega textarea en el template del componente
3. Guarda en `approveEnrollment()` o `rejectEnrollment()`

### Email de notificación al admin:
Implementa en `approveEnrollment()` y `rejectEnrollment()` usando un servicio de email
