import { Variants } from "motion/react";

export const containerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    }
  }
};

export const itemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.15, // 150ms
      ease: [0, 0, 0.2, 1],
    }
  }
};
