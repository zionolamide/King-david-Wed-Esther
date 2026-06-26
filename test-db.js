import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf8');
const matchUrl = envText.match(/VITE_SUPABASE_URL=(.+)/);
const matchKey = envText.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const supabaseUrl = matchUrl ? matchUrl[1].trim() : null;
const supabaseKey = matchKey ? matchKey[1].trim() : null;

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Testing connection to Supabase...');

  // Let's query information_schema if we can, but anon key might not have access to RLS or pg_catalog.
  // Let's just query a known function or test calling it.
  const { data: rsvps, error: rsvpsErr } = await supabase.from('rsvp_submissions').select('*');
  console.log('Query rsvp_submissions table:');
  console.log('Error:', rsvpsErr);
  console.log('Data:', rsvps);
}
