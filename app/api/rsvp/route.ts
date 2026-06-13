import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RSVP_LIMIT = Number(process.env.NEXT_PUBLIC_RSVP_LIMIT ?? 100);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { fullName, email, phone, attendees, attending, note } = body;

    // Validate required fields
    if (!fullName || !email || !attendees) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingRsvp } = await supabase
      .from('rsvp_submissions')
      .select('id')
      .eq('email', email)
      .single();

    if (existingRsvp) {
      return NextResponse.json(
        { message: 'Email already submitted. Thank you!' },
        { status: 409 }
      );
    }

    // Check total attendees count
    const { data: allRsvps } = await supabase
      .from('rsvp_submissions')
      .select('attendees', { count: 'exact' });

    const totalAttendees = (allRsvps ?? []).reduce((sum, rsvp) => sum + (rsvp.attendees || 0), 0);

    if (totalAttendees + attendees > RSVP_LIMIT) {
      return NextResponse.json(
        { message: 'RSVP capacity has been reached. We apologize for any inconvenience.' },
        { status: 409 }
      );
    }

    // Insert RSVP
    const { data, error } = await supabase
      .from('rsvp_submissions')
      .insert([
        {
          full_name: fullName,
          email,
          phone: phone || null,
          attendees: parseInt(attendees),
          attending,
          note: note || null,
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json(
      { 
        message: 'RSVP submitted successfully',
        data 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('RSVP submission error:', error);
    return NextResponse.json(
      { message: 'Failed to submit RSVP. Please try again.' },
      { status: 500 }
    );
  }
}
