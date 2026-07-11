import { Variants, Transition } from "motion/react";

// Duration Constants based on TDS 120ms-240ms system
const DURATIONS = {
  fast: 0.12,    // 120ms - Interactive elements (buttons, toggles)
  standard: 0.2, // 200ms - Small UI changes (dropdowns, cards)
  relaxed: 0.24, // 240ms - Larger transitions (pages, modals, notifications)
};

const EASING = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  out: [0.23, 1, 0.32, 1],
};

// Common Transitions
export const transitionStandard: Transition = {
  duration: DURATIONS.standard,
  ease: EASING.standard as any,
};

export const transitionFast: Transition = {
  duration: DURATIONS.fast,
  ease: EASING.accelerate as any,
};

// Page Presets
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: DURATIONS.relaxed,
      ease: EASING.out as any,
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: {
      duration: DURATIONS.fast,
      ease: EASING.accelerate as any,
    }
  },
};

// Card Presets
export const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: DURATIONS.standard,
      ease: EASING.out as any,
    }
  },
  hover: {
    scale: 1.01,
    y: -2,
    transition: {
      duration: DURATIONS.fast,
      ease: EASING.decelerate as any,
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    }
  }
};

// Button Presets
export const buttonVariants: Variants = {
  hover: {
    scale: 1.02,
    transition: {
      duration: DURATIONS.fast,
      ease: EASING.decelerate as any,
    }
  },
  tap: {
    scale: 0.96,
    transition: {
      duration: 0.08,
    }
  }
};

// Notification/Toast Presets
export const notificationVariants: Variants = {
  initial: { opacity: 0, x: 20, scale: 0.9 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      duration: DURATIONS.relaxed,
    }
  },
  exit: { 
    opacity: 0, 
    x: 20, 
    scale: 0.9,
    transition: {
      duration: DURATIONS.fast,
    }
  },
};

// Utility Presets
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATIONS.standard } },
  exit: { opacity: 0, transition: { duration: DURATIONS.fast } },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: transitionStandard },
  exit: { opacity: 0, y: 20, transition: transitionFast },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: transitionStandard },
  exit: { opacity: 0, y: -20, transition: transitionFast },
};

export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: transitionStandard },
  exit: { opacity: 0, scale: 0.95, transition: transitionFast },
};

export const staggerChildren = (stagger: number = 0.05): Variants => ({
  animate: {
    transition: {
      staggerChildren: stagger,
    },
  },
});
