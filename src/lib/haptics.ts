// /src/lib/haptics.ts

export const triggerHaptic = (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'failure' = 'medium'
) => {
  if (typeof window !== 'undefined' && 'navigator' in window && window.navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [40],
      success: [10, 30, 20],
      failure: [30, 50, 30],
    };
    window.navigator.vibrate(patterns[type]);
  }
};
