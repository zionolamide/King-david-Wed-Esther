import { motion } from 'framer-motion';
import { CalendarDays, Clock, MapPin, Navigation } from 'lucide-react';

export function DetailsSection() {
  const infoCards = [
    { icon: CalendarDays, label: 'Date', value: 'Saturday, 22 Aug 2026' },
    { icon: MapPin, label: 'Venue', value: 'Camp Young, Ede' },
    { icon: Clock, label: 'Reception', value: 'Follows immediately' },
  ];

  const schedule = [
    { time: '11:00 AM', title: 'Wedding ceremony' },
    { time: 'Immediately after', title: 'Reception celebration' },
    { time: 'Evening', title: 'Dinner, music and memories' },
  ];

  const encodedVenue = 'Camp+Young%2C+Ede%2C+Osun+State%2C+Nigeria';

  return (
    <section id="details" className="bg-moss py-16 text-ivory sm:py-24">
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">Wedding Details</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Saturday, 22 August 2026
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {infoCards.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              <div
                className="h-full p-6 backdrop-blur sm:p-7"
                style={{ border: '1px solid rgba(251,246,237,0.18)', background: 'rgba(251,246,237,0.08)' }}
              >
                <item.icon className="mb-4 text-blush sm:mb-5" size={24} />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">{item.label}</p>
                <p className="mt-3 font-serif text-2xl sm:text-3xl">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          >
            <div className="bg-ivory p-6 text-ink shadow-soft sm:p-7">
              <h3 className="font-serif text-3xl text-moss sm:text-4xl">Order of Celebration</h3>
              <div className="mt-6 space-y-5">
                {schedule.map((item) => (
                  <div
                    key={item.time}
                    className="grid gap-1 border-b pb-4 sm:grid-cols-[7rem_1fr] sm:gap-4"
                    style={{ borderColor: 'rgba(63,72,31,0.1)' }}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">{item.time}</span>
                    <span className="font-serif text-xl text-ink sm:text-2xl">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.12 }}
          >
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
