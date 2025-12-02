-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Allow users to select their own client data" ON public.clients;
DROP POLICY IF EXISTS "Allow users to insert students for their own client" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated users to insert clients" ON public.clients;

-- Enable RLS on tables (ignore errors if already enabled)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to select their own client data"
ON public.clients
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert students for their own client"
ON public.students
FOR INSERT
WITH CHECK (client_id = (
  SELECT id
  FROM public.clients
  WHERE user_id = auth.uid()
));

CREATE POLICY "Allow authenticated users to insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (true);
