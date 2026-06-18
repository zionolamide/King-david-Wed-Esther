import { motion } from 'framer-motion';
import { Flower2, Sparkles } from 'lucide-react';

const coupleImg = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4302efe2-36ca-4f5e-8fcd-b0c2bf45b49d.jpg';
const ladyImg = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7013aea5-9c40-4751-8632-d3318c58deeb.jpg';
const gentlemanImg = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5bb477ea-b514-4da1-a5fa-fd5fa7763722.jpg';

export function DressCodeSection() {
  const palette = [
    { name: 'Sage', color: '#737b54' },
    { name: 'Wine', color: '#7b0014' },
    { name: 'Dusty Rose', color: '#c89485' },
    { name: 'Terracotta', color: '#c97658' },
    { name: 'Blush', color: '#e9c0b6' },
    { name: 'Champagne', color: '#eadfc9' },
  ];

  return (
    <section id="dress-code" className="py-16 sm:py-24">
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <div
            className="relative overflow-hidden p-6 shadow-soft sm:p-12"
            style={{
              background: 'rgba(251,246,237,0.78)',
              border: '1px solid rgba(123,0,20,0.2)',
              outline: '1px solid rgba(115,123,84,0.12)',
              outlineOffset: '-8px',
            }}
          >
            {/* Floral decorations */}
            <div
              className="pointer-events-none absolute -left-[58px] -top-[52px] h-[190px] w-[190px] rotate-[-18deg]"
              style={{
                background: 'radial-gradient(circle at 42% 44%, rgba(255,255,255,0.82) 0 14%, transparent 15%), radial-gradient(circle at 58% 43%, rgba(233,192,182,0.8) 0 13%, transparent 14%), radial-gradient(circle at 48% 60%, rgba(200,148,133,0.75) 0 14%, transparent 15%), radial-gradient(circle at 62% 62%, rgba(201,118,88,0.72) 0 11%, transparent 12%), radial-gradient(ellipse at 30% 60%, rgba(115,123,84,0.45) 0 16%, transparent 17%)',
                opacity: 0.58,
                filter: 'blur(0.2px)',
              }}
            />
            <div
              className="pointer-events-none absolute -bottom-[56px] -right-[58px] h-[190px] w-[190px] rotate-[152deg]"
              style={{
                background: 'radial-gradient(circle at 42% 44%, rgba(255,255,255,0.82) 0 14%, transparent 15%), radial-gradient(circle at 58% 43%, rgba(233,192,182,0.8) 0 13%, transparent 14%), radial-gradient(circle at 48% 60%, rgba(200,148,133,0.75) 0 14%, transparent 15%), radial-gradient(circle at 62% 62%, rgba(201,118,88,0.72) 0 11%, transparent 12%), radial-gradient(ellipse at 30% 60%, rgba(115,123,84,0.45) 0 16%, transparent 17%)',
                opacity: 0.58,
                filter: 'blur(0.2px)',
              }}
            />

            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <p className="font-script text-4xl text-sage sm:text-5xl lg:text-6xl">Style Inspiration</p>
              <h2 className="mt-2 font-serif text-4xl italic leading-tight text-moss sm:text-5xl lg:text-7xl">
                Formal Garden Elegance
              </h2>
              <p className="mx-auto mt-6 max-w-3xl leading-8" style={{ color: 'rgba(45,36,31,0.76)' }}>
                In honour of this special occasion, guests are kindly requested to dress in modest,
                elegant, and formal outfits inspired by our curated color palette.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-wine">
                Please note this is just a guide and absolutely not mandatory
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {palette.map((swatch) => (
                  <span key={swatch.name} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink">
                    <span
                      className="h-6 w-6 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: swatch.color }}
                    />
                    {swatch.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-10 grid gap-6 sm:grid-cols-2">
              {/* Ladies */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                className="p-6 sm:p-7"
                style={{ background: 'rgba(234,223,201,0.56)' }}
              >
                <div className="relative mb-6 h-56 overflow-hidden sm:h-64" style={{ outline: '1px solid rgba(123,0,20,0.12)', outlineOffset: '-8px' }}>
                  <img
                    src={ladyImg}
                    alt="Elegant lady in formal garden wedding attire"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(63,72,31,0.35), transparent 60%)' }} />
                  <div className="absolute bottom-4 right-4 flex gap-1">
                    {palette.slice(0, 5).map((s) => (
                      <span key={s.name} className="h-4 w-4 rounded-full border border-white shadow" style={{ backgroundColor: s.color }} />
                    ))}
                  </div>
                </div>
                <Flower2 className="mb-4 text-wine sm:mb-5" size={24} />
                <h3 className="font-serif text-3xl text-moss sm:text-4xl">Ladies</h3>
                <p className="mt-4 leading-8" style={{ color: 'rgba(45,36,31,0.76)' }}>
                  Long dresses or refined midi-length dresses with tasteful coverage and soft,
                  elegant detailing. Fascinators or subtle headpieces are welcome to complement the
                  overall look.
                </p>
              </motion.div>

              {/* Gentlemen */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="p-6 sm:p-7"
                style={{ background: 'rgba(233,192,182,0.34)' }}
              >
                <div className="relative mb-6 h-56 overflow-hidden sm:h-64" style={{ outline: '1px solid rgba(123,0,20,0.12)', outlineOffset: '-8px' }}>
                  <img
                    src={gentlemanImg}
                    alt="Elegant gentleman in tailored formal suit"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(63,72,31,0.35), transparent 60%)' }} />
                  <div className="absolute bottom-4 right-4 flex gap-1">
                    {palette.slice(0, 4).map((s) => (
                      <span key={s.name} className="h-4 w-4 rounded-full border border-white shadow" style={{ backgroundColor: s.color }} />
                    ))}
                  </div>
                </div>
                <Sparkles className="mb-4 text-wine sm:mb-5" size={24} />
                <h3 className="font-serif text-3xl text-moss sm:text-4xl">Gentlemen</h3>
                <p className="mt-4 leading-8" style={{ color: 'rgba(45,36,31,0.76)' }}>
                  Well-tailored suits or blazers with dress trousers. Those who prefer not to wear
                  suits may opt for a neatly styled long-sleeved shirt paired with formal trousers and
                  polished shoes.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
