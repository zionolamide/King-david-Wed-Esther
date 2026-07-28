import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { sendApprovalRequest } from "../../lib/telegram";

type RsvpPayload = {
  title?: unknown;
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  note?: unknown;
  adultAgreement?: unknown;
};

const RSVP_LIMIT = Number(process.env.NEXT_PUBLIC_RSVP_LIMIT ?? 80);

const RSVP_WHATSAPP_CONTACTS = [
  { name: "Sister Rhoda", phone: "08106993435" },
  { name: "Brother Joe", phone: "08102765976" },
  { name: "Bro Zion", phone: "09135037695" }
];

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function generateRandomLetters(count: number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = randomBytes(count);
  let result = "";
  for (let i = 0; i < count; i += 1) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
}

async function generateEntryCode(supabase: any) {
  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const letters = generateRandomLetters(2);
    const digits = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const entryCode = `KDE-2026-${letters}${digits}`;

    const { data, error } = await supabase
      .from("rsvp_submissions")
      .select("id")
      .eq("entry_code", entryCode)
      .maybeSingle();

    if (error) {
      throw new Error(error.message ?? "Failed to verify entry code uniqueness.");
    }

    if (!data) {
      return entryCode;
    }
  }

  throw new Error("Unable to generate a unique entry code after multiple attempts.");
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, message: "Server configuration error." },
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

  if (!fullName || !isEmail(email) || !phone || !adultAgreement) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please enter your full name, WhatsApp number, valid email address and confirm the adult-only agreement."
      },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { persistSession: false }
  });

  // Check existing submission limit — no RSVP limit, but admin will only approve up to 80
  const { count, error: countError } = await supabase
    .from("rsvp_submissions")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ ok: false, message: countError.message }, { status: 500 });
  }

  const { data: existing, error: existsError } = await supabase
    .from("rsvp_submissions")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existsError) {
    return NextResponse.json(
      { ok: false, message: existsError.message ?? "RSVP validation failed." },
      { status: 500 }
    );
  }

  if (existing) {
    return NextResponse.json(
      {
        ok: false,
        message: "This email has already been registered."
      },
      { status: 409 }
    );
  }

  const notePayload: any = { approved: false };
  if (note) notePayload.wish = note;

  const { data: inserted, error } = await supabase.from("rsvp_submissions").insert({
    title: title === "(No Prefix)" ? null : title,
    full_name: fullName,
    email,
    phone: phone || null,
    note: JSON.stringify(notePayload),
    adult_agreement: adultAgreement,
    entry_code: null, // entry code generated on approval
  }).select("id");

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message ?? "RSVP failed." },
      { status: 500 }
    );
  }

  // Send Telegram approval request to the couple (no entry code shown)
  if (inserted && inserted[0]) {
    await sendApprovalRequest(inserted[0].id, fullName, email);
  }

  // Notify the couple by email as well (backup)
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;

  if (emailUser && emailPassword) {
    const displayFullName = title && title !== "(No Prefix)" ? `${title} ${fullName}` : fullName;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPassword },
      pool: true,
      maxConnections: 1,
      socketTimeout: 5_000,
    });
    try {
      await transporter.sendMail({
        from: emailUser,
        to: emailUser,
        subject: `New RSVP: ${displayFullName}`,
        text: `${displayFullName} just RSVP'd for King-David & Esther's wedding.\n\nEmail: ${email}\nPhone: ${phone}\nMessage: ${note || "None"}`,
      });
    } catch (err) {
      console.warn("Notification email failed:", err);
    }
    transporter.close();
  }

  return NextResponse.json({ ok: true, pending: true });
}
