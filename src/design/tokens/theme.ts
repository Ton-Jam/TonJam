import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { motion } from './motion';
import { shadows } from './shadows';
import { zIndex } from './zIndex';
import { breakpoints } from './breakpoints';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  motion,
  shadows,
  zIndex,
  breakpoints,
};

export type Theme = typeof theme;
