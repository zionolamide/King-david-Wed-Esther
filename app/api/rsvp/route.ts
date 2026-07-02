import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { generateAccessCardImage } from "@/lib/access-card";

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
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
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

  const { data, error } = await supabase.from("rsvp_submissions").insert({
    title: title === "(No Prefix)" ? null : title,
    full_name: fullName,
    email,
    phone: phone || null,
    note: note || null,
    adult_agreement: adultAgreement,
    entry_code: entryCode,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message ?? "RSVP failed." },
      { status: 500 }
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

    const cardBuffer = await generateAccessCardImage({
      fullName,
      entryCode,
      attendees: 1,
    });

    const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 18px; background: #fff;">
      <h2 style="color: #333;">King David &amp; Esther Wedding RSVP Confirmation</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">Hello ${fullName}, thank you for RSVPing. Your official access card for King David and Esther's wedding is attached. Please save this image to your phone and present it at the entrance. We look forward to seeing you!</p>
      <p style="color: #555; font-size: 16px; line-height: 1.6; margin-top: 16px;">Your unique access code is: <strong style="color: #000;">${entryCode}</strong></p>
      <div style="margin-top: 24px; text-align: center;">
        <img src="cid:access-card@kde2026" alt="Access card" style="width:100%;max-width:640px;border-radius:20px;display:block;margin-inline:auto;" />
      </div>
      <p style="color: #777; font-size: 14px; margin-top: 28px; border-top: 1px solid #eaeaea; padding-top: 16px;">Please keep this card safe and present it at the entrance. This access card is non-transferable.</p>
    </div>`;

    try {
      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: "King David & Esther Wedding - RSVP Confirmation",
        text: `Hello ${fullName}, thank you for RSVPing. Your official access card for King David and Esther's wedding is attached. Please save this image to your phone and present it at the entrance. We look forward to seeing you!`,
        html: htmlBody,
        attachments: [
          {
            filename: "access-card.png",
            content: cardBuffer,
            cid: "access-card@kde2026",
          },
        ],
      });
    } catch (emailError) {
      console.error("Nodemailer sendMail error:", emailError);
    }
  }

  return NextResponse.json({
    ok: true,
    entryCode
  });
}
