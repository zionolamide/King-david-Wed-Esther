import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

type RsvpPayload = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  attendees?: unknown;
  attending?: unknown;
  note?: unknown;
};

const RSVP_LIMIT = Number(process.env.NEXT_PUBLIC_RSVP_LIMIT ?? 100);

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toIntInRange(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const rounded = Math.trunc(n);
  return Math.max(min, Math.min(max, rounded));
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, message: "RSVP database is not configured yet." },
      { status: 503 }
    );
  }

  let body: RsvpPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid RSVP request." },
      { status: 400 }
    );
  }

  const fullName = cleanText(body.fullName);
  const email = cleanText(body.email).toLowerCase();
  const phone = cleanText(body.phone);
  const note = cleanText(body.note);

  const attending = body.attending === "no" ? false : body.attending === "yes" ? true : true;

  // attendees are only meaningful when attending === true
  const attendees = toIntInRange(body.attendees, 1, 10, 1);

  if (!fullName || !isEmail(email)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please enter your full name and a valid email address."
      },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase.rpc("register_wedding_rsvp", {
    p_full_name: fullName,
    p_email: email,
    p_phone: phone || null,
    p_attendees: attending ? attendees : 0,
    p_attending: attending,
    p_note: note || null,
    p_capacity: RSVP_LIMIT
  });

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message ?? "RSVP failed." },
      { status: 500 }
    );
  }

  if (data?.status === "closed") {
    return NextResponse.json(
      {
        ok: false,
        message: "RSVP Closed - Capacity Reached",
        remaining: data?.remaining ?? null
      },
      { status: 409 }
    );
  }

  if (process.env.RESEND_API_KEY && process.env.RSVP_FROM_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const attendanceLine = attending
      ? `We have reserved ${attendees} seat${attendees === 1 ? "" : "s"} for you.`
      : "We have noted that you are unable to attend.";

    try {
      await resend.emails.send({
        from: process.env.RSVP_FROM_EMAIL,
        to: email,
        subject: "RSVP Confirmation | King-David & Esther",
        html: `
          <div style="font-family: Georgia, serif; color: #2d241f; background: #fbf6ed; padding: 32px;">
            <div style="max-width: 560px; margin: auto; background: #fffaf3; border: 1px solid #eadfc9; padding: 32px;">
              <p style="letter-spacing: 3px; text-transform: uppercase; color: #7b0014; font: 12px Arial, sans-serif;">RSVP Confirmation</p>
              <h1 style="font-size: 38px; color: #3f481f; margin: 8px 0 16px;">Thank you, ${fullName}</h1>
              <p style="font-size: 17px; line-height: 1.7;">${attendanceLine}</p>
              <p style="font-size: 17px; line-height: 1.7;">King-David and Esther look forward to celebrating with you on Saturday, 22 August 2026 at Camp Young, Ede.</p>
              <p style="color: #7b0014; margin-top: 28px;">With love,<br/>King-David & Esther</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error("RSVP email failed", emailError);
    }
  }

  return NextResponse.json({
    ok: true,
    remaining: data?.remaining ?? null
  });
}
