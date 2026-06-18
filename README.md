# King-David & Esther Wedding Website

Luxury one-page wedding website with mobile-first layout, RSVP capacity control, Supabase storage, and Resend email confirmations.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## RSVP Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Fill in:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RSVP_FROM_EMAIL`
5. Set `NEXT_PUBLIC_RSVP_LIMIT=100` or your preferred capacity.

The API endpoint uses the `register_wedding_rsvp` database function so the guest limit is enforced in the database with an advisory transaction lock.

## Image Assets

Place these files in `public/`:

- `garden-palette.jpg`: floral palette or bouquet image for the hero and visual accents.

The pre-wedding gallery currently uses elegant placeholders. When the real
pre-wedding photos are ready, add them to `public/` and replace the placeholder
cards in `app/page.tsx`.
