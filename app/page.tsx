"use client";

import { motion, useAnimation } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Flower2,
  Gift,
  Heart,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Music2,
  Navigation,
  Pause,
  Send,
  Sparkles,
  Users
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState, useRef } from "react";

const weddingDate = new Date("2026-08-22T11:00:00+01:00");
const rsvpLimit = Number(process.env.NEXT_PUBLIC_RSVP_LIMIT ?? 80);

const palette = [
  ["Sage", "#737b54"],
  ["Wine", "#7b0014"],
  ["Dusty Rose", "#c89485"],
  ["Terracotta", "#c97658"],
  ["Blush", "#e9c0b6"],
  ["Champagne", "#eadfc9"]
];

const venueQuery = "Camp Young, Ede, Osun State, Nigeria";
const encodedVenue = encodeURIComponent(venueQuery);

const schedule = [
  { time: "11:00 AM", title: "Wedding ceremony" },
  { time: "Immediately after", title: "Reception celebration" }
];

const titleOptions = [
  "Mr.",
  "Mrs.",
  "Miss.",
  "Dr.",
  "Prof.",
  "Pastor",
  "Evang.",
  "(No Prefix)"
];

const rsvpContacts = [
  { name: "Sister Rhoda", phone: "08106993435" },
  { name: "Brother Joe", phone: "0812765976" },
  { name: "Bro Zion", phone: "09135037695" }
];

function useCountdown() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return useMemo(() => {
    const difference = Math.max(weddingDate.getTime() - now.getTime(), 0);
    const days = Math.floor(difference / 86_400_000);
    const hours = Math.floor((difference / 3_600_000) % 24);
    const minutes = Math.floor((difference / 60_000) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    return { days, hours, minutes, seconds };
  }, [now]);
}

function FadeIn({
  children,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            controls.start("visible");
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "-60px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [controls]);

  const variants = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, delay, ease: [0.76, 0, 0.24, 1] } }
  };

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={variants} className={className}>
      {children}
    </motion.div>
  );
}


function SuccessAnimation() {
  return (
    <div className="py-12 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="inline-block mb-6"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
          className="text-5xl sm:text-6xl"
        >
          💍
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="font-serif text-3xl sm:text-4xl text-moss mb-3"
      >
        You&apos;re All Set!
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="space-y-3"
      >
        <p className="text-base leading-7 text-ink/75 font-medium">
          ✓ Your RSVP has been received
        </p>
        <p className="text-sm leading-7 text-ink/72">
          Thank you for confirming your attendance. A confirmation email is on its way. We&apos;re excited to celebrate with you on August 22, 2026!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8 flex justify-center gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ delay: i * 0.15, duration: 1, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-moss"
          />
        ))}
      </motion.div>
    </div>
  );
}

function SoundButton({
  audioRef,
  soundOn,
  setSoundOn,
  audioStarted,
  setAudioStarted
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;
  audioStarted: boolean;
  setAudioStarted: (v: boolean) => void;
}) {
  useEffect(() => {
    // restore persisted preference
    try {
      const stored = localStorage.getItem("kd_sound_on");
      if (stored === "true") {
        const audio = audioRef.current;
        if (audio) {
          audio.play().then(() => {
            setAudioStarted(true);
            setSoundOn(true);
          }).catch(() => {
            setAudioStarted(false);
            setSoundOn(false);
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }, [audioRef, setAudioStarted, setSoundOn]);

  async function toggleSound() {
    const audio = audioRef.current;
    if (!audio) return;
    if (soundOn) {
      audio.pause();
      setSoundOn(false);
      try { localStorage.setItem("kd_sound_on", "false"); } catch (e) {}
      return;
    }
    // play
    try {
      await audio.play();
      setAudioStarted(true);
      setSoundOn(true);
      try { localStorage.setItem("kd_sound_on", "true"); } catch (e) {}
    } catch (err) {
      setAudioStarted(false);
      setSoundOn(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleSound}
      className={`fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full ${soundOn ? 'bg-moss' : 'bg-wine'} text-ivory shadow-soft transition hover:opacity-90`}
      aria-label={soundOn ? "Pause background music" : "Play background music"}
    >
      {soundOn ? <Pause size={18} /> : <Music2 size={18} />}
    </button>
  );
}

function StoryArch() {
  return (
    <div className="story-arch relative mx-auto h-[28rem] max-w-xs overflow-hidden rounded-t-full bg-champagne shadow-soft sm:h-[30rem] sm:max-w-sm">
      <Image
        src="/couple-images/indoor-promise.png"
        alt="King David and Esther together"
        fill
        sizes="(max-width: 640px) 320px, 384px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ivory/20 via-rose/20 to-moss/70" />
      <div className="absolute inset-x-6 bottom-8 text-center text-ivory">
        <p className="font-script text-4xl sm:text-5xl">A Garden Promise</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em]">
          King David &amp; Esther
        </p>
      </div>
    </div>
  );
}

function FloatingPetals() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 12 }).map((_, index) => (
        <span
          key={index}
          className="petal"
          style={{
            left: `${8 + index * 8}%`,
            animationDelay: `${index * 0.55}s`,
            animationDuration: `${7 + (index % 4)}s`
          }}
        />
      ))}
    </div>
  );
}

