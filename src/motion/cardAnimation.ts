import { Variants } from "motion/react";

export const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.18, // 180ms
      ease: [0, 0, 0.2, 1],
    }
  },
  hover: {
    scale: 1.01,
    y: -2,
    transition: {
      duration: 0.12, // 120ms
      ease: [0, 0, 0.2, 1],
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.08,
    }
  }
};
