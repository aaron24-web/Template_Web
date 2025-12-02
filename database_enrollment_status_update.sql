-- ============================================================================
-- Agregar estado 'rejected' a enrollments si no existe
-- ============================================================================

-- Verificar y actualizar el constraint de status en enrollments
DO $$
BEGIN
    -- Eliminar el constraint existente si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'enrollments_status_check' 
        AND table_name = 'enrollments'
    ) THEN
        ALTER TABLE public.enrollments DROP CONSTRAINT enrollments_status_check;
    END IF;
    
    -- Agregar el nuevo constraint con 'rejected' incluido
    ALTER TABLE public.enrollments 
    ADD CONSTRAINT enrollments_status_check 
    CHECK (status = ANY (ARRAY[
        'draft'::text, 
        'pending-approval'::text, 
        'approved'::text, 
        'active'::text, 
        'rejected'::text,
        'on-hold'::text, 
        'completed'::text, 
        'cancelled'::text
    ]));
END $$;

-- Verificar que el constraint se aplicó correctamente
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'enrollments_status_check';
