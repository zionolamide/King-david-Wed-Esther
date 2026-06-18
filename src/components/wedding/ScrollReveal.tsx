import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  rotate?: number;
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 28,
  duration = 0.8,
  rotate = 0,
}: ScrollRevealProps) {
  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directions[direction], rotate }}
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxSection({
  children,
  className = '',
  speed = 0.3,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 0 }}
      whileInView={{ y: 0 }}
      viewport={{ once: false, margin: '-200px' }}
      style={{ willChange: 'transform' }}
    >
      <motion.div
        style={{ y: 0 }}
        whileInView={{ y: [0, -speed * 40] }}
        transition={{ duration: 1, ease: 'linear' }}
        viewport={{ once: false }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