function ScratchDateCard() {
  const [progress, setProgress] = useState(0);
  const revealed = progress >= 4;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function scratch() {
    setProgress((current) => Math.min(current + 1, 4));
  }

  useEffect(() => {
    if (!revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.scale(DPR, DPR);

    type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; rot: number; vr: number };
    const particles: Particle[] = [];
    const colors = ["#7b0014", "#c97658", "#737b54", "#e9c0b6", "#eadfc9"];

    // spawn burst
    const spawn = (count = 40) => {
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = 2 + Math.random() * 6;
        particles.push({
          x: w / 2 + (Math.random() - 0.5) * 20,
          y: h / 2 + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          life: 60 + Math.random() * 40,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 6 + Math.random() * 12,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
        });
      }
    };

    spawn(40);

    const gravity = 0.12;
    const drag = 0.995;
    let frame = 0;
    const maxFrames = 220;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      frame += 1;
      ctx.clearRect(0, 0, w, h);
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.vx *= drag;
        p.vy *= drag;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.36);
        ctx.restore();
        if (p.life <= 0) particles.splice(i, 1);
      }
      if (particles.length === 0 && frame > maxFrames) {
        cancelAnimationFrame(raf);
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [revealed]);

  return (
    <div
      className={`scratch-card invitation-border relative mx-auto w-full max-w-lg overflow-hidden bg-ivory/84 p-7 text-center shadow-soft ${
        revealed ? "is-revealed" : ""
      }`}
      onPointerDown={scratch}
      onPointerMove={(event) => {
        if (event.buttons === 1) scratch();
      }}
    >
      <canvas ref={canvasRef} className="ribbon-canvas" />
      <div className="shimmer-overlay" />
      {revealed ? (
        // keep CSS ribbon-field as graceful fallback
        <div className="ribbon-field pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: 20 }).map((_, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.07}s` }} />
          ))}
        </div>
      ) : null}
      <p className="relative z-10 text-xs font-semibold uppercase tracking-[0.22em] text-wine">
        Wedding Date
      </p>
      <p className="relative z-10 mt-3 font-serif text-3xl leading-relaxed text-moss sm:text-4xl">
        Saturday, 22 August 2026
      </p>
      {!revealed ? (
        <button
          type="button"
          className="scratch-cover absolute inset-0 z-20 flex flex-col items-center justify-center bg-champagne text-moss"
          onClick={scratch}
        >
          <span className="font-script text-5xl sm:text-6xl">Scratch to reveal</span>
          <span className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-wine">
            rub or tap gently
          </span>
        </button>
      ) : null}
    </div>
  );
}

