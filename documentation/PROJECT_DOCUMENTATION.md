# King-David & Esther Wedding Website — Project Documentation

## 1. Project Purpose
This repository contains a **luxury one-page wedding website** for *King-David & Esther*. The site provides:
- A mobile-first **curtain-opening hero experience**
- A **wedding date reveal** interaction
- A multi-section invitation (story, gallery placeholders, wedding details, dress code, gifts, RSVP)
- An **RSVP system** with **capacity enforcement** using **Supabase** (Postgres function + advisory lock)
- Optional **email confirmations** using **Nodemailer**

---

## 2. Tech Stack
### Frontend
- **Next.js 14 (App Router)**  
- **React 18**
- **TypeScript**
- **Tailwind CSS** (with custom theme tokens)
- **framer-motion** (curtain animation and other motion effects)
- **lucide-react** (icons)

### Backend
- **Next.js Route Handler**: `POST /api/rsvp`
- **Supabase** via `@supabase/supabase-js`
- **Supabase RPC**: `public.register_wedding_rsvp`
- **Nodemailer** (optional) for sending RSVP confirmation emails

---

## 3. Repository Layout
### Key files
- `README.md`  
  Setup instructions, env var requirements, and RSVP capacity enforcement description.
- `package.json`  
  Dependencies and scripts.
- `app/layout.tsx`  
  Page metadata and font configuration (Next Font Google).
- `app/globals.css`  
  Global styles + custom invitation animation styles + form input styling.
- `app/page.tsx`  
  Main single-page UI and the RSVP form handler.
- `app/api/rsvp/route.ts`  
  RSVP API endpoint implementation.
- `supabase/schema.sql`  
  Database schema + the `register_wedding_rsvp` RPC.
- `public/garden-palette.jpg`  
  Background/hero artwork used in the design.

---

## 4. Frontend — Page Architecture (`app/page.tsx`)
### Components (in-file)
`app/page.tsx` defines several UI components, including:
- **Curtain hero** (`CurtainHero`)
  - Two animated curtain panels using Framer Motion
  - “Tap to Open” button triggers `opened` state
- **Invitation visual sections**
  - Story section
  - Pre-wedding gallery placeholders
  - Wedding details
  - Dress code styling
  - Gifts
- **RSVP section**
  - Contains the RSVP form and the `submitRsvp` handler

### RSVP Submission Flow (Frontend)
1. User fills the RSVP form.
2. `submitRsvp(event)` collects values from `FormData`.
3. It builds a JSON payload and calls:
   - `fetch("/api/rsvp", { method: "POST", ... })`
4. UI updates:
   - `loading` while request is running
   - `success` on `{ ok: true }`
   - `closed` on HTTP `409`
   - `error` on any non-OK response

---

## 5. Backend — RSVP API (`app/api/rsvp/route.ts`)
### Endpoint
**POST** `/api/rsvp`

### Input Contract
The API expects JSON body fields:
- `fullName` (string) — required
- `email` (string) — required, must be valid email format
- `phone` (string | empty) — optional
- `attendees` (number) — integer clamped to 1..10
- `attending` (`"yes" | "no"`) — converts to boolean
- `note` (string | empty) — optional

### Processing Steps
1. Reads environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Validates JSON body and required values:
   - checks `fullName`
   - checks `email` format
3. Normalizes payload:
   - lowercases email
   - trims optional fields
   - computes `attending` boolean
   - clamps `attendees` within allowed range
4. Calls Supabase RPC:
   - `supabase.rpc("register_wedding_rsvp", { ... })`
5. Handles RPC output:
   - if RPC returns `status === "closed"` → HTTP **409**
6. Optional email:
   - if `EMAIL_USER` and `EMAIL_APP_PASSWORD` are present, sends a confirmation email via Nodemailer

### Output
- On success:
  - `200` with: `{ ok: true, remaining: number|null }`
- On closed/capacity:
  - `409` with: `{ message: "RSVP Closed - Capacity Reached" }`
- On invalid request:
  - `400` with validation message
- On missing Supabase config:
  - `503` with message

---

## 6. Supabase — Schema + Capacity Enforcement (`supabase/schema.sql`)
### Table: `public.wedding_rsvps`
- `id` UUID primary key
- `full_name` text not null
- `email` text not null
- `phone` text (nullable)
- `attendees` integer default 0 with check constraint 0..10
- `attending` boolean default true
- `note` text nullable
- `created_at` timestamp

### RPC Function: `public.register_wedding_rsvp`
**Important design goal:** prevent overbooking under concurrent submissions.

The function:
1. Calls:
   - `pg_advisory_xact_lock(20260822)`
2. Computes current accepted total by summing `attendees` where `attending = true`.
3. If capacity exceeded:
   - returns `{"status":"closed","remaining":...}`
4. Otherwise inserts the RSVP row and returns:
   - `{"status":"accepted","remaining":...}`

---

## 7. Styling & Assets
### Fonts
`app/layout.tsx` uses:
- `Cormorant_Garamond`
- `Great_Vibes`
- `Montserrat`

### Visual Assets
- `public/garden-palette.jpg` used for:
  - hero background overlays

### Custom Classes
`app/globals.css` includes:
- form input styles (`.field`, `.label`)
- animation helpers for invitation components
- background gradients and section layout constraints (`.section-shell`)
- invitation-border style tokens

---

## 8. Environment Variables (as described in README)
You must configure:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EMAIL_USER` (Gmail address for Nodemailer)
- `EMAIL_APP_PASSWORD` (app password for Gmail SMTP)
- `NEXT_PUBLIC_RSVP_LIMIT` (capacity)

---

## 9. Local Run Instructions
1. Install dependencies:
   - `npm install`
2. Start development server:
   - `npm run dev`
3. Configure environment:
   - copy `.env.example` → `.env.local`
4. Run Supabase SQL:
   - execute `supabase/schema.sql` in Supabase SQL editor

---

## 10. GitHub + Vercel Readiness (Answer)
### Is it set up to push to GitHub?
Yes—this is a normal Node/Next.js project with:
- `package.json` present
- build scripts (`dev`, `build`, `start`, `lint`)

However, a GitHub repo is not created yet from within this environment. You will:
- initialize git locally
- create a GitHub repository
- push the code

### Is it suitable for Vercel?
Yes, **as long as you set Vercel environment variables** in the Vercel dashboard:
- Supabase keys
- Gmail SMTP credentials (`EMAIL_USER`, `EMAIL_APP_PASSWORD`)
- RSVP limit

Vercel will build using `next build` by default.

---

## 11. Important Note About Your Latest Requested RSVP Form Change
You requested a new RSVP form design:
- Required: Fullname, Email, Whatsapp number, Number of quest
- Optional: Message
- Add: Names of additional quest
- Remove: “Attendance/attending” (and do not include it)

This is NOT yet implemented in the code/documentation snapshot contained in this project state.
If you want, I can update the form + API payload contract next, so it remains consistent end-to-end (frontend form fields → API handler → Supabase RPC insert).
