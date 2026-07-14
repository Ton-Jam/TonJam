import { Variants } from "motion/react";

export const notificationVariants: Variants = {
  initial: { opacity: 0, x: 24, scale: 0.95 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      duration: 0.18, // 180ms
      ease: [0, 0, 0.2, 1],
    }
  },
  exit: { 
    opacity: 0, 
    x: 24, 
    scale: 0.95,
    transition: {
      duration: 0.12, // 120ms
    }
  },
};
