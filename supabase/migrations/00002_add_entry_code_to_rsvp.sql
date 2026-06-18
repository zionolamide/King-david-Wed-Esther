ALTER TABLE public.rsvp_submissions ADD COLUMN entry_code text UNIQUE;
CREATE INDEX rsvp_submissions_entry_code_idx ON public.rsvp_submissions (entry_code);