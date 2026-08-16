"use client";

import { useEffect, useState, useCallback, Component } from "react";

const ADMIN_PASSWORD = "KDE-admin2026";

class AdminErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Admin page error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
          <div className="max-w-sm rounded-2xl border border-wine/10 bg-white/85 p-8 text-center shadow-soft">
            <p className="text-4xl">😔</p>
            <h1 className="mt-3 font-serif text-2xl text-moss">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink/60">Please refresh to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-wine px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory"
            >
              Refresh
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

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
  wish?: string | null;
  wish_approved?: boolean | null;
};

export default function AdminPage() {
  return (
    <AdminErrorBoundary>
      <AdminPanel />
    </AdminErrorBoundary>
  );
}

function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"all" | "pending" | "checkin" | "wishes">("all");
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const [pendingWishes, setPendingWishes] = useState<{ id: string; name: string; wish: string; wish_approved: boolean; attending: boolean }[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [editingWishId, setEditingWishId] = useState<string | null>(null);
  const [editingWishText, setEditingWishText] = useState("");

  async function saveWishEdit(id: string) {
    if (!editingWishText.trim()) return;
    try {
      const res = await fetch("/api/admin/guests", {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${ADMIN_PASSWORD}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, edit_wish: editingWishText.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage("Wish updated");
        setEditingWishId(null);
        fetchPendingWishes();
      } else {
        setMessage(data.message || "Failed to update");
      }
    } catch {
      setMessage("Network error");
    }
  }

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
        // Show wishes from approved guests AND non-attending guests (wish-only)
        const all = (data.guests || []).filter((g: any) => !!g.wish).map((g: any) => {
          return {
            id: g.id,
            name: g.full_name,
            wish: g.wish,
            wish_approved: g.wish_approved || false,
            attending: g.attending !== "no" && !!g.entry_code,
          };
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
      const t = setTimeout(() => setMessage(""), 3500);
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
      // Success message
      setMessage(newVal ? `✅ ${guest.full_name} checked in successfully` : `${guest.full_name} check-in removed`);
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
  const approvedGuests = guests.filter((g) => g.approved);
  const unapprovedGuests = guests.filter((g) => !g.approved && g.attending !== "no");
  const wishOnlyGuests = guests.filter((g) => g.attending === "no");
  const approvedCount = approvedGuests.length;
  const remainingApprovals = Math.max(0, 80 - approvedCount);
  const wishCount = guests.filter((g) => g.wish).length;

  const filtered = guests.filter(
    (g) =>
      (g.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.entry_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.email || "").toLowerCase().includes(search.toLowerCase())
  );

  // All/Check In tabs only show approved guests; unapproved go to Awaiting tab
  const approvedFiltered = filtered.filter((g) => g.approved);
  const displayGuests = tab === "checkin" ? approvedFiltered.filter((g) => !g.checked_in) : approvedFiltered;

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
            <p className="mt-1 text-sm leading-relaxed text-ink/60">
              <strong className="text-moss">{approvedCount}</strong> approved (of 80) ·{" "}
              <strong className="text-wine">{remainingApprovals}</strong> slots left ·{" "}
              <strong className="text-amber-600">{unapprovedGuests.length}</strong> awaiting RSVP ·{" "}
              <strong className="text-ink">{wishOnlyGuests.length}</strong> wish-only ·{" "}
              <strong className="text-ink">{guests.length}</strong> records total
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
              Logout
            </button>
          </div>
        </div>

        {/* Inline Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-wine/10 bg-white/70 p-1">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              tab === "all" ? "bg-wine text-ivory shadow-soft" : "text-ink/60 hover:text-ink"
            }`}
          >
            All Guests ({approvedGuests.length})
          </button>
          <button
            onClick={() => setTab("pending")}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              tab === "pending" ? "bg-wine text-ivory shadow-soft" : "text-ink/60 hover:text-ink"
            }`}
          >
            Awaiting ({unapprovedGuests.length})
          </button>
          <button
            onClick={() => setTab("checkin")}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              tab === "checkin" ? "bg-wine text-ivory shadow-soft" : "text-ink/60 hover:text-ink"
            }`}
          >
            Check In ({Math.max(0, approvedGuests.length - checkedIn.length)})
          </button>
          <button
            onClick={() => setTab("wishes")}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
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
        {(tab === "all" || tab === "checkin") && (
          <div className="mt-4 flex gap-3 rounded-2xl border border-wine/10 bg-white/70 p-3 text-xs text-ink/60">
            <span>✅ <strong className="text-moss">{approvedCount}</strong> Approved</span>
            <span>⏳ <strong className="text-wine">{remainingApprovals}</strong> Remaining (of 80)</span>
          </div>
        )}

        {/* Tab description */}
        <div className="mt-3 rounded-xl bg-white/50 px-4 py-2.5 text-xs leading-relaxed text-ink/60 border border-wine/5">
          {tab === "all" && "📋 Approved guests only. Grouped by Checked In (arrived at venue) and Not Arrived."}
          {tab === "pending" && "⏳ People waiting for action: RSVP approval (via Telegram) and wish-only guests awaiting wish approval."}
          {tab === "checkin" && "🎟️ Approved guests who haven't arrived at the venue yet. Tap CHECK IN when they present their card at the entrance."}
          {tab === "wishes" && "💬 Wishes from approved guests. Toggle Approve/Disapprove to control which wishes appear on the wedding website."}
        </div>

        {/* Guest List */}
        {loading ? (
          <div className="mt-8 text-center text-sm text-ink/60">Loading guests...</div>
        ) : displayGuests.length === 0 ? (
          <div className="mt-8 text-center text-sm text-ink/60">
            {search.trim()
              ? "No guests match your search."
              : approvedGuests.length === 0
              ? "No approved guests yet."
              : tab === "checkin"
              ? "All guests have been checked in!"
              : "No guests here yet."}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {tab === "all" ? (
              <>
                {/* Checked In section */}
                {approvedFiltered.filter((g) => g.checked_in).length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="h-3 w-3 rounded-full bg-sage" />
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage">
                        Checked In ({approvedFiltered.filter((g) => g.checked_in).length})
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {approvedFiltered.filter((g) => g.checked_in).map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between gap-3 rounded-2xl border border-sage/20 bg-sage/5 px-4 py-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-sage" />
                              <p className="truncate text-sm font-medium text-ink">{guest.full_name}</p>
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/50">
                              <span className="font-mono text-sage">{guest.entry_code || ""}</span>
                              <span>{guest.email || ""}</span>
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
                          <button
                            onClick={() => toggleCheckIn(guest)}
                            className="rounded-full border border-sage/40 px-3 py-1.5 text-xs font-semibold text-sage transition hover:bg-sage/10"
                          >
                            ↩ Undo
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Not Arrived section */}
                {approvedFiltered.filter((g) => !g.checked_in).length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="h-3 w-3 rounded-full bg-rose" />
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">
                        Not Arrived ({approvedFiltered.filter((g) => !g.checked_in).length})
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {approvedFiltered.filter((g) => !g.checked_in).map((guest) => (
                        <div key={guest.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-wine/10 bg-white px-4 py-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-rose" />
                              <p className="truncate text-sm font-medium text-ink">{guest.full_name}</p>
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/50">
                              <span className="font-mono font-semibold text-wine">{guest.entry_code || ""}</span>
                              <span>{guest.email || ""}</span>
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
              /* Tab 2 — Awaiting Approval (read-only) */
              <div className="mt-4 space-y-5">
                {/* Awaiting RSVP approval */}
                <div>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">
                      Awaiting RSVP approval ({unapprovedGuests.length})
                    </p>
                  </div>
                  {unapprovedGuests.length === 0 ? (
                    <div className="rounded-xl bg-white/40 px-4 py-3 text-sm text-ink/50">No guests awaiting RSVP approval.</div>
                  ) : (
                    <div className="space-y-2">
                      {unapprovedGuests.map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between gap-3 rounded-2xl border border-wine/10 bg-white px-4 py-3 shadow-sm transition hover:shadow">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-ink">
                              {guest.title && guest.title !== "(No Prefix)" ? `${guest.title} ` : ""}{guest.full_name}
                            </p>
                            <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/50">
                              <span>{guest.email || ""}</span>
                              <span>{guest.phone || ""}</span>
                              <span>Filled: {guest.created_at ? new Date(guest.created_at).toLocaleDateString() : ""}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Awaiting wish approval — wish-only guests */}
                <div>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="h-3 w-3 rounded-full bg-wine" />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">
                      Awaiting wish approval — wish-only ({wishOnlyGuests.filter((g) => !g.wish_approved).length})
                    </p>
                  </div>
                  {wishOnlyGuests.filter((g) => !g.wish_approved).length === 0 ? (
                    <div className="rounded-xl bg-white/40 px-4 py-3 text-sm text-ink/50">No wish-only wishes awaiting approval — all published. ✅</div>
                  ) : (
                    <div className="space-y-2">
                      {wishOnlyGuests.filter((g) => !g.wish_approved).map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between gap-3 rounded-2xl border border-blush/20 bg-white px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-ink">{guest.full_name} 💌</p>
                            {guest.wish && <p className="mt-1 text-sm italic text-ink/60">&ldquo;{guest.wish.slice(0, 120)}{guest.wish.length > 120 ? "…" : ""}&rdquo;</p>}
                            <div className="mt-0.5 text-xs text-ink/40">
                              ⏳ Not published — approve in Wishes tab or via Telegram
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : tab === "checkin" ? (
              /* Tab 2 — Check In action list (approved but not arrived) */
              displayGuests.length > 0 ? (
                <div className="space-y-2">
                  {displayGuests.map((guest) => (
                    <div key={guest.id} className="flex flex-col gap-3 rounded-2xl border border-wine/10 bg-white px-4 py-3 shadow-sm transition hover:shadow sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{guest.full_name}</p>
                        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/50">
                          <span className="font-mono font-semibold text-wine">{guest.entry_code || ""}</span>
                          <span>{guest.email || ""}</span>
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
          <div className="mt-4 space-y-4">
            {pendingWishes.length === 0 ? (
              <div className="mt-8 text-center text-sm text-ink/60">No wishes found.</div>
            ) : (
              <>
                {/* Attending guests' wishes */}
                {pendingWishes.filter((w) => w.attending).length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="h-3 w-3 rounded-full bg-moss" />
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                        Wishes from attending guests ({pendingWishes.filter((w) => w.attending).length})
                      </p>
                    </div>
                    <div className="space-y-2">
                      {pendingWishes.filter((w) => w.attending).map((w) => (
                        <div key={w.id} className="flex items-center justify-between gap-3 rounded-2xl border border-blush/20 bg-white/80 px-4 py-3">
                          <div className="min-w-0 flex-1">
                            {editingWishId === w.id ? (
                              <div>
                                <textarea
                                  value={editingWishText}
                                  onChange={(e) => setEditingWishText(e.target.value)}
                                  maxLength={280}
                                  className="field min-h-24 resize-y text-sm"
                                />
                                <div className="mt-2 flex gap-2">
                                  <button onClick={() => saveWishEdit(w.id)} className="rounded-full bg-moss px-4 py-1.5 text-xs font-semibold text-ivory">Save</button>
                                  <button onClick={() => setEditingWishId(null)} className="rounded-full border border-ink/20 px-4 py-1.5 text-xs text-ink/60">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm italic text-ink/75">&ldquo;{w.wish}&rdquo;</p>
                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-wine">— {w.name}</p>
                                <p className="mt-0.5 text-xs text-ink/40">{w.wish_approved ? "✅ Published to website" : "⏳ Hidden — approve to publish on website"}</p>
                              </>
                            )}
                          </div>
                          <div className="flex flex-shrink-0 flex-col items-end gap-2">
                            {editingWishId !== w.id && (
                              <button
                                onClick={() => { setEditingWishId(w.id); setEditingWishText(w.wish); }}
                                className="rounded-full border border-ink/20 px-4 py-1.5 text-xs text-ink/70 transition hover:bg-ink/5"
                              >
                                ✏️ Edit
                              </button>
                            )}
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Non-attending guests' wishes */}
                {pendingWishes.filter((w) => !w.attending).length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="h-3 w-3 rounded-full bg-wine" />
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">
                        Wishes from non-attending guests ({pendingWishes.filter((w) => !w.attending).length})
                      </p>
                    </div>
                    <div className="space-y-2">
                      {pendingWishes.filter((w) => !w.attending).map((w) => (
                        <div key={w.id} className="flex items-center justify-between gap-3 rounded-2xl border border-blush/20 bg-white/80 px-4 py-3">
                          <div className="min-w-0 flex-1">
                            {editingWishId === w.id ? (
                              <div>
                                <textarea
                                  value={editingWishText}
                                  onChange={(e) => setEditingWishText(e.target.value)}
                                  maxLength={280}
                                  className="field min-h-24 resize-y text-sm"
                                />
                                <div className="mt-2 flex gap-2">
                                  <button onClick={() => saveWishEdit(w.id)} className="rounded-full bg-moss px-4 py-1.5 text-xs font-semibold text-ivory">Save</button>
                                  <button onClick={() => setEditingWishId(null)} className="rounded-full border border-ink/20 px-4 py-1.5 text-xs text-ink/60">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm italic text-ink/75">&ldquo;{w.wish}&rdquo;</p>
                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-wine">— {w.name} 💌</p>
                                <p className="mt-0.5 text-xs text-ink/40">{w.wish_approved ? "✅ Published to website" : "⏳ Hidden — approve to publish on website"}</p>
                              </>
                            )}
                          </div>
                          <div className="flex flex-shrink-0 flex-col items-end gap-2">
                            {editingWishId !== w.id && (
                              <button
                                onClick={() => { setEditingWishId(w.id); setEditingWishText(w.wish); }}
                                className="rounded-full border border-ink/20 px-4 py-1.5 text-xs text-ink/70 transition hover:bg-ink/5"
                              >
                                ✏️ Edit
                              </button>
                            )}
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {message && (
          <div className={`fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl px-5 py-3.5 text-center text-sm font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur ${
            message.startsWith("✅") || message.includes("successfully") || message.includes("approved") || message.includes("published") || message.includes("updated") || message.includes("deleted") || message.includes("reset")
              ? "bg-moss text-ivory"
              : "bg-wine text-ivory"
          }`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
