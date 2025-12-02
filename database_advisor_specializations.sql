-- ============================================================================
-- Script para crear y poblar la tabla advisor_specializations
-- ============================================================================

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS public.advisor_specializations (
  user_id uuid NOT NULL,
  subject_id integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT advisor_specializations_pkey PRIMARY KEY (user_id, subject_id),
  CONSTRAINT advisor_specializations_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT advisor_specializations_subject_id_fkey FOREIGN KEY (subject_id) 
    REFERENCES public.subjects(id) ON DELETE CASCADE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.advisor_specializations ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.advisor_specializations;
CREATE POLICY "Allow read access to all authenticated users" 
ON public.advisor_specializations FOR SELECT 
TO authenticated 
USING (true);

-- Política para permitir inserción solo a admins
DROP POLICY IF EXISTS "Allow insert to admins" ON public.advisor_specializations;
CREATE POLICY "Allow insert to admins" 
ON public.advisor_specializations FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
  OR 
  -- También permitir si el registro es para un asesor válido
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = user_id 
    AND users.role = 'advisor'
  )
);

-- Política para permitir actualización solo a admins
DROP POLICY IF EXISTS "Allow update to admins" ON public.advisor_specializations;
CREATE POLICY "Allow update to admins" 
ON public.advisor_specializations FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Política para permitir eliminación solo a admins
DROP POLICY IF EXISTS "Allow delete to admins" ON public.advisor_specializations;
CREATE POLICY "Allow delete to admins" 
ON public.advisor_specializations FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- Datos de ejemplo (ajusta los UUIDs según tus datos reales)
-- ============================================================================

-- IMPORTANTE: Primero obtén los IDs reales de tus asesores y materias ejecutando:
-- SELECT id, full_name FROM users WHERE role = 'advisor';
-- SELECT id, name FROM subjects;

-- Luego, descomenta y reemplaza los UUIDs de ejemplo con los reales:

-- Ejemplo: Asesor 1 especializado en Matemáticas (id: 1) y Física (id: 2)
-- INSERT INTO public.advisor_specializations (user_id, subject_id)
-- VALUES 
--   ('UUID_DEL_ASESOR_1', 1),
--   ('UUID_DEL_ASESOR_1', 2)
-- ON CONFLICT (user_id, subject_id) DO NOTHING;

-- Ejemplo: Asesor 2 especializado en Español (id: 3)
-- INSERT INTO public.advisor_specializations (user_id, subject_id)
-- VALUES 
--   ('UUID_DEL_ASESOR_2', 3)
-- ON CONFLICT (user_id, subject_id) DO NOTHING;

-- ============================================================================
-- Query útil para ver las especializaciones actuales
-- ============================================================================
-- SELECT 
--   u.full_name as advisor_name,
--   s.name as subject_name
-- FROM advisor_specializations asp
-- JOIN users u ON asp.user_id = u.id
-- JOIN subjects s ON asp.subject_id = s.id
-- ORDER BY u.full_name, s.name;
