"use client";

import { motion } from "framer-motion";
import {
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
  Sparkles,
  Users,
  XCircle
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const weddingDate = new Date("2026-08-22T10:00:00+01:00");
const rsvpLimit = Number(process.env.NEXT_PUBLIC_RSVP_LIMIT ?? 80);

const palette = [
  ["Sage Green", "#737b54"],
  ["Deep Wine/Burgundy", "#7b0014"],
  ["Warm Brown", "#8f5c4b"],
  ["Terracotta/Peach", "#c97658"],
  ["Dusty Nude Pink", "#c89485"],
  ["Blush Pink", "#e9c0b6"]
];

const venueQuery = "Camp Young, Ede-Osogbo Rd, Nijhof Advies - Osun State";
const encodedVenue = encodeURIComponent(venueQuery);

const schedule = [
  { time: "10:00 AM", title: "Wedding ceremony starts" },
  { time: "Immediately after", title: "Reception celebration" }
];

const couplePhotos = [
  {
    title: "Garden Promise",
    src: "/couple-images/garden-car.png",
    caption: "Soft garden moments before forever."
  },
  {
    title: "Hand in Hand",
    src: "/couple-images/indoor-promise.png",
    caption: "A quiet promise, held with grace."
  },
  {
    title: "Forever Begins",
    src: "/couple-images/portrait-one.png",
    caption: "A love story made beautiful by God."
  }
];

const titleOptions = ["Mr.", "Mrs.", "Miss.", "Dr.", "Prof.", "Pastor", "Evang.", "(No Prefix)"];
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

function WeddingMusic() {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = document.getElementById("wedding-song") as HTMLAudioElement | null;
    if (!audio) return;

    audio.volume = 0.22;
    audio.currentTime = 0;

    const play = async () => {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    };

    window.addEventListener("start-wedding-music", play);
    void play();

    return () => {
      window.removeEventListener("start-wedding-music", play);
    };
  }, []);

  async function toggleSound() {
    const audio = document.getElementById("wedding-song") as HTMLAudioElement | null;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio.currentTime = audio.currentTime || 0;
    await audio.play();
    setPlaying(!audio.paused);
  }

  return (
    <>
      <audio id="wedding-song" src="/music/when-god-made-you.mp3" autoPlay loop preload="auto" />
      <button
        type="button"
        onClick={toggleSound}
        className="romantic-button fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-wine text-ivory shadow-soft"
        aria-label={playing ? "Pause romantic background song" : "Play romantic background song"}
      >
        {playing ? <Pause size={18} /> : <Music2 size={18} />}
      </button>
    </>
  );
}

