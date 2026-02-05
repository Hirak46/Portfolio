'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ParallaxProps {
  children: ReactNode;
  offset?: number;
}

export default function Parallax({ children, offset = 50 }: ParallaxProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: offset }}
      viewport={{ once: false }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
