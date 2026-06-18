import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCountdown } from './useCountdown';
import { FloatingPetals } from './FloatingPetals';

const palette = [
  ['Sage', '#737b54'],
  ['Wine', '#7b0014'],
  ['Dusty Rose', '#c89485'],
  ['Terracotta', '#c97658'],
  ['Blush', '#e9c0b6'],
  ['Champagne', '#eadfc9'],
];

function CurtainOpenTitle({ active }: { active: boolean }) {
  const palette = ['#e9c0b6', '#eadfc9', '#f0d296', '#c89485', '#7b0014'];
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[30] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 6 }}
        >
          {/* Orbiting mini hearts */}
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            const radius = 60 + (i % 3) * 20;
            const color = palette[i % palette.length];
            const size = 10 + (i % 4) * 3;
            return (
              <motion.div
                key={i}
                className="absolute"
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 0.8, 0.6, 0],
                  scale: [0, 1, 0.8, 0],
                  x: [0, Math.cos(angle) * radius * 0.5, Math.cos(angle) * radius],
                  y: [0, Math.sin(angle) * radius * 0.5, Math.sin(angle) * radius],
                }}
                transition={{
                  duration: 2.5,
                  delay: 0.8 + i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </motion.div>
            );
          })}

          {/* Central big heart — bouncy squash and stretch */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{
              opacity: [0, 1, 1, 1, 0],
              scale: [0, 1.4, 0.9, 1.05, 0.95, 1, 0.8, 0],
              rotate: [-20, 10, -5, 2, 0, 0, 0, 0],
            }}
            transition={{
              duration: 5.5,
              times: [0, 0.15, 0.25, 0.35, 0.45, 0.7, 0.9, 1],
              ease: 'easeOut',
            }}
          >
            <svg width={80} height={80} viewBox="0 0 24 24" fill="#7b0014">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {/* Heart glow */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(233,192,182,0.5) 0%, transparent 70%)',
              }}
              initial={{ width: 0, height: 0 }}
              animate={{ width: 200, height: 200 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </motion.div>

          {/* "Love" text — blooms in */}
          <motion.p
            className="absolute mt-28 font-script text-5xl text-wine sm:text-6xl"
            style={{ textShadow: '0 2px 16px rgba(123,0,20,0.2)' }}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.1, 1, 0.9],
              y: [20, -5, 0, 10],
            }}
            transition={{
              duration: 4,
              delay: 1.2,
              times: [0, 0.2, 0.7, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            Love
          </motion.p>

          {/* Floating bubbles / confetti dots */}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full"
              style={{
                width: 6 + (i % 3) * 4,
                height: 6 + (i % 3) * 4,
                background: palette[i % palette.length],
                left: `${10 + Math.random() * 80}%`,
                bottom: '-20px',
              }}
              initial={{ opacity: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.7, 0.4, 0],
                y: [0, -window.innerHeight * 0.5, -window.innerHeight * 0.85],
                scale: [0, 1, 0.8, 0.4],
                x: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 80],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: 0.5 + i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Swirling ribbons in pastel */}
          {[
            { color: '#e9c0b6', delay: 0.3, x: -80 },
            { color: '#eadfc9', delay: 0.6, x: 80 },
            { color: '#f0d296', delay: 0.9, x: -40 },
            { color: '#c89485', delay: 1.2, x: 40 },
          ].map((ribbon, i) => (
            <motion.div
              key={`ribbon-${i}`}
              className="absolute"
              style={{
                width: 4,
                height: 160,
                background: `linear-gradient(180deg, ${ribbon.color} 0%, transparent 100%)`,
                borderRadius: 4,
                left: `calc(50% + ${ribbon.x}px)`,
                top: '30%',
                opacity: 0.7,
              }}
              initial={{ opacity: 0, scaleY: 0, rotate: 0 }}
              animate={{
                opacity: [0, 0.8, 0.6, 0],
                scaleY: [0, 1, 1.2, 0.8],
                rotate: [0, (i % 2 === 0 ? 1 : -1) * 15, 0, (i % 2 === 0 ? -1 : 1) * 10],
              }}
              transition={{
                duration: 3.5,
                delay: ribbon.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoveBurst({ active }: { active: boolean }) {
  const colors = ['#7b0014', '#c89485', '#e9c0b6', '#eadfc9', '#c97658', '#737b54'];
  const hearts = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = 60 + Math.random() * 160;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 40,
      size: 8 + Math.random() * 16,
      color: colors[i % colors.length],
      rotate: Math.random() * 360 - 180,
      delay: 0.1 + i * 0.06,
    };
  });
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center overflow-visible"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Central glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(233,192,182,0.6) 0%, transparent 70%)',
            }}
            initial={{ width: 0, height: 0 }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              className="absolute"
              initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [0, 0.9, 0.7, 0],
                scale: [0, 1.1, 0.9, 0.4],
                x: [0, h.x * 0.5, h.x],
                y: [0, h.y * 0.5, h.y + 30],
                rotate: [0, h.rotate * 0.3, h.rotate],
              }}
              transition={{ duration: 1.8, delay: h.delay, ease: [0.16, 1, 0.3, 1] }}
            >
              <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill={h.color}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.div>
          ))}
          {/* Tiny sparkle dots */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute rounded-full"
              style={{
                width: 3 + Math.random() * 4,
                height: 3 + Math.random() * 4,
                background: colors[i % colors.length],
              }}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * 150],
              }}
              transition={{ duration: 1.4, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TapSparkles() {
  const sparkles = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    x: Math.cos((i / 8) * Math.PI * 2) * 60,
    y: Math.sin((i / 8) * Math.PI * 2) * 60,
    delay: i * 0.08,
    size: 3 + Math.random() * 4,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{ width: s.size, height: s.size, background: '#f0d296' }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            x: [0, s.x, s.x * 1.6],
            y: [0, s.y, s.y * 1.6],
          }}
          transition={{
            duration: 1.6,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: 1.4,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  const countdown = useCountdown();
  const [opened, setOpened] = useState(false);

  // Lock body scroll when curtain is closed
  useEffect(() => {
    if (!opened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [opened]);

  return (
    <section id="home" className="relative min-h-screen">
      <div className="relative flex min-h-screen items-center overflow-hidden pt-16 sm:pt-20">
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-20"
          style={{
            background: 'linear-gradient(rgba(251,246,237,0.58), rgba(251,246,237,0.86)), linear-gradient(135deg, #e9c0b6 0%, #eadfc9 50%, #d4c9a8 100%)',
            backgroundSize: 'cover',
          }}
        />

        <FloatingPetals />

        {/* Elegant dangling silk ribbons — CLOSED CURTAIN ONLY */}
        <AnimatePresence>
          {!opened && (
            <motion.div
              className="pointer-events-none absolute left-0 right-0 top-0 z-[4]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeIn' } }}
            >
              {[
                { left: '6%', len: 90, color: '#e9c0b6', sway: 2.5, speed: 3.2 },
                { left: '14%', len: 110, color: '#f0d296', sway: 3, speed: 2.8 },
                { left: '22%', len: 75, color: '#c89485', sway: 2, speed: 3.5 },
                { left: '30%', len: 100, color: '#eadfc9', sway: 3.5, speed: 2.6 },
                { left: '38%', len: 85, color: '#e9c0b6', sway: 2, speed: 3.8 },
                { left: '46%', len: 120, color: '#f0d296', sway: 4, speed: 2.4 },
                { left: '54%', len: 95, color: '#c89485', sway: 2.5, speed: 3.1 },
                { left: '62%', len: 80, color: '#eadfc9', sway: 3, speed: 3.3 },
                { left: '70%', len: 105, color: '#e9c0b6', sway: 2, speed: 2.9 },
                { left: '78%', len: 88, color: '#f0d296', sway: 3.5, speed: 3.6 },
                { left: '86%', len: 115, color: '#c89485', sway: 2.5, speed: 2.7 },
                { left: '94%', len: 78, color: '#eadfc9', sway: 3, speed: 3.4 },
              ].map((r, i) => {
                const heartSize = 10 + (i % 3) * 2;
                return (
                <motion.div
                  key={i}
                  className="absolute origin-top"
                  style={{ left: r.left, top: '70px' }}
                  animate={{
                    rotate: [0, r.sway, -r.sway * 0.6, r.sway * 0.3, 0],
                  }}
                  transition={{
                    duration: r.speed,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                >
                  {/* Thin silk ribbon body */}
                  <div
                    style={{
                      width: 3,
                      height: r.len,
                      margin: '0 auto',
                      background: `linear-gradient(180deg, ${r.color}ff 0%, ${r.color}dd 40%, ${r.color}99 80%, transparent 100%)`,
                      borderRadius: '0 0 2px 2px',
                      opacity: 0.9,
                      boxShadow: `inset 1px 0 0 rgba(255,255,255,0.4), 1px 0 3px rgba(0,0,0,0.2)`,
                    }}
                  />
                  {/* Top knot bead */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      top: -3,
                      width: 7,
                      height: 7,
                      background: `radial-gradient(circle at 30% 30%, #fff8ee, ${r.color})`,
                      borderRadius: '50%',
                      boxShadow: `0 1px 3px rgba(0,0,0,0.3)`,
                    }}
                  />
                  {/* Bottom cute heart charm — perfectly centered on ribbon endpoint */}
                  <motion.div
                    className="absolute"
                    style={{
                      top: r.len - heartSize / 2,
                      left: '50%',
                      marginLeft: -heartSize / 2,
                      width: heartSize,
                      height: heartSize,
                    }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2 + (i % 3) * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <svg width={heartSize} height={heartSize} viewBox="0 0 24 24" fill={r.color}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {/* Tiny glow behind heart */}
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        width: heartSize + 8,
                        height: heartSize + 8,
                        background: `radial-gradient(circle, ${r.color}66 0%, transparent 70%)`,
                        zIndex: -1,
                      }}
                    />
                  </motion.div>
                </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Valance bar */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-[5]"
          style={{
            height: '72px',
            background: 'linear-gradient(180deg, #1a0004 0%, #3d000a 40%, #5c0010 70%, transparent 100%), repeating-linear-gradient(90deg, #1a0004 0px 10px, #3d000a 10px 22px, #5c0012 22px 34px, #3d000a 34px 46px)',
            boxShadow: '0 6px 24px rgba(10, 0, 2, 0.5)',
          }}
        >
          <div
            className="absolute bottom-[-10px] left-0 right-0 h-[10px]"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(240, 210, 150, 0.55) 18px, rgba(240, 210, 150, 0.55) 22px, transparent 22px, transparent 40px)',
            }}
          />
        </div>

        {/* Left curtain */}
        <motion.div
          className="absolute left-0 top-0 z-[1] h-full"
          style={{
            width: '55%',
            background: 'repeating-linear-gradient(90deg, #1e0005 0px 5px, #4a000e 5px 12px, #830018 12px 19px, #b8001e 19px 24px, #d40024 24px 27px, #c20020 27px 32px, #8a0018 32px 39px, #4a000e 39px 46px, #1e0005 46px 52px, #320009 52px 60px, #6a0014 60px 68px, #a6001c 68px 74px, #c00022 74px 77px, #a6001c 77px 83px, #6a0014 83px 91px, #320009 91px 98px)',
            transformOrigin: 'left center',
            perspective: '1200px',
            boxShadow: 'inset -36px 0 80px rgba(8, 0, 2, 0.75), 6px 0 28px rgba(0, 0, 0, 0.55)',
          }}
          initial={false}
          animate={{
            x: opened ? '-100%' : '0%',
            rotateY: opened ? 55 : 0,
            scale: opened ? 0.82 : 1,
          }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Fabric fold overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.05) 12px, rgba(255,255,255,0.08) 24px, rgba(0,0,0,0.18) 36px, rgba(0,0,0,0.03) 48px)',
              mixBlendMode: 'multiply',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 25%)',
            }}
          />
        </motion.div>

        {/* Right curtain */}
        <motion.div
          className="absolute right-0 top-0 z-[1] h-full"
          style={{
            width: '55%',
            background: 'repeating-linear-gradient(90deg, #1e0005 0px 5px, #4a000e 5px 12px, #830018 12px 19px, #b8001e 19px 24px, #d40024 24px 27px, #c20020 27px 32px, #8a0018 32px 39px, #4a000e 39px 46px, #1e0005 46px 52px, #320009 52px 60px, #6a0014 60px 68px, #a6001c 68px 74px, #c00022 74px 77px, #a6001c 77px 83px, #6a0014 83px 91px, #320009 91px 98px)',
            transformOrigin: 'right center',
            perspective: '1200px',
            boxShadow: 'inset -36px 0 80px rgba(8, 0, 2, 0.75), 6px 0 28px rgba(0, 0, 0, 0.55)',
            transform: 'scaleX(-1)',
          }}
          initial={false}
          animate={{
            x: opened ? '100%' : '0%',
            rotateY: opened ? -55 : 0,
            scale: opened ? 0.82 : 1,
          }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Fabric fold overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.05) 12px, rgba(255,255,255,0.08) 24px, rgba(0,0,0,0.18) 36px, rgba(0,0,0,0.03) 48px)',
              mixBlendMode: 'multiply',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(to left, rgba(0,0,0,0.6) 0%, transparent 25%)',
            }}
          />
        </motion.div>

        {/* CLOSED CURTAIN: Love fever floating hearts background */}
        <AnimatePresence>
          {!opened && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-[3] overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
            >
              {/* Layer 1: Big slow drifting hearts */}
              {Array.from({ length: 8 }).map((_, i) => {
                const size = 18 + Math.random() * 22;
                const startX = 10 + Math.random() * 80;
                const driftX = (Math.random() - 0.5) * 60;
                const duration = 5 + Math.random() * 4;
                return (
                  <motion.div
                    key={`big-${i}`}
                    className="absolute"
                    style={{ left: `${startX}%`, bottom: '-40px' }}
                    initial={{ y: 0, opacity: 0, scale: 0.5, x: 0 }}
                    animate={{
                      y: [-20, -window.innerHeight * 0.9],
                      opacity: [0, 0.6, 0.8, 0.5, 0],
                      scale: [0.5, 1, 1.1, 0.9, 0.6],
                      x: [0, driftX * 0.3, driftX, driftX * 1.2],
                    }}
                    transition={{
                      duration,
                      repeat: Infinity,
                      delay: i * 1.2,
                      ease: 'easeOut',
                    }}
                  >
                    <svg width={size} height={size} viewBox="0 0 24 24" fill={['#f0d29644', '#e9c0b644', '#c8948544', '#eadfc944'][i % 4]}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </motion.div>
                );
              })}
              {/* Layer 2: Small sparkle hearts with wiggle */}
              {Array.from({ length: 14 }).map((_, i) => {
                const size = 8 + Math.random() * 10;
                const startX = 5 + Math.random() * 90;
                return (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute"
                    style={{ left: `${startX}%`, bottom: '-20px' }}
                    initial={{ y: 0, opacity: 0, scale: 0, rotate: 0 }}
                    animate={{
                      y: [-10, -window.innerHeight * 0.85],
                      opacity: [0, 0.9, 0.7, 0],
                      scale: [0, 1.2, 0.8, 0],
                      rotate: [0, 15, -10, 20, 0],
                    }}
                    transition={{
                      duration: 3.5 + Math.random() * 3,
                      repeat: Infinity,
                      delay: i * 0.7 + 0.5,
                      ease: 'easeOut',
                    }}
                  >
                    <svg width={size} height={size} viewBox="0 0 24 24" fill={['#f0d296', '#e9c0b6', '#c89485', '#eadfc9', '#c97658'][i % 5]}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </motion.div>
                );
              })}
              {/* Layer 3: Twinkling star dots */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute rounded-full"
                  style={{
                    left: `${5 + Math.random() * 90}%`,
                    top: `${10 + Math.random() * 80}%`,
                    width: 2 + Math.random() * 4,
                    height: 2 + Math.random() * 4,
                    background: ['#f0d296', '#e9c0b6', '#eadfc9', '#ffffff'][i % 4],
                  }}
                  animate={{
                    opacity: [0, 0.8, 0.3, 1, 0],
                    scale: [0.5, 1.2, 0.8, 1.5, 0.5],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 4,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap to Open overlay */}
        <AnimatePresence>
          {!opened && (
            <motion.div
              className="absolute inset-x-6 top-[36%] z-[40] text-center sm:inset-x-12 sm:top-[38%]"
              exit={{ opacity: 0, y: -22, transition: { duration: 0.8, ease: 'easeIn' } }}
            >
              <motion.p
                className="font-script text-5xl leading-none text-ivory sm:text-7xl"
                style={{ textShadow: '0 2px 24px rgba(0,0,0,0.65)' }}
                animate={{
                  textShadow: [
                    '0 2px 24px rgba(0,0,0,0.65)',
                    '0 2px 36px rgba(240,210,150,0.35)',
                    '0 2px 24px rgba(0,0,0,0.65)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                King David &amp; Esther
              </motion.p>
              {/* Floating hearts around names */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ opacity: 0, y: 20, scale: 0 }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      y: [20, -30 - i * 10, -60 - i * 15],
                      x: [0, (i % 2 === 0 ? 1 : -1) * (15 + i * 6), (i % 2 === 0 ? 1 : -1) * (25 + i * 10)],
                      scale: [0, 0.9, 0.2],
                    }}
                    transition={{
                      duration: 2.8 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: 'easeOut',
                    }}
                  >
                    <svg width={12 + i * 3} height={12 + i * 3} viewBox="0 0 24 24" fill={['#f0d296', '#e9c0b6', '#c89485', '#eadfc9'][i % 4]}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </motion.div>
                ))}
              </div>

              {/* Button with sparkles */}
              <div className="relative mt-7 inline-flex items-center justify-center">
                <TapSparkles />
                <motion.button
                  type="button"
                  onClick={() => setOpened(true)}
                  className="relative z-10 inline-flex items-center gap-2 rounded-full border border-ivory/70 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.32em] text-ivory shadow-soft sm:px-9 sm:py-4"
                  style={{
                    background: 'rgba(123,0,20,0.55)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 32px rgba(123,0,20,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                  }}
                  whileHover={{ scale: 1.06, boxShadow: '0 8px 40px rgba(123,0,20,0.45)' }}
                  whileTap={{ scale: 0.94 }}
                  animate={{
                    boxShadow: [
                      '0 4px 32px rgba(123,0,20,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                      '0 8px 48px rgba(123,0,20,0.5), inset 0 1px 0 rgba(255,255,255,0.18)',
                      '0 4px 32px rgba(123,0,20,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles size={14} />
                  Tap to Open
                  <Sparkles size={14} />
                </motion.button>
              </div>

              {/* Floating hint text */}
              <motion.p
                className="mt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-ivory/50"
                animate={{ y: [0, 4, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Scroll to explore once opened
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Love burst when curtains open */}
        <LoveBurst active={opened} />

        {/* Cute love fever title sequence on curtain open */}
        <CurtainOpenTitle active={opened} />

        {/* Hero content */}
        <motion.div
          className="section-shell relative z-[35] grid gap-6 py-6 sm:gap-10 sm:py-10 lg:grid-cols-2 lg:items-center"
          initial={false}
          animate={{
            opacity: opened ? 1 : 0,
            y: opened ? 0 : 38,
            scale: opened ? 1 : 0.98,
          }}
          transition={{ duration: 0.7, delay: opened ? 0.2 : 0 }}
          style={{ pointerEvents: opened ? 'auto' : 'none' }}
        >
          <div className="text-center lg:text-left">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-wine">
              Formal Garden Elegance
            </p>
            <h1
              className="font-script leading-[0.82] text-moss"
              style={{ fontSize: 'clamp(3.8rem, 17vw, 7.5rem)' }}
            >
              King David
              <span className="block font-serif text-2xl italic text-wine sm:text-4xl">&amp;</span>
              Esther
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 lg:mx-0" style={{ color: 'rgba(45,36,31,0.74)' }}>
              With grateful hearts, we invite you to celebrate a warm garden wedding at Camp Young,
              Ede. Reception follows immediately.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#date-reveal"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-wine px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ivory shadow-soft transition hover:opacity-90 sm:px-7 sm:py-4"
              >
                <Heart size={16} /> Your Invitation
              </a>
              <a
                href="#details"
                className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-moss transition hover:bg-ivory sm:px-7 sm:py-4"
                style={{ borderColor: 'rgba(63,72,31,0.25)', background: 'rgba(251,246,237,0.7)' }}
              >
                <MapPin size={16} /> Details
              </a>
            </div>
          </div>

          {/* Countdown card */}
          <div
            className="section-shell invitation-border rounded-3xl p-4 shadow-soft sm:p-5"
            style={{ background: 'rgba(251,246,237,0.8)', backdropFilter: 'blur(8px)' }}
          >
            <div className="rounded-2xl p-4 text-center sm:p-5" style={{ background: 'rgba(234,223,201,0.45)' }}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-moss sm:mb-5">
                Countdown to our day
              </p>
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {Object.entries(countdown).map(([label, value]) => (
                  <div key={label} className="px-1 py-3 sm:px-2 sm:py-4" style={{ background: 'rgba(251,246,237,0.8)' }}>
                    <strong className="block font-serif text-2xl text-wine sm:text-3xl lg:text-4xl">
                      {String(value).padStart(2, '0')}
                    </strong>
                    <span
                      className="text-xs uppercase tracking-[0.14em]"
                      style={{ fontSize: '0.55rem', color: 'rgba(45,36,31,0.62)' }}
                    >
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
                    className="h-6 w-6 rounded-full border-2 border-white shadow sm:h-8 sm:w-8"
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
