import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { sendApprovalRequest, sendWishNotification } from "../../lib/telegram";

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
  const countryCode = cleanText((body as any).countryCode || "+234");
  const phoneRaw = cleanText(body.phone).replace(/[^0-9]/g, "");
  const phone = countryCode + phoneRaw;
  const note = cleanText(body.note);
  const attending = (body as any).attending === "no" ? "no" : "yes";
  const adultAgreement = body.adultAgreement === true || body.adultAgreement === "true";

  if (!fullName) {
    return NextResponse.json(
      { ok: false, message: "Please enter your full name." },
      { status: 400 }
    );
  }

  if (attending === "yes" && (!phoneRaw || !adultAgreement)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please enter your WhatsApp number and confirm the adult-only agreement."
      },
      { status: 400 }
    );
  }

  if (attending === "no" && !note) {
    return NextResponse.json(
      { ok: false, message: "Please write your wish for the couple." },
      { status: 400 }
    );
  }

  if (email && !isEmail(email)) {
    return NextResponse.json(
      { ok: false, message: "Please enter a valid email address or leave it blank." },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { persistSession: false }
  });

  // Only attending guests need approval and count toward capacity
  if (attending === "yes") {
    const { data: allData, error: fetchError } = await supabase
      .from("rsvp_submissions")
      .select("note");

    if (fetchError) {
      return NextResponse.json({ ok: false, message: fetchError.message }, { status: 500 });
    }

    let approvedCount = 0;
    for (const row of allData || []) {
      try {
        const meta = JSON.parse(row.note || "{}");
        if (meta.approved) approvedCount++;
      } catch {}
    }

    if (approvedCount >= RSVP_LIMIT) {
      return NextResponse.json(
        { ok: false, message: `We've reached the guest capacity of ${RSVP_LIMIT}. RSVP is now closed.` },
        { status: 403 }
      );
    }
  }

  if (email) {
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
          message: "This email has already been registered. If you already submitted, please don't fill the form twice."
        },
        { status: 409 }
      );
    }
  }

  // Also check for duplicate WhatsApp number (applies to attending guests)
  if (phone && attending === "yes") {
    const { data: phoneExists, error: phoneError } = await supabase
      .from("rsvp_submissions")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (phoneError) {
      return NextResponse.json(
        { ok: false, message: phoneError.message ?? "RSVP validation failed." },
        { status: 500 }
      );
    }

    if (phoneExists) {
      return NextResponse.json(
        {
          ok: false,
          message: "This WhatsApp number has already been registered. If you already submitted, please don't fill the form twice."
        },
        { status: 409 }
      );
    }
  }

  const notePayload: any = { approved: false, attending };
  if (note) notePayload.wish = note;

  const { data: inserted, error } = await supabase.from("rsvp_submissions").insert({
    title: title === "(No Prefix)" ? null : title,
    full_name: fullName,
    email: email || null,
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

  // Send Telegram approval request to the couple for attending guests only
  if (inserted && inserted[0] && attending === "yes") {
    const displayName = title && title !== "(No Prefix)" ? `${title} ${fullName}` : fullName;
    await sendApprovalRequest(inserted[0].id, displayName, email, phone, note);
  } else if (inserted && inserted[0] && attending === "no") {
    const displayName = title && title !== "(No Prefix)" ? `${title} ${fullName}` : fullName;
    await sendWishNotification(inserted[0].id, displayName, note);
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
        subject: attending === "yes" ? `New RSVP: ${displayFullName}` : `New Wish: ${displayFullName}`,
        text: attending === "yes"
          ? `${displayFullName} just RSVP'd for King-David & Esther's wedding.\n\nEmail: ${email}\nPhone: ${phone}\nMessage: ${note || "None"}`
          : `${displayFullName} sent a wish for King-David & Esther's wedding (not attending).\n\nWish: ${note || "None"}`,
      });
    } catch (err) {
      console.warn("Notification email failed:", err);
    }
    transporter.close();
  }

  return NextResponse.json({ ok: true, pending: attending === "yes" });
}
