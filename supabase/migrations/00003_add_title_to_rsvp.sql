ALTER TABLE public.rsvp_submissions ADD COLUMN title text;
CREATE INDEX rsvp_submissions_title_idx ON public.rsvp_submissions (title);