function StoryArch() {
  return (
    <div className="story-arch love-orbit relative mx-auto h-[30rem] max-w-sm overflow-hidden rounded-[2rem] bg-champagne shadow-soft love-card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(233,192,182,0.62),transparent_24rem),radial-gradient(circle_at_85%_75%,rgba(115,123,84,0.22),transparent_18rem)]" />
      <div className="absolute inset-8 rounded-[1.6rem] border border-wine/15 bg-ivory/70" />
      <div className="absolute inset-x-12 top-16 text-center">
        <p className="font-script text-5xl text-wine">A Garden Promise</p>
        <p className="mt-3 text-sm leading-7 text-ink/72">
          Faith, friendship, family and the quiet joy of choosing forever.
        </p>
      </div>
      <div className="absolute bottom-10 left-8 right-8 grid grid-cols-2 gap-3">
        {palette.map(([name, color], index) => (
          <div key={name} className="rounded-xl bg-white/60 p-3 shadow-sm">
            <span className="block h-8 rounded-full" style={{ backgroundColor: color }} />
            <span className="mt-2 block text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-moss">
              {index + 1}. {name}
            </span>
          </div>
        ))}
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

  function playRevealSound() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.value = 0.04;
    gain.connect(context.destination);

    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const toneGain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      toneGain.gain.setValueAtTime(0, context.currentTime);
      toneGain.gain.linearRampToValueAtTime(0.45, context.currentTime + 0.02 + index * 0.04);
      toneGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.55 + index * 0.04);
      oscillator.connect(toneGain);
      toneGain.connect(gain);
      oscillator.start(context.currentTime + index * 0.045);
      oscillator.stop(context.currentTime + 0.65 + index * 0.045);
    });
  }

  function scratch() {
    setProgress((current) => {
      const next = Math.min(current + 1, 4);
      if (current < 4 && next === 4) {
        playRevealSound();
      }
      return next;
    });
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
          {Array.from({ length: 20 }).map((_, index) => (
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

  function openCurtain() {
    setOpened(true);
    window.dispatchEvent(new Event("start-wedding-music"));
  }

  return (
    <section id="home" className="relative min-h-[100svh]">
      <div className="relative flex min-h-[100svh] items-center overflow-hidden pt-16 sm:pt-20">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(251,246,237,0.58),rgba(251,246,237,0.86)),url('/garden-palette.jpg')] bg-cover bg-center" />
        <FloatingPetals />
        <FloatingHearts active={!opened} />
        {!opened ? (
          <div className="closed-curtain-loop pointer-events-none absolute inset-0 z-[25]">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : null}

        <div className="curtain-valance pointer-events-none absolute inset-x-0 top-0 z-20 h-24">
          <span className="curtain-rope" />
          <span className="curtain-heart" />
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
          className="absolute inset-x-8 top-[42%] z-30 text-center sm:top-[44%]"
          animate={{ opacity: opened ? 0 : 1, y: opened ? -18 : 0 }}
          transition={{ duration: 0.7 }}
          style={{ pointerEvents: opened ? "none" : "auto" }}
        >
          <button
            type="button"
            onClick={openCurtain}
            className="romantic-button curtain-open-button inline-flex items-center gap-2 rounded-full border border-ivory/70 bg-wine/70 px-7 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-ivory shadow-soft backdrop-blur"
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
              at Camp Young, Ede-Osogbo Rd, Nijhof Advies - Osun State. The wedding ceremony starts at 10am, with the reception celebration immediately after.
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
    <div className="attire-illustration attire-showcase relative mb-6 h-72 overflow-hidden rounded-[1.5rem] bg-ivory/80">
      <div className="absolute inset-x-6 bottom-0 h-36 rounded-t-full bg-sage/12" />
      {isLadies ? (
        <>
          <div className="absolute left-[42%] top-8 h-12 w-12 rounded-full bg-[#8b5c4c]" />
          <div className="absolute left-[39%] top-[4.9rem] h-20 w-20 rounded-t-full bg-blush" />
          <div className="absolute left-[30%] bottom-0 h-44 w-40 rounded-t-[5rem] bg-[linear-gradient(135deg,#e9c0b6,#c89485_52%,#7b0014)] shadow-soft" />
          <div className="absolute left-[33%] bottom-0 h-40 w-32 rounded-t-[4.5rem] bg-[linear-gradient(90deg,rgba(251,246,237,0.34),transparent,rgba(123,0,20,0.14))]" />
          <div className="absolute left-[24%] top-24 h-4 w-28 -rotate-12 rounded-full bg-wine/65" />
          <div className="absolute right-[22%] top-20 h-14 w-24 -rotate-6 rounded-full border border-wine/20 bg-champagne shadow-sm" />
        </>
      ) : (
        <>
          <div className="absolute left-[42%] top-8 h-12 w-12 rounded-full bg-[#7a513f]" />
          <div className="absolute left-[34%] top-[5rem] h-36 w-32 rounded-t-3xl bg-[linear-gradient(135deg,#3f481f,#737b54)] shadow-soft" />
          <div className="absolute left-[38%] top-[5.4rem] h-32 w-16 bg-ivory" />
          <div className="absolute left-[42%] top-[5.9rem] h-28 w-8 bg-wine" />
          <div className="absolute left-[33%] bottom-0 h-28 w-11 bg-[#2f3420]" />
          <div className="absolute right-[34%] bottom-0 h-28 w-11 bg-[#2f3420]" />
          <div className="absolute right-[18%] top-16 h-28 w-24 rounded-t-full bg-[#8f5c4b]/45" />
          <div className="absolute right-[20%] top-24 h-4 w-20 rotate-12 rounded-full bg-wine/65" />
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
  const [cardLoading, setCardLoading] = useState(false);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);

  async function fetchAccessCard(fullName: string, entryCode: string) {
    setCardLoading(true);
    try {
      const response = await fetch("/api/access-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          entryCode,
          attendees: 1,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate access card.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setCardPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return url;
      });
      return url;
    } catch (downloadError) {
      console.error(downloadError);
      return null;
    } finally {
      setCardLoading(false);
    }
  }

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "(No Prefix)");
    const fullName = String(form.get("fullName") ?? "");
    const phone = String(form.get("phone") ?? "");
    const adultAgreement = Boolean(form.get("adultAgreement"));
    const payload = {
      title,
      fullName,
      email: String(form.get("email") ?? ""),
      phone,
      note: String(form.get("note") ?? ""),
      adultAgreement
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
        ? "Thank you. Your RSVP has been received. Your access card is ready and has been sent to your email."
        : "Thank you. Your RSVP has been received and a confirmation email is on its way."
    );
    if (result.entryCode) {
      await fetchAccessCard(fullName, String(result.entryCode));
    }
    event.currentTarget.reset();
  }

  return (
    <main className="relative overflow-hidden text-ink">
      <BackgroundHearts />
      <WeddingMusic />
      {/* Dangling rope animation when curtain is closed */}
      <style>{`
        @keyframes rope-sway {
          0%, 100% { transform: rotate(-1deg); transform-origin: center top; }
          50% { transform: rotate(1deg); transform-origin: center top; }
        }
        .curtain-rope { animation: rope-sway 2.2s ease-in-out infinite; }
        .curtain-heart { animation: rope-sway 2.2s ease-in-out infinite; animation-delay: 0.1s; }
      `}</style>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-ivory/82 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          <a href="#home" className="font-serif text-xl text-moss">
            <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-wine/10 text-wine">
              <Heart size={14} />
            </span>
            King David & Esther
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

      <section id="story" className="love-band py-20 sm:py-28">
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
            <p className="mt-6 text-base leading-8 text-ink/75">
              Our journey began with a simple hello, grew through friendship, laughter, prayers, and love. Through every season, we found in each other a forever kind of love. From two different tribes, God beautifully brought us together, uniting our hearts in His perfect plan. As we step into forever together, we invite you to celebrate this moment with us.
            </p>
          </FadeIn>
        </div>
      </section>

      <section id="pre-wedding" className="love-band relative bg-ivory py-20 sm:py-28">
        <FloatingPetals />
        <FloatingHearts active />
        <div className="section-shell relative z-10">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              Pre-Wedding Portraits
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight text-moss sm:text-6xl">
              A soft gallery for the memories before the day.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-ink/72">
              A few tender frames from King David and Esther's journey into forever.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {couplePhotos.map((photo, index) => (
              <FadeIn key={photo.title} delay={index * 0.08}>
                <div className="photo-placeholder love-card group relative h-[28rem] overflow-hidden rounded-[1.6rem] bg-champagne shadow-soft">
                  <img
                    src={photo.src}
                    alt={`${photo.title} portrait of King David and Esther`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d241f]/72 via-transparent to-transparent" />
                  <div className="absolute inset-5 border border-ivory/65" />
                  <div className="absolute bottom-7 left-7 right-7 text-ivory">
                    <p className="font-script text-5xl">{photo.title}</p>
                    <p className="mt-2 text-sm leading-6 text-ivory/86">{photo.caption}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="details" className="love-band bg-moss py-20 text-ivory sm:py-28">
        <div className="section-shell">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">
              Wedding Details
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight sm:text-6xl">
              Ceremony, reception and directions.
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              { icon: MapPin, label: "Venue", value: "Camp Young, Ede-Osogbo Rd, Nijhof Advies - Osun State" },
              { icon: Clock, label: "Reception", value: "Reception celebration starts immediately after" }
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

      <section id="dress-code" className="love-band py-20 sm:py-28">
        <div className="section-shell">
          <FadeIn className="floral-frame invitation-border love-card bg-ivory/78 p-7 shadow-soft sm:p-12">
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <p className="font-script text-5xl text-sage sm:text-6xl">Style Inspiration</p>
              <h2 className="mt-2 font-serif text-5xl italic leading-tight text-moss sm:text-7xl">
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

            <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {palette.map(([name, color], index) => (
                <div key={name} className="romantic-pill flex items-center gap-3 rounded-2xl bg-white/70 p-3">
                  <span className="h-11 w-11 rounded-full border-2 border-ivory shadow" style={{ backgroundColor: color }} />
                  <span className="text-sm font-semibold text-moss">
                    {index + 1}. {name}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="gifts" className="love-band relative bg-moss py-20 text-ivory sm:py-28">
        <FloatingPetals />
        <div className="section-shell relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">
              Guest Note & Gifts
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight sm:text-6xl">
              Your presence is our greatest gift.
            </h2>
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
                  <p className="font-serif text-2xl text-moss">King David Duruihuoma</p>
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

      <section id="rsvp" className="love-band bg-[#f1e5d2] py-20 sm:py-28">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
              RSVP
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight text-moss sm:text-6xl">
              Kindly reserve your place.
            </h2>
            <div className="love-card mt-6 rounded-lg border border-wine/20 bg-wine/8 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-wine">Adults Only</p>
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
                    <div className="mx-auto mt-6 w-full max-w-lg rounded-[1.75rem] border border-wine/20 bg-white/90 p-3 shadow-soft">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">
                        Your Access Card
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-wine/80">
                        Unique entry code: {lastRsvp.entryCode}
                      </p>
                      {cardPreviewUrl ? (
                        <img
                          src={cardPreviewUrl}
                          alt="Your wedding access card"
                          className="mt-3 w-full rounded-[1.25rem] object-contain"
                        />
                      ) : (
                        <div className="mt-3 flex min-h-[16rem] items-center justify-center rounded-[1.25rem] border border-dashed border-wine/20 bg-champagne/40 text-sm text-ink/70">
                          {cardLoading ? "Preparing your access card..." : "Your access card will appear here."}
                        </div>
                      )}
                    </div>
                  ) : null}
                  {lastRsvp?.entryCode ? (
                    <button
                      type="button"
                      disabled={cardLoading}
                      onClick={async () => {
                        if (!lastRsvp) return;
                        const url = await fetchAccessCard(lastRsvp.fullName, lastRsvp.entryCode);
                        if (!url) return;
                        const anchor = document.createElement("a");
                        anchor.href = url;
                        anchor.download = "KDE2026-access-card.png";
                        document.body.appendChild(anchor);
                        anchor.click();
                        anchor.remove();
                      }}
                      className="romantic-button mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-wine px-5 py-3 text-sm font-semibold text-ivory shadow-soft disabled:opacity-60"
                    >
                      {cardLoading ? "Preparing card..." : "Download Access Card"}
                    </button>
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
