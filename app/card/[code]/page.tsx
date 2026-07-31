"use client";

import { useEffect, useState, use, useRef } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";

export default function CardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const cardRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<{ title?: string; fullName: string; entryCode: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/access-card?code=${code}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData({ title: json.title, fullName: json.fullName, entryCode: json.entryCode });
        else setError(json.message || "Card not found");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [code]);

  async function downloadCard() {
    const card = cardRef.current;
    if (!card) return;
    try {
      const dataUrl = await toPng(card, { quality: 1, pixelRatio: 2, backgroundColor: "#fbf6ed" });
      const link = document.createElement("a");
      link.download = `KDE2026-${data?.entryCode || "card"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      window.print();
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory">
        <p className="text-sm text-ink/60 animate-pulse">Loading your card...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
        <div className="max-w-sm text-center">
          <p className="font-serif text-3xl text-wine">Access Card</p>
          <p className="mt-3 text-sm text-ink/60">{error || "Card not available"}</p>
        </div>
      </main>
    );
  }

  const displayName = data.title && data.title !== "(No Prefix)" ? `${data.title} ${data.fullName}` : data.fullName;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory p-4 sm:p-6">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">King-David &amp; Esther&rsquo;s Wedding</p>
        <h1 className="mt-1 font-serif text-2xl text-moss">{displayName}</h1>
        <p className="mt-1 text-sm text-ink/50">Your Wedding Access Card</p>
      </div>

      <div ref={cardRef} id="access-card" style={{width:'min(100%,600px)', margin:'0 auto', display:'flex', flexDirection:'column', borderRadius:'12px', border:'2px solid #eadfc9', background:'#fff', overflow:'hidden', boxShadow:'0 8px 30px rgba(0,0,0,0.1)'}}>
        <div style={{background:'linear-gradient(135deg,#6e0d1b,#c9785e)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'clamp(16px, 4vw, 36px)', textAlign:'center'}}>
          <img src="/monograms.png" alt="Monogram" style={{width:'min(80px, 30%)', aspectRatio:'1/1', objectFit:'contain', marginBottom:'clamp(4px, 1vw, 10px)'}} />
          <div style={{fontFamily:'Georgia,serif', fontSize:'clamp(14px, 3.5vw, 22px)', color:'#FFF8EF', lineHeight:'1.2'}}>King-David &amp; Esther</div>
          <div style={{marginTop:'clamp(2px, 0.5vw, 5px)', fontSize:'clamp(7px, 1.5vw, 10px)', fontWeight:'600', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(234,223,201,0.7)'}}>Wedding Access Card</div>
        </div>
        <div style={{background:'#fbf6ed', display:'flex', flexDirection:'column', justifyContent:'center', gap:'clamp(8px, 1.5vw, 16px)', padding:'clamp(12px, 2.5vw, 24px)'}}>
          <div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(6px, 1vw, 12px)', marginBottom:'clamp(8px, 1.5vw, 14px)'}}>
              <div style={{background:'rgba(234,223,201,0.4)', borderRadius:'8px', padding:'clamp(8px, 1.5vw, 14px)'}}>
                <div style={{fontSize:'clamp(7px, 1.3vw, 9px)', fontWeight:'600', letterSpacing:'0.18em', textTransform:'uppercase', color:'#6e0d1b', marginBottom:'2px'}}>Guest</div>
                <div style={{fontFamily:'Georgia,serif', fontSize:'clamp(13px, 2.5vw, 18px)', color:'#2f3a22', wordBreak:'break-word'}}>{displayName}</div>
              </div>
              <div style={{background:'rgba(234,223,201,0.4)', borderRadius:'8px', padding:'clamp(8px, 1.5vw, 14px)', textAlign:'right'}}>
                <div style={{fontSize:'clamp(7px, 1.3vw, 9px)', fontWeight:'600', letterSpacing:'0.18em', textTransform:'uppercase', color:'#6e0d1b', marginBottom:'2px'}}>Entry Code</div>
                <div style={{fontFamily:'monospace', fontSize:'clamp(14px, 2.8vw, 20px)', fontWeight:'bold', color:'#2f3a22'}}>{data.entryCode}</div>
              </div>
            </div>
            <div style={{background:'rgba(235,194,187,0.2)', border:'1px solid rgba(235,194,187,0.3)', borderRadius:'8px', padding:'clamp(8px, 1.5vw, 14px)'}}>
              <div style={{fontSize:'clamp(7px, 1.3vw, 9px)', fontWeight:'600', letterSpacing:'0.18em', textTransform:'uppercase', color:'#6e0d1b', marginBottom:'2px'}}>Event Details</div>
              <div style={{fontFamily:'Georgia,serif', fontSize:'clamp(13px, 2.5vw, 18px)', color:'#2f3a22'}}>Camp Young, Ede</div>
              <div style={{fontSize:'clamp(9px, 1.8vw, 12px)', color:'rgba(45,36,31,0.6)'}}>Saturday, 22 August 2026 · 10:00 AM</div>
            </div>
          </div>
          <div>
            <div style={{marginTop:'clamp(6px, 1vw, 10px)', display:'flex', gap:'2px', borderRadius:'3px', overflow:'hidden'}}>
              {["#6f7a57","#6e0d1b","#8b5a46","#c9785e","#d7a79c","#ebc2bb"].map((c,i) => (<div key={i} style={{flex:1, height:'clamp(4px, 0.8vw, 6px)', background:c}} />))}
            </div>
            <div style={{marginTop:'clamp(5px, 0.8vw, 8px)', textAlign:'center', fontSize:'clamp(6px, 1vw, 8px)', fontWeight:'600', letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(45,36,31,0.4)'}}>1 Adult · Non-transferable</div>
          </div>
        </div>
      </div>

      <button
        onClick={downloadCard}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-wine px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-ivory shadow-soft transition hover:bg-wine/90"
      >
        <Download size={16} /> Download PNG
      </button>

      <p className="mt-4 text-xs text-ink/40">Present this card at the entrance on August 22, 2026</p>
    </main>
  );
}