function CurtainHero({ onOpen }: { onOpen: () => void }) {
  const [opened, setOpened] = useState(false);
  const countdown = useCountdown();

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  return (
    <section id="home" className="relative min-h-[100svh]">
      <div className="relative flex min-h-[100svh] items-center overflow-hidden pt-16 sm:pt-20 page-backdrop">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(255,215,205,0.16),transparent_30%),linear-gradient(180deg,rgba(54,9,12,0.92),rgba(23,2,4,0.96))]" />
        <FloatingPetals />

        {/* Valance bar across full top */}
        <div className="curtain-valance pointer-events-none" />

        {/* Left curtain panel */}
        <motion.div
          className="curtain-panel left-0"
          animate={{ x: opened ? "-102%" : "0%" }}
          transition={{ duration: 1.95, ease: [0.76, 0, 0.24, 1] }}
        >
          <span className="curtain-tie curtain-tie-left" />
        </motion.div>

        {/* Right curtain panel */}
        <motion.div
          className="curtain-panel right-0 scale-x-[-1]"
          animate={{ x: opened ? "102%" : "0%" }}
          transition={{ duration: 1.95, ease: [0.76, 0, 0.24, 1] }}
        >
          <span className="curtain-tie curtain-tie-right" />
        </motion.div>

        {/* Tap to Open overlay */}
        <motion.div
          className="absolute inset-x-6 top-[35%] z-30 text-center sm:inset-x-12 sm:top-[40%]"
          animate={{ opacity: opened ? 0 : 1, y: opened ? -18 : 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          style={{ pointerEvents: opened ? "none" : "auto" }}
        >
          <div className="closed-curtain-card mx-auto max-w-xl rounded-[2rem] border border-ivory/80 bg-white/92 px-6 py-9 shadow-soft shadow-rose/20 backdrop-blur-md sm:px-10 sm:py-10">
            <div className="flex items-center justify-center relative">
              <button
                type="button"
                onClick={() => {
                  setOpened(true);
                  try { onOpen(); } catch (e) { /* ignore */ }
                }}
                className="tap-open-btn mt-8 inline-flex rounded-full px-8 py-5 text-sm font-semibold uppercase tracking-[0.28em] text-ivory shadow-soft backdrop-blur-sm liquid-btn"
              >
                Tap to Open
              </button>
              <div className="button-bottom-wave" />
            </div>
          </div>
        </motion.div>

        {/* Hero content revealed after curtain opens */}
        <motion.div
          className="hero-content section-shell relative z-10 grid gap-6 py-6 sm:gap-10 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
          initial={false}
          animate={{ opacity: opened ? 1 : 0, y: opened ? 0 : 38, scale: opened ? 1 : 0.98 }}
          transition={{ duration: 0.9, delay: opened ? 0.9 : 0, ease: [0.76, 0, 0.24, 1] }}
          style={{ pointerEvents: opened ? "auto" : "none" }}
        >
          <div className="text-center lg:text-left">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-wine">
              Formal Garden Elegance
            </p>
            <h1 className="hero-title font-script leading-[0.82] text-moss">
              King David
              <span className="block font-serif text-2xl italic text-wine sm:text-4xl">&amp;</span>
              Esther
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-ink/74 sm:text-base lg:mx-0">
              With grateful hearts, we invite you to celebrate a warm garden wedding
              at Camp Young, Ede. Reception follows immediately.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#date-reveal"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-wine px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ivory shadow-soft transition hover:bg-wine/90 sm:px-7 sm:py-4"
              >
                <Heart size={16} /> Your Invitation
              </a>
              <a
                href="#details"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-moss/25 bg-ivory/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-moss transition hover:bg-ivory/80 sm:px-7 sm:py-4"
              >
                <MapPin size={16} /> Details
              </a>
            </div>
          </div>

          <div className="countdown-card invitation-border rounded-[2rem] bg-ivory/80 p-4 shadow-soft backdrop-blur sm:p-5">
            <div className="rounded-[1.5rem] bg-champagne/45 p-4 text-center sm:p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-moss sm:mb-5">
                Countdown to our day
              </p>
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {Object.entries(countdown).map(([label, value]) => (
                  <div key={label} className="bg-ivory/80 px-1 py-3 sm:px-2 sm:py-4">
                    <strong className="block font-serif text-2xl text-wine sm:text-3xl lg:text-4xl">
                      {String(value).padStart(2, "0")}
                    </strong>
                    <span className="text-[0.55rem] uppercase tracking-[0.14em] text-ink/62 sm:text-[0.62rem] sm:tracking-[0.18em]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-center gap-2 sm:mt-6 sm:gap-3">
                {palette.map(([name, color]) => (
                  <span
                    key={name}
                    title={name}
                    className="h-6 w-6 rounded-full border-2 border-ivory shadow sm:h-8 sm:w-8"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function DateRevealSection() {
  return (
    <section id="date-reveal" className="date-reveal-section py-16 sm:py-24">
      <div className="section-shell">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
            Your Invitation
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl">
            Reveal your special date
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink/70">
            Scratch or tap the card below to unveil the details of our special day.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-10 flex justify-center">
          <ScratchDateCard />
        </FadeIn>

        <FadeIn delay={0.25} className="mt-8 flex justify-center">
          <a
            href="#rsvp"
            className="inline-flex items-center gap-2 rounded-full bg-moss px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-ivory shadow-soft transition hover:bg-moss/90"
          >
            <Send size={15} /> Reserve Your Seat
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

function AttireIllustration({ type }: { type: "ladies" | "gentlemen" }) {
  const isLadies = type === "ladies";
  return (
    <div className="attire-illustration relative mb-6 h-56 overflow-hidden bg-ivory/70 sm:h-64">
      <div className="absolute inset-x-8 bottom-0 h-32 rounded-t-full bg-sage/12" />
      {isLadies ? (
        <>
          <div className="absolute left-[35%] top-9 h-12 w-12 rounded-full bg-cocoa" />
          <div className="absolute left-[31%] top-[5.2rem] h-28 w-[5.6rem] rounded-t-full bg-blush" />
          <div className="absolute left-[24%] bottom-0 h-40 w-36 rounded-t-[5rem] bg-rose/90" />
          <div className="absolute left-[25%] bottom-0 h-36 w-32 rounded-t-[5rem] bg-[linear-gradient(90deg,rgba(251,246,237,0.3),transparent,rgba(110,13,27,0.12))]" />
          <div className="absolute right-[25%] top-12 h-9 w-28 rotate-[-8deg] rounded-full border border-wine/20 bg-champagne" />
          <div className="absolute right-[28%] top-[4.4rem] h-4 w-20 rotate-[-8deg] bg-wine/70" />
        </>
      ) : (
        <>
          <div className="absolute left-[42%] top-9 h-12 w-12 rounded-full bg-cocoa" />
          <div className="absolute left-[35%] top-[5.1rem] h-32 w-28 rounded-t-3xl bg-moss" />
          <div className="absolute left-[38%] top-[5.5rem] h-28 w-16 bg-ivory" />
          <div className="absolute left-[42%] top-[6rem] h-24 w-8 bg-wine" />
          <div className="absolute left-[34%] bottom-0 h-24 w-10 bg-moss" />
          <div className="absolute right-[35%] bottom-0 h-24 w-10 bg-moss" />
          <div className="absolute right-[18%] top-16 h-28 w-20 rounded-t-full bg-sage/35" />
        </>
      )}
      <div className="absolute left-5 top-5 h-16 w-16 rounded-full bg-white/60 blur-sm" />
      <div className="absolute bottom-5 right-5 flex gap-1">
        {palette.slice(0, 5).map(([name, color]) => (
          <span key={name} className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
        ))}
      </div>
    </div>
  );
}

function GuestNoticeSection() {
  return (
    <section className="guest-notice-section bg-champagne/70 py-14 sm:py-20">
      <div className="section-shell">
        <FadeIn>
          <div className="invitation-border mx-auto max-w-3xl bg-ivory p-8 shadow-soft sm:p-12">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-wine/10">
                <Info className="text-wine" size={28} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
                  Important Guest Notice
                </p>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-moss sm:text-4xl">
                  Adults only celebration
                </h2>
                <p className="mt-3 leading-8 text-ink/74">
                  Due to limited space, attendance is reserved for adult guests only.
                  We kindly ask that children remain at home for this occasion so that
                  every guest can enjoy a relaxed and comfortable celebration.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function Home() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "closed" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastPayload, setLastPayload] = useState<any | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [accessCardUrl, setAccessCardUrl] = useState<string | null>(null);
  const [entryCode, setEntryCode] = useState<string | null>(null);
  const [accessCardName, setAccessCardName] = useState<string>("access-card.png");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  useEffect(() => {
    // prepare audio element
    try {
      const audio = new Audio("/music/when-god-made-you.mp3");
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.35;
      audioRef.current = audio;
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function copyToClipboard(text: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setToast("Copied to clipboard");
        return true;
      }
    } catch {}

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      setToast(ok ? "Copied to clipboard" : "Copy failed");
      return ok;
    } catch {
      setToast("Copy failed");
      return false;
    }
  }

  useEffect(() => {
    return () => {
      if (accessCardUrl) {
        URL.revokeObjectURL(accessCardUrl);
      }
    };
  }, [accessCardUrl]);

  async function fetchAccessCardPreview(payload: any, code: string) {
    try {
      const displayFullName = payload.title && payload.title !== "(No Prefix)"
        ? `${payload.title} ${payload.fullName}`
        : payload.fullName;
      const response = await fetch('/api/access-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: displayFullName,
          entryCode: code,
          attendees: 1,
          phone: payload.phone,
          whatsappContacts: rsvpContacts,
        }),
      });

      if (!response.ok) {
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAccessCardUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
      setAccessCardName(`KDE2026-${code}.png`);
      setEntryCode(code);
    } catch (err) {
      console.warn('Access card preview generation failed', err);
    }
  }

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setFormErrors({});
    setRetryAttempts(0);
    setIsRetrying(false);
    setAccessCardUrl(null);
    setEntryCode(null);
    setAccessCardName("access-card.png");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const adultAgreement =
      form.get("adultAgreement") === "on" || form.get("adultAgreement") === "true";

    // Basic client-side validation
    const payload = {
      title: String(form.get("title") ?? "(No Prefix)"),
      fullName: String(form.get("fullName") ?? "").trim(),
      email,
      phone: String(form.get("phone") ?? "").trim(),
      note: String(form.get("note") ?? ""),
      adultAgreement
    };

    const errors: Record<string, string> = {};
    if (!payload.fullName) errors.fullName = "Please enter your full name.";
    if (!isValidEmail(payload.email)) errors.email = "Please enter a valid email address.";
    if (!/^[+0-9\s-]{7,20}$/.test(payload.phone)) errors.phone = "Please enter a valid WhatsApp number.";
    if (!payload.adultAgreement) errors.adultAgreement = "You must confirm the adult-only agreement.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setStatus("error");
      setMessage("Please fix the highlighted fields and try again.");
      return;
    }

    if (submittedEmail && submittedEmail === payload.email) {
      setStatus("closed");
      setMessage("This email has already been submitted. Please do not fill the form twice.");
      return;
    }

    setLastPayload(payload);

    // network submission with retry/backoff for transient failures
    async function sendPayload(data: any, maxAttempts = 3) {
      setIsRetrying(false);
      setRetryAttempts(0);
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        setRetryAttempts(attempt);
        try {
          if (attempt > 1) {
            setIsRetrying(true);
          }

          const response = await fetch("/api/rsvp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const result = await response.json().catch(() => ({}));

          if (response.status === 409) {
            setStatus("closed");
            setMessage(result.message ?? "This email has already been registered.");
            return false;
          }

          if (!response.ok) {
            // server error, may retry
            if (response.status >= 500 && attempt < maxAttempts) {
              // exponential backoff
              // eslint-disable-next-line no-await-in-loop
              await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
              continue;
            }
            setStatus("error");
            setMessage(result.message ?? "Something went wrong. Please try again.");
            return false;
          }

          // success
          setStatus("success");
          setMessage("Thank you! Your RSVP has been received and a confirmation email is on its way.");
          setSubmittedEmail(payload.email);
          if (result.entryCode) {
            await fetchAccessCardPreview(payload, result.entryCode);
          }
          return true;
        } catch (err) {
          // network error
          if (attempt < maxAttempts) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
            continue;
          }
          setStatus("error");
          setMessage("Network error. Please check your connection and try again.");
          return false;
        } finally {
          setIsRetrying(false);
        }
      }
      return false;
    }

    const ok = await sendPayload(payload, 3);
    if (ok) event.currentTarget.reset();
  }

  function playAudioOnce() {
    if (!audioRef.current) return;
    if (audioStarted) return;
    audioRef.current.play().then(() => {
      setAudioStarted(true);
      setSoundOn(true);
    }).catch(() => {
      setAudioStarted(false);
      setSoundOn(false);
    });
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  return (
    <main className="overflow-hidden text-ink page-backdrop">
      {toast ? (
        <div className="fixed left-1/2 top-20 z-[60] -translate-x-1/2 px-4" aria-live="polite">
          <div className="invitation-border rounded-full bg-ivory/90 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-moss shadow-soft backdrop-blur">
            {toast}
          </div>
        </div>
      ) : null}
      <SoundButton
        audioRef={audioRef}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
        audioStarted={audioStarted}
        setAudioStarted={setAudioStarted}
      />

      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-ivory/82 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          <a href="#home" className="font-serif text-lg text-moss sm:text-xl">
            King David &amp; Esther
          </a>
          <a
            href="#rsvp"
            className="inline-flex items-center gap-1.5 rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ivory shadow-soft transition hover:bg-wine/90"
          >
            <Send size={13} /> RSVP
          </a>
        </div>
      </nav>

      {/* Hero with curtain */}
      <CurtainHero onOpen={playAudioOnce} />

      {/* Date Reveal / Scratch Card */}
      <DateRevealSection />

      {/* Our Story */}
      <section id="story" className="py-16 sm:py-24">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <FadeIn>
            <StoryArch />
          </FadeIn>
          <FadeIn delay={0.12}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              Our Story
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl lg:text-6xl">
              A love rooted in grace, friendship and promise.
            </h2>
            <p className="mt-6 text-base leading-8 text-ink/75">
              Our journey has been shaped by faith, laughter, family and the quiet
              certainty of choosing each other. As we begin this new chapter, we are
              honoured to gather the people we love for a celebration filled with
              warmth, beauty and thanksgiving.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Pre-Wedding Portraits */}
      <section id="pre-wedding" className="relative bg-ivory py-16 sm:py-24">
        <FloatingPetals />
        <div className="section-shell relative z-10">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              Pre-Wedding Portraits
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl lg:text-6xl">
              A quiet gallery for the memories before the day.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-ink/72">
              Portraits will be added here soon. For now, these soft editorial frames
              hold the space for the couple&apos;s pre-wedding moments.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {[
              { title: "Garden Walk", image: "/couple-images/garden-car.png" },
              { title: "Soft Portrait", image: "/couple-images/portrait-one.png" },
              { title: "Evening Promise", image: "/couple-images/portrait-two.png" }
            ].map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.08}>
                <div className="photo-placeholder group relative h-80 overflow-hidden bg-champagne shadow-soft sm:h-[28rem]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-moss/70 via-moss/15 to-transparent" />
                  <div className="absolute inset-6 border border-ivory/70" />
                  <div className="absolute bottom-8 left-6 right-6 text-center text-ivory">
                    <p className="font-script text-4xl text-ivory sm:text-5xl">{item.title}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
                      Pre-wedding moments
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Wedding Details */}
      <section id="details" className="bg-moss py-16 text-ivory sm:py-24">
        <div className="section-shell">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">
              Wedding Details
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Saturday, 22 August 2026
            </h2>
          </FadeIn>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: CalendarDays, label: "Date", value: "Saturday, 22 Aug 2026" },
              { icon: MapPin, label: "Venue", value: "Camp Young, Ede" },
              { icon: Clock, label: "Reception", value: "Follows immediately" }
            ].map((item) => (
              <FadeIn key={item.label}>
                <div className="h-full border border-ivory/18 bg-ivory/8 p-6 backdrop-blur sm:p-7">
                  <item.icon className="mb-4 text-blush sm:mb-5" size={24} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">
                    {item.label}
                  </p>
                  <p className="mt-3 font-serif text-2xl sm:text-3xl">{item.value}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <FadeIn>
              <div className="bg-ivory p-6 text-ink shadow-soft sm:p-7">
                <h3 className="font-serif text-3xl text-moss sm:text-4xl">Order of Celebration</h3>
                <div className="mt-6 space-y-5">
                  {schedule.map((item) => (
                    <div
                      key={item.time}
                      className="grid gap-1 border-b border-moss/10 pb-4 sm:grid-cols-[7rem_1fr] sm:gap-4"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">
                        {item.time}
                      </span>
                      <span className="font-serif text-xl text-ink sm:text-2xl">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <div className="overflow-hidden bg-ivory shadow-soft">
                <iframe
                  title="Camp Young Ede map"
                  src={`https://www.google.com/maps?q=${encodedVenue}&output=embed`}
                  className="h-72 w-full border-0 sm:h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodedVenue}`}
                  className="flex items-center justify-center gap-2 bg-champagne px-5 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-moss transition hover:bg-champagne/80"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation size={16} /> Open Directions
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Dress Code */}
      <section id="dress-code" className="py-16 sm:py-24">
        <div className="section-shell">
          <FadeIn className="floral-frame invitation-border bg-ivory/78 p-6 shadow-soft sm:p-12">
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <p className="font-script text-4xl text-sage sm:text-5xl lg:text-6xl">Style Inspiration</p>
              <h2 className="mt-2 font-serif text-4xl italic leading-tight text-moss sm:text-5xl lg:text-7xl">
                Formal Garden Elegance
              </h2>
              <p className="mx-auto mt-6 max-w-3xl leading-8 text-ink/76">
                In honour of this special occasion, guests are kindly requested to
                dress in modest, elegant, and formal outfits inspired by our curated
                color palette.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-wine">
                Please note this is just a guide and absolutely not mandatory
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-6 sm:grid-cols-2">
              <div className="bg-champagne/56 p-6 sm:p-7">
                <AttireIllustration type="ladies" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {palette.slice(0, 4).map(([name, color]) => (
                    <span key={`${name}-ladies`} className="rounded-full border border-moss/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-moss" style={{ backgroundColor: `${color}18` }}>
                      {name}
                    </span>
                  ))}
                </div>
                <Flower2 className="mb-4 mt-5 text-wine sm:mb-5" />
                <h3 className="font-serif text-3xl text-moss sm:text-4xl">Ladies</h3>
                <p className="mt-4 leading-8 text-ink/76">
                  Long dresses or refined midi-length dresses with tasteful coverage
                  and soft, elegant detailing. Fascinators or subtle headpieces are
                  welcome to complement the overall look.
                </p>
              </div>
              <div className="bg-blush/34 p-6 sm:p-7">
                <AttireIllustration type="gentlemen" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {palette.slice(2, 6).map(([name, color]) => (
                    <span key={`${name}-gentlemen`} className="rounded-full border border-moss/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-moss" style={{ backgroundColor: `${color}18` }}>
                      {name}
                    </span>
                  ))}
                </div>
                <Sparkles className="mb-4 mt-5 text-wine sm:mb-5" />
                <h3 className="font-serif text-3xl text-moss sm:text-4xl">Gentlemen</h3>
                <p className="mt-4 leading-8 text-ink/76">
                  Well-tailored suits or blazers with dress trousers. Those who prefer
                  not to wear suits may opt for a neatly styled long-sleeved shirt
                  paired with formal trousers and polished shoes.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Gifts */}
      <section id="gifts" className="relative bg-moss py-16 text-ivory sm:py-24">
        <FloatingPetals />
        <div className="section-shell relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">
              Gifts
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Your presence is our greatest gift.
            </h2>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="invitation-border bg-ivory p-6 text-ink shadow-soft sm:p-10">
              <Gift className="mb-5 text-wine" size={28} />
              <h3 className="font-serif text-3xl text-moss sm:text-4xl">Gifts</h3>
              <p className="mt-4 leading-8 text-ink/74">
                Your presence on our special day is the greatest gift we could ask
                for. But if your heart feels called to give more, a monetary gift
                would be received with deep gratitude and love.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="bg-champagne/60 p-5">
                  <p className="font-serif text-xl text-moss sm:text-2xl">King-David Duruihuoma</p>
                  <p className="mt-3 text-sm uppercase tracking-[0.16em] text-wine">
                    Guaranty Trust Bank
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="font-serif text-2xl text-ink sm:text-3xl">0012782278</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("0012782278")}
                      className="rounded-full bg-wine/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-wine transition hover:bg-wine/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine/30"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="bg-blush/32 p-5">
                  <p className="font-serif text-xl text-moss sm:text-2xl">Blessing Timehin</p>
                  <p className="mt-3 text-sm uppercase tracking-[0.16em] text-wine">
                    Access Bank
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="font-serif text-2xl text-ink sm:text-3xl">0733934621</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("0733934621")}
                      className="rounded-full bg-wine/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-wine transition hover:bg-wine/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine/30"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Guest Notice before RSVP */}
      <GuestNoticeSection />

      {/* RSVP */}
      <section id="rsvp" className="bg-champagne/60 py-16 sm:py-24">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              RSVP
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl lg:text-6xl">
              Kindly reserve your place.
            </h2>
            <p className="mt-6 leading-8 text-ink/74">
              Please respond early so we can prepare a warm and comfortable celebration
              for every guest. Capacity is limited to {rsvpLimit} guests.
            </p>
            <div className="mt-7 flex items-center gap-3 text-moss">
              <Users size={22} />
              <span className="font-serif text-xl sm:text-2xl">Maximum guest limit: {rsvpLimit}</span>
            </div>
            <div className="mt-8 rounded-xl border border-wine/10 bg-ivory/72 p-5">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-moss" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">
                  For RSVP inquiries
                </p>
              </div>
              <div className="mt-4 grid gap-2">
                {rsvpContacts.map((contact) => (
                  <a
                    key={contact.name}
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-wine/5"
                  >
                    <span className="font-medium text-ink">{contact.name}</span>
                    <span className="text-ink/62">{contact.phone}</span>
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <form onSubmit={submitRsvp} className="invitation-border bg-ivory p-6 shadow-soft sm:p-9">
              {status === "closed" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-14 text-center"
                >
                  <motion.div
                    animate={{ x: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 text-5xl sm:text-6xl"
                  >
                    🛑
                  </motion.div>
                  <p className="font-serif text-3xl text-wine sm:text-4xl">RSVP Closed</p>
                  <p className="mt-3 leading-7 text-ink/72">
                    {message || "Capacity has been reached."}
                  </p>
                </motion.div>
              ) : status === "success" ? (
                <div className="space-y-5 py-8 text-center">
                  <SuccessAnimation />
                  <div className="mx-auto max-w-xl rounded-[1.75rem] border border-wine/25 bg-ivory/10 p-6 shadow-soft backdrop-blur-xl text-left text-ink/80">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blush">Your digital access card</p>
                    <p className="mt-2 font-serif text-3xl text-moss">Entry code ready</p>
                    <p className="mt-3 leading-7 text-ink/75">Your RSVP was received successfully. Download your access card below or save it directly to your device.</p>
                    {entryCode ? (
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <p className="rounded-full bg-wine/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-wine">
                          ENTRY CODE: {entryCode}
                        </p>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(entryCode)}
                          className="rounded-full bg-moss px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ivory shadow-soft transition hover:bg-moss/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine/30"
                        >
                          Copy code
                        </button>
                      </div>
                    ) : null}
                    {accessCardUrl ? (
                      <>
                        <div className="mt-6 rounded-[2rem] border border-ivory/20 bg-[#2f0c0f]/76 p-4">
                          <img
                            src={accessCardUrl}
                            alt="Access card preview"
                            className="mx-auto max-h-[320px] w-full object-contain rounded-[1.5rem] border border-wine/10 shadow-soft"
                          />
                        </div>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <a
                            href={accessCardUrl}
                            download={accessCardName}
                            className="inline-flex items-center justify-center rounded-full bg-wine px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-ivory shadow-soft transition hover:bg-wine/90"
                          >
                            Download access card
                          </a>
                          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-champagne">Saved only for you</span>
                        </div>
                      </>
                    ) : (
                      <div className="mt-6 rounded-[1.25rem] border border-wine/20 bg-champagne/40 p-5 text-sm leading-7 text-ink/74">
                        <p>A confirmation email is on its way with your access card attached.</p>
                        <p className="mt-3 font-semibold text-moss">{message}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                    <label>
                      <span className="label">Title *</span>
                      <select className="field" name="title" defaultValue="(No Prefix)" required>
                        {titleOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="label">Full name *</span>
                        <input className="field" name="fullName" required />
                        {formErrors.fullName ? (
                        <p className="mt-1 text-xs text-wine">{formErrors.fullName}</p>
                        ) : null}
                    </label>
                    <label>
                      <span className="label">Email *</span>
                        <input className="field" type="email" name="email" required />
                        {formErrors.email ? <p className="mt-1 text-xs text-wine">{formErrors.email}</p> : null}
                    </label>
                    <label>
                      <span className="label">WhatsApp number *</span>
                        <input className="field" name="phone" inputMode="tel" required />
                        {formErrors.phone ? <p className="mt-1 text-xs text-wine">{formErrors.phone}</p> : null}
                    </label>
                  </div>
                  <label className="mt-4 block sm:mt-5">
                    <span className="label">Message (optional)</span>
                    <textarea className="field min-h-28 resize-y sm:min-h-32" name="note" />
                  </label>
                  <label className="mt-5 flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="adultAgreement"
                      required
                      className="mt-1 h-5 w-5 cursor-pointer rounded border-[1.5px] border-wine/40 bg-ivory accent-wine"
                    />
                    <span className="text-sm leading-6 text-ink/76">
                      I understand this invite is strictly for me alone and my unique code will only grant access to <strong>one adult</strong>.
                    </span>
                  </label>
                  {formErrors.adultAgreement ? (
                    <p className="mt-2 text-xs text-wine">{formErrors.adultAgreement}</p>
                  ) : null}
                  {status === "error" && lastPayload ? (
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-wine/10 bg-rose/5 p-3">
                      <p className="text-sm text-ink/72">Submission failed. You can retry sending your RSVP.</p>
                      <div className="flex items-center gap-2">
                        {isRetrying ? (
                          <span className="text-xs text-ink/60">Retrying ({retryAttempts})…</span>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              setStatus("loading");
                              const maxAttempts = 3;
                              setIsRetrying(true);
                              for (let i = 1; i <= maxAttempts; i += 1) {
                                setRetryAttempts(i);
                                try {
                                  const res = await fetch("/api/rsvp", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(lastPayload),
                                  });
                                  const j = await res.json().catch(() => ({}));
                                  if (!res.ok) {
                                    if (res.status >= 500 && i < maxAttempts) {
                                      await new Promise((r) => setTimeout(r, 400 * Math.pow(2, i)));
                                      continue;
                                    }
                                    setStatus("error");
                                    setMessage(j.message ?? "Submission failed.");
                                    setIsRetrying(false);
                                    break;
                                  }
                                  setStatus("success");
                                  setSubmittedEmail(lastPayload?.email ?? null);
                                  if (j.entryCode && lastPayload) {
                                    await fetchAccessCardPreview(lastPayload, j.entryCode);
                                  }
                                  setIsRetrying(false);
                                  break;
                                } catch (e) {
                                  if (i < maxAttempts) {
                                    await new Promise((r) => setTimeout(r, 400 * Math.pow(2, i)));
                                    continue;
                                  }
                                  setStatus("error");
                                  setMessage("Network error during retry.");
                                  setIsRetrying(false);
                                }
                              }
                            }}
                            className="rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ivory"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-wine px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-ivory transition hover:bg-wine/90 disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <Loader2 className="animate-spin" size={17} />
                    ) : (
                      <CheckCircle2 size={17} />
                    )}
                    Submit RSVP
                  </motion.button>
                </>
              )}
            </form>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
