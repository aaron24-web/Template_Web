CREATE TABLE public.tutoring_request_subjects (
  request_id uuid NOT NULL,
  subject_id integer NOT NULL,
  CONSTRAINT tutoring_request_subjects_pkey PRIMARY KEY (request_id, subject_id),
  CONSTRAINT tutoring_request_subjects_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.tutoring_requests(id) ON DELETE CASCADE,
  CONSTRAINT tutoring_request_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE
);
