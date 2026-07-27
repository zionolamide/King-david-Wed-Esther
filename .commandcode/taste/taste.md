# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# audio
- Pause music/audio when tab loses visibility and resume from where it stopped when tab regains focus. Confidence: 0.75

# css
- Add `overflow-x: hidden` on all parent containers (html, body, section) when using `translateX(100%)` slide animations to prevent horizontal scroll overflow. Confidence: 0.70

# vercel
- Use inline HTML/SVG for access card/image generation instead of Node.js native `canvas` module, which crashes on Vercel serverless (no native binary support). Confidence: 0.85

# access-card
- Use fixed 600×1050 pixel dimensions with vertical (portrait) layout for the access card; enforce consistent aspect ratio that scales responsively on all devices. Confidence: 0.80
- All guests' access cards share the same visual design (same monogram, layout, colors, background) — only the text information (name, role, code) differs between guests. Confidence: 0.70

# email
- Send notification email to the couple's `EMAIL_USER` only when a guest is checked in at the venue (not when a guest RSVPs); guests receive the access card email. Confidence: 0.85
- Use the exact same access card design (same monogram, same layout, same colors) in the email HTML body as the one shown on the website for download; do not generate a different design. Confidence: 0.75

# admin
- Hardcode admin password as a constant string (e.g., `ADMIN_PASSWORD = "KDE-admin2026"`) in the admin page and API routes; do not use process.env fallbacks to avoid environment variable confusion across deployments. Confidence: 0.80

# curtain
- Use deep red velvet curtain with simple fabric-matching tie-backs (no gold/brass metallic ties) — dark wine/terracotta gradient with subtle vertical pleat stripes for a realistic fabric look. Confidence: 0.70

# access-card
- When downloading the access card as PNG via html-to-image, set background to white before capture (then restore) to prevent transparent/white-wash background artifacts. Confidence: 0.70

# rsvp
- For long full names on the access card, do not use ellipsis/truncation ("..."); instead, use the vertical portrait layout (which gives more width for text) plus a maxLength of 50 characters on the input field to keep the design clean. Confidence: 0.70
