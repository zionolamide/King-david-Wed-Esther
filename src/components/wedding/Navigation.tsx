export function Navigation() {
  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b"
      style={{
        borderColor: 'rgba(255,255,255,0.3)',
        background: 'rgba(251,246,237,0.82)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="section-shell flex h-16 items-center justify-between">
        <a href="#home" className="font-serif text-lg text-moss sm:text-xl">
          King David &amp; Esther
        </a>
        <a
          href="#rsvp"
          className="inline-flex items-center gap-1.5 rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ivory shadow-soft transition hover:opacity-90"
        >
          RSVP
        </a>
      </div>
    </nav>
  );
}
