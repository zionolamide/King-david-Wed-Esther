import { NextResponse } from "next/server";
import { approveGuest } from "../../lib/telegram";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// GET handles webhook setup and testing via browser
export async function GET(request: Request) {
  const url = new URL(request.url);
  const setToken = url.searchParams.get("set");
  const getChatId = url.searchParams.get("chatid");
  const manualId = url.searchParams.get("approve");

  if (setToken && setToken.length > 10) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://king-david-wed-esther.vercel.app");
    const webhookUrl = `${siteUrl}/api/telegram`;
    const res = await fetch(`https://api.telegram.org/bot${setToken}/setWebhook?url=${webhookUrl}`);
    const data = await res.json();
    return NextResponse.json(data);
  }

  if (getChatId === "1" && BOT_TOKEN) {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const data = await res.json();
    return NextResponse.json(data);
  }

  if (manualId) {
    const result = await approveGuest(manualId);
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, message: "Use ?set=TOKEN, ?chatid=1, or ?approve=ID" });
}

export async function POST(request: Request) {
  // Normal Telegram webhook callback
  try {
    const update = await request.json();

    // Handle /start command — reply with chat ID
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;
      if (BOT_TOKEN) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ Bot active!\n\nYour chat ID: ${chatId}\n\nSet this as TELEGRAM_CHAT_ID in your Vercel environment variables.`,
          }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    // Handle button callback
    if (update.callback_query) {
      const { data, from } = update.callback_query;

      if (data?.startsWith("approve:")) {
        const guestId = data.split(":")[1];
        const result = await approveGuest(guestId);

        if (BOT_TOKEN) {
          const msg = result.ok
            ? `✅ Approved! Access card email sent.`
            : `❌ Failed: ${result.message}`;

          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: msg,
              show_alert: false,
            }),
          });

          if (result.ok) {
            // Build WhatsApp click-to-chat link
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://king-david-wed-esther.vercel.app");
            const cardUrl = `${baseUrl}/card/${result.entryCode}`;
            // Handle phone — strip special chars, keep digits
            let phone = (result.phone || "").trim();
            // If starts with 0 (local format), assume Nigeria → replace 0 with 234
            if (phone.startsWith("0")) phone = "234" + phone.slice(1);
            // Strip + if present
            else if (phone.startsWith("+")) phone = phone.slice(1);
            // Remove any remaining non-digits
            phone = phone.replace(/[^0-9]/g, "");
            const waNumber = phone || "";
            const waText = encodeURIComponent(cardUrl);
            const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : null;

            const replyMsg = waLink
              ? {
                  chat_id: from.id,
                  text: `✅ ${result.fullName} — APPROVED\n📧 Access card sent via email`,
                  reply_markup: {
                    inline_keyboard: [[
                      { text: "📱 Send via WhatsApp", url: waLink },
                    ]],
                  },
                }
              : {
                  chat_id: from.id,
                  text: `✅ ${result.fullName} — APPROVED\n📧 Access card sent via email\n⚠️ No phone number saved — check form`,
                };

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(replyMsg),
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: false, message: "Internal error" }, { status: 500 });
  }
}
