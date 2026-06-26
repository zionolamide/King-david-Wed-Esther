import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

/**
 * Floating Hearts Background Animation
 * Creates subtle, elegant floating heart animations
 */
export function FloatingHearts() {
  const hearts = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 3,
    duration: 6 + Math.random() * 4,
    size: 16 + Math.random() * 20,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute"
          style={{
            left: heart.left,
            top: '-30px',
          }}
          initial={{ y: 0, opacity: heart.opacity }}
          animate={{
            y: window.innerHeight + 30,
            opacity: [heart.opacity, heart.opacity * 0.5, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Heart size={heart.size} className="text-wine fill-wine" />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Sparkle Burst Animation
 * Creates a delightful sparkle effect on click or interaction
 */
export function SparkleEffect({ count = 12 }: { count?: number }) {
  const sparkles = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const distance = 30 + Math.random() * 50;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: Math.random() * 0.1,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#7b0014',
            boxShadow: '0 0 4px #7b0014',
          }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
            x: [0, sparkle.x],
            y: [0, sparkle.y],
          }}
          transition={{
            duration: 0.8,
            delay: sparkle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Pulse Heart Effect
 * Creates a gentle pulse animation for romantic emphasis
 */
export function PulseHeart() {
  return (
    <motion.div
      animate={{ scale: [1, 1.15, 1] }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        repeatDelay: 2,
        ease: 'easeInOut',
      }}
    >
      <Heart size={24} className="text-wine fill-wine" />
    </motion.div>
  );
}

/**
 * Romantic Button Hover Effect
 * Enhanced hover effect for buttons with romantic theme
 */
export const romanticButtonVariants = {
  rest: {
    scale: 1,
    backgroundColor: 'rgba(123, 0, 20, 1)',
  },
  hover: {
    scale: 1.08,
    backgroundColor: 'rgba(123, 0, 20, 0.9)',
    boxShadow: '0 8px 20px rgba(123, 0, 20, 0.35)',
  },
  tap: {
    scale: 0.96,
  },
};

/**
 * Smooth Fade In Animation
 * For smooth section reveals with romantic feel
 */
export const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

/**
 * Delightful Micro-interaction - Loved Animation
 * Creates a heart-burst effect when marking something as loved
 */
export function LovedAnimation() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 1, opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Heart size={40} className="text-wine fill-wine" />
      </motion.div>
    </motion.div>
  );
}

/**
 * Gentle Hover Lift Effect
 * For cards and elements that should lift on hover
 */
export const hoverLiftVariants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  hover: {
    y: -4,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
  },
};

/**
 * Smooth Underline Animation
 * For links and interactive text with romantic elegance
 */
export const underlineVariants = {
  rest: { width: 0 },
  hover: { width: '100%' },
};
