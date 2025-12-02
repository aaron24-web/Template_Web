-- Make the password_hash column nullable in the users table
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a new user in public.users
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'role');

  -- If the user is a client, create a new client profile
  IF NEW.raw_user_meta_data->>'role' = 'client' THEN
    INSERT INTO public.clients (user_id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
