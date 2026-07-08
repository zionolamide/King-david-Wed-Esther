# Project Section Overview and Technical Summary

## Repository sync confirmation
- Local branch: `main`
- Current commit: `c29beed`
- Remote branch: `origin/main`
- The local files are committed and pushed to GitHub.
- Current code is built and verified locally.

> Note: This file is temporary documentation of the current app structure, page sections, and tech stack.

---

## High-level project structure
- `app/` - active Next.js App Router source.
- `app/page.tsx` - main landing page and RSVP experience.
- `app/api/rsvp/route.ts` - RSVP POST API endpoint.
- `app/lib/access-card.ts` - access card image generator.
- `app/globals.css` - global styles including curtain, scratch card, and animations.
- `public/` - static assets used by the page.

---

## Main page sections

### Navigation
- Fixed top navigation bar.
- Anchors to `#home` and `#rsvp`.
- Uses a condensed serif brand title and RSVP button.

### Hero with curtain
- `CurtainHero` component creates a full-screen curtain experience.
- Includes:
  - animated curtain panels
  - floating petals background
  - top valance bar
  - closed curtain preview card with open button
- Behavior:
  - when curtain is closed, `document.body.style.overflow = "hidden"` prevents page scrolling
  - only the `Tap to Open` button is visible and interactive
  - once opened, the hero content appears with fade/scale animation
- Hero content:
  - `King David & Esther` headline
  - event date `22 · August · 2026`
  - invitation CTA buttons to reveal date and venue details
  - countdown card showing days/hours/minutes/seconds

### Date reveal / scratch card
- `DateRevealSection` holds the scratch card invitation.
- `ScratchDateCard` component shows:
  - `Wedding Date`
  - `Saturday, 22 August 2026`
- Scratch logic:
  - user taps or drags to increment `progress`
  - card reveals decorative ribbon burst once fully scratched
- Only the date is shown before reveal; venue text is intentionally removed from the scratch UI.

### Our Story
- Text section explaining the couple's journey.
- Uses `StoryArch` image styling and editorial copy.
- Includes a soft headline and paragraph about gratitude and celebration.

### Pre-Wedding Portraits
- Grid of three portrait image cards:
  - `Garden Walk`
  - `Soft Portrait`
  - `Evening Promise`
- Each card uses an image overlay, gradient, and editorial label.
- Styled as soft, modern gallery placeholders.

### Wedding Details
- Details section with event information.
- Includes three info cards for:
  - Date
  - Venue
  - Reception
- Also contains the order of celebration schedule:
  - `11:00 AM` — `Wedding ceremony`
  - `Immediately after` — `Reception celebration`
- Embedded Google Map with directions link.

### Dress Code
- `Formal Garden Elegance` guidance.
- Two stylized attire panels:
  - Ladies
  - Gentlemen
- Uses palette chips and illustration elements.

### Gifts
- Gift guidance section.
- Two bank account contact cards:
  - `King-David Duruihuoma` — `Guaranty Trust Bank` — `0012782278`
  - `Blessing Timehin` — `Access Bank` — `0733934621`

### Guest Notice
- Adults-only notice section.
- Explains limited space and requests children remain at home.

### RSVP
- RSVP form section with explanatory copy.
- Shows RSVP inquiry WhatsApp contacts.
- RSVP contact buttons are phone links.
- RSVP form fields:
  - Title
  - Full name
  - Email
  - WhatsApp number
  - Message (optional)
  - adult-only agreement checkbox
- Form submission logic sends JSON to `/api/rsvp`.
- Form states:
  - idle
  - loading
  - success
  - closed
  - error

---

## Access card and RSVP flow

### API route: `app/api/rsvp/route.ts`
- Accepts POST JSON payload with:
  - `title`
  - `fullName`
  - `email`
  - `phone`
  - `note`
  - `adultAgreement`
- Validates required fields and email format.
- Checks for existing RSVP by email.
- Generates a unique entry code using `crypto.randomBytes`.
- Stores the RSVP in Supabase.
- Sends confirmation email with an attached access card image if email credentials are configured.

### Access card generator: `app/lib/access-card.ts`
- Uses `canvas` to create a PNG image.
- Renders: 
  - `King David & Esther` header
  - wedding date
  - venue details
  - ceremony/reception details
  - `CHILDREN ARE NOT ALLOWED`
  - `NOT TRANSFERABLE`
  - full guest name
  - WhatsApp number from the RSVP form
  - unique entry code
  - `1 adult pass`
  - RSVP WhatsApp contact list
  - show card instruction line
- Image output is attached to the RSVP confirmation email.

---

## Tech stack
- Framework: `Next.js 14.2.35` (App Router)
- Language: `TypeScript`
- React: `18.3.1`
- Styling: Tailwind CSS via `app/globals.css` and custom utility classes
- Animations: `framer-motion`
- Email: `nodemailer`
- Database: `Supabase` via `@supabase/supabase-js`
- Image generation: `canvas`
- Icons: `lucide-react`
- Build tool: `next build`

---

## Notes
- Local current commit `c29beed` is the source of truth.
- Changes are pushed to GitHub on `main`.
- Current live Vercel deployment should reflect these latest updates if Vercel is configured to deploy from `main`.
- This temporary file is intentionally descriptive and can be deleted once you no longer need it.
