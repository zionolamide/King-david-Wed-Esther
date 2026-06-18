import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

export function GuestNoticeSection() {
  return (
    <section className="py-14 sm:py-20" style={{ background: '#f1e5d2' }}>
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <div className="invitation-border mx-auto max-w-3xl bg-ivory p-8 shadow-soft sm:p-12">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(123,0,20,0.1)' }}>
                <Info className="text-wine" size={28} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">
                  Important Guest Notice
                </p>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-moss sm:text-4xl">
                  Adults only celebration
                </h2>
                <p className="mt-3 leading-8" style={{ color: 'rgba(45,36,31,0.74)' }}>
                  Due to limited space, attendance is reserved for adult guests only. We kindly ask
                  that children remain at home for this occasion so that every guest can enjoy a
                  relaxed and comfortable celebration.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
