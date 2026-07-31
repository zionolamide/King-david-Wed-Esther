"use client";

import { useEffect, useState, useCallback } from "react";

const ADMIN_PASSWORD = "KDE-admin2026";

type Guest = {
  id: string;
  title?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  entry_code: string;
  checked_in?: boolean | null;
  checked_in_at?: string | null;
  created_at: string;
  attending?: string;
  note?: string | null;
  approved?: boolean | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"all" | "pending" | "checkin" | "wishes">("all");
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const [pendingWishes, setPendingWishes] = useState<{ id: string; name: string; wish: string; wish_approved: boolean }[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());

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
    if (authed) {
      fetchGuests();
      fetchPendingWishes();
    }
  }, [authed, fetchGuests]);

  async function fetchPendingWishes() {
    try {
      const res = await fetch("/api/admin/guests", {
        headers: { authorization: `Bearer ${ADMIN_PASSWORD}` },
      });
      const data = await res.json();
      if (data.ok) {
        // Only show wishes from approved guests (entry_code is not null)
        const all = (data.guests || []).filter((g: any) => {
          if (!g.entry_code) return false;
          try {
            const meta = JSON.parse(g.note || "{}");
            return meta.wish;
          } catch { return false; }
        }).map((g: any) => {
          const meta = JSON.parse(g.note);
          return { id: g.id, name: g.full_name, wish: meta.wish, wish_approved: meta.wish_approved || false };
        });
        setPendingWishes(all);
      }
    } catch {}
  }

  async function toggleWishApproval(wishId: string, currentlyApproved: boolean) {
    setApprovingId(wishId);
    try {
      const res = await fetch("/api/admin/guests", {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${ADMIN_PASSWORD}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: wishId, wish_approved: !currentlyApproved }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage(currentlyApproved ? "Wish disapproved" : "Wish approved");
        fetchPendingWishes();
      } else {
        setMessage(data.message || "Failed");
      }
    } catch {
      setMessage("Network error");
    }
    setApprovingId(null);
  }

  async function approveGuest(id: string) {
    setApprovingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch("/api/admin/guests", {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${ADMIN_PASSWORD}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, approve_guest: true }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage("Guest approved. Access card email sent.");
        fetchGuests();
      } else {
        setMessage(data.message || "Failed to approve");
      }
    } catch {
      setMessage("Network error");
    }
    setApprovingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  async function approveAllPending() {
    const pending = guests.filter((g) => !(g as any).approved);
    if (!confirm(`Approve all ${pending.length} pending guests? Access card emails will be sent to each.`)) return;
    for (const guest of pending) {
      await approveGuest(guest.id);
    }
    setMessage(`All ${pending.length} guests approved.`);
  }

  async function deleteGuest(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/guests", {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${ADMIN_PASSWORD}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage(`"${name}" deleted.`);
        fetchGuests();
      } else {
        setMessage(data.message || "Failed to delete");
      }
    } catch {
      setMessage("Network error");
    }
  }

  async function resetAllCheckIns() {
    if (!confirm("Are you sure you want to reset ALL guest check-ins? This will mark everyone as Not Checked In.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guests", {
        method: "POST",
        headers: {
          authorization: `Bearer ${ADMIN_PASSWORD}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resetAll: true }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage("All check-ins have been reset.");
        fetchGuests();
      } else {
        setMessage(data.message || "Reset failed");
      }
    } catch {
      setMessage("Network error");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  async function toggleCheckIn(guest: Guest) {
    const newVal = !guest.checked_in;
    setCheckedInIds((prev) => {
      const next = new Set(prev);
      if (newVal) next.add(guest.id);
      else next.delete(guest.id);
      return next;
    });

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
      // Notify on check-in
      if (newVal) {
        fetch("/api/admin/notify-checkin", {
          method: "POST",
          headers: {
            authorization: `Bearer ${ADMIN_PASSWORD}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullName: guest.full_name, entryCode: guest.entry_code }),
        }).catch(() => {});
      }
    } else {
      setCheckedInIds((prev) => {
        const next = new Set(prev);
        next.delete(guest.id);
        return next;
      });
      setMessage(data.message || "Update failed");
    }
  }

  const checkedIn = guests.filter((g) => g.checked_in);
  const pending = guests.filter((g) => !g.checked_in);
  const pendingApproval = guests.filter((g) => !g.approved);
  const approvedCount = guests.length - pendingApproval.length;
  const remainingApprovals = Math.max(0, 80 - approvedCount);

  const filtered = guests.filter(
    (g) =>
      g.full_name.toLowerCase().includes(search.toLowerCase()) ||
      g.entry_code.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase())
  );

  const displayGuests = tab === "checkin" ? filtered.filter((g) => !g.checked_in) : filtered;

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
        <div className="w-full max-w-sm rounded-[2rem] border border-wine/10 bg-white/85 p-8 shadow-soft text-center">
          <h1 className="font-serif text-3xl text-moss">Admin Access</h1>
          <p className="mt-2 text-sm text-ink/60">Enter password to continue</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password.trim() === ADMIN_PASSWORD) setAuthed(true);
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
            <h1 className="font-serif text-4xl text-moss sm:text-5xl">Guest List</h1>
            <p className="mt-1 text-sm text-ink/60">
              <strong className="text-moss">{approvedCount}</strong> approved ·{" "}
              <strong className="text-wine">{remainingApprovals}</strong> remaining ·{" "}
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
              onClick={resetAllCheckIns}
              disabled={loading}
              className="rounded-full border border-rose/30 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose transition hover:bg-rose/5 disabled:opacity-40"
            >
              {loading ? "..." : "Reset Venue Check-Ins"}
            </button>
            <button
              onClick={() => setAuthed(false)}
              className="rounded-full border border-wine/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-wine transition hover:bg-wine/5"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Inline Tabs */}
        <div className="mt-6 flex gap-1 rounded-2xl border border-wine/10 bg-white/70 p-1">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              tab === "all" ? "bg-wine text-ivory shadow-soft" : "text-ink/60 hover:text-ink"
            }`}
          >
            All Guests ({guests.length})
          </button>
          <button
            onClick={() => setTab("pending")}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              tab === "pending" ? "bg-wine text-ivory shadow-soft" : "text-ink/60 hover:text-ink"
            }`}
          >
            Approve ({pendingApproval.length})
          </button>
          <button
            onClick={() => setTab("checkin")}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              tab === "checkin" ? "bg-wine text-ivory shadow-soft" : "text-ink/60 hover:text-ink"
            }`}
          >
            Check In ({pending.length})
          </button>
          <button
            onClick={() => setTab("wishes")}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              tab === "wishes" ? "bg-wine text-ivory shadow-soft" : "text-ink/60 hover:text-ink"
            }`}
          >
            Wishes ({pendingWishes.length})
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field mt-4"
          placeholder="Search by name, entry code, or email..."
        />

        {/* Stats bar */}
        {(tab === "all" || tab === "checkin" || tab === "pending") && (
          <div className="mt-4 flex gap-3 rounded-2xl border border-wine/10 bg-white/70 p-3 text-xs text-ink/60">
            <span>✅ <strong className="text-moss">{approvedCount}</strong> Approved</span>
            <span>⏳ <strong className="text-wine">{remainingApprovals}</strong> Remaining (of 80)</span>
          </div>
        )}

        {/* Tab description */}
        <div className="mt-3 rounded-xl bg-white/50 px-4 py-2.5 text-xs leading-relaxed text-ink/60 border border-wine/5">
          {tab === "all" && "📋 All guests who have RSVP'd. Grouped by Checked In (venue) and Pending."}
          {tab === "pending" && "✅ Guests waiting for your approval. Tap Approve to generate their entry code and send their access card via email. The 80 capacity counts only approved guests."}
          {tab === "checkin" && "🎟️ Guests who are approved but haven't arrived at the venue yet. Tap CHECK IN when they present their card at the entrance."}
          {tab === "wishes" && "💬 Wishes from approved guests. Toggle Approve/Disapprove to control which wishes appear on the wedding website."}
        </div>

        {/* Guest List */}
        {loading ? (
          <div className="mt-8 text-center text-sm text-ink/60">Loading guests...</div>
        ) : displayGuests.length === 0 ? (
          <div className="mt-8 text-center text-sm text-ink/60">
            {guests.length === 0
              ? "No RSVPs received yet."
              : tab === "checkin"
              ? "All guests have been checked in!"
              : "No guests match your search."}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {tab === "all" ? (
              <>
                {/* Checked In section */}
                {filtered.filter((g) => g.checked_in).length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="h-3 w-3 rounded-full bg-sage" />
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage">
                        Checked In ({filtered.filter((g) => g.checked_in).length})
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {filtered.filter((g) => g.checked_in).map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between gap-3 rounded-2xl border border-sage/20 bg-sage/5 px-4 py-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-sage" />
                              <p className="truncate text-sm font-medium text-ink">{guest.full_name}</p>
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/50">
                              <span className="font-mono text-sage">{guest.entry_code}</span>
                              <span>{guest.email}</span>
                              {guest.checked_in_at && <span>at {new Date(guest.checked_in_at).toLocaleTimeString()}</span>}
                            </div>
                          </div>
                          {guest.entry_code && (
                            <a
                              href={`/card/${guest.entry_code}`}
                              target="_blank"
                              className="rounded-full bg-sage/20 px-3 py-1.5 text-xs font-semibold text-sage transition hover:bg-sage/30"
                            >
                              📷 Card
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Not Arrived section */}
                {filtered.filter((g) => !g.checked_in).length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="h-3 w-3 rounded-full bg-rose" />
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">
                        Not Arrived ({filtered.filter((g) => !g.checked_in).length})
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {filtered.filter((g) => !g.checked_in).map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between gap-3 rounded-2xl border border-wine/10 bg-white px-4 py-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-rose" />
                              <p className="truncate text-sm font-medium text-ink">{guest.full_name}</p>
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/50">
                              <span className="font-mono font-semibold text-wine">{guest.entry_code}</span>
                              <span>{guest.email}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteGuest(guest.id, guest.full_name)}
                            className="rounded-full border border-rose/30 px-3 py-2 text-xs text-rose transition hover:bg-rose/5"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : tab === "pending" ? (
              /* Tab 2 — Pending Approval */
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">
                    {pendingApproval.length} awaiting approval
                  </p>
                  {pendingApproval.length > 0 ? (
                    <button
                      onClick={approveAllPending}
                      className="rounded-full bg-moss px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ivory transition hover:bg-moss/90"
                    >
                      Approve All
                    </button>
                  ) : null}
                </div>
                {pendingApproval.length === 0 ? (
                  <div className="mt-8 text-center text-sm text-ink/60">All guests have been approved.</div>
                ) : (
                  <div className="space-y-2">
                    {pendingApproval.map((guest) => (
                      <div key={guest.id} className="flex items-center justify-between gap-3 rounded-2xl border border-wine/10 bg-white px-4 py-3 shadow-sm transition hover:shadow">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-rose" />
                            <p className="truncate font-medium text-ink">{guest.full_name}</p>
                          </div>
                          <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/50">
                            <span className="font-mono font-semibold text-wine">{guest.entry_code}</span>
                            <span>{guest.email}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => approveGuest(guest.id)}
                          disabled={approvingIds.has(guest.id)}
                          className="flex-shrink-0 rounded-full bg-wine px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ivory shadow-soft transition hover:bg-wine/90 disabled:opacity-50"
                        >
                          {approvingIds.has(guest.id) ? "..." : "Approve"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : tab === "checkin" ? (
              /* Tab 3 — Check In action list (approved but not arrived) */
              displayGuests.length > 0 ? (
                <div className="space-y-2">
                  {displayGuests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between gap-3 rounded-2xl border border-wine/10 bg-white px-4 py-3 shadow-sm transition hover:shadow">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{guest.full_name}</p>
                        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/50">
                          <span className="font-mono font-semibold text-wine">{guest.entry_code}</span>
                          <span>{guest.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCheckIn(guest)}
                          disabled={checkedInIds.has(guest.id)}
                          className="rounded-full bg-wine px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ivory shadow-soft transition hover:bg-wine/90 disabled:opacity-50"
                        >
                          {checkedInIds.has(guest.id) ? "..." : "CHECK IN"}
                        </button>
                        <button
                          onClick={() => deleteGuest(guest.id, guest.full_name)}
                          className="rounded-full border border-rose/30 px-3 py-2 text-xs text-rose transition hover:bg-rose/5"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null
            ) : null}
          </div>
        )}

        {/* Wishes Tab */}
        {tab === "wishes" && (
          <div className="mt-4 space-y-2">
            {pendingWishes.length === 0 ? (
              <div className="mt-8 text-center text-sm text-ink/60">No wishes found.</div>
            ) : (
              pendingWishes.map((w) => (
                <div key={w.id} className="flex items-center justify-between gap-3 rounded-2xl border border-blush/20 bg-white/80 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm italic text-ink/75">&ldquo;{w.wish}&rdquo;</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-wine">— {w.name}</p>
                    <p className="mt-0.5 text-xs text-ink/40">{w.wish_approved ? "✅ Published" : "⏳ Hidden"}</p>
                  </div>
                  <button
                    onClick={() => toggleWishApproval(w.id, w.wish_approved)}
                    disabled={approvingId === w.id}
                    className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ivory shadow-soft transition hover:opacity-90 disabled:opacity-50 ${
                      w.wish_approved ? "bg-rose" : "bg-moss"
                    }`}
                  >
                    {approvingId === w.id ? "..." : w.wish_approved ? "Disapprove" : "Approve"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-2xl border border-wine/10 bg-wine/5 p-4 text-center text-xs text-wine">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
