"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Flower2,
  Gift,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Music2,
  Navigation,
  Pause,
  Send,
  Share2,
  Sparkles,
  Users,
  XCircle
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const weddingDate = new Date("2026-08-22T11:00:00+01:00");
const rsvpLimit = Number(process.env.NEXT_PUBLIC_RSVP_LIMIT ?? 100);

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
  { time: "Immediately after", title: "Reception celebration" },
  { time: "Evening", title: "Dinner, music and memories" }
];

const titleOptions = ["Mr.", "Mrs.", "Miss.", "Dr.", "Prof.", "Pastor", "Evang.", "(No Prefix)"];
const rsvpContacts = [
  { name: "Sister Rhoda", phone: "08106993435" },
  { name: "Brother Joe", phone: "0812765976" },
  { name: "Bro Zion", phone: "09135037695" }
];

function buildWhatsAppUrl(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const normalizedPhone = cleanPhone.startsWith("0")
    ? `234${cleanPhone.slice(1)}`
    : cleanPhone;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

function useCountdown() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return useMemo(() => {
    const reference = now ?? weddingDate;
    const difference = Math.max(weddingDate.getTime() - reference.getTime(), 0);
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionFlourish({
  align = "center",
  tone = "wine"
}: {
  align?: "center" | "left";
  tone?: "wine" | "blush";
}) {
  return (
    <div
      aria-hidden
      className={`section-flourish flourish-${tone} ${align === "center" ? "is-center" : ""}`}
    >
      <span />
      <Heart size={14} fill="currentColor" />
      <span />
    </div>
  );
}

function SoundButton() {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<AudioContext | null>(null);

  async function toggleSound() {
    if (playing && audio) {
      await audio.close();
      setAudio(null);
      setPlaying(false);
      return;
    }

    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.value = 0.028;
    gain.connect(context.destination);

    [196, 246.94, 293.66, 392].forEach((frequency, index) => {
      const osc = context.createOscillator();
      const toneGain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      toneGain.gain.value = index === 0 ? 0.8 : 0.42;
      osc.connect(toneGain);
      toneGain.connect(gain);
      osc.start();
    });

    setAudio(context);
    setPlaying(true);
  }

  return (
    <button
      type="button"
      onClick={toggleSound}
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-wine text-ivory shadow-soft transition hover:bg-moss"
      aria-label={playing ? "Pause romantic background sound" : "Play romantic background sound"}
    >
      {playing ? <Pause size={18} /> : <Music2 size={18} />}
    </button>
  );
}

function StoryArch() {
  return (
    <div className="story-arch relative mx-auto h-[30rem] max-w-sm overflow-hidden rounded-xl bg-champagne shadow-soft love-card">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(251,246,237,0.12),rgba(63,72,31,0.42)),url('/garden-palette.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-ivory/20 via-rose/20 to-moss/58" />
      <div className="absolute inset-x-6 bottom-8 text-center text-ivory">
        <p className="font-script text-5xl">A Garden Promise</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em]">
          King-David & Esther
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


function FloatingHearts({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[18] overflow-hidden">
      {Array.from({ length: 18 }).map((_, index) => {
        const sizeClass = ["heart-sm", "heart-md", "heart-lg"][index % 3];
        const colorClass = ["heart-wine", "heart-rose", "heart-blush", "heart-champagne"][index % 4];
        return (
          <span
            key={index}
            className={`floating-heart ${sizeClass} ${colorClass}`}
            style={{
              left: `${6 + ((index * 17) % 88)}%`,
              animationDelay: `${index * 0.32}s`,
              animationDuration: `${4.8 + (index % 5) * 0.8}s`
            }}
          />
        );
      })}
    </div>
  );
}

function BackgroundHearts() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.14]">
      {Array.from({ length: 24 }).map((_, index) => {
        const sizeClass = ["heart-sm", "heart-md", "heart-lg"][index % 3];
        const colorClass = ["heart-wine", "heart-rose", "heart-blush", "heart-champagne"][index % 4];
        return (
          <span
            key={index}
            className={`floating-heart ${sizeClass} ${colorClass}`}
            style={{
              left: `${4 + ((index * 13) % 92)}%`,
              animationDelay: `${index * 0.45}s`,
              animationDuration: `${7 + (index % 5) * 1.5}s`
            }}
          />
        );
      })}
    </div>
  );
}

function ScratchDateCard() {
  const [progress, setProgress] = useState(0);
  const revealed = progress >= 4;

  function scratch() {
    setProgress((current) => Math.min(current + 1, 4));
  }

  return (
    <div
      className={`scratch-card love-pulse invitation-border relative mx-auto mt-7 max-w-xl overflow-hidden bg-ivory/84 p-5 text-center shadow-soft lg:mx-0 ${
        revealed ? "is-revealed" : ""
      }`}
      onPointerDown={scratch}
      onPointerMove={(event) => {
        if (event.buttons === 1) scratch();
      }}
    >
      {revealed ? (
        <div className="ribbon-field pointer-events-none absolute inset-0">
          {Array.from({ length: 10 }).map((_, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.12}s` }} />
          ))}
        </div>
      ) : null}
      <p className="relative z-10 text-xs font-semibold uppercase tracking-[0.22em] text-wine">
        Wedding Date
      </p>
      <p className="relative z-10 mt-2 font-serif text-3xl leading-relaxed text-moss text-sparkle">
        Saturday, 22 August 2026
      </p>
      {!revealed ? (
        <button
          type="button"
          className="scratch-cover absolute inset-0 z-20 flex flex-col items-center justify-center bg-champagne text-moss"
          onClick={scratch}
        >
          <span className="font-script text-5xl">Scratch to reveal</span>
          <span className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-wine">
            rub or tap gently
          </span>
        </button>
      ) : null}
    </div>
  );
}

function CurtainHero({ countdown }: { countdown: ReturnType<typeof useCountdown> }) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opened) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [opened]);

  return (
    <section id="home" className="relative min-h-[100svh]">
      <div className="relative flex min-h-[100svh] items-center overflow-hidden pt-16 sm:pt-20">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(251,246,237,0.58),rgba(251,246,237,0.86)),url('/garden-palette.jpg')] bg-cover bg-center" />
        <FloatingPetals />
        <FloatingHearts active={!opened} />

        <div className="curtain-valance pointer-events-none absolute inset-x-0 top-0 z-30 h-24">
          <motion.div
            className="pull-cord-anchor"
            initial={false}
            animate={{ opacity: opened ? 0 : 1, y: opened ? -48 : 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ pointerEvents: opened ? "none" : "auto" }}
          >
            <button
              type="button"
              onClick={() => setOpened(true)}
              className="pull-cord"
              aria-label="Pull the ribbon to open the curtains"
            >
              <span className="pull-cord-line" />
              <span className="pull-cord-bow">
                <span className="bow-knot" />
              </span>
              <span className="pull-cord-heart" />
              <span className="pull-cord-hint">pull</span>
            </button>
          </motion.div>
        </div>

        <motion.div
          className="curtain-panel left-0"
          animate={{ x: opened ? "-100%" : "0%", rotateY: opened ? 55 : 0, scale: opened ? 0.82 : 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="curtain-tie curtain-tie-left" />
        </motion.div>
        <motion.div
          className="curtain-panel right-0 scale-x-[-1]"
          animate={{ x: opened ? "100%" : "0%", rotateY: opened ? -55 : 0, scale: opened ? 0.82 : 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="curtain-tie curtain-tie-right" />
        </motion.div>
        <motion.div
          className="absolute inset-x-8 top-[35%] z-30 text-center sm:top-[38%]"
          animate={{ opacity: opened ? 0 : 1, y: opened ? -18 : 0 }}
          transition={{ duration: 0.7 }}
          style={{ pointerEvents: opened ? "none" : "auto" }}
        >
          <p className="font-script text-6xl leading-none text-ivory sm:text-7xl curtain-title">
            King David & Esther
          </p>
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="romantic-button mt-7 inline-flex items-center gap-2 rounded-full border border-ivory/70 bg-wine/60 px-7 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-ivory shadow-soft backdrop-blur"
          >
            <Sparkles size={14} />
            Tap to Open
            <Sparkles size={14} />
          </button>
        </motion.div>

        <motion.div
          className="hero-content section-shell relative z-10 grid gap-5 py-6 sm:gap-10 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
          initial={false}
          animate={{ opacity: opened ? 1 : 0, y: opened ? 0 : 38, scale: opened ? 1 : 0.98 }}
          transition={{ duration: 0.9, delay: opened ? 1.1 : 0, ease: "easeOut" }}
          style={{ pointerEvents: opened ? "auto" : "none" }}
        >
          <div className="text-center lg:text-left">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-wine">
              Formal Garden Elegance
            </p>
            <h1 className="hero-title font-script leading-[0.78] text-moss text-sparkle">
              King David
              <span className="block font-serif text-3xl italic text-wine sm:text-5xl">&</span>
              Esther
            </h1>
            <ScratchDateCard />
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink/74 lg:mx-0">
              With grateful hearts, we invite you to celebrate a warm garden wedding
              at Camp Young, Ede. Reception follows immediately.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#rsvp"
                className="romantic-button inline-flex items-center justify-center gap-2 rounded-full bg-wine px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-ivory shadow-soft"
              >
                <Heart size={17} /> Reserve Your Seat
              </a>
              <a
                href="#details"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-moss/25 bg-ivory/70 px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-moss"
              >
                <MapPin size={17} /> Details
              </a>
            </div>
          </div>

          <div className="countdown-card love-pulse invitation-border rounded-[2rem] bg-ivory/80 p-4 shadow-soft backdrop-blur sm:p-5">
            <div className="rounded-[1.5rem] bg-champagne/45 p-5 text-center">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-moss">
                Countdown to our day
              </p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(countdown).map(([label, value]) => (
                  <div key={label} className="bg-ivory/80 px-2 py-3 sm:py-4">
                    <strong className="block font-serif text-3xl text-wine sm:text-4xl">
                      {String(value).padStart(2, "0")}
                    </strong>
                    <span className="text-[0.62rem] uppercase tracking-[0.18em] text-ink/62">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center gap-3">
                {palette.map(([name, color]) => (
                  <span
                    key={name}
                    title={name}
                    className="h-8 w-8 rounded-full border-2 border-ivory shadow"
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

function AttireIllustration({ type }: { type: "ladies" | "gentlemen" }) {
  const isLadies = type === "ladies";
  return (
    <div className="attire-illustration relative mb-6 h-64 overflow-hidden bg-ivory/70">
      <div className="absolute inset-x-8 bottom-0 h-32 rounded-t-full bg-sage/12" />
      {isLadies ? (
        <>
          <div className="absolute left-[35%] top-9 h-12 w-12 rounded-full bg-[#8b5c4c]" />
          <div className="absolute left-[31%] top-[5.2rem] h-28 w-[5.6rem] rounded-t-full bg-blush" />
          <div className="absolute left-[24%] bottom-0 h-40 w-36 rounded-t-[5rem] bg-rose/90" />
          <div className="absolute left-[25%] bottom-0 h-36 w-32 rounded-t-[5rem] bg-[linear-gradient(90deg,rgba(251,246,237,0.3),transparent,rgba(123,0,20,0.12))]" />
          <div className="absolute right-[25%] top-12 h-9 w-28 rotate-[-8deg] rounded-full border border-wine/20 bg-champagne" />
          <div className="absolute right-[28%] top-[4.4rem] h-4 w-20 rotate-[-8deg] bg-wine/70" />
        </>
      ) : (
        <>
          <div className="absolute left-[42%] top-9 h-12 w-12 rounded-full bg-[#7a513f]" />
          <div className="absolute left-[35%] top-[5.1rem] h-32 w-28 rounded-t-3xl bg-moss" />
          <div className="absolute left-[38%] top-[5.5rem] h-28 w-16 bg-ivory" />
          <div className="absolute left-[42%] top-[6rem] h-24 w-8 bg-wine" />
          <div className="absolute left-[34%] bottom-0 h-24 w-10 bg-[#2f3420]" />
          <div className="absolute right-[35%] bottom-0 h-24 w-10 bg-[#2f3420]" />
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

export default function Home() {
  const countdown = useCountdown();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "closed" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [lastRsvp, setLastRsvp] = useState<{
    fullName: string;
    phone: string;
    entryCode: string;
  } | null>(null);

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "(No Prefix)");
    const fullName = String(form.get("fullName") ?? "");
    const phone = String(form.get("phone") ?? "");
    const payload = {
      title,
      fullName,
      email: String(form.get("email") ?? ""),
      phone,
      note: String(form.get("note") ?? "")
    };

    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (response.status === 409) {
      setStatus("closed");
      setMessage(result.message ?? "RSVP Closed - Capacity Reached");
      return;
    }

    if (!response.ok) {
      setStatus("error");
      setMessage(result.message ?? "Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    setLastRsvp({
      fullName,
      phone,
      entryCode: String(result.entryCode ?? "")
    });
    setMessage(
      result.entryCode
        ? `Thank you. Your RSVP has been received. Your entry code is ${result.entryCode}.`
        : "Thank you. Your RSVP has been received and a confirmation email is on its way."
    );
    event.currentTarget.reset();
  }

  return (
    <main className="relative overflow-hidden text-ink">
      <BackgroundHearts />
      <SoundButton />
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-ivory/82 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          <a href="#home" className="font-serif text-xl text-moss">
            <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-wine/10 text-wine">
              <Heart size={14} />
            </span>
            K-D & Esther
          </a>
          <a
            href="#rsvp"
            className="romantic-pill inline-flex items-center gap-2 rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ivory"
          >
            <Send size={14} /> RSVP
          </a>
        </div>
      </nav>

      <CurtainHero countdown={countdown} />

      <section id="story" className="py-20 sm:py-28">
        <div className="section-shell love-section grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <FadeIn>
            <StoryArch />
          </FadeIn>
          <FadeIn delay={0.12}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              Our Journey
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight text-moss sm:text-6xl">
              A love rooted in grace, friendship and promise.
            </h2>
            <SectionFlourish align="left" />
            <p className="mt-6 text-base leading-8 text-ink/75">
              Our journey began with a simple hello, grew through friendship, laughter, prayers, and love. Through every season, we found in each other a forever kind of love. From two different tribes, God beautifully brought us together, uniting our hearts in His perfect plan. As we step into forever together, we invite you to celebrate this moment with us.
            </p>
          </FadeIn>
        </div>
      </section>

      <section id="pre-wedding" className="relative bg-ivory py-20 sm:py-28">
        <FloatingPetals />
        <FloatingHearts active />
        <div className="section-shell relative z-10">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              Pre-Wedding Portraits
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight text-moss sm:text-6xl">
              A quiet gallery for the memories before the day.
            </h2>
            <SectionFlourish />
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-ink/72">
              Portraits will be added here soon. For now, these soft editorial frames
              hold the space for the couple's pre-wedding moments.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {["Garden Walk", "Soft Portrait", "Evening Promise"].map((title, index) => (
              <FadeIn key={title} delay={index * 0.08}>
                <div className="photo-placeholder love-card group relative h-[28rem] overflow-hidden bg-champagne shadow-soft">
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(251,246,237,0.86),rgba(233,192,182,0.44),rgba(115,123,84,0.24))]" />
                  <div className="absolute inset-6 border border-ivory/70" />
                  <div className="absolute left-6 right-6 top-8 h-40 rounded-t-full bg-ivory/46" />
                  <div className="absolute bottom-8 left-6 right-6 text-center">
                    <p className="font-script text-5xl text-moss">{title}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-wine">
                      Coming soon
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="details" className="bg-moss py-20 text-ivory sm:py-28">
        <div className="section-shell">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">
              Wedding Details
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight sm:text-6xl">
              Saturday, 22 August 2026
            </h2>
            <SectionFlourish tone="blush" />
          </FadeIn>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { icon: CalendarDays, label: "Date", value: "Saturday, 22 Aug 2026" },
              { icon: MapPin, label: "Venue", value: "Camp Young, Ede" },
              { icon: Clock, label: "Reception", value: "Follows immediately" }
            ].map((item) => (
              <FadeIn key={item.label}>
                <div className="love-card h-full border border-ivory/18 bg-ivory/8 p-7 backdrop-blur">
                  <item.icon className="mb-5 text-blush" size={24} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">
                    {item.label}
                  </p>
                  <p className="mt-3 font-serif text-3xl">{item.value}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <FadeIn>
              <div className="love-card bg-ivory p-7 text-ink shadow-soft">
                <h3 className="font-serif text-4xl text-moss">Order of Celebration</h3>
                <div className="mt-6 space-y-5">
                  {schedule.map((item) => (
                    <div
                      key={item.time}
                      className="grid gap-2 border-b border-moss/10 pb-4 sm:grid-cols-[7rem_1fr] sm:gap-4"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">
                        {item.time}
                      </span>
                      <span className="font-serif text-2xl text-ink">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <div className="love-card min-h-80 overflow-hidden bg-ivory shadow-soft">
                <iframe
                title="Camp Young Ede map"
                  src={`https://www.google.com/maps?q=${encodedVenue}&output=embed`}
                  className="h-80 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodedVenue}`}
                  className="flex items-center justify-center gap-2 bg-champagne px-5 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-moss"
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

      <section id="dress-code" className="py-20 sm:py-28">
        <div className="section-shell">
          <FadeIn className="floral-frame invitation-border love-card bg-ivory/78 p-7 shadow-soft sm:p-12">
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <p className="font-script text-5xl text-sage sm:text-6xl">Style Inspiration</p>
              <h2 className="mt-2 font-serif text-5xl italic leading-tight text-moss sm:text-7xl">
                Formal Garden Elegance
              </h2>
              <SectionFlourish />
              <p className="mx-auto mt-6 max-w-3xl leading-8 text-ink/76">
                In honour of this special occasion, guests are kindly requested to
                dress in modest, elegant, and formal outfits inspired by our curated
                color palette.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-wine">
                Please note this is just a guide and absolutely not mandatory
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-6 md:grid-cols-2">
              <div className="love-card bg-champagne/56 p-7">
                <AttireIllustration type="ladies" />
                <Flower2 className="mb-5 text-wine" />
                <h3 className="font-serif text-4xl text-moss">Ladies</h3>
                <p className="mt-4 leading-8 text-ink/76">
                  Long dresses or refined midi-length dresses with tasteful coverage
                  and soft, elegant detailing. Fascinators or subtle headpieces are
                  welcome to complement the overall look.
                </p>
              </div>
              <div className="love-card bg-blush/34 p-7">
                <AttireIllustration type="gentlemen" />
                <Sparkles className="mb-5 text-wine" />
                <h3 className="font-serif text-4xl text-moss">Gentlemen</h3>
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

      <section id="gifts" className="relative bg-moss py-20 text-ivory sm:py-28">
        <FloatingPetals />
        <div className="section-shell relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">
              Guest Note & Gifts
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight sm:text-6xl">
              Your presence is our greatest gift.
            </h2>
            <SectionFlourish align="left" tone="blush" />
            <p className="mt-6 leading-8 text-ivory/76">
              Due to limited space, attendance is reserved for adult guests only.
            </p>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="invitation-border love-card bg-ivory p-7 text-ink shadow-soft sm:p-10">
              <Gift className="mb-5 text-wine" size={28} />
              <h3 className="font-serif text-4xl text-moss">Gifts & Blessings</h3>
              <p className="mt-4 leading-8 text-ink/74">
                Your presence on our special day is the greatest gift we could ask for. But if your heart feels called to give more, a monetary gift would be received with deep gratitude and love.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="bg-champagne/60 p-5">
                  <p className="font-serif text-2xl text-moss">King-David Duruihuoma</p>
                  <p className="mt-3 text-sm uppercase tracking-[0.16em] text-wine">
                    Guaranty Trust Bank
                  </p>
                  <p className="mt-2 font-serif text-3xl text-ink">0012782278</p>
                </div>
                <div className="bg-blush/32 p-5">
                  <p className="font-serif text-2xl text-moss">Blessing Timehin</p>
                  <p className="mt-3 text-sm uppercase tracking-[0.16em] text-wine">
                    Access Bank
                  </p>
                  <p className="mt-2 font-serif text-3xl text-ink">0733934621</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="rsvp" className="bg-[#f1e5d2] py-20 sm:py-28">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              RSVP
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight text-moss sm:text-6xl">
              Kindly reserve your place.
            </h2>
            <SectionFlourish align="left" />
            <div className="love-card mt-6 rounded-lg border border-wine/20 bg-wine/8 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-wine">👨‍👩‍👧 Adults Only</p>
              <p className="mt-3 text-base leading-7 text-ink/76">
                This celebration is exclusively for adults. Due to the nature of our venue and activities, we kindly request that children are not brought to this event. Thank you for understanding.
              </p>
            </div>
            <p className="mt-6 leading-8 text-ink/74">
              Please respond early so we can prepare a warm and comfortable celebration
              for every guest. Capacity is limited to {rsvpLimit} guests.
            </p>
            <div className="mt-7 flex items-center gap-3 text-moss">
              <Users />
              <span className="font-serif text-2xl">Maximum guest limit: {rsvpLimit}</span>
            </div>
            <div className="mt-8 rounded-xl border border-wine/10 bg-ivory/72 p-5">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-moss" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">
                  For RSVP Inquiries
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
            <form onSubmit={submitRsvp} className="invitation-border love-card bg-ivory p-6 shadow-soft sm:p-9">
              {status === "closed" ? (
                <div className="py-14 text-center">
                  <XCircle className="mx-auto mb-4 h-14 w-14 text-wine" />
                  <p className="font-serif text-5xl text-wine">RSVP Closed</p>
                  <p className="mt-3 leading-7 text-ink/72">
                    {message || "Capacity has been reached."}
                  </p>
                </div>
              ) : status === "success" ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto h-16 w-16 text-moss" />
                  <p className="mt-4 font-serif text-4xl text-moss">Thank you!</p>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-ink/68">{message}</p>
                  {lastRsvp?.entryCode ? (
                    <div className="mx-auto mt-5 max-w-xs rounded-xl border border-dashed border-wine/30 bg-champagne/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-wine">
                        Entry Code
                      </p>
                      <p className="mt-2 font-serif text-3xl text-moss">{lastRsvp.entryCode}</p>
                    </div>
                  ) : null}
                  {lastRsvp?.phone && lastRsvp.entryCode ? (
                    <a
                      href={buildWhatsAppUrl(
                        lastRsvp.phone,
                        `Hello ${lastRsvp.fullName},\n\nYour entry code for King David & Esther's wedding is:\n\n${lastRsvp.entryCode}\n\nDate: Saturday, 22nd August 2026\nTime: 11:00 AM\nVenue: Camp Young, Ede\n\nPlease keep this code safe and present it at the entrance.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="romantic-button mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      <Share2 size={16} /> Send Entry Code to WhatsApp
                    </a>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label>
                      <span className="label">Title</span>
                      <select className="field" name="title" defaultValue="(No Prefix)" required>
                        {titleOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="label">Full name</span>
                      <input className="field" name="fullName" required />
                    </label>
                    <label>
                      <span className="label">Email</span>
                      <input className="field" type="email" name="email" required />
                    </label>
                    <label>
                      <span className="label">WhatsApp number</span>
                      <input className="field" name="phone" inputMode="tel" placeholder="+234..." required />
                    </label>
                  </div>
                  <label className="mt-5 block">
                    <span className="label">Message optional</span>
                    <textarea className="field min-h-32 resize-y" name="note" />
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
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="romantic-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-wine px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-ivory disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    {status === "loading" ? (
                      <Loader2 className="animate-spin" size={17} />
                    ) : (
                      <CheckCircle2 size={17} />
                    )}
                    Submit RSVP
                  </button>
                  {message ? (
                    <p
                      className={`mt-5 text-center text-sm leading-6 ${
                        status === "error" ? "text-wine" : "text-moss"
                      }`}
                    >
                      {message}
                    </p>
                  ) : null}
                </>
              )}
            </form>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
