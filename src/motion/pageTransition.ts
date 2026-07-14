import { Variants } from "motion/react";

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.24, // 240ms
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: { 
    opacity: 0, 
    y: -12,
    transition: {
      duration: 0.15, // 150ms
      ease: [0.4, 0, 1, 1],
    }
  },
};
