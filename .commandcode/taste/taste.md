# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# audio
- Pause music/audio when tab loses visibility and resume from where it stopped when tab regains focus. Confidence: 0.75

# css
- Add `overflow-x: hidden` on all parent containers (html, body, section) when using `translateX(100%)` slide animations to prevent horizontal scroll overflow. Confidence: 0.70

# vercel
- Use inline HTML/SVG for access card/image generation instead of Node.js native `canvas` module, which crashes on Vercel serverless (no native binary support). Confidence: 0.85

# access-card
- Use content-driven height (no fixed aspect ratio) for the access card — let the card be as tall as its content needs to be, with only a fixed width of 600px max. Confidence: 0.65
- All guests' access cards share the same visual design (same monogram, layout, colors, background, decorative elements like color lines) — only the text information (name, role, code) differs between guests. Confidence: 0.78

# email
- Send notification email to the couple's `EMAIL_USER` when a guest RSVPs, not just when they are checked in at the venue. Confidence: 0.70
- Use the exact same access card design (same monogram, same layout, same colors, all decorative elements) in the email HTML body as the one shown on the website for download; do not generate a different design. Confidence: 0.80

# admin
- Hardcode admin password as a constant string (e.g., `ADMIN_PASSWORD = "KDE-admin2026"`) in the admin page and API routes; do not use process.env fallbacks to avoid environment variable confusion across deployments. Confidence: 0.80

# curtain
- Use deep red velvet curtain with simple fabric-matching tie-backs (no gold/brass metallic ties) — dark wine/terracotta gradient with subtle vertical pleat stripes for a realistic fabric look. Confidence: 0.70

# access-card
- When downloading the access card as PNG via html-to-image, set background to white before capture (then restore) to prevent transparent/white-wash background artifacts. Confidence: 0.70

# rsvp
- For long full names on the access card, do not use ellipsis/truncation ("..."); instead, use the vertical portrait layout (which gives more width for text) plus a maxLength of 50 characters on the input field to keep the design clean. Confidence: 0.70
- Make the email field optional (not required) in the RSVP form for guests who don't have email addresses; send their access card via WhatsApp instead. Confidence: 0.75

# phone-input
- Use a country code dropdown (default +234 for Nigeria) combined with a phone number input using CSS grid (`grid-cols-[6rem_1fr]`) for responsive layout; store the full international number in the database. Confidence: 0.80
- For `wa.me` click-to-chat links, strip all non-digit characters, replace leading `0` with `234` (Nigerian default), else strip leading `+`, and use the digits as-is for the WhatsApp URL. Confidence: 0.80

# telegram
- Use Telegram bot with inline keyboards (callback_data) for admin approval workflows — when a guest RSVPs, send a message to the admin's Telegram with an inline "Approve" button, and handle the callback via webhook to approve the guest and send the access card email. Confidence: 0.75

# whatsapp
- Use WhatsApp click-to-chat links (`wa.me`) instead of the WhatsApp Cloud API or unofficial automation — no setup, no bans, no monthly fees. Confidence: 0.75
- Keep `wa.me` message text short — the URL includes the entire message text in the URL itself, and WhatsApp silently truncates messages that exceed its character limit when the user taps the link. Ideally send just the card URL alone (or at most ~110 chars of text) to stay under the ~250 char limit. Confidence: 0.75

# admin
- For the admin wishes tab, use a separate `wish_approved` field (not `approved`) so that approving a guest via Telegram does not auto-publish their wish to the website. Confidence: 0.85
- Add a "Delete" button (✕) on each guest in the admin panel so the admin can clean up test data. Confidence: 0.80
- Wish approval should be toggleable (Approve/Disapprove) so the admin can reverse a mistaken approval. Confidence: 0.80

# card-page
- For the public access card page (`/card/[code]`), use a client component that fetches guest data via `/api/access-card?code=...` and renders the card with a Download PNG button using `html-to-image`. The card page should check approval status and show "pending" if unapproved. Confidence: 0.75

# admin
- Before making UI/labeling changes, first explain your understanding of what the current confusing elements do, then propose a plan for how to rename/restructure them, and wait for user approval before implementing. Confidence: 0.75
- The "Reset Check-Ins" button must only reset check-in status (checked_in/checked_in_at); it must never touch approval status or entry codes. Confidence: 0.75
- Guest approval and access card generation should happen only via Telegram, not through the admin panel — remove/disable the Approve/Approve All functionality from the admin UI. Confidence: 0.75
