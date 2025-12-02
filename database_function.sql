CREATE OR REPLACE FUNCTION public.create_tutoring_request(
  p_client_id uuid,
  p_student_id uuid,
  p_need_description text,
  p_preferred_advisor_id uuid,
  p_subject_ids integer[]
)
RETURNS uuid AS $$
DECLARE
  new_request_id uuid;
BEGIN
  -- Insert into tutoring_requests and get the new id
  INSERT INTO public.tutoring_requests (client_id, student_id, need_description, preferred_advisor_id)
  VALUES (p_client_id, p_student_id, p_need_description, p_preferred_advisor_id)
  RETURNING id INTO new_request_id;

  -- Insert into tutoring_request_subjects
  IF array_length(p_subject_ids, 1) > 0 THEN
    INSERT INTO public.tutoring_request_subjects (request_id, subject_id)
    SELECT new_request_id, unnest(p_subject_ids);
  END IF;

  RETURN new_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
