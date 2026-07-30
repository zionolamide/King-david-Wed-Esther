import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return <div className="flex min-h-screen items-center justify-center bg-ivory p-6"><p className="text-sm text-ink/60">Server configuration error</p></div>;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data: guest } = await supabase
    .from("rsvp_submissions")
    .select("title, full_name, entry_code, note")
    .eq("entry_code", code)
    .maybeSingle();

  if (!guest) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
        <div className="max-w-sm text-center">
          <p className="font-serif text-3xl text-wine">Access Card</p>
          <p className="mt-3 text-sm text-ink/60">Access card not found or still pending approval.</p>
        </div>
      </main>
    );
  }

  let approved = false;
  try {
    const meta = JSON.parse(guest.note || "{}");
    approved = meta.approved === true;
  } catch {}

  if (!approved) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
        <div className="max-w-sm text-center">
          <p className="font-serif text-3xl text-wine">Access Card</p>
          <p className="mt-3 text-sm text-ink/60">Your access card is still pending approval.</p>
        </div>
      </main>
    );
  }

  const title = guest.title;
  const fullName = guest.full_name;
  const displayName = title && title !== "(No Prefix)" ? `${title} ${fullName}` : fullName;
  const entryCode = guest.entry_code;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory p-4 sm:p-6" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <div id="access-card" style={{ width: 'min(100%,600px)', display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '2px solid #eadfc9', background: '#fff', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ background: 'linear-gradient(135deg,#6e0d1b,#c9785e)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', textAlign: 'center' }}>
          <img src="/monograms.png" alt="Monogram" style={{ width: '80px', height: '80px', marginBottom: '10px', objectFit: 'contain', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', padding: '8px' }} />
          <div style={{ fontSize: '22px', color: '#FFF8EF', lineHeight: 1.2 }}>King-David &amp; Esther</div>
          <div style={{ marginTop: '4px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(234,223,201,0.7)' }}>Wedding Access Pass</div>
        </div>
        <div style={{ background: '#fbf6ed', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'rgba(234,223,201,0.4)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6e0d1b', marginBottom: '2px' }}>Guest</div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: '16px', color: '#2f3a22', wordBreak: 'break-word' }}>{displayName}</div>
            </div>
            <div style={{ background: 'rgba(234,223,201,0.4)', borderRadius: '8px', padding: '12px', textAlign: 'right' }}>
              <div style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6e0d1b', marginBottom: '2px' }}>Entry Code</div>
              <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', color: '#2f3a22' }}>{entryCode}</div>
            </div>
          </div>
          <div style={{ background: 'rgba(235,194,187,0.2)', border: '1px solid rgba(235,194,187,0.3)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6e0d1b', marginBottom: '2px' }}>Event Details</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: '16px', color: '#2f3a22' }}>Camp Young, Ede</div>
            <div style={{ fontSize: '11px', color: 'rgba(45,36,31,0.6)' }}>Saturday, 22 August 2026 · 10:00 AM</div>
          </div>
          <div style={{ display: 'flex', gap: '2px', borderRadius: '3px', overflow: 'hidden' }}>
            {["#6f7a57","#6e0d1b","#8b5a46","#c9785e","#d7a79c","#ebc2bb"].map((c,i) => <div key={i} style={{flex:1, height:'5px', background:c}} />)}
          </div>
          <div style={{ textAlign: 'center', fontSize: '7px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(45,36,31,0.4)' }}>1 Adult · Non-transferable</div>
        </div>
      </div>
      <button onClick={() => window.print()} style={{ marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#6e0d1b', color: '#FFF8EF', padding: '12px 28px', border: 'none', borderRadius: '999px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', cursor: 'pointer' }}>
        🖨️ Print / Save PDF
      </button>
      <p style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(45,36,31,0.4)', textAlign: 'center' }}>Present this card at the entrance on August 22, 2026</p>
    </main>
  );
}
