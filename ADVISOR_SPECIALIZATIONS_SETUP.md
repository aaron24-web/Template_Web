# Configuración de Especialidades de Asesores

Este documento explica cómo configurar las especialidades de asesores en la base de datos.

## Paso 1: Ejecutar el script SQL en Supabase

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo `database_advisor_specializations.sql`
4. Ejecuta el script

Esto creará:
- La tabla `advisor_specializations` (si no existe)
- Las políticas de seguridad (RLS)
- Permisos adecuados

## Paso 2: Obtener IDs de Asesores y Materias

Ejecuta estas queries en Supabase SQL Editor para obtener los IDs:

```sql
-- Ver todos los asesores
SELECT id, full_name, email 
FROM users 
WHERE role = 'advisor'
ORDER BY full_name;

-- Ver todas las materias
SELECT id, name 
FROM subjects
ORDER BY name;
```

## Paso 3: Asignar Especialidades (Opción A - SQL Manual)

Una vez que tengas los IDs, puedes insertar especialidades manualmente:

```sql
-- Ejemplo: Asignar Matemáticas (id: 1) y Física (id: 2) al asesor
INSERT INTO public.advisor_specializations (user_id, subject_id)
VALUES 
  ('UUID_DEL_ASESOR', 1),
  ('UUID_DEL_ASESOR', 2)
ON CONFLICT (user_id, subject_id) DO NOTHING;
```

## Paso 4: Asignar Especialidades (Opción B - Desde la App)

1. Inicia sesión como **admin**
2. Ve al menú **Gestión Académica** > **Especialidades de Asesores**
3. Selecciona un asesor del dropdown
4. Marca las materias en las que el asesor puede dar tutorías
5. Haz clic en **Guardar Especialidades**

## Verificar la Configuración

Ejecuta esta query para ver todas las especialidades configuradas:

```sql
SELECT 
  u.full_name as asesor,
  s.name as materia
FROM advisor_specializations asp
JOIN users u ON asp.user_id = u.id
JOIN subjects s ON asp.subject_id = s.id
ORDER BY u.full_name, s.name;
```

## Solución de Problemas

### No aparecen asesores al seleccionar una materia

**Causa**: No hay asesores con especialidad en esa materia.

**Solución**: 
1. Ve a **Especialidades de Asesores**
2. Selecciona un asesor
3. Marca la materia correspondiente
4. Guarda los cambios

### Error de permisos al guardar especialidades

**Causa**: El usuario no tiene rol de admin.

**Solución**: 
1. Verifica que tu usuario tenga `role = 'admin'` en la tabla `users`
2. Si no, actualiza el rol:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'tu_email@ejemplo.com';
```

### La tabla advisor_specializations no existe

**Solución**: Ejecuta el script `database_advisor_specializations.sql` en el SQL Editor de Supabase.

## Datos de Ejemplo

Si necesitas datos de ejemplo para probar:

```sql
-- Primero, asegúrate de tener asesores
-- Si no tienes, puedes crearlos desde la app o con:
-- (Ajusta el email y password)
-- Nota: Es mejor crear asesores desde la app para que Supabase Auth los maneje correctamente

-- Después de tener asesores, obtén sus IDs y asigna especialidades:
-- Sustituye estos UUIDs con los reales de tu base de datos
INSERT INTO public.advisor_specializations (user_id, subject_id)
VALUES 
  -- Asesor 1: Matemáticas, Física, Química
  ('UUID_ASESOR_1', 1),
  ('UUID_ASESOR_1', 2),
  ('UUID_ASESOR_1', 3),
  -- Asesor 2: Español, Historia
  ('UUID_ASESOR_2', 4),
  ('UUID_ASESOR_2', 5)
ON CONFLICT (user_id, subject_id) DO NOTHING;
```

## Flujo Completo del Sistema

1. **Admin crea asesor** → Se crea usuario con `role = 'advisor'`
2. **Admin asigna especialidades** → Se agregan registros en `advisor_specializations`
3. **Admin crea inscripción** → Selecciona materia
4. **Sistema filtra asesores** → Solo muestra asesores con esa especialidad
5. **Admin asigna asesor** → Se completa la inscripción

## Acceso Rápido en la App

- **URL directa**: `http://localhost:4200/pages/academic/advisors/specializations`
- **Menú**: Gestión Académica → Especialidades de Asesores
