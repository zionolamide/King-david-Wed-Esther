import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ADMIN_PASSWORD = "KDE-admin2026";

function unauthorized() {
  return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
}

function parseNote(note: string | null): { checked_in?: boolean; checked_in_at?: string; original?: string } {
  if (!note) return {};
  try {
    const parsed = JSON.parse(note);
    if (typeof parsed === "object" && ("checked_in" in parsed || "original" in parsed)) {
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
      note: meta.original ?? null,
    };
  });

  return NextResponse.json({ ok: true, guests });
}

export async function PATCH(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) return unauthorized();

  let body: { id?: string; checked_in?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  if (!body.id || body.checked_in === undefined) {
    return NextResponse.json({ ok: false, message: "Missing id or checked_in" }, { status: 400 });
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
