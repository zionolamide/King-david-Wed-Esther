# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# audio
- Pause music/audio when tab loses visibility and resume from where it stopped when tab regains focus. Confidence: 0.75

# css
- Add `overflow-x: hidden` on all parent containers (html, body, section) when using `translateX(100%)` slide animations to prevent horizontal scroll overflow. Confidence: 0.70

# vercel
- Use inline HTML/SVG for access card/image generation instead of Node.js native `canvas` module, which crashes on Vercel serverless (no native binary support). Confidence: 0.80

# email
- Send notification email to the couple's `EMAIL_USER` when a guest RSVPs (guest name, entry code, contact details) and when a guest is checked in at the venue. Confidence: 0.85

# admin
- Hardcode admin password as a constant string (e.g., `ADMIN_PASSWORD = "KDE-admin2026"`) in the admin page and API routes; do not use process.env fallbacks to avoid environment variable confusion across deployments. Confidence: 0.80

# curtain
- Use deep red velvet curtain with simple fabric-matching tie-backs (no gold/brass metallic ties) — dark wine/terracotta gradient with subtle vertical pleat stripes for a realistic fabric look. Confidence: 0.70
