CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'client' THEN
    INSERT INTO public.clients (user_id, full_name, email)
    VALUES (NEW.id, 'Test Client', 'test@test.com');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
