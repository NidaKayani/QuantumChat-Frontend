/** Quantum Chat — Dark Blue Professional Theme */
import type { WebsiteBranding } from '@quantum-chat/shared';

export const theme = {
  colors: {
    navy950: '#050D1A',
    navy900: '#0A1628',
    navy800: '#0F2240',
    navy700: '#1A365D',
    navy600: '#234876',
    navy500: '#2D4A6F',
    accent: '#3B82F6',
    accentLight: '#60A5FA',
    accentDark: '#2563EB',
    accentGlow: 'rgba(59, 130, 246, 0.35)',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: 'rgba(148, 163, 184, 0.12)',
    borderLight: 'rgba(148, 163, 184, 0.2)',
    success: '#22C55E',
    error: '#F87171',
    bubbleOwn: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    bubbleOther: '#1A365D',
    inputBg: 'rgba(15, 34, 64, 0.8)',
  },
  shadow: {
    widget: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.15)',
    launcher: '0 8px 32px rgba(37, 99, 235, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.2)',
    bubble: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  radius: {
    widget: 20,
    bubble: 18,
    input: 14,
  },
} as const;

export interface ResolvedTheme {
  colors: {
    navy950: string;
    navy900: string;
    navy800: string;
    navy700: string;
    navy600: string;
    navy500: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    accentGlow: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
    success: string;
    error: string;
    bubbleOwn: string;
    bubbleOther: string;
    inputBg: string;
  };
  shadow: {
    widget: string;
    launcher: string;
    bubble: string;
  };
  radius: {
    widget: number;
    bubble: number;
    input: number;
  };
}

export function resolveTheme(branding?: Partial<WebsiteBranding>): ResolvedTheme {
  const accent = branding?.accentColor || theme.colors.accent;
  const primary = branding?.primaryColor || theme.colors.navy800;
  const secondary = branding?.secondaryColor || theme.colors.navy700;

  return {
    ...theme,
    colors: {
      ...theme.colors,
      accent,
      accentLight: accent,
      accentDark: accent,
      accentGlow: `${accent}59`,
      navy900: primary,
      navy800: primary,
      navy700: secondary,
      bubbleOwn: `linear-gradient(135deg, ${accent} 0%, ${primary} 100%)`,
      bubbleOther: secondary,
    },
    shadow: {
      ...theme.shadow,
      launcher: `0 8px 32px ${accent}66, 0 0 0 1px ${accent}40`,
    },
  };
}
