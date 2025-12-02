-- ============================================================================
-- Fix para políticas de advisor_specializations - MÁS PERMISIVO PARA DESARROLLO
-- ============================================================================

-- Reemplazar las políticas con versiones más permisivas

-- Política para permitir inserción a usuarios autenticados (más permisiva)
DROP POLICY IF EXISTS "Allow insert to admins" ON public.advisor_specializations;
CREATE POLICY "Allow insert to admins" 
ON public.advisor_specializations FOR INSERT 
TO authenticated 
WITH CHECK (true);  -- Temporalmente permitir a todos los autenticados

-- Política para permitir actualización a usuarios autenticados
DROP POLICY IF EXISTS "Allow update to admins" ON public.advisor_specializations;
CREATE POLICY "Allow update to admins" 
ON public.advisor_specializations FOR UPDATE 
TO authenticated 
USING (true);

-- Política para permitir eliminación a usuarios autenticados
DROP POLICY IF EXISTS "Allow delete to admins" ON public.advisor_specializations;
CREATE POLICY "Allow delete to admins" 
ON public.advisor_specializations FOR DELETE 
TO authenticated 
USING (true);

-- NOTA: Estas políticas son más permisivas para facilitar el desarrollo.
-- En producción, deberías restaurar las políticas originales que verifican el rol de admin.
