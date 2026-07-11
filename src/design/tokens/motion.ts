export const motion = {
  duration: {
    '2xs': 0.075,
    xs: 0.12,
    sm: 0.2,
    md: 0.3,
    lg: 0.5,
    xl: 0.8,
  },
  easing: {
    standard: [0.4, 0, 0.2, 1],
    decelerate: [0, 0, 0.2, 1],
    accelerate: [0.4, 0, 1, 1],
    spring: {
      default: { type: 'spring', stiffness: 300, damping: 30 },
      gentle: { type: 'spring', stiffness: 200, damping: 30 },
      bouncy: { type: 'spring', stiffness: 400, damping: 20 },
    }
  },
  presets: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
    },
    scaleUp: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: 'spring', stiffness: 300, damping: 25 },
    }
  }
};

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.08)',
  lg: '0 12px 24px -4px rgba(0, 0, 0, 0.15), 0 8px 16px -2px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 40px -6px rgba(0, 0, 0, 0.2)',
};
