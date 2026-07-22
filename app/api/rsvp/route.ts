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
  let isSimulated = false;
  let entryCode = "";

  if (!supabaseUrl || !serviceRoleKey) {
    isSimulated = true;
    const letters = generateRandomLetters(2);
    const digits = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    entryCode = `KDE-2026-${letters}${digits}`;
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

  if (!isSimulated) {
    const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: { persistSession: false }
    });

    entryCode = await generateEntryCode(supabase);

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

    const { error } = await supabase.from("rsvp_submissions").insert({
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
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;
  const fromAddress = emailUser;

  if (emailUser && emailPassword) {
    // Use a pooled transporter with retry logic to improve delivery reliability
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPassword },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      socketTimeout: 10_000,
    });

    const displayFullName = title && title !== "(No Prefix)" ? `${title} ${fullName}` : fullName;

    // Build the email with a self-contained styled access card (no canvas dependency)
    const emailCardHtml = `
    <div style="max-width:420px;margin:0 auto;font-family:'Montserrat',Arial,sans-serif;border:2px solid #eadfc9;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);background:#ffffff;">
      <!-- Header with monogram style -->
      <div style="background:linear-gradient(135deg,#6e0d1b,#8b5a46,#2f3a22);padding:24px 20px;text-align:center;">
        <div style="width:64px;height:64px;margin:0 auto 12px;border:2px solid rgba(255,248,239,0.4);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <span style="font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#FFF8EF;">KDE</span>
        </div>
        <h3 style="margin:0;font-family:Georgia,serif;font-size:20px;color:#FFF8EF;">King-David &amp; Esther</h3>
        <p style="margin:4px 0 0;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(234,223,201,0.7);">Wedding Access Pass</p>
      </div>
      <!-- Body -->
      <div style="background:#fbf6ed;padding:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:50%;background:rgba(255,255,255,0.9);border-radius:10px;padding:12px;vertical-align:top;">
              <p style="margin:0;font-size:8px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#6e0d1b;">Guest</p>
              <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:14px;color:#2f3a22;">${displayFullName}</p>
            </td>
            <td style="width:10px;"></td>
            <td style="width:50%;background:rgba(255,255,255,0.9);border-radius:10px;padding:12px;vertical-align:top;text-align:right;">
              <p style="margin:0;font-size:8px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#6e0d1b;">Entry Code</p>
              <p style="margin:4px 0 0;font-family:monospace;font-size:16px;font-weight:bold;color:#2f3a22;">${entryCode}</p>
            </td>
          </tr>
        </table>
        <div style="margin-top:12px;background:rgba(255,255,255,0.6);border:1px solid rgba(234,223,201,0.5);border-radius:10px;padding:12px;">
          <p style="margin:0;font-size:8px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#6e0d1b;">Event Details</p>
          <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:14px;color:#2f3a22;">Camp Young, Ede</p>
          <p style="margin:2px 0 0;font-size:11px;color:rgba(45,36,31,0.6);">Saturday, 22 August 2026 · 10:00 AM</p>
        </div>
        <!-- Palette strip -->
        <div style="margin-top:10px;display:flex;gap:4px;border-radius:6px;overflow:hidden;">
          ${["#6f7a57","#6e0d1b","#8b5a46","#c9785e","#d7a79c","#ebc2bb"].map(c => `<div style="flex:1;height:6px;background:${c};"></div>`).join('')}
        </div>
        <p style="margin:10px 0 0;text-align:center;font-size:7px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;color:rgba(45,36,31,0.4);">1 Adult · Non-transferable</p>
      </div>
    </div>`;

    const htmlBody = `<div style="font-family: 'Montserrat', Arial, sans-serif; background-color: #fbf6ed; padding: 30px 15px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #2f0c0f; border: 2px solid #eadfc9; border-radius: 20px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); text-align: left;">
        <h2 style="color: #eadfc9; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; margin: 0 0 15px; border-bottom: 1px solid rgba(234, 223, 201, 0.2); padding-bottom: 12px; text-align: center;">King-David &amp; Esther</h2>
        <p style="color: #f7ede6; font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
          Hello <strong>${fullName}</strong>,<br><br>
          Thank you for RSVPing to our wedding. Your official access card is shown below. Please save it to your mobile device and present it at the entrance.
        </p>
        ${emailCardHtml}
        <div style="border-top: 1px solid rgba(234, 223, 201, 0.2); padding-top: 20px; margin-top: 25px; text-align: center;">
          <p style="color: #e9c0b6; font-size: 11px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 6px;">Strictly Adults Only • Non-Transferable</p>
          <p style="color: #c89485; font-size: 12px; margin: 0;">We look forward to celebrating our special day with you!</p>
        </div>
      </div>
    </div>`;

    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: "King-David & Esther Wedding - RSVP Confirmation",
      text: `Hello ${fullName},\n\nThank you for RSVPing to our wedding. Your entry code is: ${entryCode}\n\nVenue: Camp Young, Ede\nDate: Saturday, 22 August 2026 · 10:00 AM\n\nPresent your entry code at the entrance.\n\nWith love,\nKing-David & Esther`,
      html: htmlBody,
    };

    async function sendMailWithRetries(options: any, attempts = 3) {
      let lastErr: any = null;
      for (let i = 0; i < attempts; i += 1) {
        try {
          await transporter.sendMail(options);
          return true;
        } catch (err) {
          lastErr = err;
          await new Promise((res) => setTimeout(res, 400 * Math.pow(2, i)));
        }
      }
      console.error("Failed to send RSVP email after retries:", lastErr);
      return false;
    }

    try {
      await transporter.verify();
      const sent = await sendMailWithRetries(mailOptions, 3);
      if (!sent) console.warn("Email delivery failed for:", email);
    } catch (verifyErr) {
      console.error("Email transporter verify failed:", verifyErr);
    } finally {
      try { transporter.close(); } catch (e) { /* ignore */ }
    }

    // Send notification to the couple
    try {
      const notifyTransport = nodemailer.createTransport({
        service: "gmail",
        auth: { user: emailUser, pass: emailPassword },
        pool: true,
        maxConnections: 1,
        socketTimeout: 5_000,
      });
      await notifyTransport.sendMail({
        from: fromAddress,
        to: emailUser,
        subject: `New RSVP: ${displayFullName}`,
        text: `${displayFullName} just RSVP'd for King-David & Esther's wedding.\n\nEntry Code: ${entryCode}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${note || "None"}`,
      });
      notifyTransport.close();
    } catch (notifyErr) {
      console.warn("Notification email failed:", notifyErr);
    }
  } // end if (emailUser && emailPassword)

  return NextResponse.json({
    ok: true,
    entryCode
  });
}
