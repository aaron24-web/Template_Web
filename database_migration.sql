-- Add 'client' to the possible values for the 'role' column in the 'users' table.
ALTER TABLE public.users
DROP CONSTRAINT users_role_check,
ADD CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['admin'::text, 'advisor'::text, 'client'::text]));

-- Add a 'user_id' column to the 'clients' table to link it to the 'users' table.
ALTER TABLE public.clients
ADD COLUMN user_id uuid;

-- Add a foreign key constraint to the 'user_id' column.
ALTER TABLE public.clients
ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Add a 'preferred_advisor_id' column to the 'tutoring_requests' table.
ALTER TABLE public.tutoring_requests
ADD COLUMN preferred_advisor_id uuid;

-- Add a foreign key constraint to the 'preferred_advisor_id' column.
ALTER TABLE public.tutoring_requests
ADD CONSTRAINT tutoring_requests_preferred_advisor_id_fkey FOREIGN KEY (preferred_advisor_id) REFERENCES public.users(id);
