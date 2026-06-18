import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const RSVP_LIMIT = Number(process.env.NEXT_PUBLIC_RSVP_LIMIT ?? 100);

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const supabase = getSupabase();
    const { fullName, email, phone, attendees, attending, note } = req.body;

    if (!fullName || !email || !attendees) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { data: existingRsvp } = await supabase
      .from('rsvp_submissions')
      .select('id')
      .eq('email', email)
      .single();

    if (existingRsvp) {
      return res.status(409).json({ message: 'Email already submitted. Thank you!' });
    }

    const { data: allRsvps } = await supabase
      .from('rsvp_submissions')
      .select('attendees', { count: 'exact' });

    const totalAttendees = (allRsvps ?? []).reduce((sum, rsvp) => sum + (rsvp.attendees || 0), 0);

    if (totalAttendees + attendees > RSVP_LIMIT) {
      return res.status(409).json({ message: 'RSVP capacity has been reached.' });
    }

    const { data, error } = await supabase
      .from('rsvp_submissions')
      .insert([{ full_name: fullName, email, phone: phone || null, attendees: parseInt(attendees), attending, note: note || null }])
      .select();

    if (error) throw error;

    return res.status(201).json({ message: 'RSVP submitted successfully', data });
  } catch (error) {
    console.error('RSVP error:', error);
    return res.status(500).json({ message: 'Failed to submit RSVP. Please try again.' });
  }
}
