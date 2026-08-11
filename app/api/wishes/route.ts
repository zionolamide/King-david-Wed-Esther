import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: true, wishes: [] });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("rsvp_submissions")
    .select("full_name, title, note")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  // Extract approved wishes from note field (wish_approved = true, not just approved)
  const wishes = (data ?? [])
    .map((g: any) => {
      try {
        const meta = JSON.parse(g.note || "{}");
        if (meta.wish && meta.wish_approved) {
          const title = g.title && g.title !== "(No Prefix)" ? `${g.title} ` : "";
          return { name: title + g.full_name, wish: meta.wish };
        }
      } catch {}
      return null;
    })
    .filter(Boolean);

  return NextResponse.json({ ok: true, wishes });
}
