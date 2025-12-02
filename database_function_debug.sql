CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'handle_new_user trigger called for user %', NEW.id;
  RAISE NOTICE 'User role: %', NEW.raw_user_meta_data->>'role';

  IF NEW.raw_user_meta_data->>'role' = 'client' THEN
    RAISE NOTICE 'User is a client, inserting into clients table';
    BEGIN
      INSERT INTO public.clients (user_id, full_name, email)
      VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
      RAISE NOTICE 'Inserted into clients table successfully';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting into clients table: %', SQLERRM;
        -- Re-raise the exception to see it in the client
        RAISE EXCEPTION 'Error inserting into clients table: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
