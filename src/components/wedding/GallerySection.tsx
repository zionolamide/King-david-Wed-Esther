import { motion } from 'framer-motion';

export function GallerySection() {
  const cards = [
    {
      title: 'Garden Walk',
      bg: 'linear-gradient(145deg, rgba(251,246,237,0.86), rgba(233,192,182,0.44), rgba(115,123,84,0.24))',
      overlay: 'rgba(251,246,237,0.46)',
    },
    {
      title: 'Soft Portrait',
      bg: 'linear-gradient(145deg, rgba(233,192,182,0.6), rgba(251,246,237,0.44), rgba(200,148,133,0.3))',
      overlay: 'rgba(233,192,182,0.36)',
    },
    {
      title: 'Evening Promise',
      bg: 'linear-gradient(145deg, rgba(115,123,84,0.3), rgba(234,223,201,0.5), rgba(251,246,237,0.4))',
      overlay: 'rgba(234,223,201,0.46)',
    },
  ];

  return (
    <section id="pre-wedding" className="relative bg-ivory py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="petal" style={{ left: '10%', animationDelay: '0s' }} />
        <span className="petal" style={{ left: '35%', animationDelay: '1.5s' }} />
        <span className="petal" style={{ left: '65%', animationDelay: '3s' }} />
        <span className="petal" style={{ left: '85%', animationDelay: '2s' }} />
      </div>
      <div className="section-shell relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">Pre-Wedding Portraits</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl lg:text-6xl">
            A quiet gallery for the memories before the day.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8" style={{ color: 'rgba(45,36,31,0.72)' }}>
            Portraits will be added here soon. For now, these soft editorial frames hold the space
            for the couple&apos;s pre-wedding moments.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40, rotate: i === 1 ? 1 : -1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.12 }}
              whileHover={{ y: -10, transition: { duration: 0.4 } }}
            >
              <div
                className="relative h-80 overflow-hidden bg-champagne shadow-soft transition-all duration-500 hover:translate-y-[-8px] hover:shadow-[0_30px_90px_rgba(86,54,42,0.2)] sm:h-[28rem]"
              >
                <div className="absolute inset-0" style={{ background: card.bg }} />
                <div className="absolute inset-6 border border-ivory" style={{ opacity: 0.7 }} />
                <div className="absolute left-6 right-6 top-8 h-32 rounded-t-full sm:h-40" style={{ background: card.overlay }} />
                <div className="absolute bottom-8 left-6 right-6 text-center">
                  <p className="font-script text-4xl text-moss sm:text-5xl">{card.title}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-wine">Coming soon</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
