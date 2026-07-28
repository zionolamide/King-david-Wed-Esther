import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generateAccessCardImage } from "../../lib/access-card";

type AccessCardRequest = {
  fullName: string;
  entryCode: string;
  attendees: number;
  phone?: string;
  whatsappContacts?: Array<{ name: string; phone: string }>;
};

// GET — lookup guest by entry code (used by /card/[code] page)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ ok: false, message: "Missing code parameter" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, message: "Server configuration error" }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data: guest } = await supabase
    .from("rsvp_submissions")
    .select("title, full_name, entry_code")
    .eq("entry_code", code)
    .maybeSingle();

  if (!guest) {
    return NextResponse.json({ ok: false, message: "Access card not found" }, { status: 404 });
  }

  // Check if guest is approved
  const { data: noteData } = await supabase
    .from("rsvp_submissions")
    .select("note")
    .eq("entry_code", code)
    .maybeSingle();

  let approved = false;
  if (noteData?.note) {
    try {
      const meta = JSON.parse(noteData.note);
      approved = meta.approved === true;
    } catch {}
  }

  if (!approved) {
    return NextResponse.json({ ok: false, message: "Your access card is still pending approval." }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    title: guest.title,
    fullName: guest.full_name,
    entryCode: guest.entry_code,
  });
}

export async function POST(request: Request) {
  let payload: AccessCardRequest;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request payload." }, { status: 400 });
  }

  if (!payload.fullName || !payload.entryCode || !payload.attendees) {
    return NextResponse.json({ ok: false, message: "Missing required card data." }, { status: 400 });
  }

  try {
    const imageBuffer = await generateAccessCardImage(payload);
    // Convert Node Buffer to ArrayBuffer slice compatible with Web Response
    return new Response(imageBuffer as unknown as Blob, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="KDE2026-access-card.png"`,
      },
    });
  } catch (error) {
    console.error("Access card generation error:", error);
    return NextResponse.json({ ok: false, message: "Failed to generate access card." }, { status: 500 });
  }
}
