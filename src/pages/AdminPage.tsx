import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle2,
  XCircle,
  Ticket,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  Copy,
  Check,
} from 'lucide-react';

const RSVP_LIMIT = 80;

interface RsvpRecord {
  id: string;
  title: string | null;
  full_name: string;
  email: string;
  phone: string;
  attendees: number;
  attending: string;
  note: string | null;
  entry_code: string | null;
  created_at: string;
}

type FilterStatus = 'all' | 'yes' | 'no';

export default function AdminPage() {
  const [records, setRecords] = useState<RsvpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalYes: 0,
    totalNo: 0,
    totalAttendingGuests: 0,
    remaining: RSVP_LIMIT,
  });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rsvp_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRecords(data as RsvpRecord[]);
      const yesRecords = data.filter((r: RsvpRecord) => r.attending === 'yes');
      const noRecords = data.filter((r: RsvpRecord) => r.attending === 'no');
      const attendingGuests = yesRecords.reduce(
        (sum: number, r: RsvpRecord) => sum + (r.attendees || 0),
        0
      );
      setStats({
        totalYes: yesRecords.length,
        totalNo: noRecords.length,
        totalAttendingGuests: attendingGuests,
        remaining: Math.max(0, RSVP_LIMIT - attendingGuests),
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filteredRecords = records.filter((r) => {
    const matchesFilter = filter === 'all' ? true : r.attending === filter;
    const matchesSearch =
      search.trim() === ''
        ? true
        : r.full_name.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          (r.entry_code && r.entry_code.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: typeof Users;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div
      className="flex items-center gap-4 rounded-xl p-4 sm:p-5"
      style={{ background: '#fbf6ed', border: '1px solid rgba(123,0,20,0.12)' }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11"
        style={{ background: color }}
      >
        <Icon size={20} className="text-ivory" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(45,36,31,0.55)' }}>
          {label}
        </p>
        <p className="mt-0.5 font-serif text-xl text-moss sm:text-2xl">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f5efe4' }}>
      {/* Header */}
      <header
        className="border-b px-4 py-5 sm:px-6"
        style={{ borderColor: 'rgba(123,0,20,0.12)', background: '#fbf6ed' }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl text-moss sm:text-3xl">RSVP Dashboard</h1>
              <p className="mt-1 text-xs" style={{ color: 'rgba(45,36,31,0.55)' }}>
                King David &amp; Esther — Wedding Guest Management
              </p>
            </div>
            <a
              href="/"
              className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-wine transition hover:bg-wine hover:text-ivory"
              style={{ borderColor: 'rgba(123,0,20,0.25)' }}
            >
              Back to Site
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            icon={Users}
            label="Attending Guests"
            value={stats.totalAttendingGuests}
            color="rgba(115,123,84,0.9)"
          />
          <StatCard
            icon={CheckCircle2}
            label="Confirmed RSVPs"
            value={stats.totalYes}
            color="rgba(115,123,84,0.9)"
          />
          <StatCard
            icon={XCircle}
            label="Declined"
            value={stats.totalNo}
            color="rgba(123,0,20,0.7)"
          />
          <StatCard
            icon={Ticket}
            label="Remaining Seats"
            value={stats.remaining}
            color={stats.remaining < 10 ? 'rgba(123,0,20,0.8)' : 'rgba(115,123,84,0.9)'}
          />
        </motion.div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(45,36,31,0.6)' }}>
            <span>Capacity Used</span>
            <span>
              {stats.totalAttendingGuests} / {RSVP_LIMIT}
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(123,0,20,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'rgba(123,0,20,0.75)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.totalAttendingGuests / RSVP_LIMIT) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter size={16} style={{ color: 'rgba(45,36,31,0.5)' }} />
            {(['all', 'yes', 'no'] as FilterStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition"
                style={{
                  background: filter === f ? 'rgba(123,0,20,0.85)' : 'rgba(251,246,237,0.8)',
                  color: filter === f ? '#fbf6ed' : 'rgba(45,36,31,0.7)',
                  border: '1px solid',
                  borderColor: filter === f ? 'rgba(123,0,20,0.85)' : 'rgba(123,0,20,0.15)',
                }}
              >
                {f === 'all' ? 'All' : f === 'yes' ? 'Attending' : 'Not Attending'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(45,36,31,0.35)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or code..."
              className="w-full rounded-full border py-2 pl-9 pr-4 text-sm outline-none transition sm:w-72"
              style={{
                borderColor: 'rgba(123,0,20,0.15)',
                background: 'rgba(251,246,237,0.8)',
                color: 'rgba(45,36,31,0.85)',
              }}
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 overflow-hidden rounded-xl border"
          style={{ borderColor: 'rgba(123,0,20,0.12)', background: '#fbf6ed' }}
        >
          {loading ? (
            <div className="py-16 text-center">
              <div
                className="mx-auto h-8 w-8 animate-spin rounded-full border-2"
                style={{ borderColor: 'rgba(123,0,20,0.15)', borderTopColor: 'rgba(123,0,20,0.8)' }}
              />
              <p className="mt-3 text-sm" style={{ color: 'rgba(45,36,31,0.5)' }}>
                Loading records...
              </p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={36} className="mx-auto" style={{ color: 'rgba(45,36,31,0.2)' }} />
              <p className="mt-3 text-sm" style={{ color: 'rgba(45,36,31,0.5)' }}>
                No records found.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr
                    className="border-b text-xs font-semibold uppercase tracking-[0.08em]"
                    style={{ borderColor: 'rgba(123,0,20,0.1)', color: 'rgba(45,36,31,0.55)' }}
                  >
                    <th className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">Guest</th>
                    <th className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">Contact</th>
                    <th className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">Guests</th>
                    <th className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">Entry Code</th>
                    <th className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b transition hover:bg-[rgba(123,0,20,0.03)]"
                      style={{ borderColor: 'rgba(123,0,20,0.08)' }}
                    >
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <p className="font-medium text-ink">
                          {record.title ? `${record.title} ` : ''}{record.full_name}
                        </p>
                        {record.note && (
                          <p className="mt-0.5 text-xs italic" style={{ color: 'rgba(45,36,31,0.45)' }}>
                            "{record.note}"
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <div className="flex items-center gap-1.5" style={{ color: 'rgba(45,36,31,0.65)' }}>
                          <Mail size={12} />
                          <span>{record.email}</span>
                        </div>
                        {record.phone && (
                          <div className="mt-1 flex items-center gap-1.5" style={{ color: 'rgba(45,36,31,0.65)' }}>
                            <Phone size={12} />
                            <span>{record.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            background:
                              record.attending === 'yes'
                                ? 'rgba(115,123,84,0.12)'
                                : 'rgba(123,0,20,0.08)',
                            color: record.attending === 'yes' ? '#3f481f' : '#7b0014',
                          }}
                        >
                          {record.attending === 'yes' ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {record.attending === 'yes' ? 'Attending' : 'Declined'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <span className="font-serif text-base text-moss">{record.attendees}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        {record.entry_code ? (
                          <button
                            onClick={() => copyCode(record.entry_code!, record.id)}
                            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-mono font-semibold transition hover:opacity-80"
                            style={{
                              background: 'rgba(123,0,20,0.08)',
                              color: '#7b0014',
                              border: '1px dashed rgba(123,0,20,0.25)',
                            }}
                            title="Click to copy"
                          >
                            {record.entry_code}
                            {copiedId === record.id ? (
                              <Check size={12} />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        ) : (
                          <span className="text-xs italic" style={{ color: 'rgba(45,36,31,0.35)' }}>
                            —
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <div className="flex items-center gap-1.5" style={{ color: 'rgba(45,36,31,0.5)' }}>
                          <Calendar size={12} />
                          <span className="text-xs">
                            {new Date(record.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs" style={{ color: 'rgba(45,36,31,0.4)' }}>
          Showing {filteredRecords.length} of {records.length} total records
        </p>
      </main>
    </div>
  );
}
