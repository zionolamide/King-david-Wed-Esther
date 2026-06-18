import { motion } from 'framer-motion';

const gardenImg = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_33426809-a355-4f94-b5a1-e474a98d0089.jpg';

export function StorySection() {
  return (
    <section id="story" className="py-16 sm:py-24">
      <div className="section-shell grid gap-10 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -40, rotate: -2 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <div
            className="relative mx-auto h-96 w-64 overflow-hidden rounded-t-full sm:h-[30rem] sm:w-72"
            style={{
              border: '10px solid rgba(251,246,237,0.76)',
              boxShadow: '0 24px 80px rgba(86, 54, 42, 0.14)',
            }}
          >
            <img
              src={gardenImg}
              alt="Beautiful garden wedding venue"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(251,246,237,0.15), rgba(200,148,133,0.25), rgba(63,72,31,0.65))',
              }}
            />
            <div className="absolute inset-x-6 bottom-8 z-10 text-center text-ivory">
              <p className="font-script text-4xl sm:text-5xl">A Garden Promise</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em]">
                King David &amp; Esther
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wine">Our Story</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-moss sm:text-5xl lg:text-6xl">
            A love rooted in grace, friendship and promise.
          </h2>
          <p className="mt-6 text-base leading-8" style={{ color: 'rgba(45,36,31,0.75)' }}>
            Our journey began with a simple hello, grew through friendship, laughter, prayers, and
            love. Through every season, we found in each other a forever kind of love. From two
            different tribes, God beautifully brought us together, uniting our hearts in His perfect
            plan. As we step into forever together, we invite you to celebrate this moment with us.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
