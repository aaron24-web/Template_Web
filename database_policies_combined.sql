-- Enable RLS on the clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to select their own client data
CREATE POLICY "Allow users to select their own client data"
ON public.clients
FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy that allows users to insert students for their own client
CREATE POLICY "Allow users to insert students for their own client"
ON public.students
FOR INSERT
WITH CHECK (client_id = (
  SELECT id
  FROM public.clients
  WHERE user_id = auth.uid()
));

-- TEMPORARY DEBUGGING POLICY: Allow authenticated users to insert clients
-- This is not secure for production and will be replaced later.
CREATE POLICY "Allow authenticated users to insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (true);
