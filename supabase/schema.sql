-- Schema definition for rsvp_submissions (synchronized with migrations)
CREATE TABLE IF NOT EXISTS public.rsvp_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  attendees integer NOT NULL DEFAULT 1 CHECK (attendees >= 1 AND attendees <= 10),
  attending text NOT NULL CHECK (attending IN ('yes', 'no')),
  note text,
  entry_code text UNIQUE,
  title text,
  adult_agreement boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rsvp_submissions_created_at_idx ON public.rsvp_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS rsvp_submissions_entry_code_idx ON public.rsvp_submissions (entry_code);
CREATE INDEX IF NOT EXISTS rsvp_submissions_title_idx ON public.rsvp_submissions (title);

-- Capacity Enforcement RPC
CREATE OR REPLACE FUNCTION public.register_wedding_rsvp(
  p_full_name text,
  p_email text,
  p_phone text,
  p_attendees integer,
  p_attending boolean,
  p_note text,
  p_entry_code text,
  p_capacity integer,
  p_title text DEFAULT NULL,
  p_adult_agreement boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_total integer;
  normalized_attendees integer;
  v_attending_text text;
BEGIN
  -- Advisory lock based on wedding date to serialize RSVP inserts
  PERFORM pg_advisory_xact_lock(20260822);

  normalized_attendees := CASE
    WHEN p_attending THEN greatest(1, least(coalesce(p_attendees, 1), 10))
    ELSE 0
  END;

  v_attending_text := CASE
    WHEN p_attending THEN 'yes'
    ELSE 'no'
  END;

  -- Check if email already registered to prevent duplicate submissions
  IF EXISTS (
    SELECT 1 
    FROM public.rsvp_submissions 
    WHERE email = lower(trim(p_email))
  ) THEN
    RETURN jsonb_build_object(
      'status', 'exists'
    );
  END IF;

  -- Sum up attendees for accepted RSVPs
  SELECT coalesce(sum(attendees), 0)
    INTO current_total
    FROM public.rsvp_submissions
    WHERE attending = 'yes';

  -- Check if we are over capacity
  IF p_attending AND current_total + normalized_attendees > p_capacity THEN
    RETURN jsonb_build_object(
      'status', 'closed',
      'remaining', greatest(p_capacity - current_total, 0)
    );
  END IF;

  -- Insert RSVP
  INSERT INTO public.rsvp_submissions (
    full_name,
    email,
    phone,
    attendees,
    attending,
    note,
    entry_code,
    title,
    adult_agreement
  ) VALUES (
    trim(p_full_name),
    lower(trim(p_email)),
    nullif(trim(coalesce(p_phone, '')), ''),
    normalized_attendees,
    v_attending_text,
    nullif(trim(coalesce(p_note, '')), ''),
    trim(p_entry_code),
    nullif(trim(coalesce(p_title, '')), ''),
    p_adult_agreement
  );

  RETURN jsonb_build_object(
    'status', 'accepted',
    'remaining', greatest(p_capacity - current_total - normalized_attendees, 0)
  );
END;
$$;
