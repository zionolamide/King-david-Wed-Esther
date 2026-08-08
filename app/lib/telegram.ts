import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";

const RSVP_LIMIT = Number(process.env.NEXT_PUBLIC_RSVP_LIMIT ?? 80);

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

export async function sendApprovalRequest(
  guestId: string,
  displayName: string,
  email: string,
  phone: string,
  wish?: string,
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram not configured — skipping approval request");
    return;
  }

  const wishLine = wish ? `\n💬 Wish: ${wish.slice(0, 100)}` : "";
  const text = `🆕 New RSVP\n━━━━━━━━━━━━━━━\n👤 ${displayName}\n📧 ${email || "No email"}\n📱 ${phone}${wishLine}\n━━━━━━━━━━━━━━━\nApprove to generate entry code and send their access card.`;

  // If guest has a wish: two buttons (Approve only / Approve + publish wish)
  // If no wish: single Approve button
  const inlineKeyboard = wish
    ? {
        inline_keyboard: [
          [{ text: "✅ Approve", callback_data: `approve:${guestId}` }],
          [{ text: "📝 Approve & Publish Wish", callback_data: `approve_wish:${guestId}` }],
        ],
      }
    : {
        inline_keyboard: [[{ text: "✅ Approve", callback_data: `approve:${guestId}` }]],
      };

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: inlineKeyboard,
      }),
    });
  } catch (err) {
    console.error("Telegram sendMessage failed:", err);
  }
}

export async function sendWishNotification(
  guestId: string,
  displayName: string,
  wish: string,
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram not configured — skipping wish notification");
    return;
  }

  const text = `💌 New Wish Received\n━━━━━━━━━━━━━━━\n👤 ${displayName}\n💬 Wish: ${wish.slice(0, 150)}\n━━━━━━━━━━━━━━━\nWish-only guest (not attending). No access card needed.\nApprove to publish their wish on the website.`;

  const inlineKeyboard = {
    inline_keyboard: [[
      { text: "✅ Approve Wish", callback_data: `wishonly:${guestId}` },
    ]],
  };

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: inlineKeyboard,
      }),
    });
  } catch (err) {
    console.error("Telegram wish notification failed:", err);
  }
}

export async function approveGuestWish(guestId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false, message: "Supabase not configured" };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data: guest } = await supabase
    .from("rsvp_submissions")
    .select("*")
    .eq("id", guestId)
    .maybeSingle();

  if (!guest) return { ok: false, message: "Guest not found" };

  let meta: any = {};
  try { meta = JSON.parse(guest.note || ""); } catch { meta = {}; }

  // If already published, just return success (no duplicate)
  if (meta.wish_approved === true) {
    return { ok: true, alreadyApproved: true, fullName: guest.full_name, wish: meta.wish };
  }

  meta.wish_approved = true;

  const { error } = await supabase
    .from("rsvp_submissions")
    .update({ note: JSON.stringify(meta) })
    .eq("id", guestId);

  if (error) return { ok: false, message: error.message };

  return { ok: true, alreadyApproved: false, fullName: guest.full_name, wish: meta.wish };
}

