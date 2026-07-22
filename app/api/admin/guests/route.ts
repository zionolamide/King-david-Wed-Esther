import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ADMIN_PASSWORD = "KDE-admin2026";

function unauthorized() {
  return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) return unauthorized();

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      ok: true,
      guests: [],
      message: "Supabase not configured — showing empty list"
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase
    .from("rsvp_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, guests: data ?? [] });
}

export async function PATCH(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) return unauthorized();

  let body: { id?: number; checked_in?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  if (!body.id || body.checked_in === undefined) {
    return NextResponse.json({ ok: false, message: "Missing id or checked_in" }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: true, message: "Simulated — no Supabase configured" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { error } = await supabase
    .from("rsvp_submissions")
    .update({ checked_in: body.checked_in, checked_in_at: body.checked_in ? new Date().toISOString() : null })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
