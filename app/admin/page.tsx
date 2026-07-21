"use client";

import { useEffect, useState, useCallback } from "react";

const ADMIN_PASSWORD = "admin123";

type Guest = {
  id: number;
  title?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  entry_code: string;
  checked_in?: boolean | null;
  checked_in_at?: string | null;
  created_at: string;
  attending?: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guests", {
        headers: { authorization: `Bearer ${ADMIN_PASSWORD}` },
      });
      const data = await res.json();
      if (data.ok) setGuests(data.guests);
      else setMessage(data.message || "Failed to load");
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchGuests();
  }, [authed, fetchGuests]);

  async function toggleCheckIn(guest: Guest) {
    const newVal = !guest.checked_in;
    const res = await fetch("/api/admin/guests", {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${ADMIN_PASSWORD}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: guest.id, checked_in: newVal }),
    });
    const data = await res.json();
    if (data.ok) {
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guest.id
            ? { ...g, checked_in: newVal, checked_in_at: newVal ? new Date().toISOString() : null }
            : g
        )
      );
    } else {
      setMessage(data.message || "Update failed");
    }
  }

  const checkedIn = guests.filter((g) => g.checked_in);
  const pending = guests.filter((g) => !g.checked_in);

  const filtered = guests.filter(
    (g) =>
      g.full_name.toLowerCase().includes(search.toLowerCase()) ||
      g.entry_code.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
        <div className="w-full max-w-sm rounded-[2rem] border border-wine/10 bg-white/85 p-8 shadow-soft text-center">
          <h1 className="font-serif text-3xl text-moss">Admin Access</h1>
          <p className="mt-2 text-sm text-ink/60">Enter password to continue</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password === ADMIN_PASSWORD) setAuthed(true);
              else setMessage("Wrong password");
            }}
            className="mt-6 space-y-4"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field text-center"
              placeholder="Password"
              autoFocus
            />
            {message && <p className="text-sm text-wine">{message}</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-wine px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-ivory transition hover:bg-wine/90"
            >
              Sign In
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl text-moss sm:text-5xl">Guest Check-In</h1>
            <p className="mt-1 text-sm text-ink/60">
              <strong className="text-moss">{checkedIn.length}</strong> checked in ·{" "}
              <strong className="text-wine">{pending.length}</strong> pending ·{" "}
              <strong className="text-ink">{guests.length}</strong> total
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchGuests}
              className="rounded-full border border-moss/20 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-moss transition hover:bg-white"
            >
              Refresh
            </button>
            <button
              onClick={() => setAuthed(false)}
              className="rounded-full border border-wine/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-wine transition hover:bg-wine/5"
            >
              Lock
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field mt-6"
          placeholder="Search by name, entry code, or email..."
        />

        {/* Stats bar */}
        <div className="mt-4 flex gap-3 rounded-2xl border border-wine/10 bg-white/70 p-3 text-xs text-ink/60">
          <span>🟢 <strong className="text-moss">{checkedIn.length}</strong> Checked In</span>
          <span>⚪ <strong className="text-wine">{pending.length}</strong> Pending</span>
        </div>

        {/* Guest List */}
        {loading ? (
          <div className="mt-8 text-center text-sm text-ink/60">Loading guests...</div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 text-center text-sm text-ink/60">
            {guests.length === 0 ? "No RSVPs received yet." : "No guests match your search."}
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {filtered.map((guest) => (
              <div
                key={guest.id}
                className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                  guest.checked_in
                    ? "border-sage/30 bg-sage/5"
                    : "border-wine/10 bg-white/80"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${guest.checked_in ? "bg-sage" : "bg-rose"}`} />
                    <p className="truncate font-medium text-ink">{guest.full_name}</p>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
                    <span>Code: <strong className="text-moss">{guest.entry_code}</strong></span>
                    <span>{guest.email}</span>
                    {guest.phone && <span>{guest.phone}</span>}
                    {guest.checked_in_at && (
                      <span>Checked in: {new Date(guest.checked_in_at).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleCheckIn(guest)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    guest.checked_in
                      ? "bg-sage/20 text-sage hover:bg-sage/30"
                      : "bg-wine text-ivory hover:bg-wine/90"
                  }`}
                >
                  {guest.checked_in ? "Checked In" : "Check In"}
                </button>
              </div>
            ))}
          </div>
        )}

        {message && (
          <div className="mt-6 text-center text-xs text-ink/60">{message}</div>
        )}
      </div>
    </main>
  );
}
