"use client";

import { motion, useAnimation } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
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

const weddingDate = new Date("2026-08-22T10:00:00+01:00");
const rsvpLimit = Number(process.env.NEXT_PUBLIC_RSVP_LIMIT ?? 80);

const palette = [
  ["Sage green", "#6f7a57"],
  ["Deep wine/burgundy", "#6e0d1b"],
  ["Warm brown", "#8b5a46"],
  ["Terracotta/peach", "#c9785e"],
  ["Dusty nude pink", "#d7a79c"],
  ["Blush pink", "#ebc2bb"]
];

const venueQuery = "Camp Young, Ede, Osun State, Nigeria";
const encodedVenue = encodeURIComponent(venueQuery);

const schedule = [
  { time: "10:00 AM", title: "Wedding ceremony" },
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
  { name: "Brother Joe", phone: "08102765976" },
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
  className = "",
  variant = "up"
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: "up" | "scale" | "left" | "right" | "stagger" | "zoom";
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
      { threshold: 0.08, rootMargin: "-40px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [controls]);

  const variants = {
    up: {
      hidden: { opacity: 0, y: 40, scale: 0.97 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, delay, ease: [0.76, 0, 0.24, 1] } }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.88, filter: "blur(4px)" },
      visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.9, delay, ease: [0.76, 0, 0.24, 1] } }
    },
    left: {
      hidden: { opacity: 0, x: -60 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay, ease: [0.76, 0, 0.24, 1] } }
    },
    right: {
      hidden: { opacity: 0, x: 60 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay, ease: [0.76, 0, 0.24, 1] } }
    },
    stagger: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.76, 0, 0.24, 1] } }
    },
    zoom: {
      hidden: { opacity: 0, scale: 0.92 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.9, delay, ease: [0.76, 0, 0.24, 1] } }
    }
  };

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={variants[variant]} className={className}>
      {children}
    </motion.div>
  );
}

function SectionShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`section-shell ${className}`}>{children}</div>;
}

