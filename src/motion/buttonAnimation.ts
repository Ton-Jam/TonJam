import { Variants } from "motion/react";

export const buttonVariants: Variants = {
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.12, // 120ms
      ease: [0, 0, 0.2, 1],
    }
  },
  tap: {
    scale: 0.96,
    transition: {
      duration: 0.08,
    }
  }
};
