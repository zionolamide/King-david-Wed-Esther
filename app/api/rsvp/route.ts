import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { randomBytes } from "crypto";

type RsvpPayload = {
  title?: unknown;
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  note?: unknown;
  adultAgreement?: unknown;
};

const RSVP_LIMIT = Number(process.env.NEXT_PUBLIC_RSVP_LIMIT ?? 100);

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function generateEntryCode() {
  // Generate 4 random bytes, converting to an 8-character uppercase hex string (e.g. "A1B2C3D4")
  const code = randomBytes(4).toString("hex").toUpperCase();
  return `KDE-2026-${code}`;
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

  const title = cleanText(body.title);
  const fullName = cleanText(body.fullName);
  const email = cleanText(body.email).toLowerCase();
  const phone = cleanText(body.phone);
  const note = cleanText(body.note);
  const adultAgreement = body.adultAgreement === true || body.adultAgreement === "true";
  const entryCode = generateEntryCode();
  const attendees = 1;
  const attending = true;

  if (!fullName || !isEmail(email) || !phone || !adultAgreement) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please enter your full name, WhatsApp number, valid email address and confirm the adult-only agreement."
      },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase.rpc("register_wedding_rsvp", {
    p_full_name: title && title !== "(No Prefix)" ? `${title} ${fullName}` : fullName,
    p_email: email,
    p_phone: phone || null,
    p_attendees: attendees,
    p_attending: attending,
    p_note: note || null,
    p_entry_code: entryCode,
    p_capacity: RSVP_LIMIT,
    p_title: title || null,
    p_adult_agreement: adultAgreement
  });

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message ?? "RSVP failed." },
      { status: 500 }
    );
  }

  if (data?.status === "exists") {
    return NextResponse.json(
      {
        ok: false,
        message: "This email has already been registered."
      },
      { status: 409 }
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
    const attendanceLine = "Your seat has been reserved.";
    const displayName = title && title !== "(No Prefix)" ? `${title} ${fullName}` : fullName;
    const entryCodeBlock = `
              <div style="margin: 24px 0; padding: 18px; text-align: center; border: 2px dashed rgba(123,0,20,0.3); background: #f5efe4;">
                <p style="letter-spacing: 2px; text-transform: uppercase; color: #7b0014; font: 11px Arial, sans-serif; margin: 0 0 8px;">Your Entry Code</p>
                <p style="font: 700 28px 'Courier New', monospace; color: #3f481f; margin: 0;">${entryCode}</p>
              </div>
              <p style="font-size: 15px; line-height: 1.7;">Please keep this code safe and present it at the entrance.</p>
        `;

    try {
      const emailResponse = await resend.emails.send({
        from: process.env.RSVP_FROM_EMAIL,
        to: email,
        subject: "Your Wedding Entry Code | King David & Esther",
        html: `
          <div style="font-family: Georgia, serif; color: #2d241f; background: #fbf6ed; padding: 32px;">
            <div style="max-width: 560px; margin: auto; background: #fffaf3; border: 1px solid #eadfc9; padding: 32px;">
              <p style="letter-spacing: 3px; text-transform: uppercase; color: #7b0014; font: 12px Arial, sans-serif;">RSVP Confirmation</p>
              <h1 style="font-size: 38px; color: #3f481f; margin: 8px 0 16px;">Thank you, ${displayName}</h1>
              <p style="font-size: 17px; line-height: 1.7;">${attendanceLine}</p>
              ${entryCodeBlock}
              <p style="font-size: 17px; line-height: 1.7;">King David and Esther look forward to celebrating with you on Saturday, 22 August 2026 at Camp Young, Ede.</p>
              <p style="color: #7b0014; margin-top: 28px;">With love,<br/>King David & Esther</p>
            </div>
          </div>
        `
      });
      if (emailResponse.error) {
        console.error("Resend API returned error:", emailResponse.error);
      } else {
        console.log("Resend email sent successfully:", emailResponse.data);
      }
    } catch (emailError) {
      console.error("RSVP email failed to send:", emailError);
    }
  }

  return NextResponse.json({
    ok: true,
    entryCode,
    remaining: data?.remaining ?? null
  });
}
