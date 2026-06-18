import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';

const ribbonData = [
  { x: '-140px', y: '-75px', r: '-45deg' }, { x: '-95px', y: '68px', r: '72deg' },
  { x: '-45px', y: '-105px', r: '21deg' }, { x: '30px', y: '90px', r: '-82deg' },
  { x: '90px', y: '-85px', r: '105deg' }, { x: '138px', y: '52px', r: '-18deg' },
  { x: '-160px', y: '12px', r: '140deg' }, { x: '162px', y: '-10px', r: '-136deg' },
  { x: '-16px', y: '-125px', r: '64deg' }, { x: '12px', y: '118px', r: '-32deg' },
  { x: '-115px', y: '-55px', r: '88deg' }, { x: '115px', y: '75px', r: '-95deg' },
  { x: '-68px', y: '110px', r: '30deg' }, { x: '68px', y: '-110px', r: '-30deg' },
  { x: '-175px', y: '45px', r: '160deg' }, { x: '175px', y: '-42px', r: '-155deg' },
  { x: '-50px', y: '135px', r: '-55deg' }, { x: '50px', y: '-138px', r: '55deg' },
  { x: '-130px', y: '-105px', r: '10deg' }, { x: '130px', y: '105px', r: '-10deg' },
  { x: '-90px', y: '-130px', r: '35deg' }, { x: '90px', y: '130px', r: '-35deg' },
  { x: '-195px', y: '20px', r: '172deg' }, { x: '195px', y: '-20px', r: '-168deg' },
  { x: '-40px', y: '-150px', r: '50deg' }, { x: '40px', y: '150px', r: '-50deg' },
  { x: '-145px', y: '-90px', r: '120deg' }, { x: '145px', y: '90px', r: '-120deg' },
  { x: '-75px', y: '140px', r: '15deg' }, { x: '75px', y: '-140px', r: '-15deg' },
];

export function DateRevealSection() {
  const [revealed, setRevealed] = useState(false);

  const scratch = useCallback(() => {
    if (!revealed) setRevealed(true);
  }, [revealed]);

  return (
    <section
      id="date-reveal"
      className="py-16 sm:py-24"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(233,192,182,0.45), transparent 55%)',
      }}
    >
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">Your Invitation</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl">
            Reveal your special date
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7" style={{ color: 'rgba(45,36,31,0.7)' }}>
            Scratch or tap the card below to unveil the details of our special day.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut', delay: 0.15 }}
          className="mt-10 flex justify-center"
        >
          <motion.div
            className="relative mx-auto w-full max-w-lg overflow-hidden p-7 text-center shadow-soft cursor-pointer"
            style={{
              background: 'rgba(251,246,237,0.84)',
              border: '1px solid rgba(123,0,20,0.2)',
              outline: '1px solid rgba(115,123,84,0.12)',
              outlineOffset: '-8px',
              minHeight: '160px',
            }}
            onPointerDown={scratch}
            whileHover={!revealed ? { scale: 1.02 } : undefined}
            whileTap={!revealed ? { scale: 0.97 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Ribbons burst */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 z-10"
                >
                  {ribbonData.map((d, i) => (
                    <motion.span
                      key={i}
                      className="absolute left-1/2 top-1/2 rounded-full"
                      style={{
                        width: 5 + Math.random() * 5,
                        height: 18 + Math.random() * 14,
                        background: ['#7b0014', '#c97658', '#737b54', '#e9c0b6', '#eadfc9', '#c89485'][i % 6],
                      }}
                      initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
                      animate={{
                        opacity: [1, 1, 0],
                        x: d.x,
                        y: d.y,
                        scale: [0, 1.2, 0.6],
                        rotate: d.r,
                      }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  ))}
                  {/* Burst center glow */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(233,192,182,0.8) 0%, transparent 70%)' }}
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{ width: 300, height: 300, opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating sparkle particles on revealed state */}
            <AnimatePresence>
              {revealed && (
                <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute left-1/2 top-1/2"
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: [0, (Math.random() - 0.5) * 250],
                        y: [0, (Math.random() - 0.5) * 180],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.2 + i * 0.08,
                        ease: 'easeOut',
                      }}
                    >
                      <Sparkles size={10 + Math.random() * 8} color={['#f0d296', '#e9c0b6', '#c89485', '#737b54'][i % 4]} />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            <motion.p
              className="relative z-10 text-xs font-semibold uppercase tracking-[0.22em] text-wine"
              animate={revealed ? { opacity: [0, 1], y: [10, 0] } : undefined}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Wedding Date
            </motion.p>
            <motion.p
              className="relative z-10 mt-3 font-serif text-3xl leading-relaxed text-moss sm:text-4xl"
              animate={revealed ? { opacity: [0, 1], y: [15, 0], scale: [0.9, 1] } : undefined}
              transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Saturday, 22 August 2026
            </motion.p>
            <motion.p
              className="relative z-10 mt-2 font-serif text-base italic"
              style={{ color: 'rgba(45,36,31,0.6)' }}
              animate={revealed ? { opacity: [0, 1], y: [8, 0] } : undefined}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Camp Young, Ede, Osun State
            </motion.p>

            {/* Scratch cover */}
            <AnimatePresence>
              {!revealed && (
                <motion.button
                  type="button"
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center"
                  style={{
                    cursor: 'pointer',
                    background: 'repeating-linear-gradient(45deg, #eadfc9 0 12px, #e9c0b6 12px 24px, #fbf6ed 24px 38px)',
                  }}
                  onClick={scratch}
                  exit={{ opacity: 0, scale: 1.15, rotateX: -8, transition: { duration: 0.6, ease: 'easeIn' } }}
                >
                  <motion.span
                    className="font-script text-5xl text-moss sm:text-6xl"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Scratch to reveal
                  </motion.span>
                  <motion.span
                    className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-wine"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    rub or tap gently
                  </motion.span>
                  {/* Subtle sparkle on scratch cover */}
                  <motion.div
                    className="absolute bottom-4 right-4"
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles size={20} color="rgba(123,0,20,0.3)" />
                  </motion.div>
                  <motion.div
                    className="absolute top-4 left-4"
                    animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    <Sparkles size={16} color="rgba(115,123,84,0.3)" />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut', delay: 0.25 }}
          className="mt-8 flex justify-center"
        >
          <a
            href="#rsvp"
            className="inline-flex items-center gap-2 rounded-full bg-moss px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-ivory shadow-soft transition hover:opacity-90"
          >
            <Send size={15} /> Reserve Your Seat
          </a>
        </motion.div>
      </div>
    </section>
  );
}
