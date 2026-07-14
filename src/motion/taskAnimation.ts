import { Variants } from "motion/react";

export const taskCardVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.15, // 150ms
      ease: [0, 0, 0.2, 1],
    }
  }
};

export const progressFillVariants: Variants = {
  initial: { width: 0 },
  animate: (targetWidth: string | number) => ({
    width: targetWidth,
    transition: {
      duration: 0.24, // 240ms
      ease: "easeInOut",
    }
  })
};
