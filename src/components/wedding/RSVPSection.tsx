import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, XCircle, Phone, MessageCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function ConfettiBurst() {
  const colors = ['#7b0014', '#737b54', '#c89485', '#e9c0b6', '#eadfc9', '#c97658'];
  const pieces = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
    const dist = 80 + Math.random() * 120;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 60,
      rotate: Math.random() * 720 - 360,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.2,
    };
  });
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size * 0.6, background: p.color }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
            x: [0, p.x * 0.5, p.x],
            y: [0, p.y * 0.5, p.y + 40],
            rotate: [0, p.rotate * 0.5, p.rotate],
          }}
          transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

function ErrorShake({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ x: [0, -10, 10, -8, 8, -5, 5, 0] }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

const RSVP_LIMIT = 80;
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-rsvp-email`;

const TITLES = ['Mr.', 'Mrs.', 'Miss.', 'Dr.', 'Prof.', 'Pastor', 'Evang.', '(No Prefix)'];

function generateEntryCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  const l1 = letters.charAt(Math.floor(Math.random() * letters.length));
  const l2 = letters.charAt(Math.floor(Math.random() * letters.length));
  const d1 = digits.charAt(Math.floor(Math.random() * digits.length));
  const d2 = digits.charAt(Math.floor(Math.random() * digits.length));
  const d3 = digits.charAt(Math.floor(Math.random() * digits.length));
  const chars = [l1, l2, d1, d2, d3];
  // Shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return `KDE-2026-${chars.join('')}`;
}

async function generateUniqueEntryCode(): Promise<string> {
  let code = '';
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 50) {
    code = generateEntryCode();
    const { data } = await supabase
      .from('rsvp_submissions')
      .select('id')
      .eq('entry_code', code)
      .maybeSingle();
    exists = !!data;
    attempts++;
  }
  return code;
}

interface FormData {
  title: string;
  fullName: string;
  email: string;
  phone: string;
  attendees: string;
  note: string;
}

const CONTACTS = [
  { name: 'Sister Rhoda', phone: '08106993435' },
  { name: 'Brother Joe', phone: '0812765976' },
  { name: 'Bro Zion', phone: '09135037695' },
];

function AnimatedPhoneIcon() {
  return (
    <motion.div
      animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
    >
      <Phone size={18} className="text-wine" />
    </motion.div>
  );
}

function AnimatedChatIcon() {
  return (
    <motion.div
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
    >
      <MessageCircle size={18} className="text-moss" />
    </motion.div>
  );
}

export function RSVPSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'closed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedCount, setSubmittedCount] = useState(0);
  const [form, setForm] = useState<FormData>({
    title: '(No Prefix)',
    fullName: '',
    email: '',
    phone: '',
    attendees: '1',
    note: '',
  });

  // Check capacity on mount and periodically
  useEffect(() => {
    async function checkCapacity() {
      const { data, error } = await supabase
        .from('rsvp_submissions')
        .select('attendees');
      if (!error && data) {
        const total = data.reduce((sum, r) => sum + (r.attendees || 0), 0);
        setSubmittedCount(total);
        if (total >= RSVP_LIMIT) {
          setStatus('closed');
        }
      }
    }
    checkCapacity();
    const interval = setInterval(checkCapacity, 15000); // Recheck every 15s
    return () => clearInterval(interval);
  }, []);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const submitRsvp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('loading');
      setErrorMsg('');

      const attendeesNum = parseInt(form.attendees, 10);

      // Validate
      if (!form.fullName || !form.email || !form.phone) {
        setErrorMsg('Please fill in all required fields.');
        setStatus('error');
        return;
      }

      // Check capacity again before submitting
      const { data: allRsvps } = await supabase.from('rsvp_submissions').select('attendees');
      const total = (allRsvps || []).reduce((sum, r) => sum + (r.attendees || 0), 0);
      if (total + attendeesNum > RSVP_LIMIT) {
        setStatus('closed');
        return;
      }

      // Check duplicate email
      const { data: existing } = await supabase
        .from('rsvp_submissions')
        .select('id')
        .eq('email', form.email)
        .maybeSingle();

      if (existing) {
        setErrorMsg('This email has already been registered. Thank you!');
        setStatus('error');
        return;
      }

      // Generate unique entry code
      const entryCode = await generateUniqueEntryCode();

      // Insert
      const { error: insertError } = await supabase.from('rsvp_submissions').insert({
        title: form.title === '(No Prefix)' ? null : form.title,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        attendees: attendeesNum,
        attending: 'yes',
        note: form.note || null,
        entry_code: entryCode,
      });

      if (insertError) {
        console.error('RSVP error:', insertError);
        setErrorMsg('Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      // Send confirmation email via Edge Function
      try {
        await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            full_name: form.fullName,
            email: form.email,
            title: form.title === '(No Prefix)' ? undefined : form.title,
            entry_code: entryCode,
            attendees: attendeesNum,
            phone: form.phone,
          }),
        });
      } catch (emailErr) {
        // Non-blocking: email failure should not stop the RSVP
        console.error('Email send error:', emailErr);
      }

      setStatus('success');
    },
    [form]
  );

  const isClosed = status === 'closed';

  return (
    <section id="rsvp" className="py-16 sm:py-24" style={{ background: '#ede0cc' }}>
      <div className="section-shell grid gap-10 lg:grid-cols-2 lg:items-start">
        {/* Left text */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">RSVP</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl lg:text-6xl">
            Kindly reserve your place.
          </h2>
          <p className="mt-6 leading-8" style={{ color: 'rgba(45,36,31,0.74)' }}>
            Please fill out this form ONLY if you are sure you will attend. Space is strictly
            limited to {RSVP_LIMIT} guests, so please register early. Once processed, your unique
            entry code will be sent to your WhatsApp or Email.
          </p>
          <div className="mt-7 flex items-center gap-3 text-moss">
            <Users size={22} />
            <span className="font-serif text-xl sm:text-2xl">
              Maximum guest limit: {RSVP_LIMIT} ({submittedCount} reserved)
            </span>
          </div>

          {/* RSVP Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10 rounded-xl p-5 sm:p-6"
            style={{ background: '#fbf6ed', border: '1px solid rgba(123,0,20,0.12)' }}
          >
            <div className="flex items-center gap-2">
              <AnimatedChatIcon />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">
                For RSVP Inquiries
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {CONTACTS.map((contact) => (
                <a
                  key={contact.name}
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-[rgba(123,0,20,0.04)]"
                >
                  <AnimatedPhoneIcon />
                  <div>
                    <p className="text-sm font-medium text-ink">{contact.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(45,36,31,0.6)' }}>
                      {contact.phone}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right form */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut', delay: 0.12 }}
        >
          <div
            className="p-6 shadow-soft sm:p-9"
            style={{
              background: '#fbf6ed',
              border: '1px solid rgba(123,0,20,0.2)',
              outline: '1px solid rgba(115,123,84,0.12)',
              outlineOffset: '-8px',
            }}
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative flex flex-col items-center justify-center py-10 text-center"
                >
                  <ConfettiBurst />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.6, ease: 'backOut' }}
                  >
                    <CheckCircle2 className="h-16 w-16 text-moss" />
                  </motion.div>
                  <motion.p
                    className="mt-4 font-serif text-2xl text-moss"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Thank you!
                  </motion.p>
                  <motion.p
                    className="mt-2 max-w-xs text-sm"
                    style={{ color: 'rgba(45,36,31,0.6)' }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    Your RSVP has been received. Your unique entry code will be sent to your WhatsApp
                    or Email shortly.
                  </motion.p>
                </motion.div>
              ) : status === 'closed' ? (
                <motion.div
                  key="closed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 5, -5, 0] }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <XCircle className="h-16 w-16 text-wine" />
                  </motion.div>
                  <p className="mt-4 font-serif text-2xl text-wine">Registration Closed</p>
                  <p className="mt-2 text-sm" style={{ color: 'rgba(45,36,31,0.6)' }}>
                    We have reached our maximum capacity of {RSVP_LIMIT} guests. Thank you for your
                    interest.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={submitRsvp}
                  className="space-y-5"
                >
                  {/* Title / Prefix */}
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
                      Title *
                    </Label>
                    <Select
                      value={form.title}
                      onValueChange={(val) => handleChange('title', val)}
                    >
                      <SelectTrigger className="mt-1 border-[rgba(63,72,31,0.18)] bg-[rgba(255,252,246,0.76)] px-3 py-5 text-ink focus:border-wine/55 focus:ring-wine/10">
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        {TITLES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
                        Full name *
                      </Label>
                      <Input
                        value={form.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        required
                        placeholder="Your full name"
                        className="mt-1 border-[rgba(63,72,31,0.18)] bg-[rgba(255,252,246,0.76)] px-3 py-5 text-ink focus:border-wine/55 focus:ring-wine/10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
                        Email *
                      </Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        placeholder="your@email.com"
                        className="mt-1 border-[rgba(63,72,31,0.18)] bg-[rgba(255,252,246,0.76)] px-3 py-5 text-ink focus:border-wine/55 focus:ring-wine/10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
                        WhatsApp number *
                      </Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                        inputMode="tel"
                        placeholder="+234..."
                        className="mt-1 border-[rgba(63,72,31,0.18)] bg-[rgba(255,252,246,0.76)] px-3 py-5 text-ink focus:border-wine/55 focus:ring-wine/10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
                        Number attending *
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={form.attendees}
                        onChange={(e) => handleChange('attendees', e.target.value)}
                        required
                        className="mt-1 border-[rgba(63,72,31,0.18)] bg-[rgba(255,252,246,0.76)] px-3 py-5 text-ink focus:border-wine/55 focus:ring-wine/10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
                      Message (optional)
                    </Label>
                    <Textarea
                      value={form.note}
                      onChange={(e) => handleChange('note', e.target.value)}
                      placeholder="A note for the couple..."
                      rows={4}
                      className="mt-1 border-[rgba(63,72,31,0.18)] bg-[rgba(255,252,246,0.76)] px-3 py-3 text-ink focus:border-wine/55 focus:ring-wine/10"
                    />
                  </div>

                  {status === 'error' && (
                    <ErrorShake>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                      >
                        <XCircle size={16} className="shrink-0" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    </ErrorShake>
                  )}

                  <Button
                    type="submit"
                    disabled={status === 'loading' || isClosed}
                    className="w-full rounded-full bg-wine px-7 py-6 text-sm font-semibold uppercase tracking-[0.18em] text-ivory shadow-soft transition hover:opacity-90 disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      'Submit RSVP'
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
