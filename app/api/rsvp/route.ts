import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import sharp from "sharp";
import { randomBytes } from "crypto";
import { generateAccessCardImage } from "../../lib/access-card";

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
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
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
      attending: "yes",
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
    const cardBuffer = await generateAccessCardImage({
      fullName: displayFullName,
      entryCode,
      attendees: 1,
      phone,
      whatsappContacts: RSVP_WHATSAPP_CONTACTS,
    });

    // If the generated PNG is large, create a smaller compressed variant via sharp
    let attachmentBuffer = cardBuffer;
    try {
      if (cardBuffer && cardBuffer.byteLength > 200 * 1024) {
        const targetWidth = Math.round(760 * 0.6);
        const compressed = await sharp(cardBuffer).resize({ width: targetWidth }).png({ compressionLevel: 9 }).toBuffer();
        if (compressed.byteLength < cardBuffer.byteLength) {
          attachmentBuffer = compressed;
        }
      }
    } catch (sharpErr) {
      console.warn("Sharp compression failed, using original buffer:", sharpErr);
      attachmentBuffer = cardBuffer;
    }

    const htmlBody = `<div style="font-family: 'Montserrat', Arial, sans-serif; background-color: #fbf6ed; padding: 40px 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #2f0c0f; border: 2px solid #eadfc9; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); text-align: left;">
        <h2 style="color: #eadfc9; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid rgba(234, 223, 201, 0.2); padding-bottom: 15px; text-align: center;">King David &amp; Esther</h2>
        <p style="color: #f7ede6; font-size: 16px; line-height: 1.8; margin-bottom: 24px;">
          Hello <strong>${fullName}</strong>,<br><br>
          Thank you for RSVPing to our wedding. Your official access card has been generated successfully. Please save the attached image to your mobile device and present it at the entrance. We look forward to celebrating with you!
        </p>
        <div style="margin: 30px 0; text-align: center; border-radius: 16px; overflow: hidden; background-color: #3f1013; padding: 15px;">
          <img src="cid:access-card@kde2026" alt="Access Card" style="width: 100%; max-width: 500px; border-radius: 12px; display: block; margin: 0 auto;" />
        </div>
        <div style="border-top: 1px solid rgba(234, 223, 201, 0.2); padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #e9c0b6; font-size: 12px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 8px 0;">Strictly Adults Only • Non-Transferable</p>
          <p style="color: #c89485; font-size: 13px; margin: 0;">We look forward to celebrating our special day with you!</p>
        </div>
      </div>
    </div>`;

    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: "King David & Esther Wedding - RSVP Confirmation",
      text: `Hello ${fullName}, thank you for RSVPing. Your official access card for King David and Esther's wedding is attached. Please save this image to your phone and present it at the entrance. We look forward to seeing you!`,
      html: htmlBody,
      attachments: [
        { filename: "access-card.png", content: attachmentBuffer, cid: "access-card@kde2026" },
      ],
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
  }

  return NextResponse.json({
    ok: true,
    entryCode
  });
}