function StaggerChildren({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start("visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }
      }}
      className={className}
    >
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
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-wine/10 text-wine sm:h-20 sm:w-20"
        >
          <Heart className="h-8 w-8 sm:h-10 sm:w-10" />
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
        <p className="text-sm leading-7 text-ink/70">
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
  setAudioStarted
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;
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

  // Pause audio when page is minimized, resume from same position when back
  useEffect(() => {
    const handleVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        if (!audio.paused) audio.pause();
      } else {
        if (soundOn && audio.paused) {
          audio.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [soundOn]);

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
    <div className="story-keepsake relative mx-auto max-w-xs overflow-hidden rounded-[2rem] border border-wine/10 bg-white/85 p-7 shadow-soft backdrop-blur sm:max-w-sm">
      <div className="story-vine" aria-hidden />
      <div className="relative z-10 rounded-[1.5rem] border border-champagne/80 bg-ivory/70 p-6 text-center">
        <p className="font-script text-5xl leading-none text-wine sm:text-6xl">Rooted in Grace</p>
        <p className="mx-auto mt-5 max-w-xs text-sm leading-7 text-ink/70">
          A quiet keepsake of faith, friendship, family and the joy of choosing forever.
        </p>
        <div className="mt-7 grid gap-3 text-left">
          {[{ icon: Heart, label: "Faith" }, { icon: Heart, label: "Friendship" }, { icon: Heart, label: "Forever" }].map((item) => (
            <div key={item.label} className="group flex items-center gap-3 rounded-2xl border border-wine/10 bg-white/70 px-4 py-3 transition hover:bg-white/90 hover:shadow-soft">
              <item.icon size={16} className="text-wine/50 group-hover:text-wine transition-colors" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                {item.label}
              </span>
            </div>
          ))}
        </div>
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

function RomanticAmbience({ variant = "soft" }: { variant?: "soft" | "curtain" | "gallery" | "details" }) {
  return (
    <div className={`romantic-ambience romantic-ambience-${variant}`} aria-hidden>
      {Array.from({ length: 9 }).map((_, index) => (
        <span
          key={`heart-${index}`}
          className="ambience-heart"
          style={{
            left: `${8 + ((index * 13) % 82)}%`,
            animationDelay: `${index * 0.55}s`,
            animationDuration: `${8 + (index % 4)}s`
          }}
        />
      ))}
      {Array.from({ length: 7 }).map((_, index) => (
        <span
          key={`spark-${index}`}
          className="ambience-spark"
          style={{
            left: `${12 + ((index * 17) % 76)}%`,
            top: `${16 + ((index * 19) % 68)}%`,
            animationDelay: `${index * 0.7}s`
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
      className={`scratch-card invitation-border relative mx-auto w-full max-w-lg overflow-hidden bg-ivory/85 p-7 text-center shadow-soft ${
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

function CurtainHero({
  opened,
  setOpened,
  onOpen
}: {
  opened: boolean;
  setOpened: (v: boolean) => void;
  onOpen: () => void;
}) {
  const countdown = useCountdown();

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [opened]);

  return (
    <section id="home" className={`relative ${opened ? "min-h-screen" : "min-h-[100svh]"}`}>
      <div className={`curtain-stage relative flex ${opened ? "min-h-screen is-open" : "min-h-[100svh]"} items-center pt-16 sm:pt-20 page-backdrop ${opened ? "" : "overflow-hidden"}`}>
        <div className="absolute inset-0 -z-20" style={{background: "linear-gradient(rgba(251,246,237,0.58),rgba(251,246,237,0.86)),linear-gradient(135deg,#e9c0b6 0%,#eadfc9 50%,#d4c9a8 100%)"}} />
        {!opened ? <RomanticAmbience variant="curtain" /> : null}
        <FloatingPetals />

        {/* Center glow */}
        <div className={`curtain-center-glow ${opened ? "is-open" : ""}`} />

        {/* Valance — hidden when open */}
        <div className={`curtain-valance pointer-events-none ${opened ? "opened" : ""}`} />

        {/* Left curtain panel */}
        <div
          id="curtain-left"
          className={`curtain-panel curtain-left ${opened ? "opened" : ""}`}
        >
          <div className="curtain-fabric" />
          <div className="curtain-pleats" />
          <span className="curtain-tie curtain-tie-left" />
        </div>

        {/* Right curtain panel */}
        <div
          id="curtain-right"
          className={`curtain-panel curtain-right ${opened ? "opened" : ""}`}
        >
          <div className="curtain-fabric" />
          <div className="curtain-pleats" />
          <span className="curtain-tie curtain-tie-right" />
        </div>

        {/* Floating hearts/sparkles on closed curtain */}
        {!opened && (
          <div className="pointer-events-none absolute inset-0 z-25 overflow-hidden">
            <motion.span
              className="absolute h-3 w-3 rounded-full bg-rose/30"
              style={{ left: '15%', top: '30%' }}
              animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute h-2 w-2 rounded-full bg-champagne/40"
              style={{ left: '75%', top: '25%' }}
              animate={{ y: [0, -15, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <motion.span
              className="absolute h-2.5 w-2.5 rounded-full bg-rose/25"
              style={{ left: '40%', top: '60%' }}
              animate={{ y: [-8, 8, -8], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.span
              className="absolute h-1.5 w-1.5 rounded-full bg-champagne/30"
              style={{ left: '55%', top: '40%' }}
              animate={{ y: [0, -12, 0], opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <motion.span
              className="absolute h-2 w-2 rounded-full bg-rose/20"
              style={{ left: '85%', top: '55%' }}
              animate={{ y: [-6, 6, -6], opacity: [0.15, 0.45, 0.15] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            />
            <motion.span
              className="absolute h-3 w-3 rounded-full bg-champagne/25"
              style={{ left: '25%', top: '70%' }}
              animate={{ y: [0, -10, 0], opacity: [0.1, 0.35, 0.1] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            />
          </div>
        )}

        {/* Tap overlay — standalone pulsing button with lovely glow */}
        <div className={`curtain-overlay px-6 sm:px-12 ${opened ? "hidden" : ""}`}>
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <span className="font-script text-2xl text-ivory/70 sm:text-3xl">Begin the celebration</span>
          </motion.div>
          <button
            type="button"
            onClick={() => {
              setOpened(true);
              try { onOpen(); } catch (e) { /* ignore */ }
            }}
            className="tap-to-open-btn group relative"
          >
            <span className="tap-to-open-ring absolute inset-[-4px] rounded-full" />
            <span className="relative z-10 inline-flex items-center gap-2 rounded-full border border-ivory/60 bg-ivory/85 px-8 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-wine shadow-soft backdrop-blur transition-all duration-300 group-hover:bg-wine group-hover:text-ivory group-hover:scale-105 sm:px-10 sm:py-5 sm:text-sm">
              <Sparkles size={16} className="text-wine/60 group-hover:text-ivory/80" />
              Tap to Open
              <Sparkles size={16} className="text-wine/60 group-hover:text-ivory/80" />
            </span>
          </button>
        </div>

        {/* Light flash overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-12"
          initial={{ opacity: 0 }}
          animate={opened ? { opacity: [0, 0.25, 0] } : { opacity: 0 }}
          transition={{ duration: 0.5, times: [0, 0.08, 0.5] }}
          style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,245,225,0.6), transparent 70%)" }}
        />

        {/* Hero content revealed after curtain opens — staggered entrance */}
        <motion.div
          className="hero-content section-shell relative z-10 grid gap-6 py-6 sm:gap-10 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
          initial={false}
          animate={{ opacity: opened ? 1 : 0, pointerEvents: opened ? "auto" : "none" }}
          transition={{ duration: 0.01, delay: 0.5 }}
        >
          <div className="text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={opened ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.7, ease: [0.76, 0, 0.24, 1] }}
              className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-wine"
            >
              Formal Garden Elegance
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={opened ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.85, ease: [0.76, 0, 0.24, 1] }}
              className="hero-title font-script leading-[0.82] text-moss"
            >
              King-David
              <span className="block font-serif text-2xl italic text-wine sm:text-4xl">&amp;</span>
              Esther
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={opened ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 1.0, ease: [0.76, 0, 0.24, 1] }}
              className="mx-auto mt-5 max-w-xl text-sm leading-7 text-ink/75 sm:text-base lg:mx-0"
            >
              With grateful hearts, we invite you to celebrate a warm garden wedding
              at Camp Young, Ede. Reception follows immediately.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={opened ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 1.15, ease: [0.76, 0, 0.24, 1] }}
              className="mt-10 flex flex-col items-center gap-2"
            >
              <motion.span
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-ink/40"
              >
                <ChevronDown size={20} />
              </motion.span>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-ink/40">
                Scroll to discover
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, filter: "blur(4px)" }}
            animate={opened ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
            transition={{ duration: 1.0, delay: 1.3, ease: [0.76, 0, 0.24, 1] }}
            className="countdown-card"
          >
            <div className="invitation-border rounded-[2rem] bg-ivory/80 p-4 shadow-soft backdrop-blur sm:p-5">
              <div className="rounded-[1.5rem] bg-champagne/45 p-4 text-center sm:p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-moss sm:mb-5">
                  Countdown to our day
                </p>
                <div className="countdown-grid grid grid-cols-4 gap-1 sm:gap-2">
                  {Object.entries(countdown).map(([label, value]) => (
                    <div key={label} className="bg-ivory/80 px-1 py-3 sm:px-2 sm:py-4">
                      <motion.strong
                        key={String(value)}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1.15, 1] }}
                        transition={{ duration: 0.3 }}
                        className="block font-serif text-2xl text-wine sm:text-3xl lg:text-4xl"
                      >
                        {String(value).padStart(2, "0")}
                      </motion.strong>
                      <span className="text-[0.55rem] uppercase tracking-[0.14em] text-ink/60 sm:text-[0.62rem] sm:tracking-[0.18em]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </section>
  );
}

function DateRevealSection() {
  return (
    <section id="date-reveal" className="premium-section date-reveal-section py-24 sm:py-32">
      <RomanticAmbience variant="soft" />
      <div className="section-shell">
        <FadeIn variant="scale" className="mx-auto max-w-2xl text-center">
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
          <div className="flex flex-col items-center gap-2">
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-moss/40"
            >
              <ChevronDown size={18} />
            </motion.span>
            <span className="text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-moss/40">
              Scroll for details
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function AttireIllustration({ type }: { type: "ladies" | "gentlemen" }) {
  const isLadies = type === "ladies";
  return (
    <div className="attire-illustration relative mb-4 h-36 overflow-hidden bg-ivory/50 sm:h-48 lg:h-64">
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
    </div>
  );
}

function GuestNoticeSection() {
  return (
    <section className="premium-section guest-notice-section bg-white py-20 sm:py-24">
      <RomanticAmbience variant="soft" />
      <div className="section-shell">
        <FadeIn>
          <div className="premium-card mx-auto max-w-3xl p-8 shadow-soft sm:p-12">
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
  const [opened, setOpened] = useState(false);
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
    <main className="text-ink page-backdrop">
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
        setAudioStarted={setAudioStarted}
      />

      {/* Navigation with glass shimmer */}
      {opened && (
        <motion.nav
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-ivory/80 backdrop-blur-xl"
        >
          <div className="section-shell flex h-14 items-center justify-between sm:h-16">
            <a href="#home" className="group font-serif text-lg text-moss sm:text-xl">
              King-David &amp; Esther
              <span className="block h-0.5 w-0 bg-wine/40 transition-all duration-500 group-hover:w-full" />
            </a>
            <motion.a
              href="#rsvp"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-1.5 rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ivory shadow-soft transition hover:bg-wine/90"
            >
              <Send size={13} /> RSVP
            </motion.a>
          </div>
        </motion.nav>
      )}

      {/* Hero with curtain */}
      <CurtainHero opened={opened} setOpened={setOpened} onOpen={playAudioOnce} />

      {/* Wrap other elements in a container that stays completely hidden when closed */}
      <div className={opened ? "block animate-fade-in" : "hidden"}>
        {/* Date Reveal / Scratch Card */}
        <DateRevealSection />

      {/* Our Story */}
      <section id="story" className="premium-section section-story py-24 sm:py-32">
        <RomanticAmbience variant="soft" />
        <div className="section-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <FadeIn variant="left">
            <StoryArch />
          </FadeIn>
          <FadeIn variant="right" delay={0.12} className="text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              Our Story
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl lg:text-6xl">
              A love rooted in grace, friendship and promise.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-base leading-8 text-ink/75 lg:mx-0 lg:max-w-none">
              Our journey has been shaped by faith, laughter, family and the quiet
              certainty of choosing each other. As we begin this new chapter, we are
              honoured to gather the people we love for a celebration filled with
              warmth, beauty and thanksgiving.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Pre-Wedding Portraits */}
      <section id="pre-wedding" className="premium-section section-gallery relative bg-white py-24 sm:py-32">
        <RomanticAmbience variant="gallery" />
        <FloatingPetals />
        <div className="section-shell relative z-10">
          <FadeIn variant="zoom" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              Pre-Wedding Portraits
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl lg:text-6xl">
              A soft gallery with room for every moment to breathe.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-ink/70">
              A clean editorial space for the couple&apos;s pre-wedding portraits, with gentle motion and soft palette accents.
            </p>
          </FadeIn>

          <StaggerChildren className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {[
              { title: "Garden Walk", image: "/couple-images/garden-car.png" },
              { title: "Soft Portrait", image: "/couple-images/portrait-one.png" },
              { title: "Evening Promise", image: "/couple-images/portrait-two.png" }
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="photo-placeholder group relative h-56 overflow-hidden bg-champagne shadow-soft transition-all duration-500 hover:shadow-[0_30px_90px_rgba(201,120,94,0.35)] hover:ring-2 hover:ring-rose/30 sm:h-72 lg:h-96">
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
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Wedding Details */}
      <section id="details" className="premium-section section-details bg-ivory py-24 text-ink sm:py-32">
        <RomanticAmbience variant="details" />
        <div className="section-shell">
          <FadeIn variant="scale" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              Wedding Details
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl lg:text-6xl">
              Ceremony, reception and directions.
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              { icon: MapPin, label: "Venue", value: "Camp Young, Ede" },
              { icon: Clock, label: "Reception", value: "Follows immediately" }
            ].map((item) => (
              <FadeIn key={item.label}>
                <div className="premium-card h-full p-6 sm:p-7">
                  <item.icon className="mb-4 text-wine sm:mb-5" size={24} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss/70">
                    {item.label}
                  </p>
                  <p className="mt-3 font-serif text-2xl sm:text-3xl">{item.value}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <FadeIn>
              <div className="premium-card p-6 text-ink sm:p-7">
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
            <FadeIn variant="right" delay={0.12}>
              <div className="premium-card overflow-hidden p-0">
                <iframe
                  title="Camp Young Ede map"
                  src={`https://www.google.com/maps?q=${encodedVenue}&output=embed`}
                  className="h-48 w-full border-0 sm:h-56 lg:h-80"
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
      <section id="dress-code" className="premium-section section-style py-24 sm:py-32">
        <RomanticAmbience variant="soft" />
        <div className="section-shell">
          <FadeIn variant="zoom" className="floral-frame invitation-border bg-white/90 p-6 shadow-soft sm:p-12">
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <p className="font-script text-4xl text-sage sm:text-5xl lg:text-6xl">Style Inspiration</p>
              <h2 className="mt-2 font-serif text-4xl italic leading-tight text-moss sm:text-5xl lg:text-7xl">
                Formal Garden Elegance
              </h2>
              <p className="mx-auto mt-6 max-w-3xl leading-8 text-ink/75">
                In honour of this special occasion, guests are kindly requested to
                dress in modest, elegant, and formal outfits inspired by our curated
                color palette.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-wine">
                Please note this is just a guide and absolutely not mandatory
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-6 sm:grid-cols-2">
              <div className="bg-champagne/20 p-6 sm:p-7">
                <AttireIllustration type="ladies" />
                <Flower2 className="mb-4 mt-5 text-wine sm:mb-5" />
                <h3 className="font-serif text-3xl text-moss sm:text-4xl">Ladies</h3>
                <p className="mt-4 leading-8 text-ink/75">
                  Long dresses or refined midi-length dresses with tasteful coverage
                  and soft, elegant detailing. Fascinators or subtle headpieces are
                  welcome to complement the overall look.
                </p>
              </div>
              <div className="bg-blush/15 p-6 sm:p-7">
                <AttireIllustration type="gentlemen" />
                <Sparkles className="mb-4 mt-5 text-wine sm:mb-5" />
                <h3 className="font-serif text-3xl text-moss sm:text-4xl">Gentlemen</h3>
                <p className="mt-4 leading-8 text-ink/75">
                  Well-tailored suits or blazers with dress trousers. Those who prefer
                  not to wear suits may opt for a neatly styled long-sleeved shirt
                  paired with formal trousers and polished shoes.
                </p>
              </div>
            </div>

            {/* Color Palette Showcase */}
            <div className="relative z-10 mt-14 text-center">
              <div className="mx-auto max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
                  Wedding Color Palette
                </p>
                <h3 className="mt-2 font-serif text-3xl leading-tight text-moss sm:text-4xl">
                  A garden-inspired collection of hues
                </h3>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {palette.map(([name, color]) => (
                  <div key={name} className="flex items-center gap-3 rounded-2xl border border-moss/10 bg-white/70 p-3 text-left shadow-soft transition hover:bg-white/90">
                    <span
                      className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-moss">{name}</p>
                      <p className="text-xs text-ink/60 font-mono">{color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Gifts */}
      <section id="gifts" className="premium-section section-gifts relative bg-white py-24 text-ink sm:py-32">
        <RomanticAmbience variant="soft" />
        <FloatingPetals />
        <div className="section-shell relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <FadeIn variant="left">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              Gifts
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl lg:text-6xl">
              Your presence is our greatest gift.
            </h2>
          </FadeIn>

          <FadeIn variant="right" delay={0.12}>
            <div className="premium-card p-6 text-ink sm:p-10">
              <Gift className="mb-5 text-wine" size={28} />
              <h3 className="font-serif text-3xl text-moss sm:text-4xl">Gifts</h3>
              <p className="mt-4 leading-8 text-ink/74">
                Your presence on our special day is the greatest gift we could ask
                for. But if your heart feels called to give more, a monetary gift
                would be received with deep gratitude and love.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-champagne/20 p-4 sm:p-5">
                  <p className="font-serif text-xl text-moss sm:text-2xl">King David Duruihuoma</p>
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
                <div className="rounded-2xl bg-blush/15 p-4 sm:p-5">
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
      <section id="rsvp" className="premium-section section-rsvp bg-ivory/15 py-24 sm:py-32">
        <RomanticAmbience variant="soft" />
        <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <FadeIn variant="scale">
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
                    <span className="text-ink/60">{contact.phone}</span>
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn variant="stagger" delay={0.12}>
            <form onSubmit={submitRsvp} className="premium-card p-6 shadow-soft sm:p-9">
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
                  <p className="mt-3 leading-7 text-ink/70">
                    {message || "Capacity has been reached."}
                  </p>
                </motion.div>
              ) : status === "success" ? (
                <div className="space-y-5 py-8 text-center">
                  <SuccessAnimation />
                  {/* Premium digital access card wrapped for print */}
                  <div id="access-card-wrapper">
                  <div id="access-card" className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border-2 border-champagne bg-white shadow-soft">
                    {/* Card header — wine/sage gradient with monogram */}
                    <div className="bg-gradient-to-br from-wine via-cocoa to-sage px-5 py-6 text-center sm:px-6 sm:py-8">
                      {/* Wedding monogram — interlocking K + D + E with flourishes */}
                      <svg viewBox="0 0 120 120" className="mx-auto mb-3 h-20 w-20 sm:h-24 sm:w-24">
                        <defs>
                          <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFF8EF" />
                            <stop offset="100%" stopColor="#EBC2BB" />
                          </linearGradient>
                        </defs>
                        {/* Ornate outer ring */}
                        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,248,239,0.25)" strokeWidth="1.5" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,248,239,0.12)" strokeWidth="0.5" />
                        {/* Ring of dots */}
                        {Array.from({length:12}).map((_,i)=>{const a=i*30*Math.PI/180;const r=52;return <circle key={i} cx={60+r*Math.sin(a)} cy={60-r*Math.cos(a)} r="1.5" fill="rgba(255,248,239,0.35)" />})}
                        {/* Decorative top flourish */}
                        <path d="M45 22 Q60 10 75 22" fill="none" stroke="rgba(235,194,187,0.35)" strokeWidth="1" />
                        <circle cx="45" cy="22" r="2" fill="rgba(235,194,187,0.4)" />
                        <circle cx="75" cy="22" r="2" fill="rgba(235,194,187,0.4)" />
                        {/* Bottom vine flourish */}
                        <path d="M35 98 Q60 110 85 98" fill="none" stroke="rgba(235,194,187,0.35)" strokeWidth="1.2" />
                        <path d="M35 98 Q30 92 28 96" fill="none" stroke="rgba(235,194,187,0.3)" strokeWidth="1" />
                        <path d="M85 98 Q90 92 92 96" fill="none" stroke="rgba(235,194,187,0.3)" strokeWidth="1" />
                        <circle cx="28" cy="96" r="2" fill="rgba(235,194,187,0.4)" />
                        <circle cx="92" cy="96" r="2" fill="rgba(235,194,187,0.4)" />
                        {/* Left leaf */}
                        <path d="M38 100 Q42 94 48 98" fill="none" stroke="rgba(235,194,187,0.25)" strokeWidth="1" />
                        {/* K — large letter, left */}
                        <text x="38" y="72" fontFamily="Georgia, serif" fontSize="44" fontWeight="bold" fill="#FFF8EF" textAnchor="middle" letterSpacing="-1">K</text>
                        {/* D — smaller, centered above, rotated slightly */}
                        <g transform="rotate(-8, 60, 48)">
                          <text x="60" y="52" fontFamily="Georgia, serif" fontSize="22" fontWeight="bold" fill="url(#mg)" textAnchor="middle">D</text>
                        </g>
                        {/* E — large letter, right */}
                        <text x="82" y="72" fontFamily="Georgia, serif" fontSize="44" fontWeight="bold" fill="#FFF8EF" textAnchor="middle" letterSpacing="-1">E</text>
                        {/* Small decorative diamond between K and E */}
                        <rect x="58" y="68" width="4" height="4" rx="1" fill="#EBC2BB" transform="rotate(45,60,70)" />
                      </svg>
                      <h3 className="font-serif text-lg text-ivory sm:text-xl">King-David &amp; Esther</h3>
                      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-champagne/70 sm:text-[0.6rem]">
                        Wedding Access Pass
                      </p>
                    </div>
                    {/* Card body with palette colors */}
                    <div className="bg-ivory px-5 py-5 text-left sm:px-6 sm:py-6">
                      <div className="mb-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white/90 p-3 shadow-sm">
                          <p className="text-[0.45rem] font-semibold uppercase tracking-[0.2em] text-wine">Guest</p>
                          <p className="mt-0.5 truncate font-serif text-sm text-moss sm:text-base">{lastPayload?.fullName || "Guest"}</p>
                        </div>
                        <div className="rounded-xl bg-white/90 p-3 text-right shadow-sm">
                          <p className="text-[0.45rem] font-semibold uppercase tracking-[0.2em] text-wine">Entry Code</p>
                          <p className="mt-0.5 font-mono text-sm font-bold text-moss sm:text-base">{entryCode}</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-champagne/50 bg-white/60 p-3">
                        <p className="text-[0.45rem] font-semibold uppercase tracking-[0.2em] text-wine">Event Details</p>
                        <p className="font-serif text-sm text-moss sm:text-base">Camp Young, Ede</p>
                        <p className="text-[0.6rem] text-ink/60 sm:text-xs">Saturday, 22 August 2026 · 10:00 AM</p>
                      </div>
                      {/* Color palette strip */}
                      <div className="mt-3 flex gap-1 overflow-hidden rounded-lg">
                        {["#6f7a57","#6e0d1b","#8b5a46","#c9785e","#d7a79c","#ebc2bb"].map((c,i) => (
                          <div key={i} className="h-2 flex-1" style={{backgroundColor:c}} />
                        ))}
                      </div>
                      <p className="mt-3 text-center text-[0.4rem] font-semibold uppercase tracking-[0.25em] text-ink/40 sm:text-[0.45rem]">
                        1 Adult · Non-transferable
                      </p>
                    </div>
                    {/* Card footer with buttons */}
                    <div className="flex items-center justify-between gap-2 border-t border-champagne/30 bg-white px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-wine/10 px-2.5 py-1 font-mono text-[0.6rem] font-bold text-wine sm:text-xs">
                          {entryCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(entryCode || "")}
                          className="rounded-full bg-moss px-2.5 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-ivory transition hover:bg-moss/90 sm:text-[0.55rem]"
                        >
                          Copy
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-full bg-wine px-4 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-ivory shadow-soft transition hover:bg-wine/90 sm:text-[0.6rem]"
                      >
                        Save Card
                      </button>
                    </div>
                  </div>
                  </div>
                  {entryCode && (
                    <p className="text-xs text-ink/50">
                      Entry code: <strong className="text-moss">{entryCode}</strong> — save this or present at the entrance.
                    </p>
                  )}
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
                    <span className="text-sm leading-6 text-ink/75">
                      I understand this invite is strictly for me alone and my unique code will only grant access to <strong>one adult</strong>.
                    </span>
                  </label>
                  {formErrors.adultAgreement ? (
                    <p className="mt-2 text-xs text-wine">{formErrors.adultAgreement}</p>
                  ) : null}
                  {status === "error" && lastPayload ? (
                    <div className="mt-4 rounded-md border border-wine/10 bg-rose/5 p-3">
                      <p className="text-sm text-ink/70">{message || "Submission failed. You can retry sending your RSVP."}</p>
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

      {/* Footer */}
      <footer className="bg-moss py-12 text-center text-ivory sm:py-14">
        <div className="section-shell">
          <motion.p
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="font-script text-4xl sm:text-5xl"
          >
            King-David &amp; Esther
          </motion.p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-champagne/70">
            Camp Young, Ede
          </p>
          <p className="mt-5 text-xs text-ivory/40">
            Made with love
          </p>
        </div>
      </footer>
      </div>
    </main>
  );
}

