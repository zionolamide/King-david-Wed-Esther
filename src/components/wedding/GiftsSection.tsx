import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { FloatingPetals } from './FloatingPetals';

export function GiftsSection() {
  return (
    <section id="gifts" className="relative bg-moss py-16 text-ivory sm:py-24">
      <FloatingPetals />
      <div className="section-shell relative z-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">Gifts</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Your presence is our greatest gift.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut', delay: 0.12 }}
        >
          <div
            className="p-6 text-ink shadow-soft sm:p-10"
            style={{
              background: '#fbf6ed',
              border: '1px solid rgba(123,0,20,0.2)',
              outline: '1px solid rgba(115,123,84,0.12)',
              outlineOffset: '-8px',
            }}
          >
            <Gift className="mb-5 text-wine" size={28} />
            <h3 className="font-serif text-3xl text-moss sm:text-4xl">Gifts</h3>
            <p className="mt-4 leading-8" style={{ color: 'rgba(45,36,31,0.74)' }}>
              Your presence on our special day is the greatest gift we could ask for. But if your
              heart feels called to give more, a monetary gift would be received with deep gratitude
              and love.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="p-5" style={{ background: 'rgba(234,223,201,0.6)' }}>
                <p className="font-serif text-xl text-moss sm:text-2xl">King-David Duruihuoma</p>
                <p className="mt-3 text-sm uppercase tracking-[0.16em] text-wine">Guaranty Trust Bank</p>
                <p className="mt-2 font-serif text-2xl text-ink sm:text-3xl">0012782278</p>
              </div>
              <div className="p-5" style={{ background: 'rgba(233,192,182,0.32)' }}>
                <p className="font-serif text-xl text-moss sm:text-2xl">Blessing Timehin</p>
                <p className="mt-3 text-sm uppercase tracking-[0.16em] text-wine">Access Bank</p>
                <p className="mt-2 font-serif text-2xl text-ink sm:text-3xl">0733934621</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