export async function approveGuest(guestId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false, message: "Supabase not configured" };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  // Check capacity — count already approved guests
  const { data: allGuests } = await supabase
    .from("rsvp_submissions")
    .select("id, note");

  let approvedCount = 0;
  for (const g of allGuests || []) {
    try {
      const meta = JSON.parse(g.note || "{}");
      if (meta.approved) approvedCount++;
    } catch {}
  }

  if (approvedCount >= RSVP_LIMIT) {
    return { ok: false, message: "Guest capacity reached (80)" };
  }

  const { data: guest } = await supabase
    .from("rsvp_submissions")
    .select("*")
    .eq("id", guestId)
    .maybeSingle();

  if (!guest) return { ok: false, message: "Guest not found" };

  // Check if already approved — prevent duplicate emails/codes on repeat taps
  let existingMeta: any = {};
  try { existingMeta = JSON.parse(guest.note || ""); } catch { existingMeta = {}; }
  if (existingMeta.approved === true || guest.entry_code) {
    return { ok: true, alreadyApproved: true, fullName: guest.full_name, entryCode: guest.entry_code, phone: guest.phone || "" };
  }

  // Generate entry code on approval
  const entryCode = await generateEntryCode(supabase);

  // Mark as approved, attending, and set entry code
  let meta: any = {};
  try { meta = JSON.parse(guest.note || ""); } catch { meta = {}; }
  meta.approved = true;
  meta.attending = "yes";
  const { error: updateError } = await supabase
    .from("rsvp_submissions")
    .update({ note: JSON.stringify(meta), entry_code: entryCode })
    .eq("id", guestId);

  if (updateError) return { ok: false, message: updateError.message };

  // Send access card email
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;

  if (emailUser && emailPassword) {
    const fullName = guest.full_name;
    const title = guest.title;
    const displayFullName = title && title !== "(No Prefix)" ? `${title} ${fullName}` : fullName;
    const fromAddress = emailUser;

    // Read monogram as base64 for email embedding
    let monogramBase64 = "";
    try {
      const monogramPath = path.join(process.cwd(), "public", "monograms.png");
      if (fs.existsSync(monogramPath)) {
        monogramBase64 = fs.readFileSync(monogramPath).toString("base64");
      }
    } catch (e) {
      console.warn("Could not read monogram for email:", e);
    }

    const emailCardHtml = `
    <div style="max-width:420px;margin:0 auto;font-family:'Montserrat',Arial,sans-serif;border:2px solid #eadfc9;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);background:#ffffff;">
      <div style="background:linear-gradient(135deg,#6e0d1b,#c9785e);padding:28px 20px;text-align:center;">
        ${monogramBase64 ? `<img src="data:image/png;base64,${monogramBase64}" alt="Monogram" style="width:80px;height:80px;margin:0 auto 10px;display:block;object-fit:contain;" />` : ""}
        <div style="font-family:Georgia,serif;font-size:18px;color:#FFF8EF;">King-David &amp; Esther</div>
        <div style="font-size:9px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:rgba(234,223,201,0.7);margin-top:4px;">Wedding Access Card</div>
      </div>
      <div style="background:#fbf6ed;padding:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:50%;background:rgba(234,223,201,0.4);border-radius:10px;padding:12px;vertical-align:top;">
              <p style="margin:0;font-size:7px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#6e0d1b;">Guest</p>
              <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:13px;color:#2f3a22;word-break:break-word;">${displayFullName}</p>
            </td>
            <td style="width:10px;"></td>
            <td style="width:50%;background:rgba(234,223,201,0.4);border-radius:10px;padding:12px;vertical-align:top;text-align:right;">
              <p style="margin:0;font-size:7px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#6e0d1b;">Entry Code</p>
              <p style="margin:4px 0 0;font-family:monospace;font-size:15px;font-weight:bold;color:#2f3a22;">${entryCode}</p>
            </td>
          </tr>
        </table>
        <div style="margin-top:10px;background:rgba(235,194,187,0.2);border:1px solid rgba(235,194,187,0.3);border-radius:10px;padding:10px;">
          <p style="margin:0;font-size:7px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#6e0d1b;">Event Details</p>
          <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:13px;color:#2f3a22;">Camp Young, Ede</p>
          <p style="margin:2px 0 0;font-size:10px;color:rgba(45,36,31,0.6);">Saturday, 22 August 2026 · 10:00 AM</p>
        </div>
        <div style="margin-top:10px;display:flex;gap:3px;border-radius:4px;overflow:hidden;">
          ${["#6f7a57","#6e0d1b","#8b5a46","#c9785e","#d7a79c","#ebc2bb"].map(c => `<div style="flex:1;height:5px;background:${c};"></div>`).join('')}
        </div>
        <p style="margin:10px 0 0;text-align:center;font-size:6px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;color:rgba(45,36,31,0.4);">1 Adult · Non-transferable</p>
      </div>
    </div>`;

    const htmlBody = `<div style="font-family: 'Montserrat', Arial, sans-serif; background-color: #fbf6ed; padding: 30px 15px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #2f0c0f; border: 2px solid #eadfc9; border-radius: 20px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); text-align: left;">
        <h2 style="color: #eadfc9; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; margin: 0 0 15px; border-bottom: 1px solid rgba(234, 223, 201, 0.2); padding-bottom: 12px; text-align: center;">King-David &amp; Esther</h2>
        <p style="color: #f7ede6; font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
          Hello <strong>${fullName}</strong>,<br><br>
          Your RSVP has been approved! Your official access card is shown below. Please save it to your mobile device and present it at the entrance.
        </p>
        ${emailCardHtml}
        <div style="border-top: 1px solid rgba(234, 223, 201, 0.2); padding-top: 20px; margin-top: 25px; text-align: center;">
          <p style="color: #e9c0b6; font-size: 11px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 6px;">Strictly Adults Only • Non-Transferable</p>
          <p style="color: #c89485; font-size: 12px; margin: 0;">We look forward to celebrating our special day with you!</p>
        </div>
      </div>
    </div>`;

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: emailUser, pass: emailPassword },
        socketTimeout: 10_000,
      });
      await transporter.sendMail({
        from: fromAddress,
        to: guest.email,
        subject: "King-David & Esther Wedding - Access Card Approved ✅",
        text: `Hello ${fullName},\n\nYour RSVP has been approved! Your entry code is: ${entryCode}\n\nVenue: Camp Young, Ede\nDate: Saturday, 22 August 2026 · 10:00 AM\n\nPresent your entry code at the entrance.\n\nWith love,\nKing-David & Esther`,
        html: htmlBody,
      });
      transporter.close();
    } catch (e) {
      console.error("Failed to send approval email:", e);
    }
  }

  return { ok: true, fullName: guest.full_name, phone: guest.phone || "", entryCode };
}
