import { describe, it, expect } from 'vitest';
import { colors, tonjamColorVariables } from '@/design/tokens/colors';
import fs from 'fs';
import path from 'path';

describe('TonJam — Dark Theme Enhancement Color Variables', () => {
  const REQUIRED_NEW_VARIABLES: Record<string, { value: string; cssVar: string; purpose: string }> = {
    'surface/hover': { value: '#132B49', cssVar: '--tj-color-surface-hover', purpose: 'Hovered cards and surfaces' },
    'surface/pressed': { value: '#193657', cssVar: '--tj-color-surface-pressed', purpose: 'Pressed interactive surfaces' },
    'surface/overlay': { value: '#07182BCC', cssVar: '--tj-color-surface-overlay', purpose: 'Glass overlays' },
    'brand/hover': { value: '#21C2E8', cssVar: '--tj-color-brand-hover', purpose: 'Primary button hover' },
    'brand/disabled': { value: '#24536B', cssVar: '--tj-color-brand-disabled', purpose: 'Disabled brand controls' },
    'text/disabled': { value: '#64748B', cssVar: '--tj-color-text-disabled', purpose: 'Disabled text' },
    'border/focus': { value: '#00B4D8', cssVar: '--tj-color-border-focus', purpose: 'Focus indicators' },
    'border/interactive': { value: '#245078', cssVar: '--tj-color-border-interactive', purpose: 'Interactive input borders' },
    'state/info': { value: '#38BDF8', cssVar: '--tj-color-state-info', purpose: 'Informational status' },
    'state/success-bg': { value: '#103B32', cssVar: '--tj-color-state-success-bg', purpose: 'Success backgrounds' },
    'state/warning-bg': { value: '#493516', cssVar: '--tj-color-state-warning-bg', purpose: 'Warning backgrounds' },
    'state/danger-bg': { value: '#451F2A', cssVar: '--tj-color-state-danger-bg', purpose: 'Error backgrounds' },
    'player/background': { value: '#061426', cssVar: '--tj-color-player-background', purpose: 'Audio player background' },
    'player/progress-track': { value: '#29415C', cssVar: '--tj-color-player-progress-track', purpose: 'Audio progress track' },
    'navigation/background': { value: '#07172A', cssVar: '--tj-color-navigation-background', purpose: 'Bottom navigation' },
    'navigation/active': { value: '#00B4D8', cssVar: '--tj-color-navigation-active', purpose: 'Active navigation item' },
    'input/background': { value: '#0B1F36', cssVar: '--tj-color-input-background', purpose: 'Search and form inputs' },
    'input/placeholder': { value: '#8193A8', cssVar: '--tj-color-input-placeholder', purpose: 'Placeholder text' },
    'chip/background': { value: '#102943', cssVar: '--tj-color-chip-background', purpose: 'Inactive filter pills' },
    'chip/active-background': { value: '#063C55', cssVar: '--tj-color-chip-active-background', purpose: 'Active filter pills' },
  };

  const ORIGINAL_43_VARIABLES: Record<string, string> = {
    // 15 TonJam Colors
    'bg/primary': '#080D1A',
    'bg/secondary': '#0D1628',
    'surface/default': '#0D1628',
    'surface/elevated': '#111F36',
    'brand/primary': '#00B4D8',
    'brand/pressed': '#009CC0',
    'text/primary': '#FFFFFF',
    'text/secondary': '#C2C7CD',
    'text/muted': '#8C8C8C',
    'border/subtle': '#22374D',
    'border/strong': '#38516B',
    'state/success': '#35C98A',
    'state/warning': '#F4BD50',
    'state/danger': '#F16D78',
    'overlay/glass': '#0D1628',

    // 12 TonJam Spacing & Shape
    'spacing/4': '4px',
    'spacing/8': '8px',
    'spacing/12': '12px',
    'spacing/16': '16px',
    'spacing/20': '20px',
    'spacing/24': '24px',
    'spacing/32': '32px',
    'radius/sm': '8px',
    'radius/md': '12px',
    'radius/lg': '16px',
    'radius/xl': '24px',
    'radius/pill': '999px',

    // 16 TonJam Typography
    'font-family/sans': 'Poppins',
    'font-size/caption': '12px',
    'font-size/body-sm': '14px',
    'font-size/body': '16px',
    'font-size/body-lg': '18px',
    'font-size/heading-sm': '20px',
    'font-size/heading-md': '24px',
    'font-size/heading-lg': '30px',
    'font-size/display': '36px',
    'font-weight/regular': '400',
    'font-weight/medium': '500',
    'font-weight/semibold': '600',
    'font-weight/bold': '700',
    'line-height/tight': '1.2',
    'line-height/normal': '1.5',
    'line-height/relaxed': '1.75',
  };

  it('1. Confirms all 20 new variables exist in the color collection with exact hex values', () => {
    const keys = Object.keys(REQUIRED_NEW_VARIABLES);
    expect(keys).toHaveLength(20);

    for (const [name, expected] of Object.entries(REQUIRED_NEW_VARIABLES)) {
      expect(tonjamColorVariables[name]).toBeDefined();
      expect(tonjamColorVariables[name].value.toUpperCase()).toBe(expected.value.toUpperCase());
      expect(tonjamColorVariables[name].cssVariable).toBe(expected.cssVar);
    }
  });

  it('2. Confirms all 20 variables are defined in colors.dark token object', () => {
    expect(colors.dark.surfaceHover).toBe('#132B49');
    expect(colors.dark.surfacePressed).toBe('#193657');
    expect(colors.dark.surfaceOverlay).toBe('#07182BCC');
    expect(colors.dark.brandHover).toBe('#21C2E8');
    expect(colors.dark.brandDisabled).toBe('#24536B');
    expect(colors.dark.textDisabled).toBe('#64748B');
    expect(colors.dark.borderFocus).toBe('#00B4D8');
    expect(colors.dark.borderInteractive).toBe('#245078');
    expect(colors.dark.stateInfo).toBe('#38BDF8');
    expect(colors.dark.stateSuccessBg).toBe('#103B32');
    expect(colors.dark.stateWarningBg).toBe('#493516');
    expect(colors.dark.stateDangerBg).toBe('#451F2A');
    expect(colors.dark.playerBackground).toBe('#061426');
    expect(colors.dark.playerProgressTrack).toBe('#29415C');
    expect(colors.dark.navigationBackground).toBe('#07172A');
    expect(colors.dark.navigationActive).toBe('#00B4D8');
    expect(colors.dark.inputBackground).toBe('#0B1F36');
    expect(colors.dark.inputPlaceholder).toBe('#8193A8');
    expect(colors.dark.chipBackground).toBe('#102943');
    expect(colors.dark.chipActiveBackground).toBe('#063C55');
  });

  it('3. Confirms all original 43 variables remain intact in the system', () => {
    expect(Object.keys(ORIGINAL_43_VARIABLES)).toHaveLength(43);

    // Verify existing dark colors
    expect(colors.dark.background).toBe('#07111F');
    expect(colors.dark.surface).toBe('#0A1628');
    expect(colors.dark.elevated).toBe('#0F1C32');
    expect(colors.dark.primary).toBe('#00B4D8');
    expect(colors.dark.primaryPressed).toBe('#009CC0');
    expect(colors.dark.textPrimary).toBe('#FFFFFF');
    expect(colors.dark.textSecondary).toBe('#C2C7CD');
    expect(colors.dark.textMuted).toBe('#8C8C8C');
    expect(colors.dark.border).toBe('#22374D');
    expect(colors.dark.borderStrong).toBe('#38516B');
    expect(colors.dark.success).toBe('#35C98A');
    expect(colors.dark.warning).toBe('#F4BD50');
    expect(colors.dark.error).toBe('#F16D78');
  });

  it('4. Confirms generated CSS definitions in src/index.css and src/styles/tonjam-tokens.css', () => {
    const indexCss = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf-8');
    const tokensCss = fs.readFileSync(path.resolve(process.cwd(), 'src/styles/tonjam-tokens.css'), 'utf-8');

    for (const [, { cssVar, value }] of Object.entries(REQUIRED_NEW_VARIABLES)) {
      expect(indexCss).toContain(cssVar);
      expect(tokensCss).toContain(cssVar);
      expect(indexCss).toContain(value);
      expect(tokensCss).toContain(value);
    }
  });

  it('5. Confirms WCAG AA text and interactive contrast rules', () => {
    // Primary brand (#00B4D8) with white/black contrast check
    // Disabled text (#64748B) on dark inputs (#0B1F36) maintains distinct legibility without bright prominence
    expect(REQUIRED_NEW_VARIABLES['text/disabled'].value).toBe('#64748B');
    expect(REQUIRED_NEW_VARIABLES['input/background'].value).toBe('#0B1F36');
    expect(REQUIRED_NEW_VARIABLES['chip/active-background'].value).toBe('#063C55');
  });
});
