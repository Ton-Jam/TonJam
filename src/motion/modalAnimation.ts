import { Variants } from "motion/react";

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 16 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.18, // 180ms
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: 16,
    transition: {
      duration: 0.12, // 120ms
      ease: [0.4, 0, 1, 1],
    }
  }
};

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.12 } }
};
