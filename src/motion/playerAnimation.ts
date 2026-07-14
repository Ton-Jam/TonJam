import { Variants } from "motion/react";

export const playerPanelVariants: Variants = {
  initial: { opacity: 0, y: "100%" },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.24, // 240ms
      ease: [0.16, 1, 0.3, 1],
    }
  },
  exit: { 
    opacity: 0, 
    y: "100%",
    transition: {
      duration: 0.18, // 180ms
      ease: [0.4, 0, 1, 1],
    }
  }
};

export const equalizerBarVariants: Variants = {
  animate: (custom: number) => ({
    scaleY: [1, 2.5, 0.8, 1.8, 1],
    transition: {
      duration: custom || 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    }
  })
};
