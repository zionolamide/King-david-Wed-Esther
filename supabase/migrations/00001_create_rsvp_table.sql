
CREATE TABLE IF NOT EXISTS rsvp_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  attendees integer NOT NULL DEFAULT 1 CHECK (attendees >= 1 AND attendees <= 10),
  attending text NOT NULL CHECK (attending IN ('yes', 'no')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE rsvp_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can submit (INSERT)
CREATE POLICY "Allow anyone to submit RSVP" ON rsvp_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Policy: anyone can check existing emails (SELECT for self-check)
CREATE POLICY "Allow anyone to check email" ON rsvp_submissions
  FOR SELECT TO anon, authenticated USING (true);

-- Policy: no one can update or delete
-- Admin policy for full access (service role bypasses RLS)
