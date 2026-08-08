import { NextResponse } from "next/server";
import { approveGuest, approveGuestWish } from "../../lib/telegram";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const LIVE_URL = "https://king-david-wed-esther.vercel.app";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || LIVE_URL;
}

// GET handles webhook setup and testing via browser
export async function GET(request: Request) {
  const url = new URL(request.url);
  const setToken = url.searchParams.get("set");
  const getChatId = url.searchParams.get("chatid");
  const manualId = url.searchParams.get("approve");

  if (setToken && setToken.length > 10) {
    const webhookUrl = `${getBaseUrl()}/api/telegram`;
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

      // Helper to edit the button to Approved state
      async function markDone(message: any, label: string) {
        if (message?.message_id && message?.chat?.id && BOT_TOKEN) {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: message.chat.id,
              message_id: message.message_id,
              reply_markup: {
                inline_keyboard: [[{ text: label, callback_data: `done:0` }]],
              },
            }),
          });
        }
      }

      // CASE 1: Approve guest (RSVP only, no wish publish)
      if (data?.startsWith("approve:")) {
        const guestId = data.split(":")[1];
        const result = await approveGuest(guestId);

        if (BOT_TOKEN) {
          const alreadyApproved = result.alreadyApproved === true;
          await markDone(update.callback_query.message, alreadyApproved ? "✅ Approved" : "✅ Approved");

          const msg = alreadyApproved
            ? `Already approved — no duplicate email sent.`
            : result.ok
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

          if (result.ok && !alreadyApproved) {
            // Build WhatsApp click-to-chat link
            const cardUrl = `${getBaseUrl()}/card/${result.entryCode}`;
            let phone = (result.phone || "").trim();
            if (phone.startsWith("0")) phone = "234" + phone.slice(1);
            else if (phone.startsWith("+")) phone = phone.slice(1);
            phone = phone.replace(/[^0-9]/g, "");
            const waNumber = phone || "";
            const waText = encodeURIComponent(cardUrl);
            const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : null;

            const replyMsg = waLink
              ? {
                  chat_id: from.id,
                  text: `✅ ${result.fullName} — APPROVED\n📧 Access card sent via email`,
                  reply_markup: {
                    inline_keyboard: [[{ text: "📱 Send via WhatsApp", url: waLink }]],
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

      // CASE 2: Approve guest AND publish their wish (attending guest with wish)
      if (data?.startsWith("approve_wish:")) {
        const guestId = data.split(":")[1];
        const result = await approveGuest(guestId);

        if (BOT_TOKEN) {
          const alreadyApproved = result.alreadyApproved === true;
          await markDone(update.callback_query.message, alreadyApproved ? "✅ Approved" : "✅ Approved");

          // Also publish the wish
          let wishMsg = " — wish not found";
          if (result.ok) {
            const wishResult = await approveGuestWish(guestId);
            wishMsg = wishResult.ok
              ? (wishResult.alreadyApproved ? " (wish was already published)" : " and wish published 💌")
              : " (wish failed to publish)";
          }

          const msg = alreadyApproved
            ? `Already approved — no duplicate email${wishMsg}.`
            : result.ok
              ? `✅ Approved! Access card email sent${wishMsg}.`
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

          if (result.ok && !alreadyApproved) {
            const cardUrl = `${getBaseUrl()}/card/${result.entryCode}`;
            let phone = (result.phone || "").trim();
            if (phone.startsWith("0")) phone = "234" + phone.slice(1);
            else if (phone.startsWith("+")) phone = phone.slice(1);
            phone = phone.replace(/[^0-9]/g, "");
            const waNumber = phone || "";
            const waText = encodeURIComponent(cardUrl);
            const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : null;

            const replyMsg = waLink
              ? {
                  chat_id: from.id,
                  text: `✅ ${result.fullName} — APPROVED & WISH PUBLISHED 💌\n📧 Access card sent via email`,
                  reply_markup: {
                    inline_keyboard: [[{ text: "📱 Send via WhatsApp", url: waLink }]],
                  },
                }
              : {
                  chat_id: from.id,
                  text: `✅ ${result.fullName} — APPROVED & WISH PUBLISHED 💌\n📧 Access card sent via email\n⚠️ No phone number saved — check form`,
                };

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(replyMsg),
            });
          }
        }
      }

      // CASE 3: Approve wish-only guest (publish their wish, no card)
      if (data?.startsWith("wishonly:")) {
        const guestId = data.split(":")[1];
        const result = await approveGuestWish(guestId);

        if (BOT_TOKEN) {
          await markDone(update.callback_query.message, "✅ Wish Approved");

          const msg = result.ok
            ? (result.alreadyApproved ? "Wish was already approved." : "✅ Wish published to website!")
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
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: false, message: "Internal error" }, { status: 500 });
  }
}
