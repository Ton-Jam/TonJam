import { Variants } from "motion/react";

export const marketplaceCardVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 12 },
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
    y: -4,
    transition: {
      duration: 0.12, // 120ms
      ease: "easeOut",
    }
  }
};

export const bidPulseVariants: Variants = {
  active: {
    scale: [1, 1.03, 1],
    transition: {
      duration: 0.24, // 240ms
      ease: "easeInOut",
    }
  }
};
