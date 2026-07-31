import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { approveGuest } from "../../../lib/telegram";

const ADMIN_PASSWORD = "KDE-admin2026";

function unauthorized() {
  return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
}

function parseNote(note: string | null): { checked_in?: boolean; checked_in_at?: string; original?: string; approved?: boolean; attending?: string } {
  if (!note) return {};
  try {
    const parsed = JSON.parse(note);
    if (typeof parsed === "object") {
      return parsed;
    }
  } catch {}
  return { original: note };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) return unauthorized();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: true, guests: [], message: "Supabase not configured" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("rsvp_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  // Parse check-in status from note field
  const guests = (data ?? []).map((g: any) => {
    const meta = parseNote(g.note);
    return {
      ...g,
      checked_in: meta.checked_in ?? false,
      checked_in_at: meta.checked_in_at ?? null,
      // Approved if note says approved OR has an entry code (entry codes only generated on approval)
      approved: meta.approved === true || !!g.entry_code,
      attending: meta.attending ?? (!!g.entry_code ? "yes" : "pending"),
      note: meta.original ?? null,
    };
  });

  return NextResponse.json({ ok: true, guests });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) return unauthorized();

  let body: { resetAll?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  if (!body.resetAll) {
    return NextResponse.json({ ok: false, message: "Missing resetAll" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, message: "Supabase not configured" }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  // Fetch all guests' notes
  const { data: allGuests, error: fetchError } = await supabase
    .from("rsvp_submissions")
    .select("id, note");

  if (fetchError) {
    return NextResponse.json({ ok: false, message: fetchError.message }, { status: 500 });
  }

  // Reset checked_in and checked_in_at in each note — NEVER touches approved, entry codes, or wishes
  for (const guest of allGuests || []) {
    let meta: any = null;
    try { meta = JSON.parse(guest.note || ""); } catch { meta = null; }

    // Only convert if note is not valid JSON object
    if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
      meta = guest.note ? { original: guest.note } : {};
    }

    meta.checked_in = false;
    meta.checked_in_at = null;
    await supabase.from("rsvp_submissions").update({ note: JSON.stringify(meta) }).eq("id", guest.id);
  }

  return NextResponse.json({ ok: true, resetCount: allGuests?.length || 0 });
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) return unauthorized();

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ ok: false, message: "Missing id" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, message: "Supabase not configured" }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { error } = await supabase
    .from("rsvp_submissions")
    .delete()
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) return unauthorized();

  let body: { id?: string; checked_in?: boolean; approve_wish?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ ok: false, message: "Missing id" }, { status: 400 });
  }

  // Approve guest — uses lib function (checks capacity, generates entry code, sends email)
  if ((body as any).approve_guest) {
    const result = await approveGuest(body.id);
    if (result.ok) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }

  // Wish approval toggle — uses wish_approved (separate from guest approved)
  if ((body as any).wish_approved !== undefined) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ ok: false, message: "Supabase not configured" }, { status: 503 });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { data: existing } = await supabase.from("rsvp_submissions").select("note").eq("id", body.id).maybeSingle();
    if (!existing?.note) return NextResponse.json({ ok: false, message: "No note found" }, { status: 400 });

    try {
      const meta = JSON.parse(existing.note);
      meta.wish_approved = (body as any).wish_approved;
      await supabase.from("rsvp_submissions").update({ note: JSON.stringify(meta) }).eq("id", body.id);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false, message: "Invalid note format" }, { status: 400 });
    }
  }

  // Update attending status + clear entry code (used to convert a guest to wish-only)
  if ((body as any).attending !== undefined || (body as any).clear_entry_code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ ok: false, message: "Supabase not configured" }, { status: 503 });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const updates: any = {};
    if ((body as any).clear_entry_code) updates.entry_code = null;

    const { data: existing } = await supabase.from("rsvp_submissions").select("note").eq("id", body.id).maybeSingle();
    let meta: any = {};
    if (existing?.note) {
      try { meta = JSON.parse(existing.note); } catch { meta = {}; }
    }
    if ((body as any).attending !== undefined) {
      meta.attending = (body as any).attending;
    }
    if ((body as any).attending === "no") {
      meta.approved = false;
    }

    const { error } = await supabase.from("rsvp_submissions").update({ ...updates, note: JSON.stringify(meta) }).eq("id", body.id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Old approve_wish kept for backward compatibility
  if (body.approve_wish) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ ok: false, message: "Supabase not configured" }, { status: 503 });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { data: existing } = await supabase.from("rsvp_submissions").select("note").eq("id", body.id).maybeSingle();
    if (!existing?.note) return NextResponse.json({ ok: false, message: "No note found" }, { status: 400 });

    try {
      const meta = JSON.parse(existing.note);
      meta.approved = true;
      await supabase.from("rsvp_submissions").update({ note: JSON.stringify(meta) }).eq("id", body.id);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false, message: "Invalid note format" }, { status: 400 });
    }
  }

  if (body.checked_in === undefined) {
    return NextResponse.json({ ok: false, message: "Missing checked_in" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, message: "Supabase not configured" }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  // Fetch existing note
  const { data: existing } = await supabase
    .from("rsvp_submissions")
    .select("note")
    .eq("id", body.id)
    .maybeSingle();

  let meta: any = {};
  try { meta = JSON.parse(existing?.note || ""); } catch { meta = {}; }
  if (meta.checked_in !== undefined || meta.original !== undefined) {
    // Already JSON format, just update
  } else {
    // Store original note and add check-in data
    meta = { original: existing?.note || null };
  }
  meta.checked_in = body.checked_in;
  meta.checked_in_at = body.checked_in ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("rsvp_submissions")
    .update({ note: JSON.stringify(meta) })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
