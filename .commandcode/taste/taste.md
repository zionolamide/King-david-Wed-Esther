# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# audio
- Pause music/audio when tab loses visibility and resume from where it stopped when tab regains focus. Confidence: 0.75

# css
- Add `overflow-x: hidden` on all parent containers (html, body, section) when using `translateX(100%)` slide animations to prevent horizontal scroll overflow. Confidence: 0.70

# vercel
- Use inline HTML/SVG for access card/image generation instead of Node.js native `canvas` module, which crashes on Vercel serverless (no native binary support). Confidence: 0.80
