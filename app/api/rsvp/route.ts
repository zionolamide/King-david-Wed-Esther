import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
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

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;
  const fromAddress = emailUser;

  if (emailUser && emailPassword) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;"><h2 style="color: #333;">RSVP Confirmed</h2><p style="color: #555; font-size: 16px;">Thank you for RSVPing to celebrate with David and Esther. We are thrilled to have you join us!</p><p style="color: #555; font-size: 16px;">Your unique entry code is: <strong style="font-size: 20px; color: #000; letter-spacing: 2px;">${entryCode}</strong></p><p style="color: #777; font-size: 14px; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 15px;">Please keep this code handy, as you will need it for entry.</p></div>`;

    try {
      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: "Your Official RSVP Confirmation & Entry Code",
        html: htmlBody,
      });
    } catch (emailError) {
      console.error("Nodemailer sendMail error:", emailError);
    }
  }

  return NextResponse.json({
    ok: true,
    entryCode,
    remaining: data?.remaining ?? null
  });
}
