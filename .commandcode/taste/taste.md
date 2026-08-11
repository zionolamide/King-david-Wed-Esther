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
- When email is optional in the RSVP form, store empty email as `null` (not `""`), because the DB `email` column has UNIQUE constraint — two guests leaving email blank would otherwise collide and throw a "duplicate" error. Also add a WhatsApp-number duplicate check as a more practical duplicate-guard than email. Confidence: 0.80
- Use the exact same access card design (same monogram, same layout, same colors, all decorative elements) in the email HTML body as the one shown on the website for download; do not generate a different design. Confidence: 0.80

# admin
- Hardcode admin password as a constant string (e.g., `ADMIN_PASSWORD = "KDE-admin2026"`) in the admin page and API routes; do not use process.env fallbacks to avoid environment variable confusion across deployments. Confidence: 0.80

# curtain
- Use deep red velvet curtain with simple fabric-matching tie-backs (no gold/brass metallic ties) — dark wine/terracotta gradient with subtle vertical pleat stripes for a realistic fabric look. Confidence: 0.70

# access-card
- When downloading the access card as PNG via html-to-image, set background to white before capture (then restore) to prevent transparent/white-wash background artifacts. Confidence: 0.70
- Within the access card's visual design itself, the card title text should read "Wedding Access Card" (not just "Access Card") — the user specifically wants "Wedding" included in the card's in-design text. Confidence: 0.65

# rsvp
- For long full names on the access card, do not use ellipsis/truncation ("..."); instead, use the vertical portrait layout (which gives more width for text) plus a maxLength of 50 characters on the input field to keep the design clean. Confidence: 0.70
- Make the email field optional (not required) in the RSVP form for guests who don't have email addresses; send their access card via WhatsApp instead. Confidence: 0.75
- The live Supabase `rsvp_submissions` table cannot easily have new columns applied (schema.sql is not auto-applied) — store extended/mutable guest-state fields (attending, approved, wish, wish_approved, checked_in) inside the existing `note` JSON column rather than adding DB columns. Confidence: 0.65

# rsvp
- Show a different user-facing success message for attending guests vs. non-attending (wish-only) guests: wish-only submitters should NOT see a "pending approval" message, but instead a distinct message appropriate to a guest who just sent a wish. Confidence: 0.65

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

# nextjs
- Use HTML entities (`&rsquo;`, `&apos;`, etc.) instead of raw apostrophes/quotes/quotation marks in JSX text content — `next build` enforces `react/no-unescaped-entities` as an error and fails the build otherwise. Confidence: 0.70

# git
- Run `npm run build` to verify a successful production build before committing and pushing changes to git. Confidence: 0.60

# admin
See [admin/taste.md](admin/taste.md)